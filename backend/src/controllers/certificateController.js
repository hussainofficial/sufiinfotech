const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const pool = require('../config/db');

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

  const code = generateCertificateCode();
  const fileName = `${code}.pdf`;
  const filePath = path.join(certDir, fileName);

  const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(2).stroke('#1e293b');
  doc.fontSize(28).fillColor('#1e293b').text('Sufi Infotech', 0, 70, { align: 'center' });
  doc.fontSize(16).fillColor('#475569').text('Certificate of Completion', { align: 'center' });
  doc.moveDown(2);
  doc.fontSize(14).fillColor('#334155').text('This is to certify that', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(26).fillColor('#0f172a').text(student.name, { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(14).fillColor('#334155').text('has successfully completed the course', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(20).fillColor('#0f172a').text(course.title, { align: 'center' });
  doc.moveDown(2);
  doc.fontSize(10).fillColor('#64748b').text(`Certificate ID: ${code}`, { align: 'center' });
  doc.text(`Issued: ${new Date().toLocaleDateString()}`, { align: 'center' });

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  const fileUrl = `/uploads/certificates/${fileName}`;
  const [result] = await pool.query(
    'INSERT INTO certificates (student_id, course_id, certificate_code, file_url) VALUES (?, ?, ?, ?)',
    [student_id, course_id, code, fileUrl]
  );

  res.status(201).json({ id: result.insertId, certificate_code: code, file_url: fileUrl });
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
    `SELECT cert.certificate_code, cert.issued_date, s.name AS student_name, c.title AS course_title
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
