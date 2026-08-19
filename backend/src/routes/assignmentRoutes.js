const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { authRequired } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createAssignment, listAssignmentsForBatch, myAssignments,
  submitAssignment, listSubmissions, gradeSubmission,
} = require('../controllers/assignmentController');

const router = express.Router();

router.post('/', authRequired('admin', 'trainer'), asyncHandler(createAssignment));
router.get('/batch', authRequired('admin', 'trainer'), asyncHandler(listAssignmentsForBatch));
router.get('/mine', authRequired('student'), asyncHandler(myAssignments));
router.post('/:assignment_id/submit', authRequired('student'), upload.single('file'), asyncHandler(submitAssignment));
router.get('/:assignment_id/submissions', authRequired('admin', 'trainer'), asyncHandler(listSubmissions));
router.patch('/submissions/:submission_id/grade', authRequired('admin', 'trainer'), asyncHandler(gradeSubmission));

module.exports = router;
