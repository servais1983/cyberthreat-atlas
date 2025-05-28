/**
 * Script d'intégration des données MITRE ATT&CK dans MongoDB
 * Ce script utilise les données collectées pour enrichir la base de données
 */

const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
const { collectMitreData } = require('./collectMitreData');

// Modèles
const AttackGroup = require('../models/AttackGroup');
const Technique = require('../models/Technique');
const Malware = require('../models/Malware');
const Campaign = require('../models/Campaign');
const Region = require('../models/Region');
const Sector = require('../models/Sector');

// Données pour les régions
const regionsData = [
  {
    name: "Amérique du Nord",
    countries: ["États-Unis", "Canada", "Mexique"],
    threatLevel: 9,
    activeGroups: []
  },
  {
    name: "Europe",
    countries: ["France", "Allemagne", "Royaume-Uni", "Italie", "Espagne", "Pays-Bas", "Belgique", "Suisse", "Suède", "Norvège", "Finlande", "Danemark", "Pologne", "République tchèque", "Autriche", "Hongrie", "Grèce", "Portugal", "Irlande"],
    threatLevel: 8,
    activeGroups: []
  },
  {
    name: "Asie",
    countries: ["Chine", "Japon", "Corée du Sud", "Corée du Nord", "Inde", "Pakistan", "Bangladesh", "Indonésie", "Malaisie", "Singapour", "Thaïlande", "Vietnam", "Philippines", "Taiwan", "Hong Kong"],
    threatLevel: 9,
    activeGroups: []
  },
  {
    name: "Moyen-Orient",
    countries: ["Israël", "Émirats arabes unis", "Arabie saoudite", "Qatar", "Koweït", "Bahreïn", "Oman", "Iran", "Irak", "Syrie", "Jordanie", "Liban", "Turquie"],
    threatLevel: 8,
    activeGroups: []
  },
  {
    name: "Amérique latine",
    countries: ["Brésil", "Argentine", "Colombie", "Chili", "Pérou", "Venezuela", "Équateur", "Bolivie", "Paraguay", "Uruguay", "Panama", "Costa Rica", "Guatemala", "Honduras", "El Salvador", "Nicaragua", "Cuba", "République dominicaine", "Haïti"],
    threatLevel: 7,
    activeGroups: []
  },
  {
    name: "Afrique",
    countries: ["Afrique du Sud", "Nigéria", "Égypte", "Maroc", "Algérie", "Tunisie", "Kenya", "Tanzanie", "Éthiopie", "Ghana", "Côte d'Ivoire", "Sénégal", "Angola", "Mozambique", "Zimbabwe", "Zambie", "Ouganda", "Rwanda", "Cameroun"],
    threatLevel: 6,
    activeGroups: []
  },
  {
    name: "Océanie",
    countries: ["Australie", "Nouvelle-Zélande", "Papouasie-Nouvelle-Guinée", "Fidji", "Îles Salomon", "Vanuatu", "Samoa", "Tonga"],
    threatLevel: 7,
    activeGroups: []
  }
];

// Données pour les secteurs
const sectorsData = [
  {
    name: "Gouvernement",
    description: "Organisations gouvernementales, agences fédérales, administrations locales, services publics, défense nationale",
    threatLevel: 9,
    activeGroups: []
  },
  {
    name: "Finance",
    description: "Banques, assurances, services financiers, marchés financiers, fintechs, cryptomonnaies",
    threatLevel: 9,
    activeGroups: []
  },
  {
    name: "Santé",
    description: "Hôpitaux, cliniques, recherche médicale, assurance maladie, industrie pharmaceutique, biotechnologies",
    threatLevel: 8,
    activeGroups: []
  },
  {
    name: "Énergie",
    description: "Pétrole et gaz, électricité, énergies renouvelables, services publics, infrastructures critiques",
    threatLevel: 9,
    activeGroups: []
  },
  {
    name: "Technologie",
    description: "Entreprises technologiques, télécommunications, fournisseurs de services cloud, éditeurs de logiciels, matériel informatique",
    threatLevel: 9,
    activeGroups: []
  },
  {
    name: "Défense",
    description: "Industrie de la défense, contractants militaires, aérospatiale, armement, sécurité nationale",
    threatLevel: 10,
    activeGroups: []
  },
  {
    name: "Industrie manufacturière",
    description: "Production industrielle, fabrication, chaînes d'approvisionnement, automobile, aéronautique, électronique",
    threatLevel: 8,
    activeGroups: []
  },
  {
    name: "Transport",
    description: "Aviation, maritime, ferroviaire, logistique, transport public, infrastructures de transport",
    threatLevel: 7,
    activeGroups: []
  },
  {
    name: "Éducation",
    description: "Universités, écoles, instituts de recherche, établissements d'enseignement, plateformes d'apprentissage en ligne",
    threatLevel: 6,
    activeGroups: []
  },
  {
    name: "Commerce de détail",
    description: "Grandes surfaces, e-commerce, chaînes de magasins, distribution, biens de consommation",
    threatLevel: 7,
    activeGroups: []
  },
  {
    name: "Médias et divertissement",
    description: "Presse, télévision, radio, cinéma, jeux vidéo, réseaux sociaux, plateformes de streaming",
    threatLevel: 7,
    activeGroups: []
  },
  {
    name: "Services professionnels",
    description: "Cabinets d'avocats, consultants, comptables, ressources humaines, services aux entreprises",
    threatLevel: 6,
    activeGroups: []
  }
];

// Données pour les campagnes majeures
const campaignsData = [
  {
    name: "SolarWinds Supply Chain Attack",
    description: "Une attaque sophistiquée de la chaîne d'approvisionnement qui a compromis le logiciel Orion de SolarWinds, affectant des milliers d'organisations, y compris plusieurs agences gouvernementales américaines.",
    attackGroups: ["APT29"],
    startDate: new Date("2020-03-01"),
    endDate: new Date("2020-12-31"),
    status: "Inactive",
    techniques: ["T1195", "T1027", "T1059", "T1053"],
    malware: ["SUNBURST", "TEARDROP", "SUNSPOT"],
    targetSectors: ["Gouvernement", "Technologie", "Cybersécurité"],
    targetRegions: ["Amérique du Nord", "Europe"],
    impactLevel: 10,
    references: [
      {
        url: "https://www.fireeye.com/blog/threat-research/2020/12/evasive-attacker-leverages-solarwinds-supply-chain-compromises-with-sunburst-backdoor.html",
        source: "FireEye",
        description: "Analyse initiale"
      },
      {
        url: "https://www.microsoft.com/security/blog/2020/12/18/analyzing-solorigate-the-compromised-dll-file-that-started-a-sophisticated-cyberattack/",
        source: "Microsoft",
        description: "Analyse technique"
      }
    ]
  },
  {
    name: "NotPetya Global Attack",
    description: "Une cyberattaque destructrice déguisée en ransomware qui a affecté des organisations dans le monde entier, causant des milliards de dollars de dommages.",
    attackGroups: ["Sandworm"],
    startDate: new Date("2017-06-27"),
    endDate: new Date("2017-07-15"),
    status: "Inactive",
    techniques: ["T1566.001", "T1486", "T1570", "T1003"],
    malware: ["NotPetya", "Mimikatz"],
    targetSectors: ["Énergie", "Transport", "Finance", "Santé"],
    targetRegions: ["Ukraine", "Europe", "Monde entier"],
    impactLevel: 10,
    references: [
      {
        url: "https://www.wired.com/story/notpetya-cyberattack-ukraine-russia-code-crashed-the-world/",
        source: "Wired",
        description: "Analyse d'impact"
      },
      {
        url: "https://blog.talosintelligence.com/2017/06/worldwide-ransomware-variant.html",
        source: "Cisco Talos",
        description: "Analyse technique"
      }
    ]
  },
  {
    name: "Operation CuckooBees",
    description: "Une campagne d'espionnage industriel de longue durée ciblant la propriété intellectuelle et les informations sensibles d'entreprises dans les secteurs de la défense, de l'énergie et de la fabrication.",
    attackGroups: ["APT41"],
    startDate: new Date("2019-01-01"),
    endDate: new Date("2021-12-31"),
    status: "Inactive",
    techniques: ["T1566.001", "T1027", "T1041", "T1059"],
    malware: ["Winnti", "PlugX", "ShadowPad"],
    targetSectors: ["Défense", "Énergie", "Industrie manufacturière", "Technologie"],
    targetRegions: ["Amérique du Nord", "Europe", "Asie"],
    impactLevel: 8,
    references: [
      {
        url: "https://www.cybereason.com/blog/operation-cuckoobees-deep-dive-into-stealthy-winnti-techniques",
        source: "Cybereason",
        description: "Analyse technique"
      }
    ]
  },
  {
    name: "Colonial Pipeline Ransomware Attack",
    description: "Une attaque de ransomware qui a forcé Colonial Pipeline à fermer son pipeline de carburant, provoquant des pénuries de carburant sur la côte est des États-Unis.",
    attackGroups: ["DarkSide"],
    startDate: new Date("2021-05-07"),
    endDate: new Date("2021-05-14"),
    status: "Inactive",
    techniques: ["T1566.001", "T1486", "T1041", "T1003"],
    malware: ["DarkSide Ransomware"],
    targetSectors: ["Énergie", "Infrastructure critique"],
    targetRegions: ["États-Unis"],
    impactLevel: 9,
    references: [
      {
        url: "https://www.cisa.gov/uscert/ncas/alerts/aa21-131a",
        source: "CISA",
        description: "Alerte officielle"
      },
      {
        url: "https://www.mandiant.com/resources/shining-a-light-on-darkside-ransomware-operations",
        source: "Mandiant",
        description: "Analyse technique"
      }
    ]
  },
  {
    name: "Operation Soft Cell",
    description: "Une campagne d'espionnage ciblant les opérateurs de télécommunications du monde entier pour voler des données d'appels et de localisation.",
    attackGroups: ["APT41"],
    startDate: new Date("2018-01-01"),
    endDate: new Date("2019-06-30"),
    status: "Inactive",
    techniques: ["T1566.001", "T1027", "T1041", "T1570"],
    malware: ["Poison Ivy", "China Chopper"],
    targetSectors: ["Télécommunications"],
    targetRegions: ["Asie", "Europe", "Moyen-Orient"],
    impactLevel: 8,
    references: [
      {
        url: "https://www.cybereason.com/blog/operation-soft-cell-a-worldwide-campaign-against-telecommunications-providers",
        source: "Cybereason",
        description: "Analyse technique"
      }
    ]
  },
  {
    name: "HAFNIUM Microsoft Exchange Server Attack",
    description: "Une campagne d'exploitation de vulnérabilités zero-day dans Microsoft Exchange Server, permettant l'accès à des milliers de serveurs de messagerie dans le monde.",
    attackGroups: ["HAFNIUM"],
    startDate: new Date("2021-01-01"),
    endDate: new Date("2021-03-15"),
    status: "Inactive",
    techniques: ["T1190", "T1203", "T1136", "T1505.003"],
    malware: ["China Chopper", "ASPX Webshells"],
    targetSectors: ["Gouvernement", "Éducation", "Santé", "Services professionnels"],
    targetRegions: ["Monde entier"],
    impactLevel: 9,
    references: [
      {
        url: "https://www.microsoft.com/security/blog/2021/03/02/hafnium-targeting-exchange-servers/",
        source: "Microsoft",
        description: "Analyse initiale"
      },
      {
        url: "https://www.volexity.com/blog/2021/03/02/active-exploitation-of-microsoft-exchange-zero-day-vulnerabilities/",
        source: "Volexity",
        description: "Analyse technique"
      }
    ]
  },
  {
    name: "Kaseya VSA Supply Chain Attack",
    description: "Une attaque de ransomware contre le logiciel Kaseya VSA, affectant des milliers d'entreprises clientes via leurs fournisseurs de services gérés (MSP).",
    attackGroups: ["REvil"],
    startDate: new Date("2021-07-02"),
    endDate: new Date("2021-07-10"),
    status: "Inactive",
    techniques: ["T1195", "T1190", "T1486", "T1027"],
    malware: ["REvil Ransomware"],
    targetSectors: ["Technologie", "Services professionnels", "Commerce de détail"],
    targetRegions: ["Monde entier"],
    impactLevel: 9,
    references: [
      {
        url: "https://www.cisa.gov/uscert/kaseya-ransomware-attack",
        source: "CISA",
        description: "Alerte officielle"
      },
      {
        url: "https://blog.truesec.com/2021/07/04/kaseya-vsa-supply-chain-attack-targeting-msps-to-deliver-revil-ransomware/",
        source: "Truesec",
        description: "Analyse technique"
      }
    ]
  },
  {
    name: "Log4Shell Exploitation",
    description: "Exploitation massive de la vulnérabilité Log4j (CVE-2021-44228) affectant des millions de systèmes et applications dans le monde entier.",
    attackGroups: ["Multiple"],
    startDate: new Date("2021-12-09"),
    endDate: new Date("2022-03-31"),
    status: "Active",
    techniques: ["T1190", "T1059", "T1562", "T1105"],
    malware: ["Cryptominers", "Cobalt Strike", "Various RATs"],
    targetSectors: ["Tous secteurs"],
    targetRegions: ["Monde entier"],
    impactLevel: 10,
    references: [
      {
        url: "https://www.cisa.gov/uscert/apache-log4j-vulnerability-guidance",
        source: "CISA",
        description: "Alerte officielle"
      },
      {
        url: "https://www.lunasec.io/docs/blog/log4j-zero-day/",
        source: "LunaSec",
        description: "Analyse technique"
      }
    ]
  }
];

/**
 * Fonction principale pour intégrer les données MITRE ATT&CK dans MongoDB
 */
async function integrateMitreData() {
  console.log('Démarrage de l\'intégration des données MITRE ATT&CK dans MongoDB...');
  
  try {
    // Connexion à MongoDB
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connecté à MongoDB');

    // Collecter les données MITRE ATT&CK
    console.log('Collecte des données MITRE ATT&CK...');
    const mitreData = await collectMitreData();
    console.log('Données MITRE ATT&CK collectées avec succès');

    // Vider les collections existantes
    console.log('Suppression des données existantes...');
    await AttackGroup.deleteMany({});
    await Technique.deleteMany({});
    await Malware.deleteMany({});
    await Campaign.deleteMany({});
    await Region.deleteMany({});
    await Sector.deleteMany({});
    console.log('Données existantes supprimées avec succès');

    // Insérer les régions
    console.log('Insertion des régions...');
    await Region.insertMany(regionsData);
    console.log(`${regionsData.length} régions insérées`);

    // Insérer les secteurs
    console.log('Insertion des secteurs...');
    await Sector.insertMany(sectorsData);
    console.log(`${sectorsData.length} secteurs insérés`);

    // Insérer les techniques
    console.log('Insertion des techniques...');
    await Technique.insertMany(mitreData.techniques);
    console.log(`${mitreData.techniques.length} techniques insérées`);

    // Insérer les groupes d'attaque
    console.log('Insertion des groupes d\'attaque...');
    await AttackGroup.insertMany(mitreData.groups);
    console.log(`${mitreData.groups.length} groupes d'attaque insérés`);

    // Insérer les malwares
    console.log('Insertion des malwares...');
    await Malware.insertMany(mitreData.malwares);
    console.log(`${mitreData.malwares.length} malwares insérés`);

    // Insérer les campagnes
    console.log('Insertion des campagnes...');
    await Campaign.insertMany(campaignsData);
    console.log(`${campaignsData.length} campagnes insérées`);

    console.log('Intégration des données MITRE ATT&CK terminée avec succès');
    
    // Afficher quelques statistiques
    const attackGroupCount = await AttackGroup.countDocuments();
    const techniqueCount = await Technique.countDocuments();
    const malwareCount = await Malware.countDocuments();
    const campaignCount = await Campaign.countDocuments();
    const regionCount = await Region.countDocuments();
    const sectorCount = await Sector.countDocuments();
    
    console.log('\n=== STATISTIQUES DE LA BASE DE DONNÉES ===');
    console.log(`Groupes d'attaque: ${attackGroupCount}`);
    console.log(`Techniques: ${techniqueCount}`);
    console.log(`Malwares: ${malwareCount}`);
    console.log(`Campagnes: ${campaignCount}`);
    console.log(`Régions: ${regionCount}`);
    console.log(`Secteurs: ${sectorCount}`);
    console.log('==========================================\n');
  } catch (error) {
    console.error('Erreur lors de l\'intégration des données MITRE ATT&CK:', error);
    throw error;
  } finally {
    // Fermeture de la connexion à MongoDB
    await mongoose.connection.close();
    console.log('Connexion à MongoDB fermée');
  }
}

// Exécution du script si appelé directement
if (require.main === module) {
  integrateMitreData()
    .then(() => {
      console.log('Script d\'intégration terminé');
      process.exit(0);
    })
    .catch(error => {
      console.error('Erreur lors de l\'exécution du script d\'intégration:', error);
      process.exit(1);
    });
}

module.exports = { integrateMitreData };
