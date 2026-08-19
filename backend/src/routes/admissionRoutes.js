const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { authRequired } = require('../middleware/auth');
const { createAdmission } = require('../controllers/admissionController');

const router = express.Router();

router.post('/', authRequired('admin'), asyncHandler(createAdmission));

module.exports = router;
