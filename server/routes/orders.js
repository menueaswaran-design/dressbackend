const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, authorize } = require('../middleware/auth');
const { verifyCustomerToken } = require('../middleware/customerAuth');

router.get('/', verifyToken, orderController.list);
router.get('/number/:orderNumber', verifyToken, orderController.getByNumber);
router.get('/:id', verifyToken, orderController.get);
router.post('/', verifyToken, authorize('super_admin', 'admin', 'order_manager'), orderController.create);
router.patch('/:id/status', verifyToken, authorize('super_admin', 'admin', 'order_manager'), orderController.updateStatus);
router.patch('/:id/payment', verifyToken, authorize('super_admin', 'admin', 'order_manager'), orderController.updatePayment);
router.delete('/:id', verifyToken, authorize('super_admin', 'admin'), orderController.remove);

router.post('/checkout', verifyCustomerToken, orderController.checkout);
router.get('/my/all', verifyCustomerToken, orderController.myOrders);
router.get('/my/:id', verifyCustomerToken, orderController.myOrder);

module.exports = router;
