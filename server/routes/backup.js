const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const { verifyToken, authorize } = require('../middleware/auth');

router.post('/create', verifyToken, authorize('super_admin'), backupController.create);
router.get('/', verifyToken, authorize('super_admin'), backupController.list);
router.post('/restore', verifyToken, authorize('super_admin'), backupController.restore);

module.exports = router;
