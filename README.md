![image](https://github.com/user-attachments/assets/6f9948e3-ac11-4a52-a940-d8408bdf7ac1)

<!-- Badges professionnels -->
<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/threat-intelligence-red.svg" alt="Threat Intelligence">
  <img src="https://img.shields.io/badge/platform-web%20%7C%20docker-lightgrey.svg" alt="Platform">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/MITRE-ATT%26CK%20Framework-orange.svg" alt="MITRE ATT&CK">
  <img src="https://img.shields.io/badge/Node.js-18%2B-brightgreen.svg" alt="Node.js">
  <img src="https://img.shields.io/badge/React-18-blue.svg" alt="React">
  <img src="https://img.shields.io/badge/MongoDB-5%2B-green.svg" alt="MongoDB">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/OSINT-enabled-blueviolet.svg" alt="OSINT">
  <img src="https://img.shields.io/badge/geolocation-mapping-success.svg" alt="Geolocation">
  <img src="https://img.shields.io/badge/real--time-analysis-critical.svg" alt="Real-time">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/maintained-yes-green.svg" alt="Maintenance">
  <img src="https://img.shields.io/badge/last%20update-mai%202025-brightgreen.svg" alt="Last Update">
  <img src="https://img.shields.io/badge/contributors-welcome-brightgreen.svg" alt="Contributors">
  <img src="https://img.shields.io/badge/docs-comprehensive-blue.svg" alt="Documentation">
</p>

# 🛡️ CyberThreat Atlas

Un atlas professionnel des cybermenaces pour les analystes en sécurité, offrant une visualisation avancée et une analyse des menaces cyber à l'échelle mondiale.

## ⚡ Fonctionnalités Principales

### 🗺️ Cartographie Interactive
- 🌍 Visualisation mondiale des menaces avec géolocalisation précise
- 🔄 Représentation des flux d'attaques (origine → destination)
- 🔍 Filtrage par type de menace, secteur, intensité
- 📊 Modes de visualisation multiples (marqueurs, carte de chaleur, flux)

### 🎯 Analyse des Acteurs Malveillants
- 👥 Profils détaillés des groupes d'attaque
- 🛠️ Techniques et tactiques utilisées (MITRE ATT&CK)
- 📜 Historique des campagnes et évolution des méthodes
- 🕸️ Graphe de relations entre acteurs et techniques

### ⏰ Timeline des Campagnes
- 📅 Chronologie interactive des campagnes d'attaque
- 🔗 Corrélation temporelle entre événements
- 🎛️ Filtrage par période et type d'événement
- 📈 Analyse des tendances et patterns

### 📊 Dashboards Analytiques
- 📋 Métriques clés et indicateurs de sécurité
- 📈 Visualisations synthétiques (graphiques, jauges, compteurs)
- ⚙️ Personnalisation des vues selon les besoins utilisateur
- 📄 Export des rapports en PDF/CSV

## 🏗️ Architecture

### 🔧 Backend
- **Node.js & Express** - Serveur API RESTful
- **MongoDB & Mongoose** - Base de données et ODM
- **JWT** - Authentification par token
- **Joi** - Validation des données
- **Winston** - Journalisation
- **Node-cron** - Tâches planifiées

### 🎨 Frontend
- **React** - Bibliothèque UI
- **React Router** - Navigation
- **Axios** - Client HTTP
- **D3.js** - Visualisations de données avancées
- **Leaflet** - Cartographie interactive
- **Recharts** - Graphiques et diagrammes
- **date-fns** - Manipulation de dates

### 🚀 DevOps & Qualité
- **ESLint & Prettier** - Qualité du code
- **Jest** - Tests unitaires
- **Supertest** - Tests d'API
- **Docker** - Conteneurisation
- **GitHub Actions** - CI/CD

## 📦 Installation

### 📋 Prérequis
- Node.js (v18+)
- MongoDB (v5+)
- Git
- Docker et Docker Compose (optionnel)

### 🚀 Installation Rapide (Windows & Linux)

#### Option 1: Installation Automatique

**Windows:**
```bash
# Cloner le dépôt
git clone https://github.com/servais1983/cyberthreat-atlas.git
cd cyberthreat-atlas

# Lancer l'installation automatique
install.bat
```

**Linux/macOS:**
```bash
# Cloner le dépôt
git clone https://github.com/servais1983/cyberthreat-atlas.git
cd cyberthreat-atlas

# Rendre le script exécutable et lancer l'installation
chmod +x install.sh
./install.sh
```

#### Option 2: Installation avec Docker Compose

```bash
# Cloner le dépôt
git clone https://github.com/servais1983/cyberthreat-atlas.git
cd cyberthreat-atlas

# Lancer avec Docker Compose
docker-compose up -d
```

L'application sera accessible à :
- Frontend : http://localhost:3000
- Backend API : http://localhost:5000

### 💻 Installation Manuelle

1. **📥 Cloner le dépôt**
```bash
git clone https://github.com/servais1983/cyberthreat-atlas.git
cd cyberthreat-atlas
```

2. **📚 Installer les dépendances Backend**
```bash
cd backend
npm install
```

3. **⚙️ Configurer l'environnement Backend**
```bash
# Créer le fichier .env
cp .env.example .env

# Éditer le fichier .env avec vos paramètres
# Exemple de configuration :
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/cyberthreat-atlas
# JWT_SECRET=votre_secret_jwt_securise
```

4. **📚 Installer les dépendances Frontend**
```bash
cd ../frontend
npm install
```

5. **🚀 Démarrer l'application**

**Méthode 1 - Terminaux séparés:**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

**Méthode 2 - Concurrently (recommandé):**
```bash
# Depuis la racine du projet, après avoir installé concurrently
npm install -g concurrently

# Démarrer les deux services
cd backend
npm run dev
```

### 🐳 Déploiement avec Docker

1. **Build et démarrage des conteneurs**
```bash
# Depuis la racine du projet
docker-compose build
docker-compose up -d
```

2. **Vérifier les logs**
```bash
# Voir tous les logs
docker-compose logs -f

# Logs du backend uniquement
docker-compose logs -f backend

# Logs du frontend uniquement
docker-compose logs -f frontend
```

3. **Arrêter les conteneurs**
```bash
docker-compose down

# Pour supprimer aussi les volumes (base de données)
docker-compose down -v
```

### 🔧 Scripts NPM Disponibles

**Backend (`backend/package.json`):**
- `npm start` - Démarre le serveur en production
- `npm run dev` - Démarre le serveur en développement avec nodemon
- `npm run test` - Lance les tests
- `npm run seed` - Initialise la base de données avec des données de démonstration

**Frontend (`frontend/package.json`):**
- `npm start` - Démarre l'application React en développement
- `npm run build` - Construit l'application pour la production
- `npm run test` - Lance les tests
- `npm run eject` - Éjecte la configuration Create React App (attention : irréversible)

## 📖 Documentation

La documentation complète est disponible dans le dossier `docs/` :

- 📋 [Conception détaillée](docs/conception_atlas_cybermenaces.md) - Architecture et design du projet
- ✅ [Validation professionnelle](docs/validation_professionnelle.md) - Conformité aux standards professionnels

## 🔌 API Documentation

L'API REST est documentée avec Swagger et accessible à l'adresse `/api-docs` lorsque le serveur backend est en cours d'exécution.

### 📡 Points d'Entrée Principaux
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

## 🐛 Dépannage

### Problèmes Courants

**Erreur de connexion MongoDB:**
- Vérifiez que MongoDB est installé et démarré
- Vérifiez l'URL de connexion dans le fichier `.env`

**Port déjà utilisé:**
- Changez les ports dans les fichiers `.env` ou `docker-compose.yml`
- Arrêtez les services qui utilisent les ports 3000 ou 5000

**Erreur npm install:**
- Supprimez `node_modules` et `package-lock.json`, puis réessayez
- Assurez-vous d'utiliser Node.js v18+

**Erreur Docker:**
- Vérifiez que Docker Desktop est démarré
- Nettoyez les images : `docker system prune -a`

## 🚀 Guide de Démarrage Rapide

1. **🔐 Connexion** - Utilisez les identifiants par défaut (admin/admin123) ou créez un nouveau compte
2. **📊 Dashboard** - Visualisez les menaces actives et les statistiques globales
3. **🗺️ Carte des Menaces** - Explorez la carte interactive avec différents modes d'affichage
4. **👥 Groupes d'Attaque** - Consultez les profils détaillés des acteurs malveillants
5. **⏰ Timeline** - Analysez la chronologie des campagnes d'attaque
6. **📄 Rapports** - Générez des rapports personnalisés sur les menaces

## ❓ FAQ et Support

### 💬 Questions Fréquentes

**Q: Comment ajouter de nouvelles données de menaces ?**  
R: Utilisez l'interface d'administration accessible via le menu "Admin" ou importez des données via l'API.

**Q: L'application fonctionne-t-elle hors ligne ?**  
R: Une fois les données chargées, la plupart des fonctionnalités sont disponibles hors ligne, mais les mises à jour en temps réel nécessitent une connexion.

**Q: Comment personnaliser les filtres de la carte ?**  
R: Utilisez le panneau de filtres à gauche de la carte pour sélectionner les critères (sévérité, type, période, etc.).

### 🆘 Support

Pour toute question ou assistance technique :
- 🐛 Ouvrez une issue sur GitHub
- 📖 Consultez la documentation détaillée dans le dossier `docs/`
- 📧 Contactez l'équipe de développement via l'adresse indiquée dans le profil GitHub

## 📄 Licence

Ce projet est distribué sous licence MIT. Voir le fichier `LICENSE` pour plus d'informations.

---

<p align="center">
  Développé avec ❤️ par l'équipe CyberThreat Atlas
</p>
