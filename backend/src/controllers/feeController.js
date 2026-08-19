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

// Records a payment against an installment — either the full remaining balance (default) or a
// custom/partial amount. If a partial amount leaves a balance, the installment stays pending/overdue
// and an optional new due date can be set for when the remaining balance should be paid.
async function markInstallmentPaid(req, res) {
  const { id } = req.params;
  const { payment_method, receipt_no, amount_paid, payment_date, next_due_date } = req.body;

  const [rows] = await pool.query('SELECT * FROM fee_installments WHERE id = ?', [id]);
  const installment = rows[0];
  if (!installment) return res.status(404).json({ error: 'Installment not found' });

  const remaining = Number(installment.amount) - Number(installment.paid_amount);
  const amountPaid = amount_paid != null && amount_paid !== '' ? Number(amount_paid) : remaining;
  if (!(amountPaid > 0)) {
    return res.status(400).json({ error: 'amount_paid must be greater than 0' });
  }

  const newPaidAmount = Math.min(Number(installment.paid_amount) + amountPaid, Number(installment.amount));
  const isFullyPaid = newPaidAmount >= Number(installment.amount);
  const today = new Date().toISOString().slice(0, 10);
  const dueDate = next_due_date || installment.due_date;
  const status = isFullyPaid ? 'paid' : (String(dueDate) < today ? 'overdue' : 'pending');

  await pool.query(
    'UPDATE fee_installments SET paid_amount = ?, status = ?, due_date = ? WHERE id = ?',
    [newPaidAmount, status, dueDate, id]
  );
  await pool.query(
    `INSERT INTO payments (fee_installment_id, amount, payment_method, status, receipt_no, paid_at)
     VALUES (?, ?, ?, 'success', ?, ?)`,
    [id, amountPaid, payment_method || 'cash', receipt_no || `RCPT-${Date.now()}`, payment_date || new Date()]
  );

  res.json({ message: 'Payment recorded', paid_amount: newPaidAmount, status });
}

module.exports = { myFees, listAllFees, markInstallmentPaid };
