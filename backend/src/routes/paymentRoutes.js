const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { authRequired } = require('../middleware/auth');
const { createOrder, verifyPayment } = require('../controllers/paymentController');

const router = express.Router();

router.post('/create-order', authRequired('student'), asyncHandler(createOrder));
router.post('/verify', authRequired('student'), asyncHandler(verifyPayment));

module.exports = router;
