/**
 * Script de diagnostic pour vérifier le contenu de la base de données
 * Ce script affiche le nombre d'entrées dans chaque collection et des exemples de données
 */

const mongoose = require('mongoose');
const config = require('./config');

// Modèles
const AttackGroup = require('./models/AttackGroup');
const Campaign = require('./models/Campaign');
const Technique = require('./models/Technique');
const Malware = require('./models/Malware');
const Region = require('./models/Region');
const Sector = require('./models/Sector');

/**
 * Fonction principale pour diagnostiquer le contenu de la base de données
 */
async function diagnoseDatabaseContent() {
  console.log('=== DIAGNOSTIC DE LA BASE DE DONNÉES ===');
  
  try {
    // Connexion à MongoDB
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connecté à MongoDB pour diagnostic');

    // Compter les entrées dans chaque collection
    const attackGroupsCount = await AttackGroup.countDocuments();
    console.log(`Nombre de groupes d'attaque: ${attackGroupsCount}`);

    const techniquesCount = await Technique.countDocuments();
    console.log(`Nombre de techniques: ${techniquesCount}`);

    const campaignsCount = await Campaign.countDocuments();
    console.log(`Nombre de campagnes: ${campaignsCount}`);

    const malwaresCount = await Malware.countDocuments();
    console.log(`Nombre de malwares: ${malwaresCount}`);

    const regionsCount = await Region.countDocuments();
    console.log(`Nombre de régions: ${regionsCount}`);

    const sectorsCount = await Sector.countDocuments();
    console.log(`Nombre de secteurs: ${sectorsCount}`);

    // Afficher quelques exemples de données
    console.log('\n=== EXEMPLES DE DONNÉES ===');
    
    // Exemple de groupe d'attaque
    const attackGroup = await AttackGroup.findOne().lean();
    if (attackGroup) {
      console.log('\nExemple de groupe d\'attaque:');
      console.log(`Nom: ${attackGroup.name}`);
      console.log(`Origine: ${attackGroup.countryOfOrigin}`);
      console.log(`Aliases: ${attackGroup.aliases.join(', ')}`);
      console.log(`Niveau de menace: ${attackGroup.threatLevel}`);
    } else {
      console.log('Aucun groupe d\'attaque trouvé');
    }

    // Exemple de technique
    const technique = await Technique.findOne().lean();
    if (technique) {
      console.log('\nExemple de technique:');
      console.log(`Nom: ${technique.name}`);
      console.log(`ID MITRE: ${technique.mitreId}`);
      console.log(`Tactique: ${technique.tactic}`);
      console.log(`Plateformes: ${technique.platforms.join(', ')}`);
    } else {
      console.log('Aucune technique trouvée');
    }

    // Exemple de campagne
    const campaign = await Campaign.findOne().lean();
    if (campaign) {
      console.log('\nExemple de campagne:');
      console.log(`Nom: ${campaign.name}`);
      console.log(`Groupes d'attaque: ${campaign.attackGroups.join(', ')}`);
      console.log(`Statut: ${campaign.status}`);
      console.log(`Niveau d'impact: ${campaign.impactLevel}`);
    } else {
      console.log('Aucune campagne trouvée');
    }

    // Exemple de malware
    const malware = await Malware.findOne().lean();
    if (malware) {
      console.log('\nExemple de malware:');
      console.log(`Nom: ${malware.name}`);
      console.log(`Type: ${malware.type}`);
      console.log(`Aliases: ${malware.aliases.join(', ')}`);
      console.log(`Niveau de menace: ${malware.threatLevel}`);
    } else {
      console.log('Aucun malware trouvé');
    }

    console.log('\n=== DIAGNOSTIC TERMINÉ ===');
  } catch (error) {
    console.error('Erreur lors du diagnostic de la base de données:', error);
    throw error;
  } finally {
    // Fermeture de la connexion à MongoDB
    await mongoose.connection.close();
    console.log('Connexion à MongoDB fermée');
  }
}

// Exécution du script si appelé directement
if (require.main === module) {
  diagnoseDatabaseContent()
    .then(() => {
      console.log('Script de diagnostic terminé');
      process.exit(0);
    })
    .catch(error => {
      console.error('Erreur lors de l\'exécution du script de diagnostic:', error);
      process.exit(1);
    });
}

module.exports = { diagnoseDatabaseContent };
