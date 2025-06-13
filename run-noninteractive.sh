#!/bin/bash

# Script d'exemple pour lancer ChatLogger.JS en mode non-interactif
# Copiez ce fichier et modifiez les valeurs selon vos besoins

# Configuration Steam (OBLIGATOIRE pour le mode non-interactif)
export STEAM_USERNAME="votre_username_ici"
export STEAM_PASSWORD="votre_password_ici"

# Configuration optionnelle
export LOG_DIRECTORY="./logs"  # Répertoire de sortie des logs
export SAVE_LOGIN_DATA="true"   # Sauvegarder le token de connexion

# Lancement de l'application
echo "Lancement de ChatLogger.JS en mode non-interactif..."
echo "Username: $STEAM_USERNAME"
echo "Répertoire de logs: $LOG_DIRECTORY"
echo "Sauvegarde du token: $SAVE_LOGIN_DATA"
echo ""

node src/chatlogger.js
