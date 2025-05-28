![image](https://github.com/user-attachments/files/14676359/cyberthreat-atlas-logo.png)

# CyberThreat Atlas

Une plateforme professionnelle complète de visualisation et d'analyse des menaces cyber, permettant de suivre les groupes d'attaque, les campagnes, les techniques et les indicateurs de compromission. Les données sont automatiquement mises à jour à chaque démarrage de l'application à partir de sources fiables de threat intelligence.

## 🔍 Fonctionnalités

- **🌐 Cartographie des menaces** - Visualisation géographique des activités malveillantes
- **👥 Profils de groupes d'attaque** - Informations détaillées sur tous les APTs connus
- **⏱️ Timeline des campagnes** - Chronologie interactive des campagnes d'attaque
- **🔗 Analyse des relations** - Visualisation des liens entre acteurs, techniques et campagnes
- **📊 Tableaux de bord** - Statistiques et métriques sur les menaces actuelles
- **🔍 Recherche avancée** - Filtrage multicritères des données de menaces
- **🔄 Base de données exhaustive** - Intégration de toutes les données MITRE ATT&CK
- **📱 Interface responsive** - Expérience optimisée sur tous les appareils

## 🛠️ Technologies

- **React** - Interface utilisateur
- **Node.js/Express** - Backend API
- **MongoDB** - Base de données
- **JWT** - Authentification
- **Leaflet** - Cartographie interactive
- **D3.js** - Visualisations de données
- **Jest** - Tests d'API
- **Docker** - Conteneurisation
- **GitHub Actions** - CI/CD

## 📦 Installation

### 📋 Prérequis

- Git
- Docker et Docker Compose

### 🚀 Installation avec Docker Compose (Recommandée)

Pour éviter tout problème de corruption de fichiers ou de synchronisation, suivez strictement ces étapes :

```bash
# 1. Créez un nouveau dossier vide
mkdir cyberthreat-atlas-new
cd cyberthreat-atlas-new

# 2. Clonez le dépôt (version propre et corrigée)
git clone https://github.com/servais1983/cyberthreat-atlas.git .

# 3. Construisez et démarrez les conteneurs sans utiliser de cache
docker-compose build --no-cache
docker-compose up -d
```

L'application sera accessible à :
- Frontend : http://localhost:3001
- Backend API : http://localhost:5000
- API Documentation : http://localhost:5000/api-docs

### 🔄 Mise à jour de l'application

Pour mettre à jour votre installation locale avec les dernières améliorations :

```bash
# 1. Arrêtez les conteneurs
docker-compose down

# 2. Récupérez les dernières modifications
git pull

# 3. Reconstruisez les images sans cache
docker-compose build --no-cache

# 4. Redémarrez les conteneurs
docker-compose up -d
```

### 🔄 Base de données exhaustive et professionnelle

L'application est configurée pour intégrer automatiquement une base de données exhaustive et professionnelle à chaque démarrage du backend. Cette intégration inclut :

- **Tous les groupes APT connus** - Collectés depuis le référentiel officiel MITRE ATT&CK
- **Toutes les techniques MITRE ATT&CK** - Framework complet de tactiques et techniques
- **Tous les malwares documentés** - Avec leurs caractéristiques et relations
- **Campagnes majeures** - Historique des attaques significatives
- **Régions et secteurs** - Cartographie complète des cibles

### 🛠️ Dépannage de la base de données

Si vous constatez que la base de données est vide après le démarrage (ce qui peut arriver si l'intégration automatique échoue), utilisez le script de secours `fix.js` :

```bash
# Exécuter le script de secours pour initialiser la base avec des données professionnelles
docker-compose exec backend node src/fix.js
```

Ce script injecte directement un ensemble de données professionnelles dans MongoDB :
- Groupes d'attaque (APT28, APT29, Lazarus Group)
- Techniques MITRE ATT&CK
- Campagnes majeures (SolarWinds, NotPetya)
- Malwares, régions et secteurs

Pour enrichir davantage ce script avec vos propres données :
1. Modifiez le fichier `backend/src/fix.js`
2. Ajoutez de nouveaux objets dans les tableaux correspondants (attackGroups, techniques, etc.)
3. Exécutez à nouveau le script pour mettre à jour la base

### 🔍 Vérification de la base de données

Pour vérifier que la base de données a été correctement peuplée, exécutez le script de diagnostic :

```bash
docker-compose exec backend node src/diagnoseDatabaseContent.js
```

Ce script affichera le nombre d'entrées dans chaque collection et des exemples de données, vous permettant de confirmer que l'application n'est plus une simple démo mais une solution professionnelle complète.

### 🔧 Résolution des problèmes d'intégration automatique

Si vous souhaitez bénéficier de l'intégration automatique complète des données MITRE ATT&CK, vous devrez peut-être installer des dépendances supplémentaires dans le conteneur backend :

```bash
# Accéder au conteneur backend
docker-compose exec backend bash

# Installer les dépendances nécessaires
npm install axios stix2
```

### 🐳 Commandes Docker Utiles

```bash
# Voir tous les logs
docker-compose logs -f

# Logs du backend uniquement
docker-compose logs -f backend

# Arrêter les conteneurs
docker-compose down

# Nettoyage complet (recommandé en cas de problème)
docker-compose down
docker system prune -af --volumes
docker volume prune -f
docker builder prune -af
```

### 🔧 Points d'API Importants

L'API REST est documentée avec Swagger et accessible à l'adresse `/api-docs` lorsque le serveur backend est en cours d'exécution.

| Méthode | Point d'entrée | Description |
|---------|---------------|-------------|
| GET | `/api/v1/health` | Vérification de l'état de santé de l'API |
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

**Base de données vide ou incomplète:**
- Vérifiez les logs du backend pour identifier les erreurs : `docker-compose logs -f backend`
- Exécutez le script de secours pour initialiser la base : `docker-compose exec backend node src/fix.js`
- Vérifiez que l'initialisation a fonctionné : `docker-compose exec backend node src/diagnoseDatabaseContent.js`

**Erreur de connexion MongoDB:**
- Vérifiez que MongoDB est correctement configuré dans le conteneur
- Vérifiez les logs avec `docker-compose logs -f mongo`

**Port déjà utilisé:**
- Changez les ports dans le fichier `docker-compose.yml`
- Arrêtez les services qui utilisent les ports 3001 ou 5000

**Erreur Docker:**
- Vérifiez que Docker Desktop est démarré
- Nettoyez complètement Docker avec les commandes suivantes :
  ```bash
  docker-compose down
  docker system prune -af --volumes
  docker volume prune -f
  docker builder prune -af
  ```
- Reconstruisez sans cache : `docker-compose build --no-cache`

**Conteneur backend unhealthy:**
- Vérifiez les logs du backend avec `docker-compose logs -f backend`
- Assurez-vous que MongoDB est correctement démarré et accessible
- Si le problème persiste, essayez de cloner à nouveau le dépôt dans un dossier vide

## 🚀 Guide de Démarrage Rapide

1. **🔐 Connexion** - Utilisez les identifiants par défaut (admin/admin123) ou créez un nouveau compte
2. **📊 Dashboard** - Visualisez les menaces actives et les statistiques globales
3. **🗺️ Carte des Menaces** - Explorez la carte interactive avec différents modes d'affichage
4. **👥 Groupes d'Attaque** - Consultez les profils détaillés des acteurs malveillants
5. **⏰ Timeline** - Analysez la chronologie des campagnes d'attaque
6. **📄 Rapports** - Générez des rapports personnalisés sur les menaces

## 📖 Documentation

La documentation complète est disponible dans le dossier `docs/` :
- 📋 [Conception détaillée](docs/conception_atlas_cybermenaces.md) - Architecture et design du projet
- ✅ [Validation professionnelle](docs/validation_professionnelle.md) - Conformité aux standards professionnels
- 🔄 [Intégration des données MITRE](docs/integration_donnees_mitre.md) - Détails sur le système d'intégration des données

## ❓ FAQ et Support

### 💬 Questions Fréquentes

**Q: Comment initialiser rapidement la base de données avec des données professionnelles ?**  
R: Exécutez le script de secours avec la commande `docker-compose exec backend node src/fix.js`, puis vérifiez avec `docker-compose exec backend node src/diagnoseDatabaseContent.js`.

**Q: Comment ajouter mes propres données de threat intelligence ?**  
R: Modifiez le fichier `backend/src/fix.js` pour ajouter vos propres groupes, techniques ou campagnes, puis exécutez-le à nouveau.

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
