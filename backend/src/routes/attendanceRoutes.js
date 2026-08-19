const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { authRequired } = require('../middleware/auth');
const { markAttendance, myAttendance, batchAttendance } = require('../controllers/attendanceController');

const router = express.Router();

router.post('/', authRequired('admin', 'trainer'), asyncHandler(markAttendance));
router.get('/mine', authRequired('student'), asyncHandler(myAttendance));
router.get('/batch', authRequired('admin', 'trainer'), asyncHandler(batchAttendance));

module.exports = router;
