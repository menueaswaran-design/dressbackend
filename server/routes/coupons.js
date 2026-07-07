const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { verifyToken, authorize } = require('../middleware/auth');
const { verifyCustomerToken } = require('../middleware/customerAuth');

router.get('/', verifyToken, couponController.list);
router.get('/:id', verifyToken, couponController.get);
router.post('/', verifyToken, authorize('super_admin', 'admin'), couponController.create);
router.post('/validate', verifyCustomerToken, couponController.validate);
router.put('/:id', verifyToken, authorize('super_admin', 'admin'), couponController.update);
router.delete('/:id', verifyToken, authorize('super_admin', 'admin'), couponController.remove);

module.exports = router;
