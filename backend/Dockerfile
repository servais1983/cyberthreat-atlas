# Backend Dockerfile pour CyberThreat Atlas
FROM node:18-alpine

# Installer les outils nécessaires
RUN apk add --no-cache python3 make g++ dos2unix

# Créer le répertoire de l'application
WORKDIR /app

# Copier package.json
COPY package.json ./

# Générer package-lock.json si nécessaire et installer les dépendances
RUN npm install

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copier le code source avec les bonnes permissions
COPY --chown=nodejs:nodejs . .

# Convertir tous les fichiers JS en format Unix pour éviter les problèmes d'encodage
RUN find /app -type f -name "*.js" -exec dos2unix {} \;

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
