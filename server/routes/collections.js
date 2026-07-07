const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', collectionController.list);
router.get('/slug/:slug', collectionController.getBySlug);
router.get('/:id', verifyToken, collectionController.get);
router.post('/', verifyToken, authorize('super_admin', 'admin', 'product_manager'), collectionController.create);
router.put('/:id', verifyToken, authorize('super_admin', 'admin', 'product_manager'), collectionController.update);
router.delete('/:id', verifyToken, authorize('super_admin', 'admin'), collectionController.remove);
router.post('/:id/products', verifyToken, authorize('super_admin', 'admin', 'product_manager'), collectionController.addProducts);
router.delete('/:id/products', verifyToken, authorize('super_admin', 'admin', 'product_manager'), collectionController.removeProducts);

module.exports = router;
