const mongoose = require('mongoose');

/**
 * Modèle Mongoose pour les secteurs d'activité
 */
const SectorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String
  },
  commonVulnerabilities: [{
    type: String,
    trim: true
  }],
  commonAttackVectors: [{
    type: String,
    trim: true
  }],
  threatGroups: [{
    type: String,
    trim: true
  }],
  recommendedControls: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Middleware pour mettre à jour la date de dernière modification
SectorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Méthode pour obtenir les groupes d'attaque ciblant ce secteur
SectorSchema.methods.getAttackGroups = async function() {
  const AttackGroup = mongoose.model('AttackGroup');
  
  // Recherche directe dans les threatGroups de ce secteur
  const directGroups = await AttackGroup.find({ 
    name: { $in: this.threatGroups } 
  });
  
  // Recherche des groupes qui mentionnent ce secteur dans leurs cibles
  const indirectGroups = await AttackGroup.find({ 
    targetSectors: this.name,
    name: { $nin: this.threatGroups } // Éviter les doublons
  });
  
  // Combiner les résultats
  return [...directGroups, ...indirectGroups];
};

// Méthode pour obtenir les campagnes ciblant ce secteur
SectorSchema.methods.getCampaigns = async function() {
  const Campaign = mongoose.model('Campaign');
  return await Campaign.find({ targetSectors: this.name });
};

// Méthode pour obtenir les techniques fréquemment utilisées contre ce secteur
SectorSchema.methods.getCommonTechniques = async function() {
  const Campaign = mongoose.model('Campaign');
  const Technique = mongoose.model('Technique');
  
  // Trouver toutes les campagnes ciblant ce secteur
  const campaigns = await Campaign.find({ targetSectors: this.name });
  
  // Extraire tous les IDs de techniques et leur fréquence
  const techniquesCount = {};
  campaigns.forEach(campaign => {
    campaign.techniques.forEach(technique => {
      techniquesCount[technique] = (techniquesCount[technique] || 0) + 1;
    });
  });
  
  // Convertir en tableau et trier par fréquence
  const sortedTechniques = Object.entries(techniquesCount)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  // Récupérer les détails des techniques (limité aux 20 plus fréquentes)
  return await Technique.find({ 
    mitreId: { $in: sortedTechniques.slice(0, 20) } 
  });
};

const Sector = mongoose.model('Sector', SectorSchema);

module.exports = Sector;
