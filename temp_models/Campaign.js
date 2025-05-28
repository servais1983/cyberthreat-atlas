const mongoose = require('mongoose');

/**
 * Modèle Mongoose pour les campagnes d'attaque
 */
const CampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String
  },
  attackGroups: [{
    type: String,
    trim: true
  }],
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Unknown'],
    default: 'Unknown'
  },
  techniques: [{
    type: String,
    trim: true
  }],
  malware: [{
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
  impactLevel: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  indicators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Indicator'
  }],
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
CampaignSchema.index({ 
  name: 'text', 
  description: 'text' 
});

// Middleware pour mettre à jour la date de dernière modification
CampaignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Méthode pour obtenir les groupes d'attaque associés
CampaignSchema.methods.getAttackGroups = async function() {
  const AttackGroup = mongoose.model('AttackGroup');
  return await AttackGroup.find({ name: { $in: this.attackGroups } });
};

// Méthode pour obtenir les techniques utilisées
CampaignSchema.methods.getTechniques = async function() {
  const Technique = mongoose.model('Technique');
  return await Technique.find({ mitreId: { $in: this.techniques } });
};

// Méthode pour obtenir les malwares utilisés
CampaignSchema.methods.getMalware = async function() {
  const Malware = mongoose.model('Malware');
  return await Malware.find({ name: { $in: this.malware } });
};

const Campaign = mongoose.model('Campaign', CampaignSchema);

module.exports = Campaign;
