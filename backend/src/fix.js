/**
 * Script de réparation et d'initialisation de la base de données
 * Ce script injecte directement un ensemble de données de base dans MongoDB
 */

const mongoose = require('mongoose');
const config = require('./config');
const AttackGroup = require('./models/AttackGroup');
const Technique = require('./models/Technique');
const Campaign = require('./models/Campaign');
const Malware = require('./models/Malware');
const Region = require('./models/Region');
const Sector = require('./models/Sector');

// Données pour les groupes d'attaque (version simplifiée)
const attackGroups = [
  {
    name: "APT28",
    aliases: ["Fancy Bear", "Sofacy", "Sednit", "Pawn Storm"],
    countryOfOrigin: "Russia",
    description: "Groupe lié au renseignement militaire russe (GRU)",
    firstSeen: new Date("2004-01-01"),
    lastSeen: new Date(),
    motivations: ["Espionnage politique", "Influence électorale"],
    targetSectors: ["Gouvernement", "Défense", "Politique"],
    targetRegions: ["Amérique du Nord", "Europe", "Ukraine"],
    sophisticationLevel: "High",
    references: [],
    relatedGroups: [],
    threatLevel: 9
  },
  {
    name: "APT29",
    aliases: ["Cozy Bear", "The Dukes", "CozyDuke"],
    countryOfOrigin: "Russia",
    description: "Groupe lié au Service de Renseignement Extérieur russe (SVR)",
    firstSeen: new Date("2008-01-01"),
    lastSeen: new Date(),
    motivations: ["Espionnage", "Vol de données sensibles"],
    targetSectors: ["Gouvernement", "Diplomatie", "Santé"],
    targetRegions: ["Amérique du Nord", "Europe"],
    sophisticationLevel: "High",
    references: [],
    relatedGroups: [],
    threatLevel: 9
  },
  {
    name: "Lazarus Group",
    aliases: ["HIDDEN COBRA", "Guardians of Peace"],
    countryOfOrigin: "North Korea",
    description: "Groupe lié au gouvernement nord-coréen",
    firstSeen: new Date("2009-01-01"),
    lastSeen: new Date(),
    motivations: ["Gain financier", "Sabotage"],
    targetSectors: ["Finance", "Médias", "Cryptomonnaies"],
    targetRegions: ["Monde entier", "Corée du Sud", "États-Unis"],
    sophisticationLevel: "High",
    references: [],
    relatedGroups: [],
    threatLevel: 9
  }
];

// Données pour les techniques
const techniques = [
  {
    name: "Spear Phishing Attachment",
    mitreId: "T1566.001",
    description: "Envoi d'e-mails ciblés avec pièces jointes malveillantes",
    tactic: "Initial Access",
    platforms: ["Windows", "macOS", "Linux"],
    dataSources: ["Email Gateway", "Network Traffic"],
    mitigation: "Filtrage des e-mails, sensibilisation des utilisateurs",
    detection: "Surveiller les pièces jointes inhabituelles",
    references: []
  },
  {
    name: "Credential Dumping",
    mitreId: "T1003",
    description: "Extraction des identifiants de connexion du système",
    tactic: "Credential Access",
    platforms: ["Windows", "macOS", "Linux"],
    dataSources: ["Process Monitoring", "Memory Analysis"],
    mitigation: "Privilèges limités, authentification multifacteur",
    detection: "Surveiller l'accès aux fichiers de base de données d'identifiants",
    references: []
  }
];

// Données pour les campagnes
const campaigns = [
  {
    name: "SolarWinds Supply Chain Attack",
    description: "Attaque de la chaîne d'approvisionnement SolarWinds",
    attackGroups: ["APT29"],
    startDate: new Date("2020-03-01"),
    endDate: new Date("2020-12-31"),
    status: "Inactive",
    techniques: ["T1195", "T1027"],
    malware: ["SUNBURST", "TEARDROP"],
    targetSectors: ["Gouvernement", "Technologie"],
    targetRegions: ["Amérique du Nord", "Europe"],
    impactLevel: 10,
    references: []
  },
  {
    name: "NotPetya Global Attack",
    description: "Cyberattaque destructrice déguisée en ransomware",
    attackGroups: ["Sandworm"],
    startDate: new Date("2017-06-27"),
    endDate: new Date("2017-07-15"),
    status: "Inactive",
    techniques: ["T1566.001", "T1486"],
    malware: ["NotPetya", "Mimikatz"],
    targetSectors: ["Énergie", "Transport", "Finance"],
    targetRegions: ["Ukraine", "Europe", "Monde entier"],
    impactLevel: 10,
    references: []
  }
];

// Données pour les malwares
const malwares = [
  {
    name: "SUNBURST",
    aliases: ["Solorigate"],
    description: "Backdoor déployée via SolarWinds Orion",
    type: "Backdoor",
    firstSeen: new Date("2020-03-01"),
    lastSeen: new Date("2020-12-31"),
    associatedGroups: ["APT29"],
    techniques: ["T1195", "T1027"],
    targetPlatforms: ["Windows"],
    capabilities: ["Command Execution", "Data Exfiltration"],
    references: [],
    threatLevel: 9
  },
  {
    name: "NotPetya",
    aliases: ["GoldenEye", "Nyetya"],
    description: "Malware destructeur déguisé en ransomware",
    type: "Wiper",
    firstSeen: new Date("2017-06-27"),
    lastSeen: new Date("2017-07-15"),
    associatedGroups: ["Sandworm"],
    techniques: ["T1566.001", "T1486"],
    targetPlatforms: ["Windows"],
    capabilities: ["Self-Propagation", "Data Destruction"],
    references: [],
    threatLevel: 10
  }
];

// Données pour les régions
const regions = [
  {
    name: "Amérique du Nord",
    countries: ["États-Unis", "Canada", "Mexique"],
    threatLevel: 9,
    activeGroups: ["APT28", "APT29", "Lazarus Group"]
  },
  {
    name: "Europe",
    countries: ["France", "Allemagne", "Royaume-Uni", "Italie"],
    threatLevel: 8,
    activeGroups: ["APT28", "APT29", "Sandworm"]
  },
  {
    name: "Asie",
    countries: ["Chine", "Japon", "Corée du Sud", "Inde"],
    threatLevel: 9,
    activeGroups: ["APT1", "APT41", "Lazarus Group"]
  }
];

// Données pour les secteurs
const sectors = [
  {
    name: "Gouvernement",
    description: "Organisations gouvernementales, agences fédérales",
    threatLevel: 9,
    activeGroups: ["APT28", "APT29", "Sandworm"]
  },
  {
    name: "Finance",
    description: "Banques, assurances, services financiers",
    threatLevel: 9,
    activeGroups: ["Lazarus Group", "Carbanak"]
  },
  {
    name: "Énergie",
    description: "Pétrole et gaz, électricité, énergies renouvelables",
    threatLevel: 9,
    activeGroups: ["APT1", "Sandworm", "APT41"]
  }
];

async function fixDatabase() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connecté à MongoDB');

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
    await AttackGroup.insertMany(attackGroups);
    await Technique.insertMany(techniques);
    await Campaign.insertMany(campaigns);
    await Malware.insertMany(malwares);
    await Region.insertMany(regions);
    await Sector.insertMany(sectors);
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

    console.log('Base de données réparée avec succès');
  } catch (error) {
    console.error('Erreur lors de la réparation de la base de données:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Connexion à MongoDB fermée');
  }
}

fixDatabase()
  .then(() => {
    console.log('Script terminé');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erreur:', error);
    process.exit(1);
  });
