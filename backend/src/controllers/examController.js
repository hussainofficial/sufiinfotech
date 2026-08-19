const fs = require('fs');
const ExcelJS = require('exceljs');
const pool = require('../config/db');

async function createExam(req, res) {
  const { course_id, title, duration_minutes, pass_marks, negative_marks } = req.body;
  if (!course_id || !title) {
    return res.status(400).json({ error: 'course_id and title are required' });
  }
  const [result] = await pool.query(
    'INSERT INTO exams (course_id, title, duration_minutes, pass_marks, negative_marks) VALUES (?, ?, ?, ?, ?)',
    [course_id, title, duration_minutes || 30, pass_marks || 0, negative_marks || 0]
  );
  res.status(201).json({ id: result.insertId });
}

async function addQuestion(req, res) {
  const { exam_id } = req.params;
  const { question_text, option_a, option_b, option_c, option_d, correct_option, marks } = req.body;
  if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
    return res.status(400).json({ error: 'All question fields are required' });
  }

  await pool.query(
    `INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks || 1]
  );
  await pool.query(
    'UPDATE exams SET total_marks = (SELECT COALESCE(SUM(marks),0) FROM questions WHERE exam_id = ?) WHERE id = ?',
    [exam_id, exam_id]
  );
  res.status(201).json({ message: 'Question added' });
}

// Bulk-adds questions from an uploaded Excel file. Expected columns (header row required):
// question_text | option_a | option_b | option_c | option_d | correct_option | marks
const VALID_OPTIONS = new Set(['A', 'B', 'C', 'D']);

async function uploadQuestionsExcel(req, res) {
  const { exam_id } = req.params;
  if (!req.file) return res.status(400).json({ error: 'An Excel file is required' });

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(req.file.path);
  const sheet = workbook.worksheets[0];
  if (!sheet) return res.status(400).json({ error: 'The uploaded file has no sheets' });

  const headerRow = sheet.getRow(1).values.map((v) => String(v || '').trim().toLowerCase());
  const colIndex = (name) => headerRow.indexOf(name);
  const idx = {
    question_text: colIndex('question_text'),
    option_a: colIndex('option_a'),
    option_b: colIndex('option_b'),
    option_c: colIndex('option_c'),
    option_d: colIndex('option_d'),
    correct_option: colIndex('correct_option'),
    marks: colIndex('marks'),
  };
  if (Object.values(idx).slice(0, 6).some((i) => i === -1)) {
    return res.status(400).json({
      error: 'Missing required columns. Expected headers: question_text, option_a, option_b, option_c, option_d, correct_option, marks (optional)',
    });
  }

  const rowsToInsert = [];
  const errors = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header
    const cell = (i) => String(row.values[i] ?? '').trim();
    const question_text = cell(idx.question_text);
    if (!question_text) return; // skip blank rows

    const correct_option = cell(idx.correct_option).toUpperCase();
    if (!VALID_OPTIONS.has(correct_option)) {
      errors.push(`Row ${rowNumber}: correct_option must be A, B, C, or D`);
      return;
    }
    const marks = idx.marks !== -1 ? (Number(cell(idx.marks)) || 1) : 1;

    rowsToInsert.push([
      exam_id, question_text, cell(idx.option_a), cell(idx.option_b),
      cell(idx.option_c), cell(idx.option_d), correct_option, marks,
    ]);
  });

  if (rowsToInsert.length === 0) {
    return res.status(400).json({ error: 'No valid question rows found', details: errors });
  }

  for (const row of rowsToInsert) {
    await pool.query(
      `INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      row
    );
  }
  await pool.query(
    'UPDATE exams SET total_marks = (SELECT COALESCE(SUM(marks),0) FROM questions WHERE exam_id = ?) WHERE id = ?',
    [exam_id, exam_id]
  );

  fs.unlink(req.file.path, () => {});
  res.status(201).json({ inserted: rowsToInsert.length, skipped: errors.length, errors });
}

async function publishExam(req, res) {
  const { exam_id } = req.params;
  await pool.query('UPDATE exams SET is_published = TRUE WHERE id = ?', [exam_id]);
  res.json({ message: 'Exam published' });
}

// Admin/trainer-facing: all exams, with course title and question count.
async function listExams(req, res) {
  const [rows] = await pool.query(
    `SELECT e.*, c.title AS course_title, COUNT(q.id) AS question_count
     FROM exams e
     JOIN courses c ON c.id = e.course_id
     LEFT JOIN questions q ON q.exam_id = e.id
     GROUP BY e.id
     ORDER BY e.created_at DESC`
  );
  res.json(rows);
}

// Admin/trainer-facing: questions for one exam, including the correct answer (for editing/review).
async function listQuestions(req, res) {
  const { exam_id } = req.params;
  const [rows] = await pool.query('SELECT * FROM questions WHERE exam_id = ? ORDER BY id', [exam_id]);
  res.json(rows);
}

async function deleteQuestion(req, res) {
  const { question_id } = req.params;
  const [rows] = await pool.query('SELECT exam_id FROM questions WHERE id = ?', [question_id]);
  if (!rows[0]) return res.status(404).json({ error: 'Question not found' });

  await pool.query('DELETE FROM questions WHERE id = ?', [question_id]);
  await pool.query(
    'UPDATE exams SET total_marks = (SELECT COALESCE(SUM(marks),0) FROM questions WHERE exam_id = ?) WHERE id = ?',
    [rows[0].exam_id, rows[0].exam_id]
  );
  res.json({ message: 'Question deleted' });
}

// Assigns an exam to one or more specific students with a scheduled start time.
// Re-assigning an already-assigned student just updates their scheduled time.
async function assignExam(req, res) {
  const { exam_id } = req.params;
  const { student_ids, scheduled_at } = req.body;
  if (!Array.isArray(student_ids) || student_ids.length === 0 || !scheduled_at) {
    return res.status(400).json({ error: 'student_ids[] and scheduled_at are required' });
  }

  for (const studentId of student_ids) {
    await pool.query(
      `INSERT INTO exam_assignments (exam_id, student_id, scheduled_at) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE scheduled_at = VALUES(scheduled_at)`,
      [exam_id, studentId, scheduled_at]
    );
  }
  res.status(201).json({ message: `Assigned to ${student_ids.length} student(s)` });
}

async function unassignExam(req, res) {
  const { exam_id, student_id } = req.params;
  await pool.query('DELETE FROM exam_assignments WHERE exam_id = ? AND student_id = ?', [exam_id, student_id]);
  res.json({ message: 'Assignment removed' });
}

// Admin/trainer-facing: who's assigned to this exam and when it unlocks for them.
async function listAssignments(req, res) {
  const { exam_id } = req.params;
  const [rows] = await pool.query(
    `SELECT ea.student_id, ea.scheduled_at, s.name AS student_name, s.email AS student_email
     FROM exam_assignments ea
     JOIN students s ON s.id = ea.student_id
     WHERE ea.exam_id = ?
     ORDER BY ea.scheduled_at`,
    [exam_id]
  );
  res.json(rows);
}

// Student-facing: exams assigned to them, with their unlock time and whether course fees are clear.
async function listAvailableExams(req, res) {
  const studentId = req.user.id;
  const [rows] = await pool.query(
    `SELECT e.id, e.course_id, e.title, e.duration_minutes, e.total_marks, e.pass_marks, e.negative_marks, ea.scheduled_at
     FROM exam_assignments ea
     JOIN exams e ON e.id = ea.exam_id
     WHERE ea.student_id = ? AND e.is_published = TRUE
     ORDER BY ea.scheduled_at`,
    [studentId]
  );
  for (const row of rows) {
    row.fees_cleared = !(await hasPendingFees(studentId, row.course_id));
  }
  res.json(rows);
}

// True if the student has any unpaid (pending/overdue) fee installment for the given course.
// A student with no fee plan at all for the course is treated as unrestricted.
async function hasPendingFees(studentId, courseId) {
  const [[row]] = await pool.query(
    `SELECT COUNT(*) AS pending FROM fee_installments fi
     JOIN fee_plans fp ON fp.id = fi.fee_plan_id
     WHERE fp.student_id = ? AND fp.course_id = ? AND fi.status != 'paid'`,
    [studentId, courseId]
  );
  return row.pending > 0;
}

// Starts an attempt and returns the questions WITHOUT the correct answer.
async function startAttempt(req, res) {
  const studentId = req.user.id;
  const { exam_id } = req.params;

  const [assignmentRows] = await pool.query(
    'SELECT * FROM exam_assignments WHERE exam_id = ? AND student_id = ?',
    [exam_id, studentId]
  );
  const assignment = assignmentRows[0];
  if (!assignment) return res.status(403).json({ error: 'This exam is not assigned to you' });
  if (new Date(assignment.scheduled_at) > new Date()) {
    return res.status(403).json({ error: 'This exam has not started yet', scheduled_at: assignment.scheduled_at });
  }

  const [examCourseRows] = await pool.query('SELECT course_id FROM exams WHERE id = ?', [exam_id]);
  if (!examCourseRows[0]) return res.status(404).json({ error: 'Exam not found' });
  if (await hasPendingFees(studentId, examCourseRows[0].course_id)) {
    return res.status(403).json({ error: 'Please clear your pending course fees before attempting this exam.' });
  }

  const [existing] = await pool.query(
    "SELECT * FROM exam_attempts WHERE exam_id = ? AND student_id = ? AND status = 'in_progress'",
    [exam_id, studentId]
  );
  let attempt = existing[0];
  if (!attempt) {
    const [result] = await pool.query(
      'INSERT INTO exam_attempts (exam_id, student_id) VALUES (?, ?)',
      [exam_id, studentId]
    );
    attempt = { id: result.insertId, started_at: new Date() };
  }

  const [exam] = await pool.query('SELECT * FROM exams WHERE id = ?', [exam_id]);
  const [questions] = await pool.query(
    'SELECT id, question_text, option_a, option_b, option_c, option_d, marks FROM questions WHERE exam_id = ?',
    [exam_id]
  );

  res.json({ attemptId: attempt.id, exam: exam[0], questions });
}

// Submits answers, auto-grades (applying negative marking if the exam has any), and stores the score.
async function submitAttempt(req, res) {
  const studentId = req.user.id;
  const { attempt_id } = req.params;
  const { answers } = req.body; // [{ question_id, selected_option }]

  const [attemptRows] = await pool.query(
    "SELECT * FROM exam_attempts WHERE id = ? AND student_id = ? AND status = 'in_progress'",
    [attempt_id, studentId]
  );
  const attempt = attemptRows[0];
  if (!attempt) return res.status(404).json({ error: 'No active attempt found' });

  const [examRows] = await pool.query('SELECT negative_marks FROM exams WHERE id = ?', [attempt.exam_id]);
  const negativeMarks = Number(examRows[0]?.negative_marks || 0);

  const [questions] = await pool.query('SELECT * FROM questions WHERE exam_id = ?', [attempt.exam_id]);
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  let score = 0;
  for (const ans of answers || []) {
    const question = questionMap.get(ans.question_id);
    if (!question || !ans.selected_option) continue;
    const isCorrect = question.correct_option === ans.selected_option;
    score += isCorrect ? question.marks : -negativeMarks;

    await pool.query(
      `INSERT INTO exam_answers (attempt_id, question_id, selected_option, is_correct)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE selected_option = VALUES(selected_option), is_correct = VALUES(is_correct)`,
      [attempt_id, ans.question_id, ans.selected_option, isCorrect]
    );
  }
  score = Math.max(0, Math.round(score * 100) / 100);

  const status = req.body.auto_submitted ? 'auto_submitted' : 'submitted';
  await pool.query(
    'UPDATE exam_attempts SET score = ?, status = ?, submitted_at = NOW() WHERE id = ?',
    [score, status, attempt_id]
  );

  res.json({ score, status });
}

async function myResults(req, res) {
  const studentId = req.user.id;
  const [rows] = await pool.query(
    `SELECT ea.id AS attempt_id, e.title AS exam_title, ea.score, e.total_marks, e.pass_marks, ea.submitted_at
     FROM exam_attempts ea
     JOIN exams e ON e.id = ea.exam_id
     WHERE ea.student_id = ? AND ea.status != 'in_progress'
     ORDER BY ea.submitted_at DESC`,
    [studentId]
  );
  res.json(rows);
}

module.exports = {
  createExam, addQuestion, uploadQuestionsExcel, publishExam, listExams, listQuestions, deleteQuestion,
  assignExam, unassignExam, listAssignments,
  listAvailableExams, startAttempt, submitAttempt, myResults,
};
