const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/db');
const { sendMail } = require('../utils/mailer');

function generateTempPassword() {
  return crypto.randomBytes(4).toString('hex');
}

// Converts an enquiry (or a fresh walk-in) into an enrolled student:
// creates the student login, enrolls them in a batch, and builds a fee plan
// with evenly split installments so fee reminders have something to track.
async function createAdmission(req, res) {
  const {
    enquiry_id, name, email, phone, dob, address,
    batch_id, installments, password,
  } = req.body;

  if (!name || !email || !phone || !batch_id) {
    return res.status(400).json({ error: 'name, email, phone and batch_id are required' });
  }
  if (password && password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const [batchRows] = await pool.query(
    `SELECT b.*, c.fee_amount, c.id AS course_id FROM batches b
     JOIN courses c ON c.id = b.course_id WHERE b.id = ?`,
    [batch_id]
  );
  const batch = batchRows[0];
  if (!batch) return res.status(404).json({ error: 'Batch not found' });
  if (batch.seats_filled >= batch.seats_total) {
    return res.status(400).json({ error: 'Batch is full' });
  }

  const isCustomPassword = !!password;
  const loginPassword = isCustomPassword ? password : generateTempPassword();
  const passwordHash = await bcrypt.hash(loginPassword, 10);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [studentResult] = await conn.query(
      `INSERT INTO students (enquiry_id, name, email, phone, password_hash, dob, address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [enquiry_id || null, name, email, phone, passwordHash, dob || null, address || null]
    );
    const studentId = studentResult.insertId;

    await conn.query('INSERT INTO student_batches (student_id, batch_id) VALUES (?, ?)', [studentId, batch_id]);
    await conn.query('UPDATE batches SET seats_filled = seats_filled + 1 WHERE id = ?', [batch_id]);

    if (enquiry_id) {
      await conn.query("UPDATE enquiries SET status = 'converted' WHERE id = ?", [enquiry_id]);
    }

    const [feePlanResult] = await conn.query(
      'INSERT INTO fee_plans (student_id, course_id, total_amount) VALUES (?, ?, ?)',
      [studentId, batch.course_id, batch.fee_amount]
    );
    const feePlanId = feePlanResult.insertId;

    const numInstallments = Math.max(1, Number(installments) || 1);
    const installmentAmount = Math.floor((batch.fee_amount / numInstallments) * 100) / 100;
    const today = new Date();
    for (let i = 0; i < numInstallments; i++) {
      const dueDate = new Date(today);
      dueDate.setMonth(dueDate.getMonth() + i);
      const amount = i === numInstallments - 1
        ? batch.fee_amount - installmentAmount * (numInstallments - 1)
        : installmentAmount;
      await conn.query(
        'INSERT INTO fee_installments (fee_plan_id, amount, due_date) VALUES (?, ?, ?)',
        [feePlanId, amount, dueDate.toISOString().slice(0, 10)]
      );
    }

    await conn.commit();

    sendMail({
      to: email,
      subject: 'Admission Confirmed — Sufi Infotech',
      type: 'admission_confirmation',
      html: `<p>Hi ${name},</p>
             <p>Your admission to <b>${batch.name}</b> is confirmed.</p>
             <p>Your student portal login:</p>
             <p>Email: ${email}<br/>${isCustomPassword ? 'Password' : 'Temporary Password'}: <b>${loginPassword}</b></p>
             ${isCustomPassword ? '' : '<p>Please log in and change your password.</p>'}`,
    }).catch(() => {});

    res.status(201).json({ studentId, message: 'Admission created', tempPassword: loginPassword });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { createAdmission };
