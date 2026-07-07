const express = require('express');
const router = express.Router();
const navigationController = require('../controllers/navigationController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/:location', navigationController.getByLocation);
router.put('/:location', verifyToken, authorize('super_admin', 'admin'), navigationController.upsert);
router.patch('/:location/items', verifyToken, authorize('super_admin', 'admin'), navigationController.updateItems);

module.exports = router;
