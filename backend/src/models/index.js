/**
 * Index des modèles de données MongoDB
 * Ce fichier exporte tous les modèles de données de l'application
 */

const AttackGroup = require('./AttackGroup');
const Technique = require('./Technique');
const Campaign = require('./Campaign');
const Malware = require('./Malware');
const Indicator = require('./Indicator');
const Sector = require('./Sector');
const Region = require('./Region');

module.exports = {
  AttackGroup,
  Technique,
  Campaign,
  Malware,
  Indicator,
  Sector,
  Region
};
