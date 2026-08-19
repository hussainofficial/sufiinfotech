const pool = require('../config/db');

async function listCourses(req, res) {
  const [rows] = await pool.query('SELECT * FROM courses WHERE is_active = TRUE ORDER BY title');
  res.json(rows);
}

async function createCourse(req, res) {
  const { title, description, duration_weeks, fee_amount } = req.body;
  if (!title || fee_amount == null) {
    return res.status(400).json({ error: 'Title and fee_amount are required' });
  }
  const [result] = await pool.query(
    'INSERT INTO courses (title, description, duration_weeks, fee_amount) VALUES (?, ?, ?, ?)',
    [title, description || null, duration_weeks || null, fee_amount]
  );
  res.status(201).json({ id: result.insertId });
}

async function updateCourse(req, res) {
  const { id } = req.params;
  const { title, description, duration_weeks, fee_amount, is_active } = req.body;
  await pool.query(
    `UPDATE courses SET title = COALESCE(?, title), description = COALESCE(?, description),
     duration_weeks = COALESCE(?, duration_weeks), fee_amount = COALESCE(?, fee_amount),
     is_active = COALESCE(?, is_active) WHERE id = ?`,
    [title, description, duration_weeks, fee_amount, is_active, id]
  );
  res.json({ message: 'Course updated' });
}

async function listBatches(req, res) {
  const { course_id } = req.query;
  let query = `SELECT b.*, c.title AS course_title, t.name AS trainer_name
               FROM batches b
               JOIN courses c ON c.id = b.course_id
               LEFT JOIN trainers t ON t.id = b.trainer_id`;
  const params = [];
  if (course_id) {
    query += ' WHERE b.course_id = ?';
    params.push(course_id);
  }
  query += ' ORDER BY b.start_date DESC';

  const [rows] = await pool.query(query, params);
  res.json(rows);
}

async function listMyBatches(req, res) {
  const trainerId = req.user.id;
  const [rows] = await pool.query(
    `SELECT b.*, c.title AS course_title FROM batches b
     JOIN courses c ON c.id = b.course_id
     WHERE b.trainer_id = ? ORDER BY b.start_date DESC`,
    [trainerId]
  );
  res.json(rows);
}

async function createBatch(req, res) {
  const { course_id, trainer_id, name, start_date, end_date, timing, seats_total } = req.body;
  if (!course_id || !name) {
    return res.status(400).json({ error: 'course_id and name are required' });
  }
  const [result] = await pool.query(
    `INSERT INTO batches (course_id, trainer_id, name, start_date, end_date, timing, seats_total)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [course_id, trainer_id || null, name, start_date || null, end_date || null, timing || null, seats_total || 30]
  );
  res.status(201).json({ id: result.insertId });
}

module.exports = { listCourses, createCourse, updateCourse, listBatches, listMyBatches, createBatch };
