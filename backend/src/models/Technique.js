const mongoose = require('mongoose');

/**
 * Modèle Mongoose pour les techniques d'attaque (basé sur MITRE ATT&CK)
 */
const TechniqueSchema = new mongoose.Schema({
  mitreId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  tactics: [{
    type: String,
    trim: true
  }],
  platforms: [{
    type: String,
    trim: true
  }],
  dataSources: [{
    type: String,
    trim: true
  }],
  mitigations: [{
    type: String,
    trim: true
  }],
  detectionMethods: {
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
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
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
  description: 'text',
  mitreId: 'text'
});

// Middleware pour mettre à jour la date de dernière modification
TechniqueSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Méthode pour obtenir les groupes utilisant cette technique
TechniqueSchema.methods.getAttackGroups = async function() {
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
TechniqueSchema.methods.getCampaigns = async function() {
  const Campaign = mongoose.model('Campaign');
  return await Campaign.find({ techniques: this.mitreId });
};

// Méthode pour obtenir les malwares associés à cette technique
TechniqueSchema.methods.getRelatedMalware = async function() {
  const Campaign = mongoose.model('Campaign');
  const Malware = mongoose.model('Malware');
  
  // Trouver toutes les campagnes utilisant cette technique
  const campaigns = await Campaign.find({ techniques: this.mitreId });
  
  // Extraire tous les noms de malwares uniques
  const malwareNames = [...new Set(
    campaigns.flatMap(campaign => campaign.malware)
  )];
  
  // Récupérer les détails des malwares
  return await Malware.find({ name: { $in: malwareNames } });
};

const Technique = mongoose.model('Technique', TechniqueSchema);

module.exports = Technique;
