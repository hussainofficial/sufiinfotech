const pool = require('../config/db');
const { sendMail } = require('../utils/mailer');

async function createEnquiry(req, res) {
  const { name, phone, email, course_id, message } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }

  const [result] = await pool.query(
    'INSERT INTO enquiries (name, phone, email, course_id, message) VALUES (?, ?, ?, ?, ?)',
    [name, phone, email || null, course_id || null, message || null]
  );

  if (email) {
    sendMail({
      to: email,
      subject: 'Thank you for your enquiry — Sufi Infotech',
      type: 'general',
      html: `<p>Hi ${name},</p><p>Thanks for reaching out to Sufi Infotech. Our team will contact you shortly on ${phone}.</p>`,
    }).catch(() => {});
  }

  res.status(201).json({ id: result.insertId, message: 'Enquiry submitted successfully' });
}

async function listEnquiries(req, res) {
  const { status } = req.query;
  let query = `SELECT e.*, c.title AS course_title FROM enquiries e
               LEFT JOIN courses c ON c.id = e.course_id`;
  const params = [];
  if (status) {
    query += ' WHERE e.status = ?';
    params.push(status);
  }
  query += ' ORDER BY e.created_at DESC';

  const [rows] = await pool.query(query, params);
  res.json(rows);
}

async function updateEnquiryStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['new', 'contacted', 'converted', 'closed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  await pool.query('UPDATE enquiries SET status = ? WHERE id = ?', [status, id]);
  res.json({ message: 'Status updated' });
}

module.exports = { createEnquiry, listEnquiries, updateEnquiryStatus };
