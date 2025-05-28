/**
 * Script de planification des mises à jour automatiques
 * Ce script configure un cron job pour exécuter régulièrement le script d'actualisation des données
 */

const cron = require('node-cron');
const { updateThreatData } = require('./updateThreatData');
const logger = require('../utils/logger');

// Configuration de la fréquence des mises à jour
// Par défaut: tous les jours à 2h du matin
// Format cron: [minute] [heure] [jour du mois] [mois] [jour de la semaine]
const UPDATE_SCHEDULE = process.env.UPDATE_SCHEDULE || '0 2 * * *';

/**
 * Initialise la planification des mises à jour automatiques
 */
function initScheduler() {
  logger.info('Initialisation du planificateur de mises à jour automatiques');
  logger.info(`Fréquence configurée: ${UPDATE_SCHEDULE}`);
  
  // Planification de la tâche de mise à jour
  cron.schedule(UPDATE_SCHEDULE, async () => {
    logger.info('Démarrage de la mise à jour automatique des données de threat intelligence');
    
    try {
      await updateThreatData();
      logger.info('Mise à jour automatique terminée avec succès');
    } catch (error) {
      logger.error('Erreur lors de la mise à jour automatique:', error);
    }
  });
  
  logger.info('Planificateur de mises à jour automatiques initialisé avec succès');
  
  // Exécuter une mise à jour immédiate au démarrage de l'application
  if (process.env.UPDATE_ON_STARTUP === 'true') {
    logger.info('Exécution d'une mise à jour initiale au démarrage');
    updateThreatData()
      .then(() => logger.info('Mise à jour initiale terminée avec succès'))
      .catch(error => logger.error('Erreur lors de la mise à jour initiale:', error));
  }
}

module.exports = { initScheduler };
