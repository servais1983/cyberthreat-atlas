const mongoose = require('mongoose');

/**
 * Modèle Mongoose pour les régions géographiques
 */
const RegionSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['Country', 'Continent', 'Region', 'City', 'Other'],
    default: 'Country'
  },
  coordinates: {
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    }
  },
  parent: {
    type: String,
    trim: true
  },
  description: {
    type: String
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
RegionSchema.index({ 
  name: 'text', 
  code: 'text', 
  description: 'text' 
});

// Middleware pour mettre à jour la date de dernière modification
RegionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Méthode pour obtenir les sous-régions
RegionSchema.methods.getSubRegions = async function() {
  return await this.model('Region').find({ parent: this.name });
};

// Méthode pour obtenir les groupes d'attaque ciblant cette région
RegionSchema.methods.getTargetingGroups = async function() {
  const AttackGroup = mongoose.model('AttackGroup');
  return await AttackGroup.find({ targetRegions: this.name });
};

// Méthode pour obtenir les campagnes ciblant cette région
RegionSchema.methods.getTargetingCampaigns = async function() {
  const Campaign = mongoose.model('Campaign');
  return await Campaign.find({ targetRegions: this.name });
};

const Region = mongoose.model('Region', RegionSchema);

module.exports = Region;
