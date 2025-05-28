const mongoose = require('mongoose');

/**
 * Modèle Mongoose pour les techniques d'attaque (MITRE ATT&CK)
 */
const TechniqueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  mitreId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String
  },
  tactic: {
    type: String,
    trim: true
  },
  platforms: [{
    type: String,
    trim: true
  }],
  dataSources: [{
    type: String,
    trim: true
  }],
  mitigation: {
    type: String
  },
  detection: {
    type: String
  },
  references: [{
    url: {
      type: String,
      required: true
    },
    source: {
      type: String,
      required: true
    },
    description: {
      type: String
    }
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

// Index pour les recherches textuelles
TechniqueSchema.index({ 
  name: 'text', 
  mitreId: 'text', 
  description: 'text' 
});

// Middleware pour mettre à jour la date de dernière modification
TechniqueSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Méthode pour obtenir les groupes d'attaque utilisant cette technique
TechniqueSchema.methods.getUsingGroups = async function() {
  const Campaign = mongoose.model('Campaign');
  const AttackGroup = mongoose.model('AttackGroup');
  
  // Trouver toutes les campagnes utilisant cette technique
  const campaigns = await Campaign.find({ techniques: this.mitreId });
  
  // Extraire tous les noms de groupes uniques
  const groupNames = [...new Set(
    campaigns.flatMap(campaign => campaign.attackGroups)
  )];
  
  // Récupérer les détails des groupes
  return await AttackGroup.find({ name: { $in: groupNames } });
};

// Méthode pour obtenir les campagnes utilisant cette technique
TechniqueSchema.methods.getUsingCampaigns = async function() {
  const Campaign = mongoose.model('Campaign');
  return await Campaign.find({ techniques: this.mitreId });
};

const Technique = mongoose.model('Technique', TechniqueSchema);

module.exports = Technique;
