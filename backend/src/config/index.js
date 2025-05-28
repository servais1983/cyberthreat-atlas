/**
 * Configuration principale de l'application
 * Ce fichier centralise toutes les variables de configuration
 */

require('dotenv').config(); // Charger les variables d'environnement depuis .env

module.exports = {
  // Environnement d'exécution
  env: process.env.NODE_ENV || 'development',
  
  // Configuration du serveur
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost'
  },
  
  // Configuration de la base de données
  mongoURI: process.env.MONGO_URI || 'mongodb://admin:password@mongodb:27017/cyberthreat-atlas?authSource=admin',
  
  // Configuration de sécurité
  security: {
    jwtSecret: process.env.JWT_SECRET || 'cyberthreat-atlas-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    rateLimitWindow: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 100 // 100 requêtes max par fenêtre
  },
  
  // Configuration des API externes
  externalApis: {
    mitre: {
      baseUrl: 'https://attack.mitre.org/api/'
    },
    virusTotal: {
      baseUrl: 'https://www.virustotal.com/api/v3/',
      apiKey: process.env.VIRUSTOTAL_API_KEY
    },
    shodan: {
      baseUrl: 'https://api.shodan.io/',
      apiKey: process.env.SHODAN_API_KEY
    },
    alienvault: {
      baseUrl: 'https://otx.alienvault.com/api/v1/',
      apiKey: process.env.ALIENVAULT_API_KEY
    },
    cve: {
      baseUrl: 'https://services.nvd.nist.gov/rest/json/cves/2.0/'
    }
  },
  
  // Configuration de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info', // debug, info, warn, error
    format: process.env.LOG_FORMAT || 'combined' // common, combined, dev, short, tiny
  },
  
  // Limites et pagination
  limits: {
    paginationDefaultLimit: 20,
    paginationMaxLimit: 100,
    maxSearchResults: 100,
    maxFileSize: 10 * 1024 * 1024 // 10 MB
  },
  
  // Configuration du CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  
  // Configuration des tâches planifiées (cron jobs)
  scheduledTasks: {
    updateMitreMatrix: process.env.UPDATE_MITRE_CRON || '0 0 * * *', // Tous les jours à minuit
    fetchThreatIntel: process.env.FETCH_THREAT_INTEL_CRON || '0 */6 * * *' // Toutes les 6 heures
  }
};
