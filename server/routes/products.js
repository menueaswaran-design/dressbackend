const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { body } = require('express-validator');

router.get('/', productController.list);
router.get('/slug/:slug', productController.getBySlug);
router.get('/:id', productController.get);
router.post('/', verifyToken, authorize('super_admin', 'admin', 'product_manager'), [
  body('name').notEmpty(),
  body('category').notEmpty(),
  body('mrp').isNumeric(),
  body('sellingPrice').isNumeric(),
], validate, productController.create);
router.put('/:id', verifyToken, authorize('super_admin', 'admin', 'product_manager'), productController.update);
router.delete('/:id', verifyToken, authorize('super_admin', 'admin'), productController.remove);
router.patch('/:id/restore', verifyToken, authorize('super_admin', 'admin'), productController.restore);
router.post('/bulk/delete', verifyToken, authorize('super_admin', 'admin'), productController.bulkDelete);
router.post('/bulk/status', verifyToken, authorize('super_admin', 'admin'), productController.bulkUpdateStatus);
router.post('/upload/images', verifyToken, upload.array('images', 10), productController.uploadImages);
router.delete('/images/:publicId', verifyToken, productController.deleteImage);

module.exports = router;
