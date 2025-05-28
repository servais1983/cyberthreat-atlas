/**
 * Serveur principal de l'application CyberThreat Atlas
 */

// Importations des modules
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Importation des configurations et services
const config = require('./config');
const connectDB = require('./database');
const { integrateMitreData } = require('./scripts/integrateMitreData');
// const logger = require('./utils/logger');

// Importation des routes
const authRoutes = require('./routes/auth');
const attackGroupRoutes = require('./routes/attackGroups');
const campaignRoutes = require('./routes/campaigns');
const healthRoutes = require('./routes/health');

// Création de l'application Express
const app = express();

// Middlewares de sécurité et performance
app.use(helmet()); // Protection contre les vulnérabilités web courantes
app.use(compression()); // Compression gzip des réponses

// Configuration CORS
app.use(cors({
  origin: config.cors.origin,
  methods: config.cors.methods,
  allowedHeaders: config.cors.allowedHeaders
}));

// Limitation des requêtes (protection contre les attaques DDoS)
const limiter = rateLimit({
  windowMs: config.security.rateLimitWindow,
  max: config.security.rateLimitMax,
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use('/api/', limiter); // Applique le rate limiting aux routes API

// Logging des requêtes HTTP
app.use(morgan(config.logging.format));

// Parsers pour les requêtes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Route de base pour vérifier que l'API fonctionne
app.get('/', (req, res) => {
  res.json({
    name: 'CyberThreat Atlas API',
    version: '1.0.0',
    status: 'running'
  });
});

// Montage des routes API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/attack-groups', attackGroupRoutes);
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1/health', healthRoutes);

// Middleware de gestion des erreurs 404 (routes non trouvées)
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `La route ${req.originalUrl} n'existe pas`
  });
});

// Middleware de gestion des erreurs générales
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.name || 'Server Error',
    message: err.message || 'Une erreur interne est survenue',
    stack: config.env === 'development' ? err.stack : undefined
  });
});

// Démarrage du serveur
const startServer = async () => {
  try {
    // Connexion à MongoDB
    await connectDB();
    console.log('MongoDB connecté');
    
    // Intégration des données MITRE ATT&CK
    console.log('Démarrage de l\'intégration des données MITRE ATT&CK...');
    try {
      await integrateMitreData();
      console.log('Intégration des données MITRE ATT&CK terminée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'intégration des données MITRE ATT&CK:', error);
      console.log('Le serveur continuera à démarrer malgré l\'erreur d\'intégration');
    }
    
    // Démarrage du serveur HTTP
    const PORT = config.server.port;
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT} en mode ${config.env}`);
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Gestion des signaux pour l'arrêt gracieux
process.on('SIGTERM', () => {
  console.log('Signal SIGTERM reçu. Arrêt gracieux du serveur...');
  process.exit(0);
});

// Lancer le serveur
startServer();

// Export pour les tests
module.exports = app;
