const nodemailer = require('nodemailer');
const pool = require('../config/db');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail({ to, subject, html, type = 'general' }) {
  let status = 'sent';
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
  } catch (err) {
    status = 'failed';
    console.error(`Email to ${to} failed:`, err.message);
  }

  await pool.query(
    'INSERT INTO email_logs (recipient_email, subject, type, status) VALUES (?, ?, ?, ?)',
    [to, subject, type, status]
  );

  return status === 'sent';
}

module.exports = { sendMail };
