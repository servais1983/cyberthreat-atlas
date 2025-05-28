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
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String
  },
  subSectors: [{
    type: String,
    trim: true
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
SectorSchema.index({ 
  name: 'text', 
  code: 'text', 
  description: 'text' 
});

// Middleware pour mettre à jour la date de dernière modification
SectorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Méthode pour obtenir les groupes d'attaque ciblant ce secteur
SectorSchema.methods.getTargetingGroups = async function() {
  const AttackGroup = mongoose.model('AttackGroup');
  return await AttackGroup.find({ targetSectors: this.name });
};

// Méthode pour obtenir les campagnes ciblant ce secteur
SectorSchema.methods.getTargetingCampaigns = async function() {
  const Campaign = mongoose.model('Campaign');
  return await Campaign.find({ targetSectors: this.name });
};

const Sector = mongoose.model('Sector', SectorSchema);

module.exports = Sector;
