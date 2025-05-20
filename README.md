# CyberThreat Atlas

Un outil visuel et dynamique pour recenser les techniques et campagnes d'attaques cyber mondiales.

## Objectifs du projet

CyberThreat Atlas est une application web conçue pour fournir une vue complète et interactive des menaces cyber à l'échelle mondiale. Elle permet aux analystes SOC, chercheurs en sécurité et professionnels de la cybersécurité de :

- **Référencer dynamiquement** toutes les techniques et campagnes d'attaque connues
- **Rechercher et filtrer** les menaces par pays, groupe, type d'attaque, période et sévérité
- **Visualiser les données** sous forme de cartes, graphiques de lien, timelines et tableaux interactifs
- **Accéder à des sources fiables** via des liens vers MITRE ATT&CK, Mandiant, CrowdStrike, etc.

## Fonctionnalités principales

- 🔍 Système de recherche avancée multi-critères
- 🌐 Cartographie mondiale des attaques 
- 📊 Visualisations interactives des relations entre groupes, techniques et cibles
- 📈 Timeline des campagnes d'attaque
- 🔄 Veille automatisée des nouvelles menaces
- 📱 Interface responsive et professionnelle

## Architecture technique

- **Frontend** : React.js avec TypeScript
- **Backend** : Node.js/Express
- **Base de données** : MongoDB
- **APIs** : Intégration avec MITRE ATT&CK, VirusTotal, Shodan, etc.
- **Visualisations** : D3.js, Leaflet, React-vis

## Structure du projet

Le projet est organisé en deux parties principales :

### Backend (Node.js/Express + MongoDB)

Nous avons mis en place :
* Une structure de base de données MongoDB avec des modèles pour :
   * Groupes d'attaque (APTs)
   * Techniques d'attaque (basées sur MITRE ATT&CK)
   * Campagnes d'attaque
   * Malwares et outils
   * Indicateurs de compromission (IOCs)
   * Secteurs d'activité ciblés
   * Régions géographiques
* Une configuration pour la connexion à la base de données
* Un serveur Express avec middleware de sécurité
* Un système de configuration centralisé

### Frontend (React)

Le frontend comprend :
* Une structure de base avec React Router
* Un système de thème (mode clair/sombre)
* Des composants de mise en page (Header, Sidebar, Footer)
* Des composants prévus pour les visualisations interactives :
   * Carte du monde des menaces
   * Graphe de relations
   * Timeline des attaques
* Un système de filtrage avancé pour la recherche

## Prochaines étapes

Pour finaliser le développement du projet CyberThreat Atlas, les tâches suivantes doivent être réalisées :

### 1. Développement Backend

- **Implémentation des routes API REST :**
  - Créer les contrôleurs pour chaque modèle (AttackGroup, Campaign, Indicator, etc.)
  - Développer les routes CRUD complètes (GET, POST, PUT, DELETE)
  - Implémenter des endpoints de recherche avancée avec filtrage multicritères
  - Ajouter des validations de données avec Joi ou express-validator

- **Système d'authentification et d'autorisation :**
  - Mettre en place JWT pour l'authentification
  - Créer des middlewares de contrôle d'accès
  - Définir différents niveaux d'utilisateurs (admin, analyste, lecteur)
  - Implémenter la gestion des sessions

- **Intégration des APIs externes :**
  - Développer des connecteurs pour MITRE ATT&CK Framework
  - Intégrer des APIs de renseignement sur les menaces (VirusTotal, AlienVault OTX, etc.)
  - Créer un système de synchronisation périodique des données externes

### 2. Développement Frontend

- **Composants de visualisation :**
  - Développer la carte mondiale des menaces avec Leaflet ou D3.js
  - Créer le graphe de relations entre acteurs/techniques/cibles
  - Implémenter la timeline interactive des campagnes d'attaque
  - Concevoir des tableaux de bord analytiques avec filtres dynamiques

- **Pages et fonctionnalités utilisateur :**
  - Créer les pages de détail pour chaque entité (groupe, campagne, etc.)
  - Développer un système de favoris/surveillance
  - Implémenter la gestion des profils utilisateurs
  - Ajouter des fonctionnalités d'export (PDF, CSV, JSON)

- **Améliorations UX/UI :**
  - Optimiser les performances des visualisations avec des rendus conditionnels
  - Améliorer l'accessibilité de l'interface
  - Implémenter des animations et transitions fluides
  - Assurer la compatibilité mobile (responsive design)

### 3. Tests et Assurance Qualité

- **Tests automatisés :**
  - Développer des tests unitaires pour le backend (Jest)
  - Créer des tests d'intégration pour l'API (Supertest)
  - Implémenter des tests end-to-end (Cypress ou Playwright)
  - Mettre en place des tests de performance (k6 ou JMeter)

- **CI/CD :**
  - Configurer un pipeline d'intégration continue avec GitHub Actions
  - Mettre en place des environnements de test, staging et production
  - Automatiser les déploiements avec vérifications de qualité

### 4. Système de veille automatique

- **Collecteurs de données :**
  - Développer des crawlers pour les sources d'information de sécurité
  - Créer des connecteurs RSS pour les flux d'actualités cybersécurité
  - Implémenter un système de parsing pour extraire les IOCs des rapports
  
- **Analyse et enrichissement :**
  - Mettre en place des algorithmes de classification des menaces
  - Développer des fonctionnalités de corrélation entre différentes sources
  - Créer un système d'alertes basé sur des seuils configurables

### 5. Documentation et Déploiement

- **Documentation :**
  - Rédiger une documentation technique complète du projet
  - Créer des guides utilisateurs avec captures d'écran
  - Documenter les APIs pour faciliter l'intégration avec d'autres outils

- **Déploiement :**
  - Configurer l'infrastructure cloud (AWS, Azure ou GCP)
  - Mettre en place des conteneurs Docker pour faciliter le déploiement
  - Implémenter un système de monitoring et de logging

## Installation et déploiement

_Instructions détaillées à venir_

## Licence

MIT