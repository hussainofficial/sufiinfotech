const pool = require('../config/db');

async function createExam(req, res) {
  const { course_id, title, duration_minutes, pass_marks } = req.body;
  if (!course_id || !title) {
    return res.status(400).json({ error: 'course_id and title are required' });
  }
  const [result] = await pool.query(
    'INSERT INTO exams (course_id, title, duration_minutes, pass_marks) VALUES (?, ?, ?, ?)',
    [course_id, title, duration_minutes || 30, pass_marks || 0]
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

// Student-facing: list published exams for courses they're enrolled in.
async function listAvailableExams(req, res) {
  const studentId = req.user.id;
  const [rows] = await pool.query(
    `SELECT DISTINCT e.id, e.title, e.duration_minutes, e.total_marks, e.pass_marks
     FROM exams e
     JOIN courses c ON c.id = e.course_id
     JOIN batches b ON b.course_id = c.id
     JOIN student_batches sb ON sb.batch_id = b.id
     WHERE sb.student_id = ? AND e.is_published = TRUE`,
    [studentId]
  );
  res.json(rows);
}

// Starts an attempt and returns the questions WITHOUT the correct answer.
async function startAttempt(req, res) {
  const studentId = req.user.id;
  const { exam_id } = req.params;

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

// Submits answers, auto-grades, and stores the score.
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

  const [questions] = await pool.query('SELECT * FROM questions WHERE exam_id = ?', [attempt.exam_id]);
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  let score = 0;
  for (const ans of answers || []) {
    const question = questionMap.get(ans.question_id);
    if (!question) continue;
    const isCorrect = question.correct_option === ans.selected_option;
    if (isCorrect) score += question.marks;

    await pool.query(
      `INSERT INTO exam_answers (attempt_id, question_id, selected_option, is_correct)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE selected_option = VALUES(selected_option), is_correct = VALUES(is_correct)`,
      [attempt_id, ans.question_id, ans.selected_option, isCorrect]
    );
  }

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
  createExam, addQuestion, publishExam, listExams, listQuestions, deleteQuestion,
  listAvailableExams, startAttempt, submitAttempt, myResults,
};
