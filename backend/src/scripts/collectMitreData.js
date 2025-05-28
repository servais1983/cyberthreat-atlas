/**
 * Script de collecte automatique des données MITRE ATT&CK
 * Ce script télécharge et formate les données STIX JSON depuis le dépôt officiel MITRE
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// URLs des fichiers STIX JSON officiels de MITRE ATT&CK
const ENTERPRISE_ATTACK_URL = 'https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master/enterprise-attack/enterprise-attack.json';
const MOBILE_ATTACK_URL = 'https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master/mobile-attack/mobile-attack.json';
const ICS_ATTACK_URL = 'https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master/ics-attack/ics-attack.json';

// Dossier de destination pour les données téléchargées
const DATA_DIR = path.join(__dirname, '../../data');

/**
 * Télécharge un fichier JSON depuis une URL
 * @param {string} url - URL du fichier à télécharger
 * @returns {Promise<Object>} - Contenu JSON du fichier
 */
async function downloadJsonFile(url) {
  console.log(`Téléchargement des données depuis ${url}...`);
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors du téléchargement depuis ${url}:`, error.message);
    throw error;
  }
}

/**
 * Extrait les groupes d'attaque des données STIX
 * @param {Object} stixData - Données STIX
 * @returns {Array} - Liste des groupes d'attaque formatés
 */
function extractAttackGroups(stixData) {
  console.log('Extraction des groupes d\'attaque...');
  const groups = [];
  
  // Filtrer les objets de type intrusion-set (groupes d'attaque)
  const intrusionSets = stixData.objects.filter(obj => obj.type === 'intrusion-set');
  
  for (const group of intrusionSets) {
    // Extraire les relations avec d'autres objets
    const relationships = stixData.objects.filter(obj => 
      obj.type === 'relationship' && 
      (obj.source_ref === group.id || obj.target_ref === group.id)
    );
    
    // Extraire les techniques utilisées par ce groupe
    const techniques = [];
    for (const rel of relationships) {
      if (rel.relationship_type === 'uses' && rel.source_ref === group.id) {
        const targetObj = stixData.objects.find(obj => obj.id === rel.target_ref);
        if (targetObj && targetObj.type === 'attack-pattern') {
          techniques.push(targetObj.external_references.find(ref => ref.source_name === 'mitre-attack').external_id);
        }
      }
    }
    
    // Extraire les malwares utilisés par ce groupe
    const malwares = [];
    for (const rel of relationships) {
      if (rel.relationship_type === 'uses' && rel.source_ref === group.id) {
        const targetObj = stixData.objects.find(obj => obj.id === rel.target_ref);
        if (targetObj && targetObj.type === 'malware') {
          malwares.push(targetObj.name);
        }
      }
    }
    
    // Extraire les secteurs ciblés
    const targetSectors = [];
    if (group.x_mitre_sectors) {
      targetSectors.push(...group.x_mitre_sectors);
    }
    
    // Créer l'objet groupe formaté
    const formattedGroup = {
      name: group.name,
      aliases: group.aliases || [],
      description: group.description || '',
      countryOfOrigin: group.x_mitre_country || 'Unknown',
      firstSeen: group.first_seen ? new Date(group.first_seen) : new Date('2000-01-01'),
      lastSeen: group.last_seen ? new Date(group.last_seen) : new Date(),
      motivations: group.primary_motivation ? [group.primary_motivation] : [],
      targetSectors: targetSectors,
      targetRegions: [],
      sophisticationLevel: group.x_mitre_sophistication || 'Unknown',
      references: group.external_references ? group.external_references.map(ref => ({
        url: ref.url || '',
        source: ref.source_name || '',
        description: ref.description || ''
      })) : [],
      relatedGroups: [],
      threatLevel: 8, // Valeur par défaut
      techniques: techniques,
      malwares: malwares
    };
    
    groups.push(formattedGroup);
  }
  
  console.log(`${groups.length} groupes d'attaque extraits`);
  return groups;
}

/**
 * Extrait les techniques d'attaque des données STIX
 * @param {Object} stixData - Données STIX
 * @returns {Array} - Liste des techniques d'attaque formatées
 */
function extractTechniques(stixData) {
  console.log('Extraction des techniques d\'attaque...');
  const techniques = [];
  
  // Filtrer les objets de type attack-pattern (techniques)
  const attackPatterns = stixData.objects.filter(obj => obj.type === 'attack-pattern');
  
  for (const technique of attackPatterns) {
    // Extraire l'ID MITRE
    const mitreRef = technique.external_references.find(ref => ref.source_name === 'mitre-attack');
    const mitreId = mitreRef ? mitreRef.external_id : '';
    
    // Extraire les plateformes
    const platforms = technique.x_mitre_platforms || [];
    
    // Extraire les sources de données
    const dataSources = technique.x_mitre_data_sources || [];
    
    // Créer l'objet technique formaté
    const formattedTechnique = {
      name: technique.name,
      mitreId: mitreId,
      description: technique.description || '',
      tactic: technique.kill_chain_phases ? technique.kill_chain_phases.map(phase => phase.phase_name).join(', ') : '',
      platforms: platforms,
      dataSources: dataSources,
      mitigation: technique.x_mitre_detection || '',
      detection: technique.x_mitre_detection || '',
      references: technique.external_references ? technique.external_references.map(ref => ({
        url: ref.url || '',
        source: ref.source_name || '',
        description: ref.description || ''
      })) : []
    };
    
    techniques.push(formattedTechnique);
  }
  
  console.log(`${techniques.length} techniques extraites`);
  return techniques;
}

/**
 * Extrait les malwares des données STIX
 * @param {Object} stixData - Données STIX
 * @returns {Array} - Liste des malwares formatés
 */
function extractMalwares(stixData) {
  console.log('Extraction des malwares...');
  const malwares = [];
  
  // Filtrer les objets de type malware
  const malwareObjects = stixData.objects.filter(obj => obj.type === 'malware');
  
  for (const malware of malwareObjects) {
    // Extraire les relations avec d'autres objets
    const relationships = stixData.objects.filter(obj => 
      obj.type === 'relationship' && 
      (obj.source_ref === malware.id || obj.target_ref === malware.id)
    );
    
    // Extraire les techniques utilisées par ce malware
    const techniques = [];
    for (const rel of relationships) {
      if (rel.relationship_type === 'uses' && rel.source_ref === malware.id) {
        const targetObj = stixData.objects.find(obj => obj.id === rel.target_ref);
        if (targetObj && targetObj.type === 'attack-pattern') {
          const mitreRef = targetObj.external_references.find(ref => ref.source_name === 'mitre-attack');
          if (mitreRef) {
            techniques.push(mitreRef.external_id);
          }
        }
      }
    }
    
    // Extraire les groupes associés à ce malware
    const associatedGroups = [];
    for (const rel of relationships) {
      if (rel.relationship_type === 'uses' && rel.target_ref === malware.id) {
        const sourceObj = stixData.objects.find(obj => obj.id === rel.source_ref);
        if (sourceObj && sourceObj.type === 'intrusion-set') {
          associatedGroups.push(sourceObj.name);
        }
      }
    }
    
    // Extraire les plateformes ciblées
    const targetPlatforms = malware.x_mitre_platforms || [];
    
    // Créer l'objet malware formaté
    const formattedMalware = {
      name: malware.name,
      aliases: malware.x_mitre_aliases || [],
      description: malware.description || '',
      type: malware.x_mitre_malware_types ? malware.x_mitre_malware_types.join(', ') : 'Unknown',
      firstSeen: malware.first_seen ? new Date(malware.first_seen) : new Date('2000-01-01'),
      lastSeen: malware.last_seen ? new Date(malware.last_seen) : new Date(),
      associatedGroups: associatedGroups,
      techniques: techniques,
      targetPlatforms: targetPlatforms,
      capabilities: [],
      references: malware.external_references ? malware.external_references.map(ref => ({
        url: ref.url || '',
        source: ref.source_name || '',
        description: ref.description || ''
      })) : [],
      threatLevel: 7 // Valeur par défaut
    };
    
    malwares.push(formattedMalware);
  }
  
  console.log(`${malwares.length} malwares extraits`);
  return malwares;
}

/**
 * Fonction principale pour collecter les données MITRE ATT&CK
 */
async function collectMitreData() {
  console.log('Démarrage de la collecte des données MITRE ATT&CK...');
  
  try {
    // Créer les dossiers de destination s'ils n'existent pas
    await fs.mkdir(path.join(DATA_DIR, 'attack_groups'), { recursive: true });
    await fs.mkdir(path.join(DATA_DIR, 'techniques'), { recursive: true });
    await fs.mkdir(path.join(DATA_DIR, 'malwares'), { recursive: true });
    
    // Télécharger les données STIX
    const enterpriseAttackData = await downloadJsonFile(ENTERPRISE_ATTACK_URL);
    const mobileAttackData = await downloadJsonFile(MOBILE_ATTACK_URL);
    const icsAttackData = await downloadJsonFile(ICS_ATTACK_URL);
    
    // Extraire les groupes d'attaque
    const enterpriseGroups = extractAttackGroups(enterpriseAttackData);
    const mobileGroups = extractAttackGroups(mobileAttackData);
    const icsGroups = extractAttackGroups(icsAttackData);
    
    // Fusionner et dédupliquer les groupes
    const allGroups = [...enterpriseGroups, ...mobileGroups, ...icsGroups];
    const uniqueGroups = [];
    const groupNames = new Set();
    
    for (const group of allGroups) {
      if (!groupNames.has(group.name)) {
        groupNames.add(group.name);
        uniqueGroups.push(group);
      }
    }
    
    // Extraire les techniques
    const enterpriseTechniques = extractTechniques(enterpriseAttackData);
    const mobileTechniques = extractTechniques(mobileAttackData);
    const icsTechniques = extractTechniques(icsAttackData);
    
    // Fusionner et dédupliquer les techniques
    const allTechniques = [...enterpriseTechniques, ...mobileTechniques, ...icsTechniques];
    const uniqueTechniques = [];
    const techniqueIds = new Set();
    
    for (const technique of allTechniques) {
      if (!techniqueIds.has(technique.mitreId) && technique.mitreId) {
        techniqueIds.add(technique.mitreId);
        uniqueTechniques.push(technique);
      }
    }
    
    // Extraire les malwares
    const enterpriseMalwares = extractMalwares(enterpriseAttackData);
    const mobileMalwares = extractMalwares(mobileAttackData);
    const icsMalwares = extractMalwares(icsAttackData);
    
    // Fusionner et dédupliquer les malwares
    const allMalwares = [...enterpriseMalwares, ...mobileMalwares, ...icsMalwares];
    const uniqueMalwares = [];
    const malwareNames = new Set();
    
    for (const malware of allMalwares) {
      if (!malwareNames.has(malware.name)) {
        malwareNames.add(malware.name);
        uniqueMalwares.push(malware);
      }
    }
    
    // Enregistrer les données formatées
    await fs.writeFile(
      path.join(DATA_DIR, 'attack_groups', 'mitre_groups.json'),
      JSON.stringify(uniqueGroups, null, 2)
    );
    
    await fs.writeFile(
      path.join(DATA_DIR, 'techniques', 'mitre_techniques.json'),
      JSON.stringify(uniqueTechniques, null, 2)
    );
    
    await fs.writeFile(
      path.join(DATA_DIR, 'malwares', 'mitre_malwares.json'),
      JSON.stringify(uniqueMalwares, null, 2)
    );
    
    console.log('Collecte des données MITRE ATT&CK terminée avec succès');
    console.log(`Groupes d'attaque: ${uniqueGroups.length}`);
    console.log(`Techniques: ${uniqueTechniques.length}`);
    console.log(`Malwares: ${uniqueMalwares.length}`);
    
    return {
      groups: uniqueGroups,
      techniques: uniqueTechniques,
      malwares: uniqueMalwares
    };
  } catch (error) {
    console.error('Erreur lors de la collecte des données MITRE ATT&CK:', error);
    throw error;
  }
}

// Exécution du script si appelé directement
if (require.main === module) {
  collectMitreData()
    .then(() => {
      console.log('Script de collecte terminé');
      process.exit(0);
    })
    .catch(error => {
      console.error('Erreur lors de l\'exécution du script de collecte:', error);
      process.exit(1);
    });
}

module.exports = { collectMitreData };
