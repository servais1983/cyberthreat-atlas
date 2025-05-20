const express = require('express');
const { check } = require('express-validator');
const campaignController = require('../controllers/campaignController');
const router = express.Router();

// Validation middleware
const validateCampaign = [
  check('name')
    .not().isEmpty()
    .withMessage('Name is required')
    .trim(),
  check('description')
    .not().isEmpty()
    .withMessage('Description is required')
    .trim(),
  check('attack_group')
    .optional()
    .isMongoId()
    .withMessage('Invalid attack group ID'),
  check('start_date')
    .not().isEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  check('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((endDate, { req }) => {
      if (endDate && req.body.start_date && new Date(endDate) < new Date(req.body.start_date)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  check('status')
    .not().isEmpty()
    .withMessage('Status is required')
    .isIn(['ongoing', 'completed', 'planned', 'suspended'])
    .withMessage('Invalid status'),
  check('severity')
    .not().isEmpty()
    .withMessage('Severity is required')
    .isIn(['critical', 'high', 'medium', 'low'])
    .withMessage('Invalid severity level'),
  check('techniques_used')
    .optional()
    .isArray()
    .withMessage('Techniques used must be an array'),
  check('malware_used')
    .optional()
    .isArray()
    .withMessage('Malware used must be an array'),
  check('indicators')
    .optional()
    .isArray()
    .withMessage('Indicators must be an array'),
  check('targeted_sectors')
    .optional()
    .isArray()
    .withMessage('Targeted sectors must be an array'),
  check('targeted_regions')
    .optional()
    .isArray()
    .withMessage('Targeted regions must be an array'),
  check('references')
    .optional()
    .isArray()
    .withMessage('References must be an array')
];

// Routes for campaigns
router.get('/', campaignController.getAllCampaigns);
router.get('/timeline', campaignController.getCampaignTimeline);
router.get('/:id', campaignController.getCampaignById);
router.post('/', validateCampaign, campaignController.createCampaign);
router.put('/:id', validateCampaign, campaignController.updateCampaign);
router.delete('/:id', campaignController.deleteCampaign);
router.post('/search', campaignController.searchCampaigns);

module.exports = router;
