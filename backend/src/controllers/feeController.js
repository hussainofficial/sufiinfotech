const pool = require('../config/db');

async function myFees(req, res) {
  const studentId = req.user.id;
  const [rows] = await pool.query(
    `SELECT fi.*, fp.total_amount, c.title AS course_title
     FROM fee_installments fi
     JOIN fee_plans fp ON fp.id = fi.fee_plan_id
     JOIN courses c ON c.id = fp.course_id
     WHERE fp.student_id = ?
     ORDER BY fi.due_date`,
    [studentId]
  );
  res.json(rows);
}

async function listAllFees(req, res) {
  const { status } = req.query;
  let query = `SELECT fi.*, s.name AS student_name, s.email AS student_email, c.title AS course_title
               FROM fee_installments fi
               JOIN fee_plans fp ON fp.id = fi.fee_plan_id
               JOIN students s ON s.id = fp.student_id
               JOIN courses c ON c.id = fp.course_id`;
  const params = [];
  if (status) {
    query += ' WHERE fi.status = ?';
    params.push(status);
  }
  query += ' ORDER BY fi.due_date';

  const [rows] = await pool.query(query, params);
  res.json(rows);
}

async function markInstallmentPaid(req, res) {
  const { id } = req.params;
  const { payment_method, receipt_no } = req.body;

  const [rows] = await pool.query('SELECT * FROM fee_installments WHERE id = ?', [id]);
  const installment = rows[0];
  if (!installment) return res.status(404).json({ error: 'Installment not found' });

  await pool.query("UPDATE fee_installments SET status = 'paid' WHERE id = ?", [id]);
  await pool.query(
    `INSERT INTO payments (fee_installment_id, amount, payment_method, status, receipt_no)
     VALUES (?, ?, ?, 'success', ?)`,
    [id, installment.amount, payment_method || 'cash', receipt_no || `RCPT-${Date.now()}`]
  );

  res.json({ message: 'Payment recorded' });
}

module.exports = { myFees, listAllFees, markInstallmentPaid };
