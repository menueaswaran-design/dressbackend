const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', verifyToken, settingController.getAll);
router.get('/:group', verifyToken, settingController.getByGroup);
router.put('/:group', verifyToken, authorize('super_admin', 'admin'), settingController.upsert);
router.post('/:group/bulk', verifyToken, authorize('super_admin', 'admin'), settingController.bulkUpsert);

module.exports = router;
