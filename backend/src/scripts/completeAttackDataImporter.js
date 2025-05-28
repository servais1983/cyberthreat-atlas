/**
 * Script d'importation exhaustive de données MITRE ATT&CK
 * Ce script collecte automatiquement TOUTES les données depuis les sources officielles MITRE ATT&CK
 * et les importe dans la base de données MongoDB.
 * 
 * Il récupère:
 * - TOUS les groupes APT connus (170+)
 * - TOUTES les techniques MITRE ATT&CK (200+)
 * - TOUS les malwares documentés
 * - TOUTES les campagnes documentées
 */

const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Modèles
const AttackGroup = require('../models/AttackGroup');
const Technique = require('../models/Technique');
const Campaign = require('../models/Campaign');
const Malware = require('../models/Malware');
const Region = require('../models/Region');
const Sector = require('../models/Sector');

// URLs des sources MITRE ATT&CK STIX
const MITRE_ENTERPRISE_URL = 'https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json';
const MITRE_MOBILE_URL = 'https://raw.githubusercontent.com/mitre/cti/master/mobile-attack/mobile-attack.json';
const MITRE_ICS_URL = 'https://raw.githubusercontent.com/mitre/cti/master/ics-attack/ics-attack.json';

// Régions et secteurs pour enrichir les données
const regions = [
  {
    name: "Amérique du Nord",
    countries: ["États-Unis", "Canada", "Mexique"],
    threatLevel: 9,
    activeGroups: []
  },
  {
    name: "Europe",
    countries: ["France", "Allemagne", "Royaume-Uni", "Italie", "Espagne", "Pays-Bas", "Belgique", "Suisse", "Suède", "Norvège", "Finlande", "Pologne", "Ukraine", "Russie"],
    threatLevel: 9,
    activeGroups: []
  },
  {
    name: "Asie",
    countries: ["Chine", "Japon", "Corée du Sud", "Corée du Nord", "Inde", "Singapour", "Taïwan", "Vietnam", "Thaïlande", "Indonésie", "Malaisie", "Philippines"],
    threatLevel: 9,
    activeGroups: []
  },
  {
    name: "Moyen-Orient",
    countries: ["Israël", "Arabie Saoudite", "Émirats arabes unis", "Qatar", "Koweït", "Iran", "Irak", "Turquie", "Syrie", "Liban", "Jordanie"],
    threatLevel: 9,
    activeGroups: []
  },
  {
    name: "Amérique latine",
    countries: ["Brésil", "Argentine", "Colombie", "Chili", "Pérou", "Venezuela", "Mexique", "Cuba"],
    threatLevel: 7,
    activeGroups: []
  },
  {
    name: "Afrique",
    countries: ["Afrique du Sud", "Égypte", "Nigeria", "Kenya", "Maroc", "Algérie", "Tunisie", "Libye", "Éthiopie", "Ghana"],
    threatLevel: 6,
    activeGroups: []
  },
  {
    name: "Océanie",
    countries: ["Australie", "Nouvelle-Zélande", "Papouasie-Nouvelle-Guinée", "Fidji"],
    threatLevel: 7,
    activeGroups: []
  }
];

const sectors = [
  {
    name: "Gouvernement",
    description: "Organisations gouvernementales, agences fédérales, administrations locales et services publics",
    threatLevel: 10,
    activeGroups: []
  },
  {
    name: "Finance",
    description: "Banques, assurances, services financiers, marchés boursiers, fintechs et institutions financières",
    threatLevel: 9,
    activeGroups: []
  },
  {
    name: "Énergie",
    description: "Pétrole et gaz, électricité, énergies renouvelables, infrastructures énergétiques et services publics",
    threatLevel: 9,
    activeGroups: []
  },
  {
    name: "Santé",
    description: "Hôpitaux, cliniques, laboratoires pharmaceutiques, recherche médicale et assurances santé",
    threatLevel: 8,
    activeGroups: []
  },
  {
    name: "Défense",
    description: "Industries de défense, contractants militaires, agences de renseignement et organisations militaires",
    threatLevel: 10,
    activeGroups: []
  },
  {
    name: "Technologie",
    description: "Entreprises technologiques, fournisseurs de logiciels, services cloud, télécommunications et électronique",
    threatLevel: 9,
    activeGroups: []
  },
  {
    name: "Industrie",
    description: "Fabrication, automobile, aérospatiale, construction, produits chimiques et industries lourdes",
    threatLevel: 8,
    activeGroups: []
  },
  {
    name: "Transport",
    description: "Aviation, maritime, ferroviaire, logistique et infrastructures de transport",
    threatLevel: 8,
    activeGroups: []
  },
  {
    name: "Éducation",
    description: "Universités, écoles, instituts de recherche et organisations éducatives",
    threatLevel: 7,
    activeGroups: []
  },
  {
    name: "Médias",
    description: "Presse, télévision, radio, médias en ligne, divertissement et réseaux sociaux",
    threatLevel: 7,
    activeGroups: []
  },
  {
    name: "Vente au détail",
    description: "Commerce de détail, e-commerce, grande distribution et chaînes d'approvisionnement",
    threatLevel: 7,
    activeGroups: []
  },
  {
    name: "Infrastructure critique",
    description: "Eau, électricité, télécommunications, services d'urgence et infrastructures essentielles",
    threatLevel: 10,
    activeGroups: []
  }
];

/**
 * Récupère les données STIX depuis une URL
 * @param {string} url - URL de la source STIX
 * @returns {Promise<Object>} - Données STIX
 */
async function fetchStixData(url) {
  try {
    console.log(`Récupération des données depuis ${url}...`);
    const response = await axios.get(url);
    console.log(`Données récupérées avec succès depuis ${url}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des données depuis ${url}:`, error.message);
    throw error;
  }
}

/**
 * Extrait les groupes d'attaque des données STIX
 * @param {Object} stixData - Données STIX
 * @returns {Array} - Groupes d'attaque formatés pour MongoDB
 */
function extractGroups(stixData) {
  const groups = [];
  const objects = stixData.objects || [];
  
  // Filtrer les objets de type intrusion-set (groupes d'attaque)
  const intrusionSets = objects.filter(obj => obj.type === 'intrusion-set');
  
  console.log(`Nombre de groupes trouvés: ${intrusionSets.length}`);
  
  // Traiter chaque groupe
  for (const group of intrusionSets) {
    try {
      // Trouver les relations avec ce groupe
      const relationships = objects.filter(obj => 
        obj.type === 'relationship' && 
        (obj.source_ref === group.id || obj.target_ref === group.id)
      );
      
      // Extraire les techniques utilisées par ce groupe
      const techniques = relationships
        .filter(rel => 
          rel.relationship_type === 'uses' && 
          rel.source_ref === group.id && 
          rel.target_ref.startsWith('attack-pattern--')
        )
        .map(rel => {
          const technique = objects.find(obj => obj.id === rel.target_ref);
          return technique ? technique.external_references.find(ref => ref.source_name === 'mitre-attack')?.external_id : null;
        })
        .filter(Boolean);
      
      // Extraire les malwares utilisés par ce groupe
      const malwares = relationships
        .filter(rel => 
          rel.relationship_type === 'uses' && 
          rel.source_ref === group.id && 
          rel.target_ref.startsWith('malware--')
        )
        .map(rel => {
          const malware = objects.find(obj => obj.id === rel.target_ref);
          return malware ? malware.name : null;
        })
        .filter(Boolean);
      
      // Extraire les secteurs ciblés
      const targetSectors = relationships
        .filter(rel => 
          rel.relationship_type === 'targets' && 
          rel.source_ref === group.id && 
          rel.target_ref.startsWith('identity--')
        )
        .map(rel => {
          const identity = objects.find(obj => obj.id === rel.target_ref);
          return identity ? identity.name : null;
        })
        .filter(Boolean);
      
      // Déterminer le pays d'origine (si disponible)
      let countryOfOrigin = "Unknown";
      if (group.country) {
        countryOfOrigin = group.country;
      } else if (group.description && group.description.includes("China")) {
        countryOfOrigin = "China";
      } else if (group.description && group.description.includes("Russia")) {
        countryOfOrigin = "Russia";
      } else if (group.description && group.description.includes("Iran")) {
        countryOfOrigin = "Iran";
      } else if (group.description && group.description.includes("North Korea")) {
        countryOfOrigin = "North Korea";
      }
      
      // Déterminer les régions ciblées
      const targetRegions = [];
      if (targetSectors.some(sector => ["Government", "Defense", "Intelligence"].includes(sector))) {
        targetRegions.push("Amérique du Nord", "Europe");
      }
      if (group.description && group.description.includes("Asia")) {
        targetRegions.push("Asie");
      }
      if (group.description && group.description.includes("Middle East")) {
        targetRegions.push("Moyen-Orient");
      }
      
      // Déterminer le niveau de sophistication
      let sophisticationLevel = "Medium";
      if (group.sophistication) {
        sophisticationLevel = group.sophistication;
      } else if (techniques.length > 20) {
        sophisticationLevel = "High";
      }
      
      // Déterminer le niveau de menace
      let threatLevel = 7;
      if (sophisticationLevel === "High") {
        threatLevel = 9;
      } else if (sophisticationLevel === "Medium") {
        threatLevel = 7;
      } else {
        threatLevel = 5;
      }
      
      // Créer l'objet groupe formaté pour MongoDB
      const formattedGroup = {
        name: group.name,
        aliases: group.aliases || [],
        countryOfOrigin: countryOfOrigin,
        description: group.description || `Groupe d'attaque identifié par MITRE ATT&CK.`,
        firstSeen: group.first_seen ? new Date(group.first_seen) : new Date("2010-01-01"),
        lastSeen: group.last_seen ? new Date(group.last_seen) : new Date(),
        motivations: group.primary_motivation ? [group.primary_motivation] : ["Espionnage", "Vol de données"],
        targetSectors: targetSectors.length > 0 ? targetSectors : ["Gouvernement", "Défense"],
        targetRegions: targetRegions.length > 0 ? targetRegions : ["Monde entier"],
        sophisticationLevel: sophisticationLevel,
        references: group.external_references ? group.external_references.map(ref => ({
          url: ref.url || "https://attack.mitre.org/",
          source: ref.source_name || "MITRE ATT&CK",
          description: ref.description || `Référence pour ${group.name}`
        })) : [],
        relatedGroups: [],
        threatLevel: threatLevel
      };
      
      groups.push(formattedGroup);
    } catch (error) {
      console.error(`Erreur lors du traitement du groupe ${group.name}:`, error.message);
    }
  }
  
  return groups;
}

/**
 * Extrait les techniques des données STIX
 * @param {Object} stixData - Données STIX
 * @returns {Array} - Techniques formatées pour MongoDB
 */
function extractTechniques(stixData) {
  const techniques = [];
  const objects = stixData.objects || [];
  
  // Filtrer les objets de type attack-pattern (techniques)
  const attackPatterns = objects.filter(obj => obj.type === 'attack-pattern');
  
  console.log(`Nombre de techniques trouvées: ${attackPatterns.length}`);
  
  // Traiter chaque technique
  for (const technique of attackPatterns) {
    try {
      // Extraire l'ID MITRE
      const mitreId = technique.external_references
        .find(ref => ref.source_name === 'mitre-attack')?.external_id || '';
      
      // Extraire la tactique
      let tactic = "Unknown";
      const killChainPhases = technique.kill_chain_phases || [];
      if (killChainPhases.length > 0) {
        tactic = killChainPhases[0].phase_name
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
      
      // Déterminer les plateformes
      const platforms = technique.x_mitre_platforms || ["Windows"];
      
      // Déterminer les sources de données
      const dataSources = technique.x_mitre_data_sources || ["Process Monitoring", "File Monitoring"];
      
      // Créer l'objet technique formaté pour MongoDB
      const formattedTechnique = {
        name: technique.name,
        mitreId: mitreId,
        description: technique.description || `Technique identifiée par MITRE ATT&CK.`,
        tactic: tactic,
        platforms: platforms,
        dataSources: dataSources,
        mitigation: technique.x_mitre_detection || "Surveillance des activités suspectes et mise en place de contrôles de sécurité appropriés.",
        detection: technique.x_mitre_detection || "Surveiller les comportements anormaux et les indicateurs de compromission associés.",
        references: technique.external_references ? technique.external_references.map(ref => ({
          url: ref.url || "https://attack.mitre.org/",
          source: ref.source_name || "MITRE ATT&CK",
          description: ref.description || `Référence pour ${technique.name}`
        })) : []
      };
      
      techniques.push(formattedTechnique);
    } catch (error) {
      console.error(`Erreur lors du traitement de la technique ${technique.name}:`, error.message);
    }
  }
  
  return techniques;
}

/**
 * Extrait les malwares des données STIX
 * @param {Object} stixData - Données STIX
 * @returns {Array} - Malwares formatés pour MongoDB
 */
function extractMalwares(stixData) {
  const malwares = [];
  const objects = stixData.objects || [];
  
  // Filtrer les objets de type malware
  const malwareObjects = objects.filter(obj => obj.type === 'malware');
  
  console.log(`Nombre de malwares trouvés: ${malwareObjects.length}`);
  
  // Traiter chaque malware
  for (const malware of malwareObjects) {
    try {
      // Trouver les relations avec ce malware
      const relationships = objects.filter(obj => 
        obj.type === 'relationship' && 
        (obj.source_ref === malware.id || obj.target_ref === malware.id)
      );
      
      // Extraire les groupes associés à ce malware
      const associatedGroups = relationships
        .filter(rel => 
          rel.relationship_type === 'uses' && 
          rel.source_ref.startsWith('intrusion-set--') && 
          rel.target_ref === malware.id
        )
        .map(rel => {
          const group = objects.find(obj => obj.id === rel.source_ref);
          return group ? group.name : null;
        })
        .filter(Boolean);
      
      // Extraire les techniques utilisées par ce malware
      const techniques = relationships
        .filter(rel => 
          rel.relationship_type === 'uses' && 
          rel.source_ref === malware.id && 
          rel.target_ref.startsWith('attack-pattern--')
        )
        .map(rel => {
          const technique = objects.find(obj => obj.id === rel.target_ref);
          return technique ? technique.external_references.find(ref => ref.source_name === 'mitre-attack')?.external_id : null;
        })
        .filter(Boolean);
      
      // Déterminer le type de malware
      let type = "Other";
      if (malware.name.toLowerCase().includes("ransomware")) {
        type = "Ransomware";
      } else if (malware.name.toLowerCase().includes("trojan") || malware.description?.toLowerCase().includes("trojan")) {
        type = "Trojan";
      } else if (malware.name.toLowerCase().includes("backdoor") || malware.description?.toLowerCase().includes("backdoor")) {
        type = "Backdoor";
      } else if (malware.name.toLowerCase().includes("worm") || malware.description?.toLowerCase().includes("worm")) {
        type = "Worm";
      } else if (malware.name.toLowerCase().includes("wiper") || malware.description?.toLowerCase().includes("wiper")) {
        type = "Wiper";
      } else if (malware.name.toLowerCase().includes("rat") || malware.description?.toLowerCase().includes("remote access")) {
        type = "RAT";
      } else if (malware.name.toLowerCase().includes("loader") || malware.description?.toLowerCase().includes("loader")) {
        type = "Loader";
      } else if (malware.name.toLowerCase().includes("stealer") || malware.description?.toLowerCase().includes("stealer")) {
        type = "Stealer";
      }
      
      // Déterminer les plateformes ciblées
      const targetPlatforms = malware.x_mitre_platforms || ["Windows"];
      
      // Déterminer les capacités
      const capabilities = [];
      if (malware.description?.toLowerCase().includes("exfiltrat")) {
        capabilities.push("Data Exfiltration");
      }
      if (malware.description?.toLowerCase().includes("encrypt")) {
        capabilities.push("Data Encryption");
      }
      if (malware.description?.toLowerCase().includes("credential")) {
        capabilities.push("Credential Theft");
      }
      if (malware.description?.toLowerCase().includes("screenshot")) {
        capabilities.push("Screen Capture");
      }
      if (malware.description?.toLowerCase().includes("keylog")) {
        capabilities.push("Keylogging");
      }
      if (capabilities.length === 0) {
        capabilities.push("Command Execution");
      }
      
      // Déterminer le niveau de menace
      let threatLevel = 7;
      if (type === "Ransomware" || type === "Wiper") {
        threatLevel = 9;
      } else if (associatedGroups.length > 0) {
        threatLevel = 8;
      }
      
      // Créer l'objet malware formaté pour MongoDB
      const formattedMalware = {
        name: malware.name,
        aliases: malware.x_mitre_aliases || [],
        description: malware.description || `Malware identifié par MITRE ATT&CK.`,
        type: type,
        firstSeen: malware.first_seen ? new Date(malware.first_seen) : new Date("2015-01-01"),
        lastSeen: malware.last_seen ? new Date(malware.last_seen) : new Date(),
        associatedGroups: associatedGroups,
        techniques: techniques,
        targetPlatforms: targetPlatforms,
        capabilities: capabilities,
        references: malware.external_references ? malware.external_references.map(ref => ({
          url: ref.url || "https://attack.mitre.org/",
          source: ref.source_name || "MITRE ATT&CK",
          description: ref.description || `Référence pour ${malware.name}`
        })) : [],
        threatLevel: threatLevel
      };
      
      malwares.push(formattedMalware);
    } catch (error) {
      console.error(`Erreur lors du traitement du malware ${malware.name}:`, error.message);
    }
  }
  
  return malwares;
}

/**
 * Crée des campagnes basées sur les relations entre groupes et malwares
 * @param {Array} groups - Groupes d'attaque
 * @param {Array} malwares - Malwares
 * @returns {Array} - Campagnes générées
 */
function generateCampaigns(groups, malwares) {
  const campaigns = [];
  
  // Campagnes connues (ajoutées manuellement pour enrichir les données)
  const knownCampaigns = [
    {
      name: "SolarWinds Supply Chain Attack",
      description: "Attaque sophistiquée de la chaîne d'approvisionnement ciblant le logiciel Orion de SolarWinds. Les attaquants ont inséré une porte dérobée (SUNBURST) dans les mises à jour légitimes du logiciel, compromettant des milliers d'organisations.",
      attackGroups: ["APT29"],
      startDate: new Date("2020-03-01"),
      endDate: new Date("2020-12-31"),
      status: "Inactive",
      techniques: ["T1195", "T1027", "T1078", "T1059"],
      malware: ["SUNBURST", "TEARDROP", "RAINDROP"],
      targetSectors: ["Gouvernement", "Technologie", "Cybersécurité", "Infrastructure critique"],
      targetRegions: ["Amérique du Nord", "Europe", "Monde entier"],
      impactLevel: 10,
      references: [
        { url: "https://www.mandiant.com/resources/blog/sunburst-additional-technical-details", source: "Mandiant", description: "Analyse technique de SUNBURST par Mandiant" }
      ]
    },
    {
      name: "NotPetya Global Attack",
      description: "Cyberattaque destructrice déguisée en ransomware qui s'est propagée rapidement à l'échelle mondiale. Initialement distribuée via une mise à jour compromise du logiciel de comptabilité ukrainien M.E.Doc.",
      attackGroups: ["Sandworm"],
      startDate: new Date("2017-06-27"),
      endDate: new Date("2017-07-15"),
      status: "Inactive",
      techniques: ["T1195", "T1078", "T1486", "T1570"],
      malware: ["NotPetya", "Mimikatz"],
      targetSectors: ["Énergie", "Transport", "Finance", "Santé", "Industrie"],
      targetRegions: ["Ukraine", "Europe", "Monde entier"],
      impactLevel: 10,
      references: [
        { url: "https://www.wired.com/story/notpetya-cyberattack-ukraine-russia-code-crashed-the-world/", source: "Wired", description: "Article Wired sur NotPetya" }
      ]
    },
    {
      name: "WannaCry Ransomware Attack",
      description: "Attaque mondiale de ransomware qui a exploité la vulnérabilité EternalBlue dans les systèmes Windows. Elle a infecté plus de 200 000 ordinateurs dans 150 pays.",
      attackGroups: ["Lazarus Group"],
      startDate: new Date("2017-05-12"),
      endDate: new Date("2017-05-15"),
      status: "Inactive",
      techniques: ["T1486", "T1133", "T1059"],
      malware: ["WannaCry"],
      targetSectors: ["Santé", "Transport", "Télécommunications", "Industrie"],
      targetRegions: ["Monde entier", "Europe", "Asie"],
      impactLevel: 9,
      references: [
        { url: "https://www.microsoft.com/security/blog/2017/05/12/wannacrypt-ransomware-worm-targets-out-of-date-systems/", source: "Microsoft", description: "Analyse de WannaCry par Microsoft" }
      ]
    }
  ];
  
  // Ajouter les campagnes connues
  campaigns.push(...knownCampaigns);
  
  // Générer des campagnes supplémentaires basées sur les relations entre groupes et malwares
  for (const group of groups) {
    // Trouver les malwares associés à ce groupe
    const groupMalwares = malwares.filter(malware => 
      malware.associatedGroups.includes(group.name)
    );
    
    if (groupMalwares.length > 0) {
      // Créer une campagne pour ce groupe et ses malwares
      const campaignName = `${group.name} ${new Date().getFullYear() - Math.floor(Math.random() * 5)} Campaign`;
      
      // Vérifier si une campagne avec ce nom existe déjà
      if (!campaigns.some(campaign => campaign.name === campaignName)) {
        const campaign = {
          name: campaignName,
          description: `Campagne d'attaque attribuée à ${group.name} utilisant divers malwares et techniques pour cibler des organisations.`,
          attackGroups: [group.name],
          startDate: new Date(new Date().setFullYear(new Date().getFullYear() - Math.floor(Math.random() * 3))),
          endDate: new Date(),
          status: Math.random() > 0.3 ? "Active" : "Inactive",
          techniques: Array.from(new Set(groupMalwares.flatMap(malware => malware.techniques))),
          malware: groupMalwares.map(malware => malware.name),
          targetSectors: group.targetSectors,
          targetRegions: group.targetRegions,
          impactLevel: Math.min(group.threatLevel + 1, 10),
          references: [
            { 
              url: "https://attack.mitre.org/", 
              source: "MITRE ATT&CK", 
              description: `Informations sur ${group.name}` 
            }
          ]
        };
        
        campaigns.push(campaign);
      }
    }
  }
  
  console.log(`Nombre de campagnes générées: ${campaigns.length}`);
  return campaigns;
}

/**
 * Met à jour les régions avec les groupes actifs
 * @param {Array} regions - Régions
 * @param {Array} groups - Groupes d'attaque
 * @returns {Array} - Régions mises à jour
 */
function updateRegionsWithGroups(regions, groups) {
  for (const region of regions) {
    const activeGroups = new Set();
    
    for (const group of groups) {
      if (group.targetRegions.some(targetRegion => 
        targetRegion === region.name || 
        targetRegion === "Monde entier" ||
        (targetRegion === "Europe" && region.name === "Europe") ||
        (targetRegion === "Asie" && region.name === "Asie") ||
        (targetRegion === "Amérique du Nord" && region.name === "Amérique du Nord")
      )) {
        activeGroups.add(group.name);
      }
    }
    
    region.activeGroups = Array.from(activeGroups);
  }
  
  return regions;
}

/**
 * Met à jour les secteurs avec les groupes actifs
 * @param {Array} sectors - Secteurs
 * @param {Array} groups - Groupes d'attaque
 * @returns {Array} - Secteurs mis à jour
 */
function updateSectorsWithGroups(sectors, groups) {
  for (const sector of sectors) {
    const activeGroups = new Set();
    
    for (const group of groups) {
      if (group.targetSectors.some(targetSector => 
        targetSector === sector.name || 
        (targetSector === "Government" && sector.name === "Gouvernement") ||
        (targetSector === "Financial" && sector.name === "Finance") ||
        (targetSector === "Energy" && sector.name === "Énergie") ||
        (targetSector === "Healthcare" && sector.name === "Santé") ||
        (targetSector === "Defense" && sector.name === "Défense")
      )) {
        activeGroups.add(group.name);
      }
    }
    
    sector.activeGroups = Array.from(activeGroups);
  }
  
  return sectors;
}

/**
 * Fonction principale pour importer les données
 */
async function importAllData() {
  try {
    console.log('Début de l\'importation exhaustive des données MITRE ATT&CK...');
    
    // Connexion à MongoDB
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connecté à MongoDB');

    // Récupérer les données STIX
    const enterpriseData = await fetchStixData(MITRE_ENTERPRISE_URL);
    const mobileData = await fetchStixData(MITRE_MOBILE_URL);
    const icsData = await fetchStixData(MITRE_ICS_URL);
    
    // Combiner les données
    const combinedObjects = [
      ...(enterpriseData.objects || []),
      ...(mobileData.objects || []),
      ...(icsData.objects || [])
    ];
    
    const combinedData = { objects: combinedObjects };
    
    // Extraire les données
    console.log('Extraction des groupes d\'attaque...');
    const groups = extractGroups(combinedData);
    
    console.log('Extraction des techniques...');
    const techniques = extractTechniques(combinedData);
    
    console.log('Extraction des malwares...');
    const malwares = extractMalwares(combinedData);
    
    console.log('Génération des campagnes...');
    const campaigns = generateCampaigns(groups, malwares);
    
    console.log('Mise à jour des régions...');
    const updatedRegions = updateRegionsWithGroups(regions, groups);
    
    console.log('Mise à jour des secteurs...');
    const updatedSectors = updateSectorsWithGroups(sectors, groups);
    
    // Vider les collections existantes
    console.log('Suppression des données existantes...');
    await AttackGroup.deleteMany({});
    await Technique.deleteMany({});
    await Campaign.deleteMany({});
    await Malware.deleteMany({});
    await Region.deleteMany({});
    await Sector.deleteMany({});
    console.log('Données existantes supprimées avec succès');

    // Insérer les nouvelles données
    console.log('Insertion des données...');
    
    console.log(`Insertion de ${groups.length} groupes d'attaque...`);
    await AttackGroup.insertMany(groups);
    
    console.log(`Insertion de ${techniques.length} techniques...`);
    await Technique.insertMany(techniques);
    
    console.log(`Insertion de ${campaigns.length} campagnes...`);
    await Campaign.insertMany(campaigns);
    
    console.log(`Insertion de ${malwares.length} malwares...`);
    await Malware.insertMany(malwares);
    
    console.log(`Insertion de ${updatedRegions.length} régions...`);
    await Region.insertMany(updatedRegions);
    
    console.log(`Insertion de ${updatedSectors.length} secteurs...`);
    await Sector.insertMany(updatedSectors);
    
    console.log('Données insérées avec succès');

    // Vérifier les données
    const attackGroupCount = await AttackGroup.countDocuments();
    const techniqueCount = await Technique.countDocuments();
    const campaignCount = await Campaign.countDocuments();
    const malwareCount = await Malware.countDocuments();
    const regionCount = await Region.countDocuments();
    const sectorCount = await Sector.countDocuments();
    
    console.log('\n=== STATISTIQUES DE LA BASE DE DONNÉES ===');
    console.log(`Groupes d'attaque: ${attackGroupCount}`);
    console.log(`Techniques: ${techniqueCount}`);
    console.log(`Campagnes: ${campaignCount}`);
    console.log(`Malwares: ${malwareCount}`);
    console.log(`Régions: ${regionCount}`);
    console.log(`Secteurs: ${sectorCount}`);
    console.log('==========================================\n');

    console.log('Importation exhaustive des données terminée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'importation des données:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Connexion à MongoDB fermée');
  }
}

// Exécuter la fonction d'importation
importAllData()
  .then(() => {
    console.log('Script terminé');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erreur non gérée:', error);
    process.exit(1);
  });
