# Utiliser l'image Node.js officielle basée sur Alpine (plus légère)
FROM node:20-alpine

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers package.json et package-lock.json (si disponible)
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY src/ ./src/
COPY docs/ ./docs/

# Créer les répertoires nécessaires
RUN mkdir -p /app/logdata/logs

# Définir les variables d'environnement par défaut
ENV NODE_ENV=production
ENV LOG_DIRECTORY=/app/logdata/logs

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S chatlogger -u 1001 -G nodejs

# Changer la propriété des fichiers
RUN chown -R chatlogger:nodejs /app

# Passer à l'utilisateur non-root
USER chatlogger

# Commande par défaut (sera overridée par docker-compose)
CMD ["node", "src/chatlogger.js"]
