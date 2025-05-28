/**
 * Script d'importation massive de données pour CyberThreat Atlas
 * Ce script collecte et importe des données complètes sur les groupes APT, techniques, campagnes et malwares
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

// Données complètes pour les groupes d'attaque (version étendue)
const attackGroups = [
  // Groupes russes
  {
    name: "APT28",
    aliases: ["Fancy Bear", "Sofacy", "Sednit", "Pawn Storm", "Strontium", "Tsar Team", "Threat Group-4127", "TG-4127"],
    countryOfOrigin: "Russia",
    description: "Groupe lié au renseignement militaire russe (GRU). Connu pour ses opérations d'espionnage politique et ses campagnes d'influence électorale. A été impliqué dans le piratage du Comité national démocrate américain en 2016.",
    firstSeen: new Date("2004-01-01"),
    lastSeen: new Date(),
    motivations: ["Espionnage politique", "Influence électorale", "Vol de données sensibles"],
    targetSectors: ["Gouvernement", "Défense", "Politique", "Organisations internationales"],
    targetRegions: ["Amérique du Nord", "Europe", "Ukraine", "OTAN"],
    sophisticationLevel: "High",
    references: [
      { url: "https://attack.mitre.org/groups/G0007/", source: "MITRE ATT&CK", description: "Page MITRE ATT&CK pour APT28" },
      { url: "https://www.mandiant.com/resources/apt28-a-window-into-russias-cyber-espionage-operations", source: "Mandiant", description: "Rapport Mandiant sur APT28" }
    ],
    relatedGroups: ["APT29", "Sandworm"],
    threatLevel: 9
  },
  {
    name: "APT29",
    aliases: ["Cozy Bear", "The Dukes", "CozyDuke", "Office Monkeys", "CozyCar", "Dark Halo", "UNC2452", "NOBELIUM"],
    countryOfOrigin: "Russia",
    description: "Groupe lié au Service de Renseignement Extérieur russe (SVR). Connu pour ses opérations sophistiquées d'espionnage et d'exfiltration de données. Responsable de l'attaque de la chaîne d'approvisionnement SolarWinds en 2020.",
    firstSeen: new Date("2008-01-01"),
    lastSeen: new Date(),
    motivations: ["Espionnage", "Vol de données sensibles", "Accès persistant"],
    targetSectors: ["Gouvernement", "Diplomatie", "Santé", "Recherche", "Énergie"],
    targetRegions: ["Amérique du Nord", "Europe", "OTAN"],
    sophisticationLevel: "High",
    references: [
      { url: "https://attack.mitre.org/groups/G0016/", source: "MITRE ATT&CK", description: "Page MITRE ATT&CK pour APT29" },
      { url: "https://www.mandiant.com/resources/blog/unc2452-merged-into-apt29", source: "Mandiant", description: "Rapport Mandiant sur APT29 et SolarWinds" }
    ],
    relatedGroups: ["APT28"],
    threatLevel: 10
  },
  {
    name: "Sandworm",
    aliases: ["Sandworm Team", "BlackEnergy", "Voodoo Bear", "ELECTRUM", "Telebots", "Iron Viking"],
    countryOfOrigin: "Russia",
    description: "Groupe lié au renseignement militaire russe (GRU). Connu pour ses attaques destructrices contre les infrastructures critiques. Responsable de NotPetya, BlackEnergy et des attaques contre le réseau électrique ukrainien.",
    firstSeen: new Date("2009-01-01"),
    lastSeen: new Date(),
    motivations: ["Sabotage", "Perturbation", "Destruction"],
    targetSectors: ["Énergie", "Transport", "Médias", "Infrastructure critique"],
    targetRegions: ["Ukraine", "Europe", "États-Unis"],
    sophisticationLevel: "High",
    references: [
      { url: "https://attack.mitre.org/groups/G0034/", source: "MITRE ATT&CK", description: "Page MITRE ATT&CK pour Sandworm" },
      { url: "https://www.wired.com/story/sandworm-kremlin-most-dangerous-hackers/", source: "Wired", description: "Article Wired sur Sandworm" }
    ],
    relatedGroups: ["APT28"],
    threatLevel: 10
  },
  
  // Groupes nord-coréens
  {
    name: "Lazarus Group",
    aliases: ["HIDDEN COBRA", "Guardians of Peace", "ZINC", "NICKEL ACADEMY", "APT-C-26", "Group 77", "Whois Team"],
    countryOfOrigin: "North Korea",
    description: "Groupe lié au Bureau général de reconnaissance nord-coréen. Connu pour ses opérations financières et de sabotage. Responsable de l'attaque WannaCry, du vol de crypto-monnaies et du piratage de Sony Pictures.",
    firstSeen: new Date("2009-01-01"),
    lastSeen: new Date(),
    motivations: ["Gain financier", "Sabotage", "Contournement des sanctions"],
    targetSectors: ["Finance", "Médias", "Cryptomonnaies", "Défense"],
    targetRegions: ["Monde entier", "Corée du Sud", "États-Unis", "Japon"],
    sophisticationLevel: "High",
    references: [
      { url: "https://attack.mitre.org/groups/G0032/", source: "MITRE ATT&CK", description: "Page MITRE ATT&CK pour Lazarus Group" },
      { url: "https://www.kaspersky.com/resource-center/threats/lazarus-group", source: "Kaspersky", description: "Rapport Kaspersky sur Lazarus Group" }
    ],
    relatedGroups: ["Kimsuky", "APT37"],
    threatLevel: 9
  },
  {
    name: "Kimsuky",
    aliases: ["Thallium", "Black Banshee", "Velvet Chollima", "ITG16"],
    countryOfOrigin: "North Korea",
    description: "Groupe d'espionnage nord-coréen ciblant principalement les organisations liées à la politique de réunification coréenne et les experts nucléaires.",
    firstSeen: new Date("2013-01-01"),
    lastSeen: new Date(),
    motivations: ["Espionnage", "Vol d'informations stratégiques"],
    targetSectors: ["Gouvernement", "Recherche", "Défense", "Nucléaire"],
    targetRegions: ["Corée du Sud", "États-Unis", "Japon"],
    sophisticationLevel: "Medium",
    references: [
      { url: "https://attack.mitre.org/groups/G0094/", source: "MITRE ATT&CK", description: "Page MITRE ATT&CK pour Kimsuky" }
    ],
    relatedGroups: ["Lazarus Group"],
    threatLevel: 7
  },
  
  // Groupes chinois
  {
    name: "APT1",
    aliases: ["Comment Crew", "Comment Panda", "PLA Unit 61398"],
    countryOfOrigin: "China",
    description: "Unité de l'Armée populaire de libération chinoise. Premier groupe APT majeur identifié publiquement. Connu pour ses opérations massives d'espionnage industriel et de vol de propriété intellectuelle.",
    firstSeen: new Date("2006-01-01"),
    lastSeen: new Date("2016-01-01"),
    motivations: ["Espionnage industriel", "Vol de propriété intellectuelle"],
    targetSectors: ["Technologie", "Énergie", "Transport", "Industrie"],
    targetRegions: ["États-Unis", "Europe", "Asie"],
    sophisticationLevel: "Medium",
    references: [
      { url: "https://attack.mitre.org/groups/G0006/", source: "MITRE ATT&CK", description: "Page MITRE ATT&CK pour APT1" },
      { url: "https://www.mandiant.com/resources/apt1-exposing-one-of-chinas-cyber-espionage-units", source: "Mandiant", description: "Rapport Mandiant sur APT1" }
    ],
    relatedGroups: [],
    threatLevel: 8
  },
  {
    name: "APT41",
    aliases: ["BARIUM", "Winnti", "Blackfly", "Wicked Panda", "Wicked Spider"],
    countryOfOrigin: "China",
    description: "Groupe chinois combinant des opérations d'espionnage parrainées par l'État et des activités criminelles à motivation financière. Connu pour ses attaques contre l'industrie du jeu vidéo et les chaînes d'approvisionnement logicielles.",
    firstSeen: new Date("2012-01-01"),
    lastSeen: new Date(),
    motivations: ["Espionnage", "Gain financier", "Vol de propriété intellectuelle"],
    targetSectors: ["Jeux vidéo", "Technologie", "Santé", "Télécommunications"],
    targetRegions: ["Monde entier", "Asie", "États-Unis", "Europe"],
    sophisticationLevel: "High",
    references: [
      { url: "https://attack.mitre.org/groups/G0096/", source: "MITRE ATT&CK", description: "Page MITRE ATT&CK pour APT41" },
      { url: "https://www.fireeye.com/blog/threat-research/2019/08/apt41-dual-espionage-and-cyber-crime-operation.html", source: "FireEye", description: "Rapport FireEye sur APT41" }
    ],
    relatedGroups: ["APT17", "APT10"],
    threatLevel: 9
  },
  
  // Groupes iraniens
  {
    name: "APT33",
    aliases: ["Elfin", "MAGNALLIUM", "HOLMIUM", "Refined Kitten"],
    countryOfOrigin: "Iran",
    description: "Groupe lié au gouvernement iranien ciblant les secteurs de l'aérospatiale et de l'énergie. Connu pour ses attaques de type wiper et ses campagnes d'espionnage.",
    firstSeen: new Date("2013-01-01"),
    lastSeen: new Date(),
    motivations: ["Espionnage", "Destruction", "Sabotage"],
    targetSectors: ["Aérospatiale", "Énergie", "Pétrole et gaz", "Défense"],
    targetRegions: ["États-Unis", "Arabie Saoudite", "Corée du Sud", "Europe"],
    sophisticationLevel: "Medium",
    references: [
      { url: "https://attack.mitre.org/groups/G0064/", source: "MITRE ATT&CK", description: "Page MITRE ATT&CK pour APT33" },
      { url: "https://www.fireeye.com/blog/threat-research/2017/09/apt33-insights-into-iranian-cyber-espionage.html", source: "FireEye", description: "Rapport FireEye sur APT33" }
    ],
    relatedGroups: ["APT34", "MuddyWater"],
    threatLevel: 8
  },
  {
    name: "APT35",
    aliases: ["Charming Kitten", "Phosphorus", "TA453", "COBALT ILLUSION", "ITG18"],
    countryOfOrigin: "Iran",
    description: "Groupe lié au Corps des Gardiens de la révolution islamique iranien. Connu pour ses opérations d'espionnage et de vol d'informations sensibles, notamment via des campagnes de phishing sophistiquées.",
    firstSeen: new Date("2014-01-01"),
    lastSeen: new Date(),
    motivations: ["Espionnage", "Vol d'informations sensibles", "Surveillance"],
    targetSectors: ["Gouvernement", "Défense", "Médias", "Dissidents"],
    targetRegions: ["États-Unis", "Europe", "Moyen-Orient", "Israël"],
    sophisticationLevel: "Medium",
    references: [
      { url: "https://attack.mitre.org/groups/G0059/", source: "MITRE ATT&CK", description: "Page MITRE ATT&CK pour APT35" }
    ],
    relatedGroups: ["APT33", "APT34"],
    threatLevel: 8
  },
  
  // Autres groupes notables
  {
    name: "FIN7",
    aliases: ["Carbanak", "Carbon Spider", "Navigator Group"],
    countryOfOrigin: "Unknown",
    description: "Groupe cybercriminel sophistiqué ciblant principalement le secteur financier et la vente au détail. Connu pour ses attaques contre les systèmes de point de vente et les institutions financières.",
    firstSeen: new Date("2013-01-01"),
    lastSeen: new Date(),
    motivations: ["Gain financier", "Vol de données de cartes bancaires"],
    targetSectors: ["Finance", "Vente au détail", "Hôtellerie", "Restauration"],
    targetRegions: ["Monde entier", "États-Unis", "Europe"],
    sophisticationLevel: "High",
    references: [
      { url: "https://attack.mitre.org/groups/G0046/", source: "MITRE ATT&CK", description: "Page MITRE ATT&CK pour FIN7" },
      { url: "https://www.fireeye.com/blog/threat-research/2018/08/fin7-pursuing-an-enigmatic-and-evasive-global-criminal-operation.html", source: "FireEye", description: "Rapport FireEye sur FIN7" }
    ],
    relatedGroups: [],
    threatLevel: 9
  },
  {
    name: "Wizard Spider",
    aliases: ["UNC1878", "TEMP.MixMaster", "Grim Spider", "Gold Blackburn"],
    countryOfOrigin: "Russia",
    description: "Groupe cybercriminel russe responsable des ransomwares Ryuk et Conti. Connu pour ses attaques ciblées à forte demande de rançon contre des organisations critiques.",
    firstSeen: new Date("2016-01-01"),
    lastSeen: new Date(),
    motivations: ["Gain financier", "Extorsion"],
    targetSectors: ["Santé", "Gouvernement", "Éducation", "Industrie"],
    targetRegions: ["Monde entier", "États-Unis", "Europe"],
    sophisticationLevel: "High",
    references: [
      { url: "https://attack.mitre.org/groups/G0102/", source: "MITRE ATT&CK", description: "Page MITRE ATT&CK pour Wizard Spider" }
    ],
    relatedGroups: [],
    threatLevel: 9
  }
];

// Données complètes pour les techniques
const techniques = [
  {
    name: "Spear Phishing Attachment",
    mitreId: "T1566.001",
    description: "Les attaquants envoient des e-mails ciblés avec des pièces jointes malveillantes pour obtenir un accès initial au système de la victime. Ces e-mails sont souvent personnalisés et semblent provenir d'une source légitime.",
    tactic: "Initial Access",
    platforms: ["Windows", "macOS", "Linux"],
    dataSources: ["Email Gateway", "Network Traffic", "File Monitoring"],
    mitigation: "Filtrage des e-mails, sensibilisation des utilisateurs, analyse des pièces jointes, désactivation des macros Office",
    detection: "Surveiller les pièces jointes inhabituelles, les extensions de fichiers suspectes, et les comportements post-exécution comme les connexions réseau inhabituelles",
    references: [
      { url: "https://attack.mitre.org/techniques/T1566/001/", source: "MITRE ATT&CK", description: "Page MITRE ATT&CK pour Spear Phishing Attachment" }
    ]
  },
  {
    name: "Spear Phishing Link",
    mitreId: "T1566.002",
    description: "Les attaquants envoient des e-mails ciblés contenant des liens malveillants pour inciter les victimes à visiter des sites web compromis ou malveillants.",
    tactic: "Initial Access",
    platforms: ["Windows", "macOS", "Linux", "Mobile"],
    dataSources: ["Email Gateway", "Network Traffic", "Web Proxy"],
    mitigation: "Filtrage des e-mails, sensibilisation des utilisateurs, analyse des URL, filtrage web",
    detection: "Surveiller les URL suspectes, les redirections, et les comportements post-clic comme les téléchargements de fichiers ou les injections de code",
    references: [
      { url: "https://attack.mitre.org/techniques/T1566/002/", source: "MITRE ATT&CK", description: "Page MITRE ATT&CK pour Spear Phishing Link" }
    ]
  },
  {
    name: "Credential Dumping",
    mitreId: "T1003",
    description: "Les attaquants extraient les identifiants de connexion du système, comme les hachages de mots de passe, les tickets Kerberos ou les mots de passe en texte clair stockés en mémoire.",
    tactic: "Credential Access",
    platforms: ["Windows", "macOS", "Linux"],
    dataSources: ["Process Monitoring", "Memory Analysis", "Windows Event Logs"],
    mitigation: "Privilèges limités, authentification multifacteur, protection de la mémoire, surveillance des accès aux fichiers sensibles",
    detection: "Surveiller l'accès aux fichiers de base de données d'identifiants, les processus accédant à lsass.exe, l'utilisation d'outils comme Mimikatz",
    references: [
      { url: "https://attack.mitre.org/techniques/T1003/", source: "MITRE ATT&CK", description: "Page MITRE ATT&CK pour Credential Dumping" }
    ]
  },
  {
    name: "Supply Chain Compromise",
    mitreId: "T1195",
    description: "Les attaquants compromettent ou manipulent des produits ou des outils avant leur livraison au client final, comme dans le cas de l'attaque SolarWinds.",
    tactic: "Initial Access",
    platforms: ["Windows", "macOS", "Linux", "Network"],
    dataSources: ["File Integrity Monitoring", "Network Traffic", "Binary Analysis"],
    mitigation: "Vérification de l'intégrité des logiciels, audit des fournisseurs, surveillance des mises à jour",
    detection: "Analyser les comportements inhabituels des logiciels de confiance, les communications réseau suspectes, les modifications de binaires signés",
    references: [
      { url: "https://attack.mitre.org/techniques/T1195/", source: "MITRE ATT&CK", description: "Page MITRE ATT&CK pour Supply Chain Compromise" }
    ]
  },
  {
    name: "Obfuscated Files or Information",
    mitreId: "T1027",
    description: "Les attaquants obfusquent le contenu de leurs fichiers ou informations pour éviter la détection. Cela peut inclure l'encodage, la compression, ou le chiffrement des données malveillantes.",
    tactic: "Defense Evasion",
    platforms: ["Windows", "macOS", "Linux"],
    dataSources: ["File Monitoring", "Process Monitoring", "Binary Analysis"],
    mitigation: "Analyse comportementale, détection d'anomalies, désobfuscation automatisée",
    detection: "Identifier les fichiers avec un entropie élevée, les scripts encodés, les chaînes de caractères obfusquées",
    references: [
      { url: "https://attack.mitre.org/techniques/T1027/", source: "MITRE ATT&CK", description: "Page MITRE ATT&CK pour Obfuscated Files or Information" }
    ]
  },
  {
    name: "Data Encrypted for Impact",
    mitreId: "T1486",
    description: "Les attaquants chiffrent les données sur les systèmes cibles pour interrompre la disponibilité des ressources système et des données. Cette technique est couramment utilisée dans les attaques de ransomware.",
    tactic: "Impact",
    platforms: ["Windows", "macOS", "Linux"],
    dataSources: ["File Monitoring", "Process Monitoring", "Command Monitoring"],
    mitigation: "Sauvegardes régulières hors ligne, segmentation du réseau, principe du moindre privilège",
    detection: "Surveiller les activités massives de chiffrement de fichiers, les extensions de fichiers modifiées, les notes de rançon",
    references: [
      { url: "https://attack.mitre.org/techniques/T1486/", source: "MITRE ATT&CK", description: "Page MITRE ATT&CK pour Data Encrypted for Impact" }
    ]
  },
  {
    name: "Lateral Tool Transfer",
    mitreId: "T1570",
    description: "Les attaquants transfèrent des outils ou d'autres fichiers entre les systèmes d'un environnement compromis pour faciliter l'exécution d'autres techniques.",
    tactic: "Lateral Movement",
    platforms: ["Windows", "macOS", "Linux"],
    dataSources: ["File Monitoring", "Network Traffic", "Command Monitoring"],
    mitigation: "Segmentation du réseau, surveillance des transferts de fichiers, restriction des outils d'administration",
    detection: "Surveiller les transferts de fichiers inhabituels entre systèmes, l'apparition soudaine d'outils d'administration ou de scripts",
    references: [
      { url: "https://attack.mitre.org/techniques/T1570/", source: "MITRE ATT&CK", description: "Page MITRE ATT&CK pour Lateral Tool Transfer" }
    ]
  },
  {
    name: "External Remote Services",
    mitreId: "T1133",
    description: "Les attaquants utilisent des services d'accès à distance légitimes (VPN, RDP, SSH) pour accéder aux réseaux des victimes et maintenir leur présence.",
    tactic: "Persistence, Initial Access",
    platforms: ["Windows", "macOS", "Linux", "Network"],
    dataSources: ["Authentication Logs", "Network Traffic", "VPN Logs"],
    mitigation: "Authentification multifacteur, surveillance des connexions, restriction des accès à distance",
    detection: "Identifier les connexions à distance à des heures inhabituelles, depuis des emplacements géographiques suspects, ou avec des comportements anormaux",
    references: [
      { url: "https://attack.mitre.org/techniques/T1133/", source: "MITRE ATT&CK", description: "Page MITRE ATT&CK pour External Remote Services" }
    ]
  },
  {
    name: "Valid Accounts",
    mitreId: "T1078",
    description: "Les attaquants utilisent des comptes légitimes pour accéder aux systèmes et maintenir leur accès. Ces comptes peuvent être compromis, créés par l'attaquant, ou partagés.",
    tactic: "Defense Evasion, Persistence, Privilege Escalation, Initial Access",
    platforms: ["Windows", "macOS", "Linux", "Network", "Cloud"],
    dataSources: ["Authentication Logs", "Account Monitoring", "User Behavior Analytics"],
    mitigation: "Authentification multifacteur, audit régulier des comptes, principe du moindre privilège",
    detection: "Surveiller les activités inhabituelles des comptes, les connexions à des heures anormales, les accès à des ressources inhabituelles",
    references: [
      { url: "https://attack.mitre.org/techniques/T1078/", source: "MITRE ATT&CK", description: "Page MITRE ATT&CK pour Valid Accounts" }
    ]
  },
  {
    name: "Command and Scripting Interpreter",
    mitreId: "T1059",
    description: "Les attaquants abusent des interpréteurs de commandes et de scripts pour exécuter des commandes, des scripts ou des binaires malveillants.",
    tactic: "Execution",
    platforms: ["Windows", "macOS", "Linux"],
    dataSources: ["Process Monitoring", "Command Monitoring", "Script Monitoring"],
    mitigation: "Restriction des interpréteurs de scripts, journalisation des lignes de commande, analyse comportementale",
    detection: "Surveiller l'exécution de scripts inhabituels, les commandes suspectes, les paramètres de ligne de commande obfusqués",
    references: [
      { url: "https://attack.mitre.org/techniques/T1059/", source: "MITRE ATT&CK", description: "Page MITRE ATT&CK pour Command and Scripting Interpreter" }
    ]
  }
];

// Données complètes pour les campagnes
const campaigns = [
  {
    name: "SolarWinds Supply Chain Attack",
    description: "Attaque sophistiquée de la chaîne d'approvisionnement ciblant le logiciel Orion de SolarWinds. Les attaquants ont inséré une porte dérobée (SUNBURST) dans les mises à jour légitimes du logiciel, compromettant des milliers d'organisations, dont plusieurs agences gouvernementales américaines.",
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
      { url: "https://www.mandiant.com/resources/blog/sunburst-additional-technical-details", source: "Mandiant", description: "Analyse technique de SUNBURST par Mandiant" },
      { url: "https://www.microsoft.com/security/blog/2020/12/18/analyzing-solorigate-the-compromised-dll-file-that-started-a-sophisticated-cyberattack/", source: "Microsoft", description: "Analyse de Solorigate par Microsoft" }
    ]
  },
  {
    name: "NotPetya Global Attack",
    description: "Cyberattaque destructrice déguisée en ransomware qui s'est propagée rapidement à l'échelle mondiale. Initialement distribuée via une mise à jour compromise du logiciel de comptabilité ukrainien M.E.Doc, elle a causé des milliards de dollars de dommages.",
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
      { url: "https://www.wired.com/story/notpetya-cyberattack-ukraine-russia-code-crashed-the-world/", source: "Wired", description: "Article Wired sur NotPetya" },
      { url: "https://blog.talosintelligence.com/2017/06/worldwide-ransomware-variant.html", source: "Cisco Talos", description: "Analyse de NotPetya par Cisco Talos" }
    ]
  },
  {
    name: "Operation Cloud Hopper",
    description: "Campagne d'espionnage ciblant les fournisseurs de services gérés (MSP) pour accéder aux données de leurs clients dans divers secteurs. Les attaquants ont utilisé les MSP comme points d'entrée pour compromettre de nombreuses organisations en aval.",
    attackGroups: ["APT10"],
    startDate: new Date("2016-01-01"),
    endDate: new Date("2018-12-31"),
    status: "Inactive",
    techniques: ["T1566.001", "T1078", "T1133", "T1570"],
    malware: ["PlugX", "Poison Ivy", "ChChes"],
    targetSectors: ["Services gérés", "Technologie", "Gouvernement", "Défense"],
    targetRegions: ["Japon", "Europe", "États-Unis"],
    impactLevel: 9,
    references: [
      { url: "https://www.pwc.co.uk/cyber-security/pdf/cloud-hopper-report-final-v4.pdf", source: "PwC", description: "Rapport PwC sur Operation Cloud Hopper" }
    ]
  },
  {
    name: "WannaCry Ransomware Attack",
    description: "Attaque mondiale de ransomware qui a exploité la vulnérabilité EternalBlue dans les systèmes Windows. Elle a infecté plus de 200 000 ordinateurs dans 150 pays, causant des dommages estimés à plusieurs milliards de dollars.",
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
  },
  {
    name: "Operation Ghostwriter",
    description: "Campagne d'influence et de désinformation ciblant principalement les pays baltes et la Pologne. Les attaquants ont utilisé de faux sites d'information, des comptes de médias sociaux compromis et des fuites de documents pour diffuser de fausses informations.",
    attackGroups: ["UNC1151"],
    startDate: new Date("2020-01-01"),
    endDate: new Date(),
    status: "Active",
    techniques: ["T1566.002", "T1078", "T1059"],
    malware: ["Custom Malware"],
    targetSectors: ["Gouvernement", "Médias", "Défense", "Politique"],
    targetRegions: ["Pologne", "Lituanie", "Lettonie", "Allemagne"],
    impactLevel: 7,
    references: [
      { url: "https://www.fireeye.com/blog/threat-research/2020/07/ghostwriter-influence-campaign.html", source: "FireEye", description: "Rapport FireEye sur Operation Ghostwriter" }
    ]
  }
];

// Données complètes pour les malwares
const malwares = [
  {
    name: "SUNBURST",
    aliases: ["Solorigate"],
    description: "Backdoor sophistiquée déployée via les mises à jour compromises de SolarWinds Orion. Conçue pour rester discrète, elle utilise des techniques avancées d'évasion et communique avec des serveurs de commande et contrôle en imitant le trafic légitime d'Orion.",
    type: "Backdoor",
    firstSeen: new Date("2020-03-01"),
    lastSeen: new Date("2020-12-31"),
    associatedGroups: ["APT29"],
    techniques: ["T1195", "T1027", "T1078", "T1059"],
    targetPlatforms: ["Windows"],
    capabilities: ["Command Execution", "Data Exfiltration", "Persistence", "Defense Evasion"],
    references: [
      { url: "https://www.mandiant.com/resources/blog/sunburst-additional-technical-details", source: "Mandiant", description: "Analyse technique de SUNBURST par Mandiant" }
    ],
    threatLevel: 10
  },
  {
    name: "NotPetya",
    aliases: ["GoldenEye", "Nyetya", "Petrwrap"],
    description: "Malware destructeur déguisé en ransomware. Utilise plusieurs vecteurs de propagation, dont EternalBlue et des identifiants volés. Contrairement aux ransomwares traditionnels, il est conçu pour détruire les données plutôt que pour extorquer de l'argent.",
    type: "Wiper",
    firstSeen: new Date("2017-06-27"),
    lastSeen: new Date("2017-07-15"),
    associatedGroups: ["Sandworm"],
    techniques: ["T1486", "T1078", "T1570"],
    targetPlatforms: ["Windows"],
    capabilities: ["Self-Propagation", "Data Destruction", "Credential Theft"],
    references: [
      { url: "https://blog.talosintelligence.com/2017/06/worldwide-ransomware-variant.html", source: "Cisco Talos", description: "Analyse de NotPetya par Cisco Talos" }
    ],
    threatLevel: 10
  },
  {
    name: "WannaCry",
    aliases: ["WanaCrypt0r", "Wana Decrypt0r"],
    description: "Ransomware qui s'est propagé mondialement en exploitant la vulnérabilité EternalBlue dans les systèmes Windows. Il chiffre les fichiers des victimes et demande une rançon en Bitcoin pour les déchiffrer.",
    type: "Ransomware",
    firstSeen: new Date("2017-05-12"),
    lastSeen: new Date("2017-05-15"),
    associatedGroups: ["Lazarus Group"],
    techniques: ["T1486", "T1133"],
    targetPlatforms: ["Windows"],
    capabilities: ["Self-Propagation", "Data Encryption", "Ransom Demand"],
    references: [
      { url: "https://www.microsoft.com/security/blog/2017/05/12/wannacrypt-ransomware-worm-targets-out-of-date-systems/", source: "Microsoft", description: "Analyse de WannaCry par Microsoft" }
    ],
    threatLevel: 9
  },
  {
    name: "Conti",
    aliases: ["Ryuk 2.0"],
    description: "Ransomware sophistiqué utilisé dans des attaques ciblées à forte demande de rançon. Opère selon le modèle de Ransomware-as-a-Service (RaaS) et est connu pour ses techniques avancées d'évasion et sa rapidité de chiffrement.",
    type: "Ransomware",
    firstSeen: new Date("2020-01-01"),
    lastSeen: new Date(),
    associatedGroups: ["Wizard Spider"],
    techniques: ["T1486", "T1078", "T1059"],
    targetPlatforms: ["Windows"],
    capabilities: ["Data Encryption", "Data Exfiltration", "Defense Evasion"],
    references: [
      { url: "https://www.cisa.gov/uscert/ncas/alerts/aa22-011a", source: "CISA", description: "Alerte CISA sur Conti Ransomware" }
    ],
    threatLevel: 9
  },
  {
    name: "Cobalt Strike",
    aliases: ["Beacon"],
    description: "Outil commercial de test de pénétration légitimement utilisé par les professionnels de la sécurité, mais fréquemment détourné par les attaquants. Fournit un ensemble complet de fonctionnalités post-exploitation.",
    type: "Backdoor",
    firstSeen: new Date("2012-01-01"),
    lastSeen: new Date(),
    associatedGroups: ["Multiple"],
    techniques: ["T1059", "T1078", "T1570"],
    targetPlatforms: ["Windows", "Linux"],
    capabilities: ["Command Execution", "Lateral Movement", "Credential Theft", "Data Exfiltration"],
    references: [
      { url: "https://www.mandiant.com/resources/blog/defining-cobalt-strike-components", source: "Mandiant", description: "Analyse de Cobalt Strike par Mandiant" }
    ],
    threatLevel: 8
  }
];

// Données complètes pour les régions
const regions = [
  {
    name: "Amérique du Nord",
    countries: ["États-Unis", "Canada", "Mexique"],
    threatLevel: 9,
    activeGroups: ["APT28", "APT29", "Lazarus Group", "APT41", "Wizard Spider"]
  },
  {
    name: "Europe",
    countries: ["France", "Allemagne", "Royaume-Uni", "Italie", "Espagne", "Pays-Bas", "Belgique", "Suisse", "Suède", "Norvège", "Finlande", "Pologne", "Ukraine"],
    threatLevel: 9,
    activeGroups: ["APT28", "APT29", "Sandworm", "APT41", "Wizard Spider"]
  },
  {
    name: "Asie",
    countries: ["Chine", "Japon", "Corée du Sud", "Inde", "Singapour", "Taïwan", "Vietnam", "Thaïlande", "Indonésie", "Malaisie", "Philippines"],
    threatLevel: 9,
    activeGroups: ["APT1", "APT41", "Lazarus Group", "APT33", "APT35"]
  },
  {
    name: "Moyen-Orient",
    countries: ["Israël", "Arabie Saoudite", "Émirats arabes unis", "Qatar", "Koweït", "Iran", "Irak", "Turquie"],
    threatLevel: 9,
    activeGroups: ["APT33", "APT35", "APT28", "APT29"]
  },
  {
    name: "Amérique latine",
    countries: ["Brésil", "Argentine", "Colombie", "Chili", "Pérou", "Venezuela"],
    threatLevel: 7,
    activeGroups: ["APT41", "FIN7", "Wizard Spider"]
  },
  {
    name: "Afrique",
    countries: ["Afrique du Sud", "Égypte", "Nigeria", "Kenya", "Maroc", "Algérie"],
    threatLevel: 6,
    activeGroups: ["APT35", "FIN7"]
  },
  {
    name: "Océanie",
    countries: ["Australie", "Nouvelle-Zélande"],
    threatLevel: 7,
    activeGroups: ["APT41", "APT29", "Lazarus Group"]
  }
];

// Données complètes pour les secteurs
const sectors = [
  {
    name: "Gouvernement",
    description: "Organisations gouvernementales, agences fédérales, administrations locales et services publics",
    threatLevel: 10,
    activeGroups: ["APT28", "APT29", "Sandworm", "APT41", "Lazarus Group", "APT33", "APT35"]
  },
  {
    name: "Finance",
    description: "Banques, assurances, services financiers, marchés boursiers, fintechs et institutions financières",
    threatLevel: 9,
    activeGroups: ["Lazarus Group", "FIN7", "Wizard Spider", "APT41", "APT38"]
  },
  {
    name: "Énergie",
    description: "Pétrole et gaz, électricité, énergies renouvelables, infrastructures énergétiques et services publics",
    threatLevel: 9,
    activeGroups: ["Sandworm", "APT33", "APT41", "APT29"]
  },
  {
    name: "Santé",
    description: "Hôpitaux, cliniques, laboratoires pharmaceutiques, recherche médicale et assurances santé",
    threatLevel: 8,
    activeGroups: ["APT29", "Wizard Spider", "APT41", "FIN7"]
  },
  {
    name: "Défense",
    description: "Industries de défense, contractants militaires, agences de renseignement et organisations militaires",
    threatLevel: 10,
    activeGroups: ["APT28", "APT29", "APT41", "Lazarus Group", "APT33", "APT35"]
  },
  {
    name: "Technologie",
    description: "Entreprises technologiques, fournisseurs de logiciels, services cloud, télécommunications et électronique",
    threatLevel: 9,
    activeGroups: ["APT41", "APT29", "Lazarus Group", "APT1"]
  },
  {
    name: "Industrie",
    description: "Fabrication, automobile, aérospatiale, construction, produits chimiques et industries lourdes",
    threatLevel: 8,
    activeGroups: ["APT1", "APT41", "APT33", "Sandworm"]
  },
  {
    name: "Transport",
    description: "Aviation, maritime, ferroviaire, logistique et infrastructures de transport",
    threatLevel: 8,
    activeGroups: ["APT41", "Sandworm", "Wizard Spider"]
  },
  {
    name: "Éducation",
    description: "Universités, écoles, instituts de recherche et organisations éducatives",
    threatLevel: 7,
    activeGroups: ["APT29", "APT41", "Wizard Spider"]
  },
  {
    name: "Médias",
    description: "Presse, télévision, radio, médias en ligne, divertissement et réseaux sociaux",
    threatLevel: 7,
    activeGroups: ["APT28", "APT35", "Lazarus Group"]
  }
];

/**
 * Fonction principale pour importer les données
 */
async function importData() {
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
    
    console.log('Insertion des groupes d\'attaque...');
    await AttackGroup.insertMany(attackGroups);
    
    console.log('Insertion des techniques...');
    await Technique.insertMany(techniques);
    
    console.log('Insertion des campagnes...');
    await Campaign.insertMany(campaigns);
    
    console.log('Insertion des malwares...');
    await Malware.insertMany(malwares);
    
    console.log('Insertion des régions...');
    await Region.insertMany(regions);
    
    console.log('Insertion des secteurs...');
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

    console.log('Importation des données terminée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'importation des données:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Connexion à MongoDB fermée');
  }
}

// Exécuter la fonction d'importation
importData()
  .then(() => {
    console.log('Script terminé');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erreur non gérée:', error);
    process.exit(1);
  });
