const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { authRequired } = require('../middleware/auth');
const { listTrainers, createTrainer } = require('../controllers/trainerController');

const router = express.Router();

router.get('/', authRequired('admin'), asyncHandler(listTrainers));
router.post('/', authRequired('admin'), asyncHandler(createTrainer));

module.exports = router;
