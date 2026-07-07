const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyCustomerToken } = require('../middleware/customerAuth');

router.get('/', verifyCustomerToken, cartController.getCart);
router.post('/', verifyCustomerToken, cartController.addToCart);
router.put('/:itemId', verifyCustomerToken, cartController.updateCartItem);
router.delete('/:itemId', verifyCustomerToken, cartController.removeFromCart);
router.delete('/', verifyCustomerToken, cartController.clearCart);

module.exports = router;
