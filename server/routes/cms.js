const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', verifyToken, cmsController.list);
router.get('/slug/:slug', cmsController.getBySlug);
router.get('/:id', verifyToken, cmsController.get);
router.post('/', verifyToken, authorize('super_admin', 'admin'), cmsController.create);
router.put('/:id', verifyToken, authorize('super_admin', 'admin'), cmsController.update);
router.delete('/:id', verifyToken, authorize('super_admin', 'admin'), cmsController.remove);

module.exports = router;
