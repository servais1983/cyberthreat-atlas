# Intégration des données MITRE ATT&CK

Ce document détaille le processus d'intégration automatique des données MITRE ATT&CK dans l'application CyberThreat Atlas.

## Vue d'ensemble

L'application CyberThreat Atlas intègre automatiquement une base de données exhaustive et professionnelle à chaque démarrage du backend. Cette intégration collecte les données directement depuis les sources officielles STIX JSON de MITRE ATT&CK, garantissant l'exhaustivité et la précision des informations.

## Sources de données

Les données sont collectées à partir des sources officielles suivantes :

1. **MITRE ATT&CK Enterprise** - Tactiques, techniques et groupes d'attaque ciblant les environnements d'entreprise
2. **MITRE ATT&CK Mobile** - Tactiques, techniques et groupes d'attaque ciblant les plateformes mobiles
3. **MITRE ATT&CK ICS** - Tactiques, techniques et groupes d'attaque ciblant les systèmes de contrôle industriels

Ces données sont fournies au format STIX (Structured Threat Information Expression), un langage standardisé pour l'échange d'informations sur les cybermenaces.

## Types de données collectées

Le processus d'intégration collecte et formate les données suivantes :

- **Groupes d'attaque (APT)** - Tous les groupes d'attaque connus, avec leurs attributs, tactiques et relations
- **Techniques d'attaque** - Toutes les techniques MITRE ATT&CK, avec leurs descriptions, tactiques et plateformes
- **Malwares** - Tous les malwares documentés, avec leurs caractéristiques et relations
- **Campagnes** - Historique des attaques significatives
- **Régions et secteurs** - Cartographie complète des cibles

## Architecture du système d'intégration

Le système d'intégration est composé de deux composants principaux :

1. **Script de collecte (`collectMitreData.js`)** - Télécharge et formate les données STIX JSON depuis les dépôts officiels
2. **Script d'intégration (`integrateMitreData.js`)** - Injecte les données formatées dans la base MongoDB

### Flux de travail

1. Au démarrage du backend, le script d'intégration est automatiquement exécuté
2. Ce script appelle d'abord le script de collecte pour télécharger les données STIX JSON les plus récentes
3. Les données sont ensuite formatées pour correspondre aux modèles MongoDB de l'application
4. Les collections existantes sont vidées pour éviter les doublons
5. Les nouvelles données sont insérées dans la base MongoDB
6. Des statistiques sont affichées pour confirmer le succès de l'intégration

## Vérification de l'intégration

Pour vérifier que la base de données a été correctement peuplée avec toutes les données exhaustives, vous pouvez exécuter le script de diagnostic :

```bash
docker-compose exec backend node src/diagnoseDatabaseContent.js
```

Ce script affichera :
- Le nombre d'entrées dans chaque collection
- Des exemples de données pour chaque type d'entité
- Des informations sur la structure et les relations entre les entités

## Dépannage

### Problèmes courants

**Échec du téléchargement des données STIX :**
- Vérifiez la connectivité Internet du conteneur
- Vérifiez que les URLs des dépôts STIX sont toujours valides
- Examinez les logs pour des erreurs HTTP spécifiques

**Erreur lors du formatage des données :**
- Vérifiez les logs pour identifier les objets STIX problématiques
- Vérifiez si le format STIX a été modifié dans les dépôts officiels

**Erreur lors de l'insertion dans MongoDB :**
- Vérifiez que les modèles MongoDB correspondent aux données formatées
- Vérifiez l'espace disque disponible
- Examinez les logs pour des erreurs de validation de schéma

## Maintenance et mises à jour

Le système d'intégration est conçu pour fonctionner automatiquement à chaque démarrage du backend. Cependant, si des modifications sont apportées au format STIX ou aux modèles MongoDB, les scripts devront être mis à jour en conséquence.

Pour mettre à jour manuellement les données sans redémarrer le backend, vous pouvez exécuter :

```bash
docker-compose exec backend node src/scripts/integrateMitreData.js
```

## Conclusion

Le système d'intégration garantit que votre instance de CyberThreat Atlas dispose toujours des informations les plus récentes et les plus complètes sur les menaces cyber, transformant l'application en un outil professionnel de référence pour la cybersécurité.
