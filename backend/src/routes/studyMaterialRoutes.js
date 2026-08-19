const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { authRequired } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { listMaterials, myMaterials, uploadMaterial } = require('../controllers/studyMaterialController');

const router = express.Router();

router.get('/', authRequired('admin', 'trainer'), asyncHandler(listMaterials));
router.get('/mine', authRequired('student'), asyncHandler(myMaterials));
router.post('/', authRequired('admin', 'trainer'), upload.single('file'), asyncHandler(uploadMaterial));

module.exports = router;
