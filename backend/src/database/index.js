/**
 * Configuration de la connexion à MongoDB
 */
const mongoose = require('mongoose');
const config = require('../config');

// Options de configuration pour Mongoose
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout après 5s si impossible de se connecter
  autoIndex: process.env.NODE_ENV !== 'production', // Désactiver l'auto-indexation en production
};

// Fonction pour établir la connexion à MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoURI, options);
    console.log(`MongoDB connecté: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Erreur de connexion à MongoDB: ${error.message}`);
    process.exit(1); // Quitter l'application en cas d'échec de connexion
  }
};

// Gestion des événements de connexion
mongoose.connection.on('connected', () => {
  console.log('Mongoose connecté à MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error(`Erreur de connexion Mongoose: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose déconnecté de MongoDB');
});

// Fermeture propre de la connexion lors de l'arrêt de l'application
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Connexion Mongoose fermée suite à l\'arrêt de l\'application');
  process.exit(0);
});

module.exports = connectDB;
