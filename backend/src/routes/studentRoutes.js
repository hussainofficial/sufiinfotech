const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { authRequired } = require('../middleware/auth');
const { listStudents, listStudentsInBatch, setStudentActive } = require('../controllers/studentController');

const router = express.Router();

router.get('/', authRequired('admin'), asyncHandler(listStudents));
router.get('/batch/:batch_id', authRequired('admin', 'trainer'), asyncHandler(listStudentsInBatch));
router.patch('/:id/active', authRequired('admin'), asyncHandler(setStudentActive));

module.exports = router;
