const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { signToken } = require('../utils/jwt');

async function adminLogin(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const [rows] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
  const admin = rows[0];
  if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signToken({ id: admin.id, role: 'admin', name: admin.name });
  res.json({ token, user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
}

async function studentLogin(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const [rows] = await pool.query('SELECT * FROM students WHERE email = ?', [email]);
  const student = rows[0];
  if (!student || !(await bcrypt.compare(password, student.password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  if (!student.is_active) {
    return res.status(403).json({ error: 'Your account has been deactivated' });
  }

  const token = signToken({ id: student.id, role: 'student', name: student.name });
  res.json({ token, user: { id: student.id, name: student.name, email: student.email } });
}

async function trainerLogin(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const [rows] = await pool.query('SELECT * FROM trainers WHERE email = ?', [email]);
  const trainer = rows[0];
  if (!trainer || !(await bcrypt.compare(password, trainer.password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signToken({ id: trainer.id, role: 'trainer', name: trainer.name });
  res.json({ token, user: { id: trainer.id, name: trainer.name, email: trainer.email } });
}

const tableByRole = { admin: 'admins', student: 'students', trainer: 'trainers' };

async function changePassword(req, res) {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'current_password and new_password are required' });
  }
  if (new_password.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const table = tableByRole[req.user.role];
  const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [req.user.id]);
  const account = rows[0];
  if (!account || !(await bcrypt.compare(current_password, account.password_hash))) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const passwordHash = await bcrypt.hash(new_password, 10);
  await pool.query(`UPDATE ${table} SET password_hash = ? WHERE id = ?`, [passwordHash, req.user.id]);
  res.json({ message: 'Password updated' });
}

module.exports = { adminLogin, studentLogin, trainerLogin, changePassword };
