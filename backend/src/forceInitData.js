/**
 * Script de forçage d'initialisation des données
 * Ce script injecte directement des données complètes dans la base MongoDB
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// Modèles
const AttackGroup = require('./models/AttackGroup');
const Campaign = require('./models/Campaign');
const Technique = require('./models/Technique');
const Malware = require('./models/Malware');
const Region = require('./models/Region');
const Sector = require('./models/Sector');

// Données complètes pour les groupes d'attaque
const attackGroupsData = [
  {
    name: "APT1",
    aliases: ["Comment Crew", "Comment Group", "Unit 61398"],
    countryOfOrigin: "China",
    description: "APT1 est une unité de cyberespionnage du Département de Reconnaissance Général de l'Armée Populaire de Libération chinoise (PLA). Ce groupe a mené une campagne de cyberespionnage économique contre des organisations occidentales depuis au moins 2006.",
    firstSeen: new Date("2006-01-01"),
    lastSeen: new Date(),
    motivations: ["Espionnage", "Vol de propriété intellectuelle"],
    targetSectors: ["Aérospatiale", "Énergie", "Télécommunications", "Industrie manufacturière"],
    targetRegions: ["Amérique du Nord", "Europe"],
    sophisticationLevel: "High",
    references: [
      {
        url: "https://www.mandiant.com/resources/apt1-exposing-one-of-chinas-cyber-espionage-units",
        source: "Mandiant",
        description: "Rapport APT1"
      },
      {
        url: "https://attack.mitre.org/groups/G0006/",
        source: "MITRE ATT&CK",
        description: "Profil MITRE ATT&CK"
      }
    ],
    relatedGroups: [],
    threatLevel: 8
  },
  {
    name: "APT28",
    aliases: ["Fancy Bear", "Sofacy", "Sednit", "Pawn Storm", "STRONTIUM"],
    countryOfOrigin: "Russia",
    description: "APT28 est un groupe de cyberespionnage sophistiqué lié au renseignement militaire russe (GRU). Actif depuis au moins 2004, ce groupe cible principalement les organisations gouvernementales, militaires et de sécurité dans le monde entier.",
    firstSeen: new Date("2004-01-01"),
    lastSeen: new Date(),
    motivations: ["Espionnage politique", "Influence électorale", "Collecte de renseignements militaires"],
    targetSectors: ["Gouvernement", "Défense", "Politique", "Sport"],
    targetRegions: ["Amérique du Nord", "Europe", "Ukraine"],
    sophisticationLevel: "High",
    references: [
      {
        url: "https://www.crowdstrike.com/blog/who-is-fancy-bear/",
        source: "CrowdStrike",
        description: "Profil Fancy Bear"
      },
      {
        url: "https://attack.mitre.org/groups/G0007/",
        source: "MITRE ATT&CK",
        description: "Profil MITRE ATT&CK"
      }
    ],
    relatedGroups: ["Sandworm"],
    threatLevel: 9
  },
  {
    name: "APT29",
    aliases: ["Cozy Bear", "The Dukes", "CozyDuke", "NOBELIUM"],
    countryOfOrigin: "Russia",
    description: "APT29 est un groupe de cyberespionnage sophistiqué lié au Service de Renseignement Extérieur russe (SVR). Ils sont connus pour leur discrétion et leurs techniques d'évasion avancées.",
    firstSeen: new Date("2008-01-01"),
    lastSeen: new Date(),
    motivations: ["Espionnage", "Vol de données sensibles", "Accès persistant"],
    targetSectors: ["Gouvernement", "Diplomatie", "Santé", "Recherche"],
    targetRegions: ["Amérique du Nord", "Europe", "Moyen-Orient"],
    sophisticationLevel: "High",
    references: [
      {
        url: "https://www.fireeye.com/blog/threat-research/2020/12/evasive-attacker-leverages-solarwinds-supply-chain-compromises-with-sunburst-backdoor.html",
        source: "FireEye",
        description: "Analyse SolarWinds"
      },
      {
        url: "https://attack.mitre.org/groups/G0016/",
        source: "MITRE ATT&CK",
        description: "Profil MITRE ATT&CK"
      }
    ],
    relatedGroups: [],
    threatLevel: 9
  },
  {
    name: "Lazarus Group",
    aliases: ["HIDDEN COBRA", "Guardians of Peace", "ZINC", "NICKEL ACADEMY"],
    countryOfOrigin: "North Korea",
    description: "Le Lazarus Group est un collectif de hackers lié au gouvernement nord-coréen. Actif depuis au moins 2009, ce groupe est responsable de certaines des cyberattaques les plus destructrices et des vols financiers les plus importants de l'histoire.",
    firstSeen: new Date("2009-01-01"),
    lastSeen: new Date(),
    motivations: ["Gain financier", "Contournement des sanctions", "Sabotage", "Espionnage"],
    targetSectors: ["Finance", "Médias", "Aérospatiale", "Défense", "Cryptomonnaies"],
    targetRegions: ["Monde entier", "Corée du Sud", "États-Unis"],
    sophisticationLevel: "High",
    references: [
      {
        url: "https://www.us-cert.gov/ncas/alerts/TA17-318B",
        source: "US-CERT",
        description: "Alerte Hidden Cobra"
      },
      {
        url: "https://attack.mitre.org/groups/G0032/",
        source: "MITRE ATT&CK",
        description: "Profil MITRE ATT&CK"
      }
    ],
    relatedGroups: [],
    threatLevel: 9
  },
  {
    name: "APT41",
    aliases: ["BARIUM", "Winnti", "Blackfly", "Wicked Panda"],
    countryOfOrigin: "China",
    description: "APT41 est un groupe de cybermenace chinois qui mène des opérations d'espionnage parrainées par l'État ainsi que des activités cybercriminelles financièrement motivées.",
    firstSeen: new Date("2012-01-01"),
    lastSeen: new Date(),
    motivations: ["Espionnage", "Gain financier", "Vol de propriété intellectuelle"],
    targetSectors: ["Jeux vidéo", "Santé", "Hautes technologies", "Télécommunications", "Voyages"],
    targetRegions: ["Asie", "Amérique du Nord", "Europe"],
    sophisticationLevel: "High",
    references: [
      {
        url: "https://www.fireeye.com/blog/threat-research/2019/08/apt41-dual-espionage-and-cyber-crime-operation.html",
        source: "FireEye",
        description: "Analyse APT41"
      },
      {
        url: "https://attack.mitre.org/groups/G0096/",
        source: "MITRE ATT&CK",
        description: "Profil MITRE ATT&CK"
      }
    ],
    relatedGroups: ["Winnti Group"],
    threatLevel: 8
  },
  {
    name: "Carbanak",
    aliases: ["FIN7", "Carbon Spider", "Anunak"],
    countryOfOrigin: "Russia",
    description: "Carbanak est un groupe cybercriminel sophistiqué spécialisé dans le vol financier. Ils ont volé plus d'un milliard de dollars à des institutions financières dans le monde entier.",
    firstSeen: new Date("2013-01-01"),
    lastSeen: new Date(),
    motivations: ["Gain financier", "Vol de données de cartes de crédit"],
    targetSectors: ["Banques", "Restaurants", "Hôtels", "Casinos", "Services financiers"],
    targetRegions: ["Monde entier"],
    sophisticationLevel: "High",
    references: [
      {
        url: "https://www.kaspersky.com/resource-center/threats/carbanak-apt",
        source: "Kaspersky",
        description: "Analyse Carbanak"
      },
      {
        url: "https://attack.mitre.org/groups/G0008/",
        source: "MITRE ATT&CK",
        description: "Profil MITRE ATT&CK"
      }
    ],
    relatedGroups: ["FIN7"],
    threatLevel: 8
  },
  {
    name: "Sandworm",
    aliases: ["BlackEnergy", "Voodoo Bear", "ELECTRUM", "Telebots"],
    countryOfOrigin: "Russia",
    description: "Sandworm est un groupe de cyberattaque d'élite lié au renseignement militaire russe (GRU). Ils sont responsables de certaines des cyberattaques les plus destructrices de l'histoire, notamment NotPetya et les attaques contre le réseau électrique ukrainien.",
    firstSeen: new Date("2009-01-01"),
    lastSeen: new Date(),
    motivations: ["Sabotage", "Perturbation", "Guerre hybride"],
    targetSectors: ["Énergie", "Gouvernements", "Médias", "Transports", "Événements sportifs"],
    targetRegions: ["Ukraine", "Europe", "États-Unis"],
    sophisticationLevel: "High",
    references: [
      {
        url: "https://www.wired.com/story/sandworm-kremlin-most-dangerous-hackers/",
        source: "Wired",
        description: "Analyse Sandworm"
      },
      {
        url: "https://attack.mitre.org/groups/G0034/",
        source: "MITRE ATT&CK",
        description: "Profil MITRE ATT&CK"
      }
    ],
    relatedGroups: ["APT28"],
    threatLevel: 10
  },
  {
    name: "Conti",
    aliases: ["Wizard Spider", "Gold Ulrick"],
    countryOfOrigin: "Russia",
    description: "Conti est l'un des groupes de ransomware les plus actifs et les plus destructeurs, responsable de centaines d'attaques contre des organisations dans le monde entier.",
    firstSeen: new Date("2020-01-01"),
    lastSeen: new Date("2022-05-01"),
    motivations: ["Gain financier", "Extorsion"],
    targetSectors: ["Santé", "Gouvernements", "Industrie manufacturière", "Services financiers", "Éducation"],
    targetRegions: ["Monde entier"],
    sophisticationLevel: "High",
    references: [
      {
        url: "https://www.cisa.gov/uscert/ncas/alerts/aa21-265a",
        source: "CISA",
        description: "Alerte Conti Ransomware"
      },
      {
        url: "https://www.mandiant.com/resources/blog/unc2727-shifts-to-conti-ransomware",
        source: "Mandiant",
        description: "Analyse Conti"
      }
    ],
    relatedGroups: ["Ryuk"],
    threatLevel: 9
  },
  {
    name: "LockBit",
    aliases: ["LockBit 2.0", "LockBit 3.0", "LockBit Black"],
    countryOfOrigin: "Russia",
    description: "LockBit est l'un des groupes de ransomware les plus actifs et les plus prolifiques, opérant selon un modèle de Ransomware-as-a-Service (RaaS).",
    firstSeen: new Date("2019-09-01"),
    lastSeen: new Date(),
    motivations: ["Gain financier", "Extorsion"],
    targetSectors: ["Services professionnels", "Industrie manufacturière", "Services financiers", "Santé", "Technologie"],
    targetRegions: ["Monde entier"],
    sophisticationLevel: "High",
    references: [
      {
        url: "https://www.mandiant.com/resources/blog/lockbit-3-refines-ransomware-operations",
        source: "Mandiant",
        description: "Analyse LockBit 3.0"
      },
      {
        url: "https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-165a",
        source: "CISA",
        description: "Alerte LockBit"
      }
    ],
    relatedGroups: [],
    threatLevel: 9
  }
];

// Données pour les techniques MITRE ATT&CK
const techniquesData = [
  {
    name: "Spear Phishing Attachment",
    mitreId: "T1566.001",
    description: "Les attaquants envoient des e-mails ciblés avec des pièces jointes malveillantes pour obtenir un accès initial au système de la victime.",
    tactic: "Initial Access",
    platforms: ["Windows", "macOS", "Linux"],
    dataSources: ["Email Gateway", "Network Traffic", "Endpoint Detection"],
    mitigation: "Filtrage des e-mails, sensibilisation des utilisateurs, analyse des pièces jointes",
    detection: "Surveiller les pièces jointes inhabituelles, les extensions de fichiers suspectes et les comportements post-exécution",
    references: [
      {
        url: "https://attack.mitre.org/techniques/T1566/001/",
        source: "MITRE ATT&CK",
        description: "Documentation MITRE"
      }
    ]
  },
  {
    name: "Obfuscated Files or Information",
    mitreId: "T1027",
    description: "Les attaquants obfusquent leur contenu pour éviter la détection.",
    tactic: "Defense Evasion",
    platforms: ["Windows", "macOS", "Linux", "Network"],
    dataSources: ["File Monitoring", "Process Monitoring", "Binary Analysis"],
    mitigation: "Analyse comportementale, détection d'anomalies",
    detection: "Rechercher des modèles d'obfuscation connus, des chaînes encodées et des comportements suspects",
    references: [
      {
        url: "https://attack.mitre.org/techniques/T1027/",
        source: "MITRE ATT&CK",
        description: "Documentation MITRE"
      }
    ]
  },
  {
    name: "Credential Dumping",
    mitreId: "T1003",
    description: "Les attaquants tentent d'extraire les identifiants de connexion et les hachages de mots de passe du système d'exploitation.",
    tactic: "Credential Access",
    platforms: ["Windows", "macOS", "Linux"],
    dataSources: ["Process Monitoring", "API Monitoring", "Memory Analysis"],
    mitigation: "Privilèges limités, authentification multifacteur, surveillance des processus",
    detection: "Surveiller l'accès aux fichiers de base de données d'identifiants, l'exécution d'outils de dumping et les accès à LSASS",
    references: [
      {
        url: "https://attack.mitre.org/techniques/T1003/",
        source: "MITRE ATT&CK",
        description: "Documentation MITRE"
      }
    ]
  },
  {
    name: "Data Encrypted for Impact",
    mitreId: "T1486",
    description: "Les attaquants chiffrent les données sur les systèmes cibles pour interrompre la disponibilité des ressources système et réseau.",
    tactic: "Impact",
    platforms: ["Windows", "macOS", "Linux"],
    dataSources: ["File Monitoring", "Process Monitoring", "Network Traffic"],
    mitigation: "Sauvegardes régulières, segmentation du réseau, principe du moindre privilège",
    detection: "Surveiller les activités de chiffrement massif, les extensions de fichiers modifiées et les notes de rançon",
    references: [
      {
        url: "https://attack.mitre.org/techniques/T1486/",
        source: "MITRE ATT&CK",
        description: "Documentation MITRE"
      }
    ]
  },
  {
    name: "Supply Chain Compromise",
    mitreId: "T1195",
    description: "Les attaquants compromettent ou manipulent des produits ou des outils logiciels avant leur réception par un client final.",
    tactic: "Initial Access",
    platforms: ["Windows", "macOS", "Linux", "Network"],
    dataSources: ["File Integrity Monitoring", "Binary Analysis", "Network Traffic"],
    mitigation: "Vérification des fournisseurs, validation des signatures, analyse des logiciels tiers",
    detection: "Surveiller les modifications inattendues des logiciels, les comportements anormaux après les mises à jour",
    references: [
      {
        url: "https://attack.mitre.org/techniques/T1195/",
        source: "MITRE ATT&CK",
        description: "Documentation MITRE"
      }
    ]
  },
  {
    name: "Lateral Movement via Stolen Credentials",
    mitreId: "T1570",
    description: "Les attaquants utilisent des identifiants volés pour se déplacer latéralement dans un réseau.",
    tactic: "Lateral Movement",
    platforms: ["Windows", "macOS", "Linux", "Network"],
    dataSources: ["Authentication Logs", "Network Traffic", "Process Monitoring"],
    mitigation: "Authentification multifacteur, segmentation du réseau, principe du moindre privilège",
    detection: "Surveiller les connexions inhabituelles, les authentifications à des heures anormales, les accès à plusieurs systèmes",
    references: [
      {
        url: "https://attack.mitre.org/techniques/T1570/",
        source: "MITRE ATT&CK",
        description: "Documentation MITRE"
      }
    ]
  },
  {
    name: "Data Exfiltration over C2 Channel",
    mitreId: "T1041",
    description: "Les attaquants volent des données en les transférant via leur canal de commande et contrôle (C2).",
    tactic: "Exfiltration",
    platforms: ["Windows", "macOS", "Linux", "Network"],
    dataSources: ["Network Traffic", "Packet Capture", "Netflow/Enclave netflow"],
    mitigation: "Surveillance du réseau, filtrage du trafic sortant, chiffrement des données sensibles",
    detection: "Surveiller les volumes de trafic inhabituels, les connexions à des domaines inconnus, les transferts de données anormaux",
    references: [
      {
        url: "https://attack.mitre.org/techniques/T1041/",
        source: "MITRE ATT&CK",
        description: "Documentation MITRE"
      }
    ]
  },
  {
    name: "Exploitation for Client Execution",
    mitreId: "T1203",
    description: "Les attaquants exploitent des vulnérabilités dans les applications client pour exécuter du code.",
    tactic: "Execution",
    platforms: ["Windows", "macOS", "Linux"],
    dataSources: ["Process Monitoring", "File Monitoring", "Network Traffic"],
    mitigation: "Mises à jour régulières, durcissement des applications, isolation des applications",
    detection: "Surveiller les comportements anormaux des applications, les crashs inexpliqués, les processus enfants inattendus",
    references: [
      {
        url: "https://attack.mitre.org/techniques/T1203/",
        source: "MITRE ATT&CK",
        description: "Documentation MITRE"
      }
    ]
  },
  {
    name: "Scheduled Task/Job",
    mitreId: "T1053",
    description: "Les attaquants utilisent les fonctionnalités de planification des tâches pour exécuter des programmes à des moments précis ou lors d'événements système.",
    tactic: "Execution, Persistence, Privilege Escalation",
    platforms: ["Windows", "macOS", "Linux"],
    dataSources: ["Process Monitoring", "File Monitoring", "Command Execution"],
    mitigation: "Surveillance des tâches planifiées, restriction des privilèges, audit des modifications",
    detection: "Surveiller la création ou la modification de tâches planifiées, les tâches qui exécutent des programmes inhabituels",
    references: [
      {
        url: "https://attack.mitre.org/techniques/T1053/",
        source: "MITRE ATT&CK",
        description: "Documentation MITRE"
      }
    ]
  },
  {
    name: "Command and Scripting Interpreter",
    mitreId: "T1059",
    description: "Les attaquants abusent des interpréteurs de commandes et de scripts pour exécuter des commandes, des scripts ou des binaires.",
    tactic: "Execution",
    platforms: ["Windows", "macOS", "Linux"],
    dataSources: ["Process Monitoring", "Command Execution", "Script Execution"],
    mitigation: "Restriction des interpréteurs de scripts, journalisation des exécutions de scripts, analyse comportementale",
    detection: "Surveiller l'exécution de scripts inhabituels, les lignes de commande suspectes, les scripts obfusqués",
    references: [
      {
        url: "https://attack.mitre.org/techniques/T1059/",
        source: "MITRE ATT&CK",
        description: "Documentation MITRE"
      }
    ]
  }
];

// Données pour les campagnes
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
  }
];

// Données pour les malwares
const malwaresData = [
  {
    name: "SUNBURST",
    aliases: ["Solorigate"],
    description: "Backdoor sophistiquée déployée via la mise à jour compromise du logiciel SolarWinds Orion. Conçue pour l'espionnage et l'exfiltration de données avec des capacités d'évasion avancées.",
    type: "Backdoor",
    firstSeen: new Date("2020-03-01"),
    lastSeen: new Date("2020-12-31"),
    associatedGroups: ["APT29"],
    techniques: ["T1195", "T1027", "T1059", "T1053"],
    targetPlatforms: ["Windows"],
    capabilities: ["Command Execution", "Data Exfiltration", "Persistence", "Evasion"],
    references: [
      {
        url: "https://www.fireeye.com/blog/threat-research/2020/12/evasive-attacker-leverages-solarwinds-supply-chain-compromises-with-sunburst-backdoor.html",
        source: "FireEye",
        description: "Analyse technique"
      }
    ],
    threatLevel: 9
  },
  {
    name: "NotPetya",
    aliases: ["GoldenEye", "Nyetya", "Petya.C"],
    description: "Malware destructeur déguisé en ransomware qui a causé des milliards de dollars de dommages dans le monde entier. Utilise EternalBlue et Mimikatz pour se propager latéralement.",
    type: "Wiper",
    firstSeen: new Date("2017-06-27"),
    lastSeen: new Date("2017-07-15"),
    associatedGroups: ["Sandworm"],
    techniques: ["T1566.001", "T1486", "T1570", "T1003"],
    targetPlatforms: ["Windows"],
    capabilities: ["Self-Propagation", "Credential Theft", "Data Destruction", "Boot Record Modification"],
    references: [
      {
        url: "https://blog.talosintelligence.com/2017/06/worldwide-ransomware-variant.html",
        source: "Cisco Talos",
        description: "Analyse technique"
      }
    ],
    threatLevel: 10
  },
  {
    name: "Conti Ransomware",
    aliases: ["Ryuk 2.0"],
    description: "Ransomware sophistiqué opérant selon un modèle RaaS (Ransomware-as-a-Service) avec double extorsion (chiffrement et vol de données).",
    type: "Ransomware",
    firstSeen: new Date("2020-01-01"),
    lastSeen: new Date("2022-05-01"),
    associatedGroups: ["Conti"],
    techniques: ["T1566.001", "T1486", "T1041", "T1003"],
    targetPlatforms: ["Windows"],
    capabilities: ["Data Encryption", "Data Exfiltration", "Lateral Movement", "Persistence"],
    references: [
      {
        url: "https://www.cisa.gov/uscert/ncas/alerts/aa21-265a",
        source: "CISA",
        description: "Alerte officielle"
      }
    ],
    threatLevel: 9
  },
  {
    name: "LockBit Ransomware",
    aliases: ["LockBit 2.0", "LockBit 3.0", "LockBit Black"],
    description: "Ransomware sophistiqué avec capacités d'auto-propagation et d'exfiltration de données, opérant selon un modèle RaaS.",
    type: "Ransomware",
    firstSeen: new Date("2019-09-01"),
    lastSeen: new Date(),
    associatedGroups: ["LockBit"],
    techniques: ["T1566.001", "T1486", "T1041", "T1570"],
    targetPlatforms: ["Windows"],
    capabilities: ["Self-Propagation", "Data Encryption", "Data Exfiltration", "Privilege Escalation"],
    references: [
      {
        url: "https://www.mandiant.com/resources/blog/lockbit-3-refines-ransomware-operations",
        source: "Mandiant",
        description: "Analyse technique"
      }
    ],
    threatLevel: 9
  },
  {
    name: "Cobalt Strike",
    aliases: ["CS", "Beacon"],
    description: "Outil commercial de test de pénétration légitimé détourné par des acteurs malveillants pour des opérations post-exploitation.",
    type: "RAT",
    firstSeen: new Date("2012-01-01"),
    lastSeen: new Date(),
    associatedGroups: ["APT29", "APT41", "Conti", "LockBit"],
    techniques: ["T1059", "T1041", "T1003", "T1570"],
    targetPlatforms: ["Windows", "Linux"],
    capabilities: ["Command Execution", "Lateral Movement", "Data Exfiltration", "Credential Theft"],
    references: [
      {
        url: "https://www.mandiant.com/resources/blog/defining-cobalt-strike-components",
        source: "Mandiant",
        description: "Analyse technique"
      }
    ],
    threatLevel: 8
  }
];

// Données pour les régions
const regionsData = [
  {
    name: "Amérique du Nord",
    countries: ["États-Unis", "Canada", "Mexique"],
    threatLevel: 9,
    activeGroups: ["APT28", "APT29", "Lazarus Group", "Conti", "LockBit"]
  },
  {
    name: "Europe",
    countries: ["France", "Allemagne", "Royaume-Uni", "Italie", "Espagne"],
    threatLevel: 8,
    activeGroups: ["APT28", "APT29", "Sandworm", "LockBit"]
  },
  {
    name: "Asie",
    countries: ["Chine", "Japon", "Corée du Sud", "Inde", "Singapour"],
    threatLevel: 9,
    activeGroups: ["APT1", "APT41", "Lazarus Group"]
  },
  {
    name: "Moyen-Orient",
    countries: ["Israël", "Émirats arabes unis", "Arabie saoudite", "Qatar", "Iran"],
    threatLevel: 8,
    activeGroups: ["APT29", "APT41"]
  },
  {
    name: "Amérique latine",
    countries: ["Brésil", "Argentine", "Colombie", "Chili", "Pérou"],
    threatLevel: 7,
    activeGroups: ["Conti", "LockBit"]
  }
];

// Données pour les secteurs
const sectorsData = [
  {
    name: "Gouvernement",
    description: "Organisations gouvernementales, agences fédérales, administrations locales",
    threatLevel: 9,
    activeGroups: ["APT28", "APT29", "Sandworm", "Lazarus Group"]
  },
  {
    name: "Finance",
    description: "Banques, assurances, services financiers, marchés financiers",
    threatLevel: 9,
    activeGroups: ["Lazarus Group", "Carbanak", "Conti", "LockBit"]
  },
  {
    name: "Santé",
    description: "Hôpitaux, cliniques, recherche médicale, assurance maladie",
    threatLevel: 8,
    activeGroups: ["APT41", "Conti", "LockBit"]
  },
  {
    name: "Énergie",
    description: "Pétrole et gaz, électricité, énergies renouvelables, services publics",
    threatLevel: 9,
    activeGroups: ["APT1", "Sandworm", "APT41"]
  },
  {
    name: "Technologie",
    description: "Entreprises technologiques, télécommunications, fournisseurs de services cloud",
    threatLevel: 9,
    activeGroups: ["APT1", "APT41", "Lazarus Group", "APT29"]
  },
  {
    name: "Défense",
    description: "Industrie de la défense, contractants militaires, aérospatiale",
    threatLevel: 10,
    activeGroups: ["APT1", "APT28", "APT29", "Lazarus Group"]
  },
  {
    name: "Industrie manufacturière",
    description: "Production industrielle, fabrication, chaînes d'approvisionnement",
    threatLevel: 8,
    activeGroups: ["APT1", "APT41", "LockBit"]
  }
];

/**
 * Fonction principale pour forcer l'initialisation des données
 */
async function forceInitData() {
  console.log('Démarrage du forçage d\'initialisation des données...');
  
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
    await Campaign.deleteMany({});
    await Technique.deleteMany({});
    await Malware.deleteMany({});
    await Region.deleteMany({});
    await Sector.deleteMany({});
    console.log('Données existantes supprimées avec succès');

    // Insérer les nouvelles données
    console.log('Insertion des groupes d\'attaque...');
    await AttackGroup.insertMany(attackGroupsData);
    console.log(`${attackGroupsData.length} groupes d'attaque insérés`);

    console.log('Insertion des techniques...');
    await Technique.insertMany(techniquesData);
    console.log(`${techniquesData.length} techniques insérées`);

    console.log('Insertion des campagnes...');
    await Campaign.insertMany(campaignsData);
    console.log(`${campaignsData.length} campagnes insérées`);

    console.log('Insertion des malwares...');
    await Malware.insertMany(malwaresData);
    console.log(`${malwaresData.length} malwares insérés`);

    console.log('Insertion des régions...');
    await Region.insertMany(regionsData);
    console.log(`${regionsData.length} régions insérées`);

    console.log('Insertion des secteurs...');
    await Sector.insertMany(sectorsData);
    console.log(`${sectorsData.length} secteurs insérés`);

    console.log('Initialisation forcée des données terminée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation forcée des données:', error);
    throw error;
  } finally {
    // Fermeture de la connexion à MongoDB
    await mongoose.connection.close();
    console.log('Connexion à MongoDB fermée');
  }
}

// Exécution du script si appelé directement
if (require.main === module) {
  forceInitData()
    .then(() => {
      console.log('Script d\'initialisation forcée terminé');
      process.exit(0);
    })
    .catch(error => {
      console.error('Erreur lors de l\'exécution du script:', error);
      process.exit(1);
    });
}

module.exports = { forceInitData };
