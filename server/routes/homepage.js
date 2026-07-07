const express = require('express');
const router = express.Router();
const homepageController = require('../controllers/homepageController');
const { verifyToken, authorize } = require('../middleware/auth');

router.post('/', verifyToken, authorize('super_admin', 'admin'), homepageController.saveAll);
router.get('/sections', homepageController.getAllSections);
router.get('/sections/:type', homepageController.getSection);
router.put('/sections/:type', verifyToken, authorize('super_admin', 'admin'), homepageController.upsertSection);
router.put('/hero-banners', verifyToken, authorize('super_admin', 'admin'), homepageController.updateHeroBanners);
router.put('/announcement-bar', verifyToken, authorize('super_admin', 'admin'), homepageController.updateAnnouncementBar);
router.put('/newsletter', verifyToken, authorize('super_admin', 'admin'), homepageController.updateNewsletter);
router.put('/instagram', verifyToken, authorize('super_admin', 'admin'), homepageController.updateInstagram);

module.exports = router;
