const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, authorize } = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);
router.get('/admins', verifyToken, authorize('super_admin'), authController.listAdmins);
router.post('/admins', verifyToken, authorize('super_admin'), authController.createAdmin);
router.put('/admins/:id', verifyToken, authorize('super_admin'), authController.updateAdmin);
router.delete('/admins/:id', verifyToken, authorize('super_admin'), authController.deleteAdmin);
router.patch('/admins/:id/disable', verifyToken, authorize('super_admin'), authController.disableAdmin);
router.patch('/admins/:id/enable', verifyToken, authorize('super_admin'), authController.enableAdmin);

module.exports = router;
