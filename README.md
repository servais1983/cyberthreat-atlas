# CyberThreat Atlas

Un atlas professionnel des cybermenaces pour les analystes en sécurité, offrant une visualisation avancée et une analyse des menaces cyber à l'échelle mondiale.

## Fonctionnalités Principales

### Cartographie Interactive
- Visualisation mondiale des menaces avec géolocalisation précise
- Représentation des flux d'attaques (origine → destination)
- Filtrage par type de menace, secteur, intensité
- Modes de visualisation multiples (marqueurs, carte de chaleur, flux)

### Analyse des Acteurs Malveillants
- Profils détaillés des groupes d'attaque
- Techniques et tactiques utilisées (MITRE ATT&CK)
- Historique des campagnes et évolution des méthodes
- Graphe de relations entre acteurs et techniques

### Timeline des Campagnes
- Chronologie interactive des campagnes d'attaque
- Corrélation temporelle entre événements
- Filtrage par période et type d'événement
- Analyse des tendances et patterns

### Dashboards Analytiques
- Métriques clés et indicateurs de sécurité
- Visualisations synthétiques (graphiques, jauges, compteurs)
- Personnalisation des vues selon les besoins utilisateur
- Export des rapports en PDF/CSV

## Architecture

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

## Installation

### Prérequis
- Node.js (v18+)
- MongoDB (v5+)
- Docker et Docker Compose (optionnel)

### Installation Locale

1. Cloner le dépôt
```bash
git clone https://github.com/servais1983/cyberthreat-atlas.git
cd cyberthreat-atlas
```

2. Installer les dépendances
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Configurer l'environnement
```bash
# Copier et éditer le fichier d'environnement
cd ../backend
cp .env.example .env
# Éditer le fichier .env avec vos paramètres
```

4. Démarrer l'application
```bash
# Démarrer le backend
cd backend
npm start

# Dans un autre terminal, démarrer le frontend
cd frontend
npm start
```

### Déploiement avec Docker

Un fichier docker-compose.yml est fourni pour faciliter le déploiement :
```bash
# Depuis la racine du projet
docker-compose up -d
```

## Documentation

La documentation complète est disponible dans le dossier `docs/` :

- [Conception détaillée](docs/conception_atlas_cybermenaces.md)
- [Validation professionnelle](docs/validation_professionnelle.md)
- [Guide d'utilisation](docs/guide_utilisation.md)
- [API Reference](docs/api_reference.md)

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

## Captures d'Écran

<p align="center">
  <img src="docs/screenshots/dashboard-map.png" alt="Dashboard Map" width="800"/>
  <em>Carte mondiale des menaces</em>
</p>

<p align="center">
  <img src="docs/screenshots/relationship-graph.png" alt="Relationship Graph" width="800"/>
  <em>Graphe de relations entre acteurs et techniques</em>
</p>

<p align="center">
  <img src="docs/screenshots/campaign-timeline.png" alt="Campaign Timeline" width="800"/>
  <em>Timeline des campagnes d'attaque</em>
</p>

## Licence

Ce projet est distribué sous licence MIT. Voir le fichier `LICENSE` pour plus d'informations.

---

<p align="center">
  Développé avec ❤️ par l'équipe CyberThreat Atlas
</p>
