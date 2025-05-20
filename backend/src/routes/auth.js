const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Registration validation
const validateRegistration = [
  check('name')
    .not().isEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ max: 50 })
    .withMessage('Name cannot be more than 50 characters'),
  check('email')
    .not().isEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  check('password')
    .not().isEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  check('role')
    .optional()
    .isIn(['admin', 'analyst', 'reader'])
    .withMessage('Invalid role')
];

// Login validation
const validateLogin = [
  check('email')
    .not().isEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  check('password')
    .not().isEmpty()
    .withMessage('Password is required')
];

// Profile update validation
const validateProfileUpdate = [
  check('name')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Name cannot be more than 50 characters'),
  check('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
];

// Password change validation
const validatePasswordChange = [
  check('currentPassword')
    .not().isEmpty()
    .withMessage('Current password is required'),
  check('newPassword')
    .not().isEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

// Password reset validation
const validatePasswordReset = [
  check('password')
    .not().isEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

// Public routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.put('/reset-password/:resetToken', validatePasswordReset, authController.resetPassword);

// Protected routes (require auth)
router.get('/me', authMiddleware, authController.getCurrentUser);
router.put('/update-profile', authMiddleware, validateProfileUpdate, authController.updateProfile);
router.put('/change-password', authMiddleware, validatePasswordChange, authController.changePassword);

module.exports = router;
