# Backend Dockerfile pour CyberThreat Atlas
FROM node:18-alpine

# Installer les outils nécessaires
RUN apk add --no-cache python3 make g++

# Créer le répertoire de l'application
WORKDIR /app

# Copier package.json
COPY package.json ./

# Générer package-lock.json si nécessaire et installer les dépendances
RUN if [ -f package-lock.json ]; then \
      npm ci --only=production; \
    else \
      npm install --only=production && \
      npm install --package-lock-only --only=production; \
    fi

# Copier le code source
COPY . .

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

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
