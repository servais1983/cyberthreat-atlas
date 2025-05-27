# Backend Dockerfile pour CyberThreat Atlas
FROM node:18-alpine

# Créer le répertoire de l'application
WORKDIR /app

# Copier package.json
COPY package.json ./

# Installer les dépendances
# Utiliser npm install au lieu de npm ci pour éviter l'erreur si package-lock.json n'existe pas
RUN npm install --only=production

# Copier le code source
COPY . .

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Changer les permissions du répertoire
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exposer le port
EXPOSE 5000

# Commandes de santé
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Démarrer l'application
CMD ["npm", "start"]
