const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { verifyToken, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', verifyToken, mediaController.list);
router.post('/upload', verifyToken, upload.single('file'), mediaController.upload);
router.post('/upload-multiple', verifyToken, upload.array('files', 10), mediaController.uploadMultiple);
router.delete('/:publicId', verifyToken, authorize('super_admin', 'admin'), mediaController.remove);
router.post('/bulk-delete', verifyToken, authorize('super_admin', 'admin'), mediaController.bulkRemove);

module.exports = router;
