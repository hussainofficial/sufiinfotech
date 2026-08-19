const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { authRequired } = require('../middleware/auth');
const { createEnquiry, listEnquiries, updateEnquiryStatus } = require('../controllers/enquiryController');

const router = express.Router();

router.post('/', asyncHandler(createEnquiry)); // public
router.get('/', authRequired('admin'), asyncHandler(listEnquiries));
router.patch('/:id/status', authRequired('admin'), asyncHandler(updateEnquiryStatus));

module.exports = router;
