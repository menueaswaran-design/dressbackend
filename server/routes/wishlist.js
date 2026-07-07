const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { verifyCustomerToken } = require('../middleware/customerAuth');

router.get('/', verifyCustomerToken, wishlistController.getWishlist);
router.post('/', verifyCustomerToken, wishlistController.addToWishlist);
router.delete('/:productId', verifyCustomerToken, wishlistController.removeFromWishlist);

module.exports = router;
