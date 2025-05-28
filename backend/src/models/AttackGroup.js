const mongoose = require('mongoose');

/**
 * Modèle Mongoose pour les groupes d'attaque (APTs)
 */
const AttackGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  aliases: [{
    type: String,
    trim: true
  }],
  countryOfOrigin: {
    type: String,
    trim: true
  },
  description: {
    type: String
  },
  firstSeen: {
    type: Date
  },
  lastSeen: {
    type: Date
  },
  motivations: [{
    type: String,
    trim: true
  }],
  targetSectors: [{
    type: String,
    trim: true
  }],
  targetRegions: [{
    type: String,
    trim: true
  }],
  sophisticationLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Unknown'],
    default: 'Unknown'
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
  relatedGroups: [{
    type: String
  }],
  threatLevel: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
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
AttackGroupSchema.index({ 
  name: 'text', 
  aliases: 'text', 
  description: 'text' 
});

// Middleware pour mettre à jour la date de dernière modification
AttackGroupSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Méthode pour obtenir les techniques utilisées par ce groupe
AttackGroupSchema.methods.getTechniques = async function() {
  const Campaign = mongoose.model('Campaign');
  const Technique = mongoose.model('Technique');
  
  // Trouver toutes les campagnes menées par ce groupe
  const campaigns = await Campaign.find({ attackGroups: this.name });
  
  // Extraire tous les IDs de techniques uniques
  const techniqueIds = [...new Set(
    campaigns.flatMap(campaign => campaign.techniques)
  )];
  
  // Récupérer les détails des techniques
  return await Technique.find({ mitreId: { $in: techniqueIds } });
};

// Méthode pour obtenir les malwares utilisés par ce groupe
AttackGroupSchema.methods.getMalware = async function() {
  const Malware = mongoose.model('Malware');
  return await Malware.find({ associatedGroups: this.name });
};

// Méthode pour obtenir les campagnes menées par ce groupe
AttackGroupSchema.methods.getCampaigns = async function() {
  const Campaign = mongoose.model('Campaign');
  return await Campaign.find({ attackGroups: this.name });
};

const AttackGroup = mongoose.model('AttackGroup', AttackGroupSchema);

module.exports = AttackGroup;
