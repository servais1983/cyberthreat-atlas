# Frontend Dockerfile pour CyberThreat Atlas
FROM node:18-alpine AS builder

# Installer les outils nécessaires pour la compilation
RUN apk add --no-cache python3 make g++

# Créer le répertoire de l'application
WORKDIR /app

# Copier package.json
COPY package.json ./

# Générer package-lock.json si nécessaire et installer les dépendances
RUN if [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install && \
      npm install --package-lock-only; \
    fi

# Copier le code source
COPY . .

# Build l'application React
RUN npm run build

# Stage de production
FROM node:18-alpine

# Installer serve pour servir l'application
RUN npm install -g serve

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers buildés depuis le stage builder
COPY --from=builder /app/build ./build

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

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

# Démarrer l'application avec serve
CMD ["serve", "-s", "build", "-l", "3000"]
