const mongoose = require('mongoose');

/**
 * Modèle Mongoose pour les indicateurs de compromission (IoCs)
 */
const IndicatorSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['IP', 'Domain', 'Hash', 'URL', 'Email', 'FilePath', 'Registry', 'Other'],
    required: true
  },
  value: {
    type: String,
    required: true,
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
  campaigns: [{
    type: String,
    trim: true
  }],
  malware: [{
    type: String,
    trim: true
  }],
  confidence: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'False Positive'],
    default: 'Active'
  },
  references: [{
    url: {
      type: String,
      required: true
    },
    source: {
      type: String,
      required: true
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

// Index unique sur la combinaison de type et valeur
IndicatorSchema.index({ type: 1, value: 1 }, { unique: true });

// Index pour les recherches par campagne ou malware
IndicatorSchema.index({ campaigns: 1 });
IndicatorSchema.index({ malware: 1 });
IndicatorSchema.index({ status: 1 });

// Middleware pour mettre à jour la date de dernière modification
IndicatorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Méthode pour obtenir les détails complets des campagnes associées
IndicatorSchema.methods.getCampaigns = async function() {
  const Campaign = mongoose.model('Campaign');
  return await Campaign.find({ name: { $in: this.campaigns } });
};

// Méthode pour obtenir les détails complets des malwares associés
IndicatorSchema.methods.getMalware = async function() {
  const Malware = mongoose.model('Malware');
  return await Malware.find({ name: { $in: this.malware } });
};

// Méthode statique pour trouver les indicateurs actifs
IndicatorSchema.statics.findActive = function() {
  return this.find({ status: 'Active' });
};

// Méthode statique pour trouver les indicateurs récents (dans les X derniers jours)
IndicatorSchema.statics.findRecent = function(days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.find({
    $or: [
      { firstSeen: { $gte: cutoffDate } },
      { lastSeen: { $gte: cutoffDate } }
    ]
  }).sort('-lastSeen');
};

// Méthode statique pour valider un indicateur en fonction de son type
IndicatorSchema.statics.validateValue = function(type, value) {
  switch (type) {
    case 'IP':
      // Validation basique d'adresse IP (IPv4 ou IPv6)
      return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value) || /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(value);
    
    case 'Domain':
      // Validation basique de nom de domaine
      return /^[a-zA-Z0-9][-a-zA-Z0-9]+\.[a-zA-Z0-9][-a-zA-Z0-9\.]+$/.test(value);
    
    case 'Hash':
      // Validation pour MD5, SHA1, ou SHA256
      return /^[a-fA-F0-9]{32}$/.test(value) || // MD5
             /^[a-fA-F0-9]{40}$/.test(value) || // SHA1
             /^[a-fA-F0-9]{64}$/.test(value);   // SHA256
    
    case 'URL':
      // Validation basique d'URL
      try {
        new URL(value);
        return true;
      } catch (e) {
        return false;
      }
    
    case 'Email':
      // Validation basique d'email
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    
    default:
      // Pour les autres types, on accepte toute valeur non vide
      return value && value.trim().length > 0;
  }
};

const Indicator = mongoose.model('Indicator', IndicatorSchema);

module.exports = Indicator;
