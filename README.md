![image](https://github.com/servais1983/cyberthreat-atlas/raw/main/frontend/src/assets/images/cyberthreat-atlas-logo.svg)

<h1 align="center">CyberThreat Atlas</h1>

<p align="center">
  <b>Une plateforme professionnelle de cartographie et d'analyse des menaces cyber mondiales</b>
</p>

<p align="center">
  <a href="#aperçu">Aperçu</a> •
  <a href="#fonctionnalités">Fonctionnalités</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#installation">Installation</a> •
  <a href="#utilisation">Utilisation</a> •
  <a href="#déploiement">Déploiement</a> •
  <a href="#api-documentation">API</a> •
  <a href="#technologies">Technologies</a> •
  <a href="#captures-décran">Captures d'écran</a> •
  <a href="#roadmap">Roadmap</a> •
  <a href="#licence">Licence</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version 1.0.0">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License MIT">
  <img src="https://img.shields.io/badge/node-v18+-green.svg" alt="Node v18+">
  <img src="https://img.shields.io/badge/react-v18.2.0-blue.svg" alt="React v18.2.0">
  <img src="https://img.shields.io/badge/express-v4.18.2-lightgrey.svg" alt="Express v4.18.2">
  <img src="https://img.shields.io/badge/mongodb-v8.0.0-green.svg" alt="MongoDB v8.0.0">
</p>

## Aperçu

CyberThreat Atlas est une solution de cybersécurité de pointe conçue pour surveiller, analyser et visualiser les menaces cyber à l'échelle mondiale. Cette plateforme permet aux professionnels de la sécurité informatique de suivre les groupes d'attaque (APTs), leurs techniques, les campagnes d'attaque et les tendances émergentes.

Développée pour les analystes SOC, chercheurs en sécurité et professionnels de la cybersécurité, elle offre une visualisation interactive des données de renseignement sur les menaces informatiques, permettant de mieux comprendre le paysage des menaces cyber et d'améliorer la posture de sécurité des organisations.

## Fonctionnalités

### 🌍 Visualisations Interactives
- **Carte mondiale des menaces** - Visualisation géographique des attaques en temps réel
- **Graphe de relations** - Exploration des liens entre acteurs, techniques et cibles
- **Timeline des campagnes** - Chronologie interactive des campagnes d'attaque

### 🔍 Système de Recherche Avancée
- Filtrage multi-critères (groupe, technique, région, sévérité, période...)
- Interface intuitive avec sélection de filtres en temps réel
- Recherche textuelle avec suggestions intelligentes

### 📊 Analyse Approfondie
- Profils détaillés des groupes d'attaque (APTs)
- Analyse des techniques selon le framework MITRE ATT&CK
- Statistiques et métriques sur les tendances des menaces

### 🔐 Système d'Authentification Robuste
- Gestion des utilisateurs avec différents niveaux d'accès
- Authentification sécurisée via JWT
- Protection des routes sensibles

### 🔄 Intégration et Veille
- Connexions avec des sources externes de renseignement
- Mise à jour automatique des données de menaces
- Système d'alerte pour les nouvelles campagnes

### 📱 Interface Responsive
- Expérience utilisateur optimisée sur tous les appareils
- Mode clair/sombre adaptable aux préférences
- Design moderne et professionnel

## Architecture

CyberThreat Atlas suit une architecture moderne client-serveur avec séparation claire des responsabilités :

### Backend (Node.js/Express + MongoDB)

```
backend/
├── src/
│   ├── config/        # Configuration de l'application
│   ├── controllers/   # Contrôleurs pour la logique métier
│   ├── database/      # Configuration et connexion à MongoDB
│   ├── middleware/    # Middlewares Express (auth, validation...)
│   ├── models/        # Modèles de données MongoDB
│   ├── routes/        # Définition des routes API
│   ├── services/      # Services métier et intégrations externes
│   ├── utils/         # Utilitaires divers
│   └── server.js      # Point d'entrée principal
├── .env.example       # Variables d'environnement (exemple)
└── package.json       # Dépendances et scripts
```

### Frontend (React)

```
frontend/
├── public/            # Fichiers statiques
├── src/
│   ├── assets/        # Images, icônes, ressources
│   ├── components/    # Composants réutilisables
│   │   ├── Auth/      # Composants d'authentification
│   │   ├── Filters/   # Système de filtrage
│   │   ├── Layout/    # Structure de l'interface
│   │   └── Visualizations/ # Composants de visualisation
│   ├── contexts/      # Contextes React (auth, thème...)
│   ├── pages/         # Pages de l'application
│   ├── services/      # Services et appels API
│   ├── utils/         # Fonctions utilitaires
│   ├── App.js         # Composant racine
│   └── index.js       # Point d'entrée
└── package.json       # Dépendances et scripts
```

## Installation

### Méthode Rapide (Recommandée)

Des scripts d'installation automatique sont fournis pour faciliter la mise en place :

#### Sur Linux/macOS :
```bash
# Cloner le dépôt
git clone https://github.com/servais1983/cyberthreat-atlas.git
cd cyberthreat-atlas

# Rendre le script exécutable
chmod +x install.sh

# Lancer l'installation
./install.sh
```

#### Sur Windows :
```powershell
# Cloner le dépôt
git clone https://github.com/servais1983/cyberthreat-atlas.git
cd cyberthreat-atlas

# Lancer l'installation
.\install.bat
```

Le script effectuera automatiquement :
- La vérification des prérequis (Node.js, MongoDB)
- L'installation des dépendances backend et frontend
- La création du fichier .env à partir du modèle
- Le démarrage optionnel de l'application

### Installation Manuelle

#### Prérequis
- Node.js (v18 ou supérieur)
- MongoDB (v5 ou supérieur)
- npm ou yarn

#### Installation du Backend
```bash
# Cloner le dépôt
git clone https://github.com/servais1983/cyberthreat-atlas.git
cd cyberthreat-atlas

# Installer les dépendances backend
cd backend
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Modifiez le fichier .env selon votre environnement

# Initialiser la base de données avec des données de démonstration (optionnel)
npm run seed

# Lancer le serveur de développement
npm run dev
```

#### Installation du Frontend
```bash
# Dans un nouveau terminal, depuis la racine du projet
cd frontend
npm install

# Lancer l'application React
npm start
```

L'application sera accessible à l'adresse [http://localhost:3000](http://localhost:3000).

## Utilisation

### Tableau de Bord Principal

Le tableau de bord principal offre trois visualisations principales accessibles via des onglets :

1. **Carte Mondiale des Menaces** - Visualisation géographique des attaques avec filtrage par sévérité, période et groupes d'attaque.

2. **Graphe de Relations** - Exploration interactive des liens entre groupes d'attaque, techniques et secteurs ciblés. Permet de découvrir les relations et modèles d'attaque.

3. **Timeline des Campagnes** - Chronologie des campagnes d'attaque permettant d'analyser les tendances temporelles et l'évolution des tactiques.

### Système de Filtrage

Le panneau de filtrage avancé permet de :

- Sélectionner un groupe d'attaque spécifique
- Filtrer par techniques d'attaque
- Sélectionner les secteurs et régions d'intérêt
- Définir une période temporelle
- Filtrer par niveau de sévérité et statut

Les filtres s'appliquent en temps réel sur toutes les visualisations.

### Détails des Entités

Chaque élément (groupe, campagne, technique) est cliquable pour accéder à une vue détaillée contenant :

- Informations complètes sur l'entité
- Historique et évolution
- Statistiques et métriques
- Documentation et références externes

### Authentification et Profil

L'application dispose d'un système complet d'authentification :

- Inscription et connexion
- Gestion du profil utilisateur
- Préférences personnalisées
- Historique de recherche et favoris

## Déploiement

### Préparation pour la Production

```bash
# Construire le frontend pour la production
cd frontend
npm run build

# Configurer le backend pour la production
cd ../backend
# Modifier .env pour l'environnement de production
# NODE_ENV=production
```

### Options de Déploiement

#### Docker Compose

Un fichier docker-compose.yml est fourni pour faciliter le déploiement :

```bash
# Depuis la racine du projet
docker-compose up -d
```

#### Déploiement Cloud

Instructions pour AWS :

1. Créer une instance EC2 ou un service ECS
2. Configurer MongoDB Atlas ou un service RDS
3. Déployer l'application avec le script fourni :

```bash
./scripts/deploy-aws.sh
```

#### Déploiement Manuel

1. Configurer un serveur avec Node.js et MongoDB
2. Configurer NGINX comme proxy inverse
3. Utiliser PM2 pour gérer les processus Node.js :

```bash
npm install -g pm2
cd backend
pm2 start src/server.js --name cyberthreat-atlas
```

## API Documentation

L'API REST est documentée avec Swagger et accessible à l'adresse `/api/docs` lorsque le serveur est en cours d'exécution.

### Points d'Entrée Principaux

| Méthode | Point d'entrée | Description |
|---------|---------------|-------------|
| GET | `/api/v1/attack-groups` | Liste des groupes d'attaque |
| GET | `/api/v1/attack-groups/:id` | Détails d'un groupe d'attaque |
| GET | `/api/v1/campaigns` | Liste des campagnes |
| GET | `/api/v1/campaigns/timeline` | Données pour la timeline |
| POST | `/api/v1/campaigns/search` | Recherche avancée de campagnes |
| GET | `/api/v1/techniques` | Liste des techniques d'attaque |
| POST | `/api/v1/auth/register` | Inscription d'un utilisateur |
| POST | `/api/v1/auth/login` | Connexion utilisateur |

Pour une documentation complète de l'API, consultez la documentation Swagger intégrée.

## Technologies

### Backend
- **Node.js & Express** - Serveur API RESTful
- **MongoDB & Mongoose** - Base de données et ODM
- **JWT** - Authentification par token
- **Joi** - Validation des données
- **Winston** - Journalisation
- **Node-cron** - Tâches planifiées

### Frontend
- **React** - Bibliothèque UI
- **React Router** - Navigation
- **Axios** - Client HTTP
- **D3.js** - Visualisations de données avancées
- **Leaflet** - Cartographie interactive
- **Recharts** - Graphiques et diagrammes
- **date-fns** - Manipulation de dates

### DevOps & Qualité
- **ESLint & Prettier** - Qualité du code
- **Jest** - Tests unitaires
- **Supertest** - Tests d'API
- **Docker** - Conteneurisation
- **GitHub Actions** - CI/CD

## Captures d'Écran

<p align="center">
  <img src="https://raw.githubusercontent.com/servais1983/cyberthreat-atlas/main/docs/screenshots/dashboard-map.png" alt="Dashboard Map" width="800"/>
  <em>Carte mondiale des menaces</em>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/servais1983/cyberthreat-atlas/main/docs/screenshots/relationship-graph.png" alt="Relationship Graph" width="800"/>
  <em>Graphe de relations entre acteurs et techniques</em>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/servais1983/cyberthreat-atlas/main/docs/screenshots/campaign-timeline.png" alt="Campaign Timeline" width="800"/>
  <em>Timeline des campagnes d'attaque</em>
</p>

## Résolution de Problèmes Courants

### Problème d'installation des paquets NPM
Si vous rencontrez des erreurs lors de l'installation des dépendances, assurez-vous que votre version de Node.js est compatible (v18+) et essayez ces commandes :

```bash
# Nettoyer le cache npm
npm cache clean --force

# Essayer à nouveau l'installation
npm install
```

### Erreur de connexion MongoDB
Si MongoDB ne se connecte pas :
1. Vérifiez que MongoDB est en cours d'exécution sur votre système
2. Vérifiez l'URL de connexion dans le fichier `.env`
3. Assurez-vous qu'aucun pare-feu ne bloque le port de MongoDB

### Erreurs au démarrage du frontend
Si le frontend ne démarre pas correctement :
1. Vérifiez que le backend est en cours d'exécution
2. Assurez-vous que la configuration proxy dans `frontend/package.json` correspond au port du backend
3. Essayez avec une installation propre : `rm -rf node_modules && npm install`

## Roadmap

### Version 1.1 (Q2 2025)
- Intégration avec plus de sources de renseignement externes
- Amélioration des algorithmes de corrélation
- Support des IOCs plus détaillés

### Version 1.2 (Q3 2025)
- Système d'alertes en temps réel
- Tableau de bord personnalisable
- Export PDF des rapports d'analyse

### Version 2.0 (Q1 2026)
- Analyse prédictive des menaces
- Module de simulation d'attaque
- API publique pour l'intégration avec d'autres outils

## Licence

Ce projet est distribué sous licence MIT. Voir le fichier `LICENSE` pour plus d'informations.

---

<p align="center">
  Développé avec ❤️ par l'équipe CyberThreat Atlas
</p>

<p align="center">
  <a href="https://github.com/servais1983/cyberthreat-atlas/issues">Signaler un problème</a> •
  <a href="https://github.com/servais1983/cyberthreat-atlas/discussions">Discussions</a> •
  <a href="mailto:contact@cyberthreat-atlas.com">Contact</a>
</p>