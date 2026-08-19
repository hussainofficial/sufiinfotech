const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { authRequired } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createExam, addQuestion, uploadQuestionsExcel, publishExam, listExams, listQuestions, deleteQuestion,
  assignExam, unassignExam, listAssignments,
  listAvailableExams, startAttempt, submitAttempt, myResults,
} = require('../controllers/examController');

const router = express.Router();

// Admin/trainer — exam authoring
router.get('/', authRequired('admin', 'trainer'), asyncHandler(listExams));
router.post('/', authRequired('admin', 'trainer'), asyncHandler(createExam));
router.get('/:exam_id/questions', authRequired('admin', 'trainer'), asyncHandler(listQuestions));
router.post('/:exam_id/questions', authRequired('admin', 'trainer'), asyncHandler(addQuestion));
router.post('/:exam_id/questions/upload', authRequired('admin', 'trainer'), upload.single('file'), asyncHandler(uploadQuestionsExcel));
router.delete('/questions/:question_id', authRequired('admin', 'trainer'), asyncHandler(deleteQuestion));
router.patch('/:exam_id/publish', authRequired('admin', 'trainer'), asyncHandler(publishExam));

// Admin/trainer — assigning exams to specific students with a scheduled time
router.get('/:exam_id/assignments', authRequired('admin', 'trainer'), asyncHandler(listAssignments));
router.post('/:exam_id/assignments', authRequired('admin', 'trainer'), asyncHandler(assignExam));
router.delete('/:exam_id/assignments/:student_id', authRequired('admin', 'trainer'), asyncHandler(unassignExam));

// Student — taking exams
router.get('/available', authRequired('student'), asyncHandler(listAvailableExams));
router.post('/:exam_id/start', authRequired('student'), asyncHandler(startAttempt));
router.post('/attempts/:attempt_id/submit', authRequired('student'), asyncHandler(submitAttempt));
router.get('/results/mine', authRequired('student'), asyncHandler(myResults));

module.exports = router;
