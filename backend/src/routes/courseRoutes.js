const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { authRequired } = require('../middleware/auth');
const {
  listCourses, createCourse, updateCourse, listBatches, listMyBatches, createBatch,
} = require('../controllers/courseController');

const router = express.Router();

router.get('/', asyncHandler(listCourses)); // public
router.post('/', authRequired('admin'), asyncHandler(createCourse));
router.patch('/:id', authRequired('admin'), asyncHandler(updateCourse));

router.get('/batches/all', asyncHandler(listBatches));
router.get('/batches/mine', authRequired('trainer'), asyncHandler(listMyBatches));
router.post('/batches', authRequired('admin'), asyncHandler(createBatch));

module.exports = router;
