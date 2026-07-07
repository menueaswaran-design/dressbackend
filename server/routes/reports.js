const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/sales', verifyToken, authorize('super_admin', 'admin'), reportController.sales);
router.get('/inventory', verifyToken, authorize('super_admin', 'admin', 'product_manager'), reportController.inventory);
router.get('/customers', verifyToken, authorize('super_admin', 'admin'), reportController.customers);
router.get('/coupons', verifyToken, authorize('super_admin', 'admin'), reportController.coupons);

module.exports = router;
