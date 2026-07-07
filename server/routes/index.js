const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/dashboard', require('./dashboard'));
router.use('/products', require('./products'));
router.use('/categories', require('./categories'));
router.use('/collections', require('./collections'));
router.use('/orders', require('./orders'));
router.use('/customers', require('./customers'));
router.use('/coupons', require('./coupons'));
router.use('/homepage', require('./homepage'));
router.use('/cms', require('./cms'));
router.use('/navigation', require('./navigation'));
router.use('/settings', require('./settings'));
router.use('/media', require('./media'));
router.use('/reports', require('./reports'));
router.use('/notifications', require('./notifications'));
router.use('/backup', require('./backup'));
router.use('/cart', require('./cart'));
router.use('/wishlist', require('./wishlist'));

module.exports = router;
