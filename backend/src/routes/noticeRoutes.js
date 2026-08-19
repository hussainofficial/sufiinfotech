const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { authRequired } = require('../middleware/auth');
const { listNotices, createNotice } = require('../controllers/noticeController');

const router = express.Router();

router.get('/', asyncHandler(listNotices)); // public
router.post('/', authRequired('admin'), asyncHandler(createNotice));

module.exports = router;
