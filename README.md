![image](https://github.com/user-attachments/files/14671075/cyberthreat-atlas-logo.png)

# 🌐 CyberThreat Atlas

Une plateforme complète de cartographie et d'analyse des menaces cyber mondiales, permettant de visualiser, suivre et comprendre les acteurs malveillants, leurs techniques et leurs campagnes d'attaque.

## 🔍 Fonctionnalités

- **🗺️ Carte Interactive** - Visualisation géographique des menaces et attaques
- **👥 Profils d'Acteurs** - Base de données détaillée des groupes APT et acteurs malveillants
- **⚔️ Techniques & Tactiques** - Mapping avec le framework MITRE ATT&CK
- **⏱️ Timeline** - Chronologie interactive des campagnes d'attaque
- **📊 Tableaux de Bord** - Statistiques et métriques sur les menaces actuelles
- **🔍 Recherche Avancée** - Filtrage multicritères des données de menaces
- **📱 Responsive Design** - Interface adaptée à tous les appareils

## 🛠️ Technologies

- **React** - Frontend
- **Node.js & Express** - Backend API
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
- Frontend : http://localhost:3000
- Backend API : http://localhost:5000
- API Documentation : http://localhost:5000/api-docs

### 🐳 Commandes Docker Utiles

```bash
# Voir tous les logs
docker-compose logs -f

# Logs du backend uniquement
docker-compose logs -f backend

# Logs du frontend uniquement
docker-compose logs -f frontend

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

**Erreur de connexion MongoDB:**
- Vérifiez que MongoDB est correctement configuré dans le conteneur
- Vérifiez les logs avec `docker-compose logs -f mongo`

**Port déjà utilisé:**
- Changez les ports dans le fichier `docker-compose.yml`
- Arrêtez les services qui utilisent les ports 3000 ou 5000

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
