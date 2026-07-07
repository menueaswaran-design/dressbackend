const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', verifyToken, customerController.list);
router.get('/:id', verifyToken, customerController.get);
router.put('/:id', verifyToken, authorize('super_admin', 'admin', 'customer_support'), customerController.update);
router.delete('/:id', verifyToken, authorize('super_admin', 'admin'), customerController.remove);

module.exports = router;
