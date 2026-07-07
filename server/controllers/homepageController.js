const homepageService = require('../services/homepageService');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

exports.getAllSections = catchAsync(async (req, res) => {
  const sections = await homepageService.getAllSections();
  ApiResponse.success(res, { sections });
});

exports.getSection = catchAsync(async (req, res) => {
  const section = await homepageService.getSectionByType(req.params.type);
  if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
  ApiResponse.success(res, { section });
});

exports.upsertSection = catchAsync(async (req, res) => {
  const section = await homepageService.upsertSection(req.params.type, req.body);
  ApiResponse.success(res, { section }, 'Section updated');
});

exports.updateHeroBanners = catchAsync(async (req, res) => {
  const section = await homepageService.updateHeroBanners(req.body);
  ApiResponse.success(res, { section }, 'Hero banners updated');
});

exports.updateAnnouncementBar = catchAsync(async (req, res) => {
  const section = await homepageService.updateAnnouncementBar(req.body);
  ApiResponse.success(res, { section }, 'Announcement bar updated');
});

exports.updateNewsletter = catchAsync(async (req, res) => {
  const section = await homepageService.updateNewsletter(req.body);
  ApiResponse.success(res, { section }, 'Newsletter section updated');
});

exports.saveAll = catchAsync(async (req, res) => {
  const { announcement, banners, newsletter } = req.body;
  const operations = [];
  if (banners) operations.push(homepageService.updateHeroBanners({ heroBanners: banners }));
  if (announcement) operations.push(homepageService.updateAnnouncementBar(announcement));
  if (newsletter) operations.push(homepageService.updateNewsletter(newsletter));
  await Promise.all(operations);
  ApiResponse.success(res, null, 'Homepage saved');
});

exports.updateInstagram = catchAsync(async (req, res) => {
  const section = await homepageService.updateInstagram(req.body);
  ApiResponse.success(res, { section }, 'Instagram section updated');
});
