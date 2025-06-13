# Variables d'environnement pour ChatLogger.JS

Ce document décrit les variables d'environnement disponibles pour contrôler ChatLogger.JS en mode non-interactif.

## Variables supportées

### `STEAM_USERNAME`
- **Description** : Nom d'utilisateur Steam pour la connexion automatique
- **Type** : Chaîne de caractères
- **Requis** : Oui (pour le mode non-interactif)
- **Exemple** : `export STEAM_USERNAME="monusername"`

### `STEAM_PASSWORD`
- **Description** : Mot de passe Steam pour la connexion automatique
- **Type** : Chaîne de caractères
- **Requis** : Oui (pour le mode non-interactif)
- **Exemple** : `export STEAM_PASSWORD="monmotdepasse"`

### `LOG_DIRECTORY`
- **Description** : Répertoire où sauvegarder les logs de chat
- **Type** : Chemin de fichier
- **Requis** : Non
- **Défaut** : `./logs`
- **Exemple** : `export LOG_DIRECTORY="/chemin/vers/mes/logs"`

### `SAVE_LOGIN_DATA`
- **Description** : Détermine si les données de connexion doivent être sauvegardées
- **Type** : Booléen (`true` ou `false`)
- **Requis** : Non
- **Défaut** : `false`
- **Exemple** : `export SAVE_LOGIN_DATA="true"`

## Utilisation

### Mode interactif (par défaut)
```bash
node src/chatlogger.js
```

### Mode non-interactif
```bash
export STEAM_USERNAME="votre_username"
export STEAM_PASSWORD="votre_password"
export LOG_DIRECTORY="/chemin/vers/logs"
export SAVE_LOGIN_DATA="true"
node src/chatlogger.js
```

### Avec un script bash
```bash
#!/bin/bash
export STEAM_USERNAME="votre_username"
export STEAM_PASSWORD="votre_password"
export LOG_DIRECTORY="./my_chat_logs"
export SAVE_LOGIN_DATA="false"

node src/chatlogger.js
```

### Avec un fichier .env (si vous utilisez dotenv)
Créez un fichier `.env` :
```
STEAM_USERNAME=votre_username
STEAM_PASSWORD=votre_password
LOG_DIRECTORY=./my_chat_logs
SAVE_LOGIN_DATA=true
```

## Sécurité

⚠️ **Attention** : Veillez à ne jamais exposer vos identifiants Steam dans des fichiers versionnés ou des logs. Utilisez des variables d'environnement ou des fichiers de configuration sécurisés.

## Comportement

- Si `STEAM_USERNAME` et `STEAM_PASSWORD` sont définis, l'application se lance en mode non-interactif
- Si ces variables ne sont pas définies, l'application utilise le mode interactif habituel
- Les autres variables d'environnement sont optionnelles et remplacent les valeurs par défaut si définies
