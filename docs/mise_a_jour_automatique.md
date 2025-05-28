# Système de Mise à Jour Automatique des Données

Ce document détaille le fonctionnement du système de mise à jour automatique des données de threat intelligence dans l'application CyberThreat Atlas.

## Vue d'ensemble

L'application CyberThreat Atlas est configurée pour mettre à jour automatiquement sa base de données avec les dernières informations sur les menaces cyber. Cette mise à jour s'effectue **à chaque démarrage de l'application** ainsi que périodiquement toutes les 6 heures.

## Sources de données

Le système de mise à jour automatique collecte des données à partir de plusieurs sources fiables de threat intelligence :

1. **MITRE ATT&CK** - Framework de référence pour les tactiques, techniques et procédures (TTP) des attaquants
2. **AlienVault OTX** - Open Threat Exchange, plateforme collaborative de partage d'informations sur les menaces
3. **ThreatFox** - Base de données d'indicateurs de compromission (IoC)
4. **Malpedia** - Base de connaissances sur les malwares

## Types de données collectées

Le système collecte et met à jour les informations suivantes :

- **Groupes d'attaquants (APT)** - Profils, origines, motivations, tactiques
- **Campagnes de cyberattaques** - Chronologie, cibles, impact, techniques utilisées
- **Techniques et tactiques** - Basées sur le framework MITRE ATT&CK
- **Malwares et ransomwares** - Caractéristiques, fonctionnalités, groupes associés
- **Indicateurs de compromission (IoC)** - Signatures, hashes, URLs malveillantes
- **Secteurs et régions ciblés** - Cartographie des cibles par industrie et géographie

## Architecture du système

Le système de mise à jour automatique est composé de trois composants principaux :

1. **Script d'initialisation (`init.js`)** - Déclenche l'initialisation et la mise à jour au démarrage
2. **Script d'actualisation (`updateThreatData.js`)** - Collecte et traite les données des différentes sources
3. **Planificateur (`scheduler.js`)** - Gère la planification des mises à jour périodiques

### Flux de travail

1. Au démarrage du backend, le script d'initialisation (`init.js`) est automatiquement exécuté
2. Ce script déclenche d'abord l'initialisation de la base de données avec les données de base
3. Puis il lance immédiatement une mise à jour complète des données depuis toutes les sources
4. Enfin, il initialise le planificateur pour les mises à jour périodiques (toutes les 6 heures)
5. Les nouvelles données sont récupérées, normalisées et validées
6. Les données existantes sont mises à jour et de nouvelles entrées sont créées si nécessaire
7. Les relations entre les différentes entités sont maintenues (groupes, campagnes, techniques, etc.)
8. Les logs de mise à jour sont enregistrés pour le suivi et le débogage

## Configuration

La fréquence des mises à jour périodiques est configurable via la variable d'environnement `UPDATE_SCHEDULE` dans le fichier docker-compose.yml. Par défaut, elle est réglée sur `0 */6 * * *` (toutes les 6 heures).

La mise à jour au démarrage est contrôlée par la variable d'environnement `UPDATE_ON_STARTUP` qui est définie sur `true` par défaut.

Pour modifier ces paramètres, vous pouvez ajuster ces variables dans la section `environment` du service backend :

```yaml
environment:
  - UPDATE_ON_STARTUP=true  # Mise à jour au démarrage
  - UPDATE_SCHEDULE=0 */6 * * *  # Format cron: [minute] [heure] [jour du mois] [mois] [jour de la semaine]
```

## API Keys

Pour certaines sources de données, des clés API sont nécessaires. Ces clés peuvent être configurées via des variables d'environnement :

```yaml
environment:
  - ALIENVAULT_API_KEY=your_api_key_here
  - THREATFOX_API_KEY=your_api_key_here
  - MALPEDIA_API_KEY=your_api_key_here
```

## Logs et surveillance

Les logs de mise à jour sont enregistrés et accessibles via la commande :

```bash
docker-compose logs -f backend
```

Recherchez les entrées commençant par "Mise à jour des données de threat intelligence" pour suivre le processus de mise à jour.

## Déclenchement manuel

Si vous souhaitez déclencher une mise à jour manuelle en dehors du cycle automatique, vous pouvez exécuter :

```bash
docker-compose exec backend node src/scripts/updateThreatData.js
```

## Dépannage

### Problèmes courants

**Interface utilisateur vide ou avec peu de données :**
- Vérifiez les logs du backend pour confirmer que l'initialisation s'est bien déroulée
- Redémarrez les conteneurs pour forcer une nouvelle mise à jour
- Vérifiez que les volumes MongoDB ne sont pas corrompus

**Erreur de connexion aux sources de données :**
- Vérifiez la connectivité Internet du conteneur
- Vérifiez que les API keys sont valides et correctement configurées

**Erreur lors de l'insertion des données :**
- Vérifiez l'espace disque disponible
- Vérifiez les logs pour des erreurs de validation de schéma

**Mise à jour non déclenchée :**
- Vérifiez que la variable `UPDATE_ON_STARTUP` est bien définie sur `true`
- Vérifiez le format de la variable `UPDATE_SCHEDULE`

## Conclusion

Le système de mise à jour automatique garantit que votre instance de CyberThreat Atlas dispose toujours des informations les plus récentes sur les menaces cyber, sans nécessiter d'intervention manuelle. Cette automatisation permet une veille constante et une analyse toujours à jour des menaces.
