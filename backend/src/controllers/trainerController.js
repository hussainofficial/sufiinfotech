const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/db');
const { sendMail } = require('../utils/mailer');

function generateTempPassword() {
  return crypto.randomBytes(4).toString('hex');
}

async function listTrainers(req, res) {
  const [rows] = await pool.query('SELECT id, name, email, phone, specialization, created_at FROM trainers ORDER BY created_at DESC');
  res.json(rows);
}

async function createTrainer(req, res) {
  const { name, email, phone, specialization, password } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  if (password && password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const isCustomPassword = !!password;
  const loginPassword = isCustomPassword ? password : generateTempPassword();
  const passwordHash = await bcrypt.hash(loginPassword, 10);

  const [result] = await pool.query(
    'INSERT INTO trainers (name, email, phone, password_hash, specialization) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone || null, passwordHash, specialization || null]
  );

  sendMail({
    to: email,
    subject: 'Trainer Account Created — Sufi Infotech',
    type: 'general',
    html: `<p>Hi ${name},</p>
           <p>A trainer account has been created for you at Sufi Infotech.</p>
           <p>Email: ${email}<br/>${isCustomPassword ? 'Password' : 'Temporary Password'}: <b>${loginPassword}</b></p>`,
  }).catch(() => {});

  res.status(201).json({ id: result.insertId, tempPassword: loginPassword });
}

module.exports = { listTrainers, createTrainer };
