const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, notificationController.list);
router.patch('/:id/read', verifyToken, notificationController.markRead);
router.post('/mark-all-read', verifyToken, notificationController.markAllRead);
router.get('/unread/count', verifyToken, notificationController.unreadCount);

module.exports = router;
