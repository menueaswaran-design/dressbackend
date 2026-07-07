const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', categoryController.list);
router.get('/slug/:slug', categoryController.getBySlug);
router.get('/:id', categoryController.get);
router.post('/', verifyToken, authorize('super_admin', 'admin', 'product_manager'), categoryController.create);
router.put('/:id', verifyToken, authorize('super_admin', 'admin', 'product_manager'), categoryController.update);
router.delete('/:id', verifyToken, authorize('super_admin', 'admin'), categoryController.remove);

module.exports = router;
