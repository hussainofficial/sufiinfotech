const crypto = require('crypto');
const Razorpay = require('razorpay');
const pool = require('../config/db');

function getRazorpayClient() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// Creates a Razorpay order for a fee installment the logged-in student owns.
async function createOrder(req, res) {
  const studentId = req.user.id;
  const { installment_id } = req.body;

  const [rows] = await pool.query(
    `SELECT fi.* FROM fee_installments fi
     JOIN fee_plans fp ON fp.id = fi.fee_plan_id
     WHERE fi.id = ? AND fp.student_id = ?`,
    [installment_id, studentId]
  );
  const installment = rows[0];
  if (!installment) return res.status(404).json({ error: 'Installment not found' });
  if (installment.status === 'paid') return res.status(400).json({ error: 'Already paid' });

  const razorpay = getRazorpayClient();
  const order = await razorpay.orders.create({
    amount: Math.round(installment.amount * 100), // paise
    currency: 'INR',
    receipt: `installment_${installment.id}`,
  });

  res.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
}

// Verifies the Razorpay signature and marks the installment paid.
async function verifyPayment(req, res) {
  const studentId = req.user.id;
  const { installment_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: 'Payment verification failed' });
  }

  const [rows] = await pool.query(
    `SELECT fi.* FROM fee_installments fi
     JOIN fee_plans fp ON fp.id = fi.fee_plan_id
     WHERE fi.id = ? AND fp.student_id = ?`,
    [installment_id, studentId]
  );
  const installment = rows[0];
  if (!installment) return res.status(404).json({ error: 'Installment not found' });

  await pool.query("UPDATE fee_installments SET status = 'paid' WHERE id = ?", [installment_id]);
  await pool.query(
    `INSERT INTO payments (fee_installment_id, amount, payment_method, razorpay_order_id, razorpay_payment_id, status, receipt_no)
     VALUES (?, ?, 'online', ?, ?, 'success', ?)`,
    [installment_id, installment.amount, razorpay_order_id, razorpay_payment_id, `RCPT-${Date.now()}`]
  );

  res.json({ message: 'Payment verified and recorded' });
}

module.exports = { createOrder, verifyPayment };
