const pool = require('../config/db');

async function listNotices(req, res) {
  const [rows] = await pool.query(
    'SELECT * FROM notices WHERE is_public = TRUE ORDER BY created_at DESC LIMIT 50'
  );
  res.json(rows);
}

async function createNotice(req, res) {
  const { title, content, is_public } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }
  const [result] = await pool.query(
    'INSERT INTO notices (title, content, posted_by, is_public) VALUES (?, ?, ?, ?)',
    [title, content, req.user.id, is_public !== false]
  );
  res.status(201).json({ id: result.insertId });
}

module.exports = { listNotices, createNotice };
