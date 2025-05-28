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
  countries: [{
    type: String,
    trim: true
  }],
  threatLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  activeThreats: [{
    type: String,
    trim: true
  }],
  commonTargets: [{
    type: String,
    trim: true
  }],
  recentCampaigns: [{
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
RegionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Méthode pour obtenir les groupes d'attaque ciblant cette région
RegionSchema.methods.getAttackGroups = async function() {
  const AttackGroup = mongoose.model('AttackGroup');
  
  // Recherche directe dans les activeThreats de cette région
  const directGroups = await AttackGroup.find({ 
    name: { $in: this.activeThreats } 
  });
  
  // Recherche des groupes qui mentionnent cette région dans leurs cibles
  const indirectGroups = await AttackGroup.find({ 
    targetRegions: this.name,
    name: { $nin: this.activeThreats } // Éviter les doublons
  });
  
  // Recherche des groupes qui ciblent des pays de cette région
  let countryGroups = [];
  if (this.countries && this.countries.length > 0) {
    // Supposons que countryOfOrigin contient le code ISO à deux lettres du pays
    countryGroups = await AttackGroup.find({
      countryOfOrigin: { $in: this.countries },
      name: { $nin: [...this.activeThreats, ...indirectGroups.map(g => g.name)] } // Éviter les doublons
    });
  }
  
  // Combiner les résultats
  return [...directGroups, ...indirectGroups, ...countryGroups];
};

// Méthode pour obtenir les campagnes ciblant cette région ou ses pays
RegionSchema.methods.getCampaigns = async function() {
  const Campaign = mongoose.model('Campaign');
  
  // Campagnes mentionnant directement cette région (via recentCampaigns)
  const directCampaigns = await Campaign.find({ 
    name: { $in: this.recentCampaigns } 
  });
  
  // Campagnes ciblant des pays de cette région
  let countryCampaigns = [];
  if (this.countries && this.countries.length > 0) {
    countryCampaigns = await Campaign.find({
      targetCountries: { $in: this.countries },
      name: { $nin: this.recentCampaigns } // Éviter les doublons
    });
  }
  
  // Combiner les résultats
  return [...directCampaigns, ...countryCampaigns];
};

// Méthode statique pour obtenir la liste de tous les pays
RegionSchema.statics.getAllCountries = async function() {
  // Cette méthode retourne la liste complète des pays uniques mentionnés dans toutes les régions
  const regions = await this.find({});
  
  // Extraire tous les codes pays uniques
  const countries = new Set();
  regions.forEach(region => {
    if (region.countries && region.countries.length > 0) {
      region.countries.forEach(country => countries.add(country));
    }
  });
  
  // Convertir en tableau
  return Array.from(countries).sort();
};

const Region = mongoose.model('Region', RegionSchema);

module.exports = Region;
