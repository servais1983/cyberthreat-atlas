/**
 * Routes de healthcheck pour l'API CyberThreat Atlas
 */
const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/v1/health
 * @desc    Vérification de l'état de santé de l'API
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is healthy and running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
