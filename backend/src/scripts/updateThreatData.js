/**
 * Script d'actualisation automatique des données de threat intelligence
 * Ce script se connecte à diverses sources de threat intelligence pour récupérer
 * les dernières informations sur les groupes d'attaquants, campagnes, malwares, etc.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const config = require('../config');
const { AttackGroup, Campaign, Technique, Malware, Region, Sector } = require('../models');

// Sources de threat intelligence
const SOURCES = {
  MITRE_ATTCK: 'https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json',
  ALIENVAULT_OTX: 'https://otx.alienvault.com/api/v1/pulses/subscribed',
  THREATFOX: 'https://threatfox-api.abuse.ch/api/v1/',
  MALPEDIA: 'https://malpedia.caad.fkie.fraunhofer.de/api/get/families',
};

// Configuration des API keys (à stocker dans des variables d'environnement en production)
const API_KEYS = {
  ALIENVAULT_OTX: process.env.ALIENVAULT_API_KEY || 'your_api_key_here',
  THREATFOX: process.env.THREATFOX_API_KEY || 'your_api_key_here',
  MALPEDIA: process.env.MALPEDIA_API_KEY || 'your_api_key_here',
};

/**
 * Fonction principale d'actualisation des données
 */
async function updateThreatData() {
  console.log('Démarrage de l\'actualisation des données de threat intelligence...');
  
  try {
    // Connexion à la base de données MongoDB
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connecté à MongoDB');

    // Récupération et mise à jour des données depuis les différentes sources
    await updateAttackGroups();
    await updateCampaigns();
    await updateTechniques();
    await updateMalwares();
    
    console.log('Actualisation des données terminée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'actualisation des données:', error);
  } finally {
    // Fermeture de la connexion à la base de données
    await mongoose.connection.close();
    console.log('Connexion à MongoDB fermée');
  }
}

/**
 * Mise à jour des groupes d'attaquants
 */
async function updateAttackGroups() {
  console.log('Mise à jour des groupes d\'attaquants...');
  
  try {
    // Récupération des données depuis MITRE ATT&CK
    const response = await axios.get(SOURCES.MITRE_ATTCK);
    const data = response.data;
    
    // Filtrer les objets de type 'intrusion-set' (groupes d'attaquants dans MITRE ATT&CK)
    const attackGroups = data.objects.filter(obj => obj.type === 'intrusion-set');
    
    // Traitement et mise à jour de chaque groupe d'attaquants
    for (const group of attackGroups) {
      const existingGroup = await AttackGroup.findOne({ 'external_references.external_id': group.external_references[0].external_id });
      
      const groupData = {
        name: group.name,
        aliases: group.aliases || [],
        description: group.description,
        motivations: group.primary_motivation ? [group.primary_motivation] : [],
        first_seen: group.first_seen,
        techniques: [],
        tools: [],
        targets: group.intended_effect || [],
        references: group.external_references.map(ref => ref.url).filter(Boolean),
        active: true,
      };
      
      // Déterminer le pays d'origine si disponible
      if (group.country) {
        groupData.country = group.country;
      }
      
      if (existingGroup) {
        // Mise à jour du groupe existant
        await AttackGroup.findByIdAndUpdate(existingGroup._id, groupData);
        console.log(`Groupe mis à jour: ${group.name}`);
      } else {
        // Création d'un nouveau groupe
        await AttackGroup.create(groupData);
        console.log(`Nouveau groupe ajouté: ${group.name}`);
      }
    }
    
    console.log(`Mise à jour de ${attackGroups.length} groupes d'attaquants terminée`);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des groupes d\'attaquants:', error);
  }
}

/**
 * Mise à jour des campagnes
 */
async function updateCampaigns() {
  console.log('Mise à jour des campagnes...');
  
  try {
    // Récupération des données depuis MITRE ATT&CK
    const response = await axios.get(SOURCES.MITRE_ATTCK);
    const data = response.data;
    
    // Filtrer les objets de type 'campaign'
    const campaigns = data.objects.filter(obj => obj.type === 'campaign');
    
    // Traitement et mise à jour de chaque campagne
    for (const campaign of campaigns) {
      const existingCampaign = await Campaign.findOne({ 'external_references.external_id': campaign.external_references[0].external_id });
      
      const campaignData = {
        name: campaign.name,
        description: campaign.description,
        first_seen: campaign.first_seen,
        last_seen: campaign.last_seen,
        objectives: campaign.objective || [],
        references: campaign.external_references.map(ref => ref.url).filter(Boolean),
        active: campaign.last_seen ? new Date(campaign.last_seen) > new Date() : true,
      };
      
      if (existingCampaign) {
        // Mise à jour de la campagne existante
        await Campaign.findByIdAndUpdate(existingCampaign._id, campaignData);
        console.log(`Campagne mise à jour: ${campaign.name}`);
      } else {
        // Création d'une nouvelle campagne
        await Campaign.create(campaignData);
        console.log(`Nouvelle campagne ajoutée: ${campaign.name}`);
      }
    }
    
    console.log(`Mise à jour de ${campaigns.length} campagnes terminée`);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des campagnes:', error);
  }
}

/**
 * Mise à jour des techniques
 */
async function updateTechniques() {
  console.log('Mise à jour des techniques...');
  
  try {
    // Récupération des données depuis MITRE ATT&CK
    const response = await axios.get(SOURCES.MITRE_ATTCK);
    const data = response.data;
    
    // Filtrer les objets de type 'attack-pattern' (techniques dans MITRE ATT&CK)
    const techniques = data.objects.filter(obj => obj.type === 'attack-pattern');
    
    // Traitement et mise à jour de chaque technique
    for (const technique of techniques) {
      const existingTechnique = await Technique.findOne({ 'external_references.external_id': technique.external_references[0].external_id });
      
      const techniqueData = {
        name: technique.name,
        description: technique.description,
        mitre_id: technique.external_references[0].external_id,
        tactics: technique.kill_chain_phases ? technique.kill_chain_phases.map(phase => phase.phase_name) : [],
        references: technique.external_references.map(ref => ref.url).filter(Boolean),
        detection: technique.x_mitre_detection || '',
      };
      
      if (existingTechnique) {
        // Mise à jour de la technique existante
        await Technique.findByIdAndUpdate(existingTechnique._id, techniqueData);
        console.log(`Technique mise à jour: ${technique.name} (${techniqueData.mitre_id})`);
      } else {
        // Création d'une nouvelle technique
        await Technique.create(techniqueData);
        console.log(`Nouvelle technique ajoutée: ${technique.name} (${techniqueData.mitre_id})`);
      }
    }
    
    console.log(`Mise à jour de ${techniques.length} techniques terminée`);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des techniques:', error);
  }
}

/**
 * Mise à jour des malwares
 */
async function updateMalwares() {
  console.log('Mise à jour des malwares...');
  
  try {
    // Récupération des données depuis MITRE ATT&CK
    const response = await axios.get(SOURCES.MITRE_ATTCK);
    const data = response.data;
    
    // Filtrer les objets de type 'malware'
    const malwares = data.objects.filter(obj => obj.type === 'malware');
    
    // Traitement et mise à jour de chaque malware
    for (const malware of malwares) {
      const existingMalware = await Malware.findOne({ 'external_references.external_id': malware.external_references[0].external_id });
      
      const malwareData = {
        name: malware.name,
        aliases: malware.x_mitre_aliases || [],
        description: malware.description,
        type: malware.malware_types || [],
        platforms: malware.x_mitre_platforms || [],
        references: malware.external_references.map(ref => ref.url).filter(Boolean),
      };
      
      if (existingMalware) {
        // Mise à jour du malware existant
        await Malware.findByIdAndUpdate(existingMalware._id, malwareData);
        console.log(`Malware mis à jour: ${malware.name}`);
      } else {
        // Création d'un nouveau malware
        await Malware.create(malwareData);
        console.log(`Nouveau malware ajouté: ${malware.name}`);
      }
    }
    
    console.log(`Mise à jour de ${malwares.length} malwares terminée`);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des malwares:', error);
  }
}

// Exécution du script si appelé directement
if (require.main === module) {
  updateThreatData()
    .then(() => {
      console.log('Script d\'actualisation terminé');
      process.exit(0);
    })
    .catch(error => {
      console.error('Erreur lors de l\'exécution du script:', error);
      process.exit(1);
    });
}

module.exports = { updateThreatData };
