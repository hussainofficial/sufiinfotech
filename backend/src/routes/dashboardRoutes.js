const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { authRequired } = require('../middleware/auth');
const { summary, revenueByMonth, enquiriesByCourse } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/summary', authRequired('admin'), asyncHandler(summary));
router.get('/revenue-by-month', authRequired('admin'), asyncHandler(revenueByMonth));
router.get('/enquiries-by-course', authRequired('admin'), asyncHandler(enquiriesByCourse));

module.exports = router;
