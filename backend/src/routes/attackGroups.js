const express = require('express');
const { check } = require('express-validator');
const attackGroupController = require('../controllers/attackGroupController');
const router = express.Router();

// Validation middleware
const validateAttackGroup = [
  check('name')
    .not().isEmpty()
    .withMessage('Name is required')
    .trim(),
  check('description')
    .not().isEmpty()
    .withMessage('Description is required')
    .trim(),
  check('country_of_origin')
    .optional()
    .trim(),
  check('first_seen_year')
    .optional()
    .isInt({ min: 1990, max: new Date().getFullYear() })
    .withMessage(`Year must be between 1990 and ${new Date().getFullYear()}`),
  check('aliases')
    .optional()
    .isArray()
    .withMessage('Aliases must be an array'),
  check('sponsored_by')
    .optional()
    .trim(),
  check('motivation')
    .optional()
    .isIn(['financial', 'espionage', 'hacktivism', 'sabotage', 'other'])
    .withMessage('Invalid motivation type'),
  check('sophistication_level')
    .optional()
    .isIn(['low', 'medium', 'high', 'advanced'])
    .withMessage('Invalid sophistication level'),
  check('known_techniques')
    .optional()
    .isArray()
    .withMessage('Known techniques must be an array'),
  check('associated_malware')
    .optional()
    .isArray()
    .withMessage('Associated malware must be an array'),
  check('targeted_sectors')
    .optional()
    .isArray()
    .withMessage('Targeted sectors must be an array'),
  check('targeted_regions')
    .optional()
    .isArray()
    .withMessage('Targeted regions must be an array')
];

// Routes for attack groups
router.get('/', attackGroupController.getAllAttackGroups);
router.get('/:id', attackGroupController.getAttackGroupById);
router.post('/', validateAttackGroup, attackGroupController.createAttackGroup);
router.put('/:id', validateAttackGroup, attackGroupController.updateAttackGroup);
router.delete('/:id', attackGroupController.deleteAttackGroup);
router.post('/search', attackGroupController.searchAttackGroups);

module.exports = router;
