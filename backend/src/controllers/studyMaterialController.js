const pool = require('../config/db');

async function listMaterials(req, res) {
  const { course_id } = req.query;
  let query = `SELECT sm.*, c.title AS course_title FROM study_materials sm
               JOIN courses c ON c.id = sm.course_id`;
  const params = [];
  if (course_id) {
    query += ' WHERE sm.course_id = ?';
    params.push(course_id);
  }
  query += ' ORDER BY sm.created_at DESC';

  const [rows] = await pool.query(query, params);
  res.json(rows);
}

// Student-facing: material for courses they're enrolled in.
async function myMaterials(req, res) {
  const studentId = req.user.id;
  const [rows] = await pool.query(
    `SELECT DISTINCT sm.* FROM study_materials sm
     JOIN courses c ON c.id = sm.course_id
     JOIN batches b ON b.course_id = c.id
     JOIN student_batches sb ON sb.batch_id = b.id
     WHERE sb.student_id = ?
     ORDER BY sm.created_at DESC`,
    [studentId]
  );
  res.json(rows);
}

async function uploadMaterial(req, res) {
  const { course_id, title } = req.body;
  if (!course_id || !title || !req.file) {
    return res.status(400).json({ error: 'course_id, title and a file are required' });
  }

  const uploadedBy = req.user.role === 'trainer' ? req.user.id : null;
  const fileUrl = `/uploads/${req.file.filename}`;

  const [result] = await pool.query(
    'INSERT INTO study_materials (course_id, title, file_url, uploaded_by) VALUES (?, ?, ?, ?)',
    [course_id, title, fileUrl, uploadedBy]
  );
  res.status(201).json({ id: result.insertId, file_url: fileUrl });
}

module.exports = { listMaterials, myMaterials, uploadMaterial };
