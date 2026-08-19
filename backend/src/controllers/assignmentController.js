const pool = require('../config/db');

async function createAssignment(req, res) {
  const { batch_id, title, description, due_date } = req.body;
  if (!batch_id || !title) {
    return res.status(400).json({ error: 'batch_id and title are required' });
  }
  const createdBy = req.user.role === 'trainer' ? req.user.id : null;

  const [result] = await pool.query(
    'INSERT INTO assignments (batch_id, title, description, due_date, created_by) VALUES (?, ?, ?, ?, ?)',
    [batch_id, title, description || null, due_date || null, createdBy]
  );
  res.status(201).json({ id: result.insertId });
}

async function listAssignmentsForBatch(req, res) {
  const { batch_id } = req.query;
  const [rows] = await pool.query(
    'SELECT * FROM assignments WHERE batch_id = ? ORDER BY due_date',
    [batch_id]
  );
  res.json(rows);
}

// Student-facing: assignments for batches they're enrolled in, with their own submission (if any).
async function myAssignments(req, res) {
  const studentId = req.user.id;
  const [rows] = await pool.query(
    `SELECT a.*, s.id AS submission_id, s.file_url AS submission_file_url, s.marks, s.feedback
     FROM assignments a
     JOIN student_batches sb ON sb.batch_id = a.batch_id
     LEFT JOIN assignment_submissions s ON s.assignment_id = a.id AND s.student_id = ?
     WHERE sb.student_id = ?
     ORDER BY a.due_date`,
    [studentId, studentId]
  );
  res.json(rows);
}

async function submitAssignment(req, res) {
  const studentId = req.user.id;
  const { assignment_id } = req.params;
  if (!req.file) return res.status(400).json({ error: 'A file is required' });

  const fileUrl = `/uploads/${req.file.filename}`;
  await pool.query(
    `INSERT INTO assignment_submissions (assignment_id, student_id, file_url)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE file_url = VALUES(file_url), submitted_at = NOW(), marks = NULL, feedback = NULL`,
    [assignment_id, studentId, fileUrl]
  );
  res.status(201).json({ file_url: fileUrl });
}

async function listSubmissions(req, res) {
  const { assignment_id } = req.params;
  const [rows] = await pool.query(
    `SELECT sub.*, st.name AS student_name FROM assignment_submissions sub
     JOIN students st ON st.id = sub.student_id
     WHERE sub.assignment_id = ?`,
    [assignment_id]
  );
  res.json(rows);
}

async function gradeSubmission(req, res) {
  const { submission_id } = req.params;
  const { marks, feedback } = req.body;
  await pool.query(
    'UPDATE assignment_submissions SET marks = ?, feedback = ? WHERE id = ?',
    [marks ?? null, feedback || null, submission_id]
  );
  res.json({ message: 'Submission graded' });
}

module.exports = {
  createAssignment, listAssignmentsForBatch, myAssignments,
  submitAssignment, listSubmissions, gradeSubmission,
};
