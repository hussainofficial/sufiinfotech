const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { authRequired } = require('../middleware/auth');
const { issueCertificate, myCertificates, verifyCertificate } = require('../controllers/certificateController');

const router = express.Router();

router.post('/', authRequired('admin'), asyncHandler(issueCertificate));
router.get('/mine', authRequired('student'), asyncHandler(myCertificates));
router.get('/verify/:code', asyncHandler(verifyCertificate)); // public

module.exports = router;
