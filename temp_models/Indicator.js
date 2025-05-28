const mongoose = require('mongoose');

/**
 * Modèle Mongoose pour les indicateurs de compromission (IOCs)
 */
const IndicatorSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['IP', 'Domain', 'URL', 'File Hash', 'Email', 'CIDR', 'Registry', 'Other'],
    default: 'Other'
  },
  description: {
    type: String
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date
  },
  campaigns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  }],
  attackGroups: [{
    type: String,
    trim: true
  }],
  malware: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
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
IndicatorSchema.index({ 
  value: 'text', 
  description: 'text',
  tags: 'text'
});

// Middleware pour mettre à jour la date de dernière modification
IndicatorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Méthode pour vérifier si l'indicateur est toujours valide
IndicatorSchema.methods.isValid = function() {
  const now = new Date();
  return (!this.validUntil || this.validUntil > now);
};

// Méthode pour obtenir les campagnes associées
IndicatorSchema.methods.getCampaigns = async function() {
  await this.populate('campaigns');
  return this.campaigns;
};

// Méthode pour obtenir les groupes d'attaque associés
IndicatorSchema.methods.getAttackGroups = async function() {
  const AttackGroup = mongoose.model('AttackGroup');
  return await AttackGroup.find({ name: { $in: this.attackGroups } });
};

const Indicator = mongoose.model('Indicator', IndicatorSchema);

module.exports = Indicator;
