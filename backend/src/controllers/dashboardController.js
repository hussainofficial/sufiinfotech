const pool = require('../config/db');

async function summary(req, res) {
  const [[{ totalStudents }]] = await pool.query('SELECT COUNT(*) AS totalStudents FROM students WHERE is_active = TRUE');
  const [[{ totalEnquiries }]] = await pool.query('SELECT COUNT(*) AS totalEnquiries FROM enquiries');
  const [[{ newEnquiries }]] = await pool.query("SELECT COUNT(*) AS newEnquiries FROM enquiries WHERE status = 'new'");
  const [[{ converted }]] = await pool.query("SELECT COUNT(*) AS converted FROM enquiries WHERE status = 'converted'");
  const [[{ activeBatches }]] = await pool.query('SELECT COUNT(*) AS activeBatches FROM batches WHERE is_active = TRUE');
  const [[{ pendingFees }]] = await pool.query(
    "SELECT COALESCE(SUM(amount),0) AS pendingFees FROM fee_installments WHERE status IN ('pending','overdue')"
  );
  const [[{ revenueCollected }]] = await pool.query(
    "SELECT COALESCE(SUM(amount),0) AS revenueCollected FROM payments WHERE status = 'success'"
  );

  const conversionRate = totalEnquiries > 0 ? Number(((converted / totalEnquiries) * 100).toFixed(1)) : 0;

  res.json({
    totalStudents, totalEnquiries, newEnquiries, converted,
    conversionRate, activeBatches, pendingFees, revenueCollected,
  });
}

async function revenueByMonth(req, res) {
  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(paid_at, '%Y-%m') AS month, SUM(amount) AS total
     FROM payments WHERE status = 'success'
     GROUP BY month ORDER BY month DESC LIMIT 12`
  );
  res.json(rows.reverse());
}

async function enquiriesByCourse(req, res) {
  const [rows] = await pool.query(
    `SELECT c.title, COUNT(e.id) AS enquiry_count
     FROM enquiries e JOIN courses c ON c.id = e.course_id
     GROUP BY c.id ORDER BY enquiry_count DESC`
  );
  res.json(rows);
}

module.exports = { summary, revenueByMonth, enquiriesByCourse };
