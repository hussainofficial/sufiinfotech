const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { authRequired } = require('../middleware/auth');
const { adminLogin, studentLogin, trainerLogin, changePassword } = require('../controllers/authController');

const router = express.Router();

router.post('/admin/login', asyncHandler(adminLogin));
router.post('/student/login', asyncHandler(studentLogin));
router.post('/trainer/login', asyncHandler(trainerLogin));
router.post('/change-password', authRequired('admin', 'student', 'trainer'), asyncHandler(changePassword));

module.exports = router;
