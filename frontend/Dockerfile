# Frontend Dockerfile pour CyberThreat Atlas
FROM node:18-alpine

# Créer le répertoire de l'application
WORKDIR /app

# Copier package.json
COPY package.json ./

# Installer les dépendances
# Utiliser npm install au lieu de npm ci pour éviter l'erreur si package-lock.json n'existe pas
RUN npm install --silent

# Copier le code source
COPY . .

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Changer les permissions du répertoire
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exposer le port
EXPOSE 3000

# Variables d'environnement pour React
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false

# Commande de santé
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# Démarrer l'application
CMD ["npm", "start"]
