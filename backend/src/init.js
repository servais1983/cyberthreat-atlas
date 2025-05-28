/**
 * Script d'initialisation du serveur
 * Ce script est exécuté au démarrage du serveur pour initialiser les composants nécessaires
 */

const { initScheduler } = require('./scripts/scheduler');
const { initDatabase } = require('./scripts/initDatabase');
const { updateThreatData } = require('./scripts/updateThreatData');
const logger = require('./utils/logger');

/**
 * Initialise tous les composants nécessaires au démarrage du serveur
 */
async function initServer() {
  logger.info('Démarrage de l\'initialisation du serveur...');

  try {
    // Initialisation de la base de données avec les données de base
    logger.info('Initialisation de la base de données...');
    await initDatabase();
    logger.info('Base de données initialisée avec succès');

    // Mise à jour immédiate des données de threat intelligence
    logger.info('Mise à jour des données de threat intelligence au démarrage...');
    await updateThreatData();
    logger.info('Mise à jour des données terminée avec succès');

    // Initialisation du planificateur de mises à jour automatiques
    initScheduler();
    logger.info('Planificateur de mises à jour automatiques initialisé');

    logger.info('Initialisation du serveur terminée avec succès');
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation du serveur:', error);
    // Ne pas faire échouer le démarrage du serveur en cas d'erreur d'initialisation
    logger.warn('Le serveur continuera à démarrer malgré l\'erreur d\'initialisation');
  }
}

module.exports = { initServer };
