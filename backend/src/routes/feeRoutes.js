const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { authRequired } = require('../middleware/auth');
const { myFees, listAllFees, markInstallmentPaid } = require('../controllers/feeController');

const router = express.Router();

router.get('/mine', authRequired('student'), asyncHandler(myFees));
router.get('/', authRequired('admin'), asyncHandler(listAllFees));
router.patch('/:id/pay', authRequired('admin'), asyncHandler(markInstallmentPaid));

module.exports = router;
