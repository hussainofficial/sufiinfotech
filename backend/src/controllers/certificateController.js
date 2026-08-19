const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const pool = require('../config/db');
const { drawCertificate, gradeForPercentage } = require('../utils/certificatePdf');

const certDir = path.join(__dirname, '..', '..', 'uploads', 'certificates');
if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });

function generateCertificateCode() {
  return `SIC-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

async function issueCertificate(req, res) {
  const { student_id, course_id } = req.body;
  if (!student_id || !course_id) {
    return res.status(400).json({ error: 'student_id and course_id are required' });
  }

  const [studentRows] = await pool.query('SELECT * FROM students WHERE id = ?', [student_id]);
  const [courseRows] = await pool.query('SELECT * FROM courses WHERE id = ?', [course_id]);
  const student = studentRows[0];
  const course = courseRows[0];
  if (!student || !course) return res.status(404).json({ error: 'Student or course not found' });

  // Derive a grade from the student's exam performance in this course, if any.
  const [[perf]] = await pool.query(
    `SELECT COALESCE(SUM(ea.score), 0) AS earned, COALESCE(SUM(e.total_marks), 0) AS possible
     FROM exam_attempts ea
     JOIN exams e ON e.id = ea.exam_id
     WHERE ea.student_id = ? AND e.course_id = ? AND ea.status != 'in_progress'`,
    [student_id, course_id]
  );
  const percentage = perf.possible > 0 ? (perf.earned / perf.possible) * 100 : null;
  const grade = gradeForPercentage(percentage);

  const code = generateCertificateCode();
  const fileName = `${code}.pdf`;
  const filePath = path.join(certDir, fileName);
  const issuedDate = new Date();

  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  drawCertificate(doc, {
    studentName: student.name,
    courseTitle: course.title,
    durationWeeks: course.duration_weeks,
    certificateCode: code,
    enrollmentNo: `SI-STU-${String(student_id).padStart(5, '0')}`,
    issuedDate: issuedDate.toLocaleDateString('en-GB'),
    percentage,
  });

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  const fileUrl = `/uploads/certificates/${fileName}`;
  const [result] = await pool.query(
    'INSERT INTO certificates (student_id, course_id, certificate_code, grade, issued_date, file_url) VALUES (?, ?, ?, ?, ?, ?)',
    [student_id, course_id, code, grade, issuedDate, fileUrl]
  );

  res.status(201).json({ id: result.insertId, certificate_code: code, grade, file_url: fileUrl });
}

async function myCertificates(req, res) {
  const studentId = req.user.id;
  const [rows] = await pool.query(
    `SELECT cert.*, c.title AS course_title FROM certificates cert
     JOIN courses c ON c.id = cert.course_id
     WHERE cert.student_id = ? ORDER BY cert.issued_date DESC`,
    [studentId]
  );
  res.json(rows);
}

// Public verification by certificate code (e.g. for QR code scans).
async function verifyCertificate(req, res) {
  const { code } = req.params;
  const [rows] = await pool.query(
    `SELECT cert.certificate_code, cert.grade, cert.issued_date, s.name AS student_name, c.title AS course_title
     FROM certificates cert
     JOIN students s ON s.id = cert.student_id
     JOIN courses c ON c.id = cert.course_id
     WHERE cert.certificate_code = ?`,
    [code]
  );
  if (!rows[0]) return res.status(404).json({ valid: false });
  res.json({ valid: true, ...rows[0] });
}

module.exports = { issueCertificate, myCertificates, verifyCertificate };
