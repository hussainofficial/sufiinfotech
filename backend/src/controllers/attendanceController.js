const pool = require('../config/db');

async function markAttendance(req, res) {
  const { batch_id, date, records } = req.body; // records: [{ student_id, status }]
  if (!batch_id || !date || !Array.isArray(records)) {
    return res.status(400).json({ error: 'batch_id, date and records[] are required' });
  }

  const markedBy = req.user.role === 'trainer' ? req.user.id : null;

  for (const record of records) {
    await pool.query(
      `INSERT INTO attendance (student_id, batch_id, date, status, marked_by)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status)`,
      [record.student_id, batch_id, date, record.status, markedBy]
    );
  }

  res.json({ message: 'Attendance saved' });
}

async function myAttendance(req, res) {
  const studentId = req.user.id;
  const [rows] = await pool.query(
    'SELECT date, status FROM attendance WHERE student_id = ? ORDER BY date DESC',
    [studentId]
  );
  res.json(rows);
}

async function batchAttendance(req, res) {
  const { batch_id, date } = req.query;
  const [rows] = await pool.query(
    `SELECT a.student_id, s.name, a.status FROM attendance a
     JOIN students s ON s.id = a.student_id
     WHERE a.batch_id = ? AND a.date = ?`,
    [batch_id, date]
  );
  res.json(rows);
}

module.exports = { markAttendance, myAttendance, batchAttendance };
