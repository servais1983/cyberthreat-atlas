/**
 * Script d'initialisation de la base de données
 * Ce script peuple la base de données MongoDB avec les données initiales
 * pour les groupes d'attaquants, campagnes, techniques, malwares, etc.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const config = require('../config');
const { AttackGroup, Campaign, Technique, Malware, Region, Sector } = require('../models');
const logger = require('../utils/logger');

/**
 * Fonction principale d'initialisation de la base de données
 */
async function initDatabase() {
  logger.info('Démarrage de l\'initialisation de la base de données...');
  
  try {
    // Connexion à la base de données MongoDB
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('Connecté à MongoDB');

    // Chargement et insertion des données initiales
    await loadAttackGroups();
    await loadCampaigns();
    await loadTechniques();
    await loadMalwares();
    await loadRegions();
    await loadSectors();
    
    logger.info('Initialisation de la base de données terminée avec succès');
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation de la base de données:', error);
  } finally {
    // Fermeture de la connexion à la base de données
    await mongoose.connection.close();
    logger.info('Connexion à MongoDB fermée');
  }
}

/**
 * Chargement des groupes d'attaquants
 */
async function loadAttackGroups() {
  logger.info('Chargement des groupes d\'attaquants...');
  
  try {
    // Vérifier si la collection est vide
    const count = await AttackGroup.countDocuments();
    
    if (count > 0) {
      logger.info(`La collection des groupes d'attaquants contient déjà ${count} documents. Importation ignorée.`);
      return;
    }
    
    // Lire le fichier JSON des groupes d'attaquants
    const dataPath = path.join(__dirname, '../../../data/attack_groups/apt_groups.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Insérer les données dans la base de données
    await AttackGroup.insertMany(data);
    
    logger.info(`${data.length} groupes d'attaquants importés avec succès`);
  } catch (error) {
    logger.error('Erreur lors du chargement des groupes d\'attaquants:', error);
  }
}

/**
 * Chargement des campagnes
 */
async function loadCampaigns() {
  logger.info('Chargement des campagnes...');
  
  try {
    // Vérifier si la collection est vide
    const count = await Campaign.countDocuments();
    
    if (count > 0) {
      logger.info(`La collection des campagnes contient déjà ${count} documents. Importation ignorée.`);
      return;
    }
    
    // Lire le fichier JSON des campagnes
    const dataPath = path.join(__dirname, '../../../data/campaigns/campaigns.json');
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(dataPath)) {
      logger.warn(`Le fichier ${dataPath} n'existe pas. Importation des campagnes ignorée.`);
      return;
    }
    
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Insérer les données dans la base de données
    await Campaign.insertMany(data);
    
    logger.info(`${data.length} campagnes importées avec succès`);
  } catch (error) {
    logger.error('Erreur lors du chargement des campagnes:', error);
  }
}

/**
 * Chargement des techniques
 */
async function loadTechniques() {
  logger.info('Chargement des techniques...');
  
  try {
    // Vérifier si la collection est vide
    const count = await Technique.countDocuments();
    
    if (count > 0) {
      logger.info(`La collection des techniques contient déjà ${count} documents. Importation ignorée.`);
      return;
    }
    
    // Lire le fichier JSON des techniques
    const dataPath = path.join(__dirname, '../../../data/techniques/techniques.json');
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(dataPath)) {
      logger.warn(`Le fichier ${dataPath} n'existe pas. Importation des techniques ignorée.`);
      return;
    }
    
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Insérer les données dans la base de données
    await Technique.insertMany(data);
    
    logger.info(`${data.length} techniques importées avec succès`);
  } catch (error) {
    logger.error('Erreur lors du chargement des techniques:', error);
  }
}

/**
 * Chargement des malwares
 */
async function loadMalwares() {
  logger.info('Chargement des malwares...');
  
  try {
    // Vérifier si la collection est vide
    const count = await Malware.countDocuments();
    
    if (count > 0) {
      logger.info(`La collection des malwares contient déjà ${count} documents. Importation ignorée.`);
      return;
    }
    
    // Lire le fichier JSON des malwares
    const dataPath = path.join(__dirname, '../../../data/malwares/malwares.json');
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(dataPath)) {
      logger.warn(`Le fichier ${dataPath} n'existe pas. Importation des malwares ignorée.`);
      return;
    }
    
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Insérer les données dans la base de données
    await Malware.insertMany(data);
    
    logger.info(`${data.length} malwares importés avec succès`);
  } catch (error) {
    logger.error('Erreur lors du chargement des malwares:', error);
  }
}

/**
 * Chargement des régions
 */
async function loadRegions() {
  logger.info('Chargement des régions...');
  
  try {
    // Vérifier si la collection est vide
    const count = await Region.countDocuments();
    
    if (count > 0) {
      logger.info(`La collection des régions contient déjà ${count} documents. Importation ignorée.`);
      return;
    }
    
    // Lire le fichier JSON des régions
    const dataPath = path.join(__dirname, '../../../data/regions/regions.json');
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(dataPath)) {
      logger.warn(`Le fichier ${dataPath} n'existe pas. Importation des régions ignorée.`);
      return;
    }
    
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Insérer les données dans la base de données
    await Region.insertMany(data);
    
    logger.info(`${data.length} régions importées avec succès`);
  } catch (error) {
    logger.error('Erreur lors du chargement des régions:', error);
  }
}

/**
 * Chargement des secteurs
 */
async function loadSectors() {
  logger.info('Chargement des secteurs...');
  
  try {
    // Vérifier si la collection est vide
    const count = await Sector.countDocuments();
    
    if (count > 0) {
      logger.info(`La collection des secteurs contient déjà ${count} documents. Importation ignorée.`);
      return;
    }
    
    // Lire le fichier JSON des secteurs
    const dataPath = path.join(__dirname, '../../../data/sectors/sectors.json');
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(dataPath)) {
      logger.warn(`Le fichier ${dataPath} n'existe pas. Importation des secteurs ignorée.`);
      return;
    }
    
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Insérer les données dans la base de données
    await Sector.insertMany(data);
    
    logger.info(`${data.length} secteurs importés avec succès`);
  } catch (error) {
    logger.error('Erreur lors du chargement des secteurs:', error);
  }
}

// Exécution du script si appelé directement
if (require.main === module) {
  initDatabase()
    .then(() => {
      logger.info('Script d\'initialisation de la base de données terminé');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Erreur lors de l\'exécution du script:', error);
      process.exit(1);
    });
}

module.exports = { initDatabase };
