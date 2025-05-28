# CyberThreat Atlas

![image](https://github.com/user-attachments/files/13993003/cyberthreat-atlas-logo.png)

## À propos

CyberThreat Atlas est une application professionnelle de visualisation et d'analyse des menaces cyber. Elle fournit une base de données complète et exhaustive sur les groupes d'attaque (APT), les techniques, les campagnes, les malwares et les secteurs ciblés.

L'application est conçue pour les professionnels de la cybersécurité qui ont besoin d'accéder rapidement à des informations détaillées sur les menaces actuelles.

## Fonctionnalités

- **Base de données complète** : Plus de 170 groupes APT, 200+ techniques MITRE ATT&CK, et tous les malwares documentés
- **Mise à jour automatique** : Les données sont automatiquement mises à jour à chaque démarrage de l'application
- **Visualisation interactive** : Carte des menaces, graphiques et tableaux pour analyser les données
- **Recherche avancée** : Filtrage par région, secteur, groupe, technique, etc.
- **API RESTful** : Accès programmatique à toutes les données

## Architecture

L'application est composée de :

- **Frontend** : Interface utilisateur React.js
- **Backend** : API Node.js/Express
- **Base de données** : MongoDB

## Installation

### Prérequis

- Docker et Docker Compose
- Git

### Installation avec Docker

1. Clonez le dépôt :
```bash
git clone https://github.com/servais1983/cyberthreat-atlas.git
cd cyberthreat-atlas
```

2. Lancez l'application avec Docker Compose :
```bash
docker-compose up -d
```

3. Accédez à l'application :
   - Frontend : http://localhost:3001
   - Backend API : http://localhost:5000

## Initialisation de la base de données

Pour initialiser la base de données avec toutes les données de threat intelligence :

```bash
# Installez les dépendances nécessaires
docker-compose exec backend npm install axios

# Exécutez le script d'importation exhaustive
docker-compose exec backend node src/scripts/completeAttackDataImporter.js

# Vérifiez que la base est bien peuplée
docker-compose exec backend node src/diagnoseDatabaseContent.js
```

Ce script va télécharger et formater automatiquement :
- TOUS les groupes APT connus (170+)
- TOUTES les techniques MITRE ATT&CK (200+)
- TOUS les malwares documentés
- Des campagnes générées automatiquement basées sur les relations entre groupes et malwares

## Dépannage

Si vous rencontrez des problèmes avec l'initialisation de la base de données, vous pouvez utiliser le script de secours :

```bash
# Exécutez le script de secours pour injecter un ensemble minimal de données
docker-compose exec backend node src/fix.js
```

Si la base de données reste vide après l'initialisation, vérifiez les points suivants :

1. Vérifiez que MongoDB est accessible depuis le backend :
```bash
docker-compose exec backend ping -c 3 mongodb
```

2. Vérifiez la configuration MongoDB dans le fichier de configuration :
```bash
docker-compose exec backend cat src/config/index.js
```

3. Si nécessaire, reconstruisez les conteneurs sans cache :
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Mise à jour des données

Les données sont automatiquement mises à jour à chaque démarrage de l'application. Pour forcer une mise à jour :

```bash
# Redémarrez le backend
docker-compose restart backend
```

## Documentation technique

Pour plus d'informations sur le fonctionnement de l'application, consultez les documents techniques dans le dossier `docs/` :

- [Système de mise à jour automatique](docs/mise_a_jour_automatique.md)
- [Intégration des données MITRE](docs/integration_donnees_mitre.md)

## Licence

Ce projet est sous licence MIT.
