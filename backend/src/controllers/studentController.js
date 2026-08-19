const pool = require('../config/db');

async function listStudents(req, res) {
  const [rows] = await pool.query(
    `SELECT s.id, s.name, s.email, s.phone, s.is_active,
            GROUP_CONCAT(DISTINCT c.title SEPARATOR ', ') AS courses
     FROM students s
     LEFT JOIN student_batches sb ON sb.student_id = s.id
     LEFT JOIN batches b ON b.id = sb.batch_id
     LEFT JOIN courses c ON c.id = b.course_id
     GROUP BY s.id
     ORDER BY s.created_at DESC`
  );
  res.json(rows);
}

async function listStudentsInBatch(req, res) {
  const { batch_id } = req.params;
  const [rows] = await pool.query(
    `SELECT s.id, s.name, s.email FROM students s
     JOIN student_batches sb ON sb.student_id = s.id
     WHERE sb.batch_id = ?`,
    [batch_id]
  );
  res.json(rows);
}

// All students enrolled in any batch of a given course — used to pick who an exam gets assigned to.
async function listStudentsInCourse(req, res) {
  const { course_id } = req.params;
  const [rows] = await pool.query(
    `SELECT DISTINCT s.id, s.name, s.email FROM students s
     JOIN student_batches sb ON sb.student_id = s.id
     JOIN batches b ON b.id = sb.batch_id
     WHERE b.course_id = ?
     ORDER BY s.name`,
    [course_id]
  );
  res.json(rows);
}

async function setStudentActive(req, res) {
  const { id } = req.params;
  const { is_active } = req.body;
  await pool.query('UPDATE students SET is_active = ? WHERE id = ?', [!!is_active, id]);
  res.json({ message: 'Student updated' });
}

module.exports = { listStudents, listStudentsInBatch, listStudentsInCourse, setStudentActive };
