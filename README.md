# ChatLogger.JS

Un logger de chat Steam basé sur Node.js qui stockera les logs de tous les chats sous votre compte Steam.

Cette application fonctionne entièrement en ligne de commande et créera automatiquement les dossiers de logs configurés.

## Installation et démarrage

### Méthode 1 : Installation des dépendances et démarrage

```shell
npm install
npm start
```

### Méthode 2 : Installation production et démarrage

```shell
npm run chatlogger-install
npm run chatlogger
```

## Fonctionnement

L'application vous demandera vos identifiants Steam au premier démarrage :

- Nom d'utilisateur Steam
- Mot de passe Steam
- Code Steam Guard (si activé)
- Si vous souhaitez mémoriser les informations de connexion

Une fois connecté, l'application loggera automatiquement tous les messages de chat dans des fichiers séparés pour chaque contact.

## Configuration

Au premier démarrage, l'application créera un fichier `config.json` dans le dossier `./logdata/`. Vous pouvez modifier ce fichier pour personnaliser :

- Répertoire de logs
- Format des noms de fichiers
- Format des messages
- Format des dates et heures
- Et plus encore...

Un exemple de configuration est disponible dans `config.example.json`.

## Structure des fichiers

- `src/chatlogger.js` : Application principale
- `config.example.json` : Exemple de configuration
- `logdata/` : Dossier créé automatiquement contenant la configuration et les données de connexion
- `logs/` : Dossier par défaut pour les logs de chat (configurable)

## Config/Fichiers de données

L'application utilise [node-steam-user](https://github.com/DoctorMcKay/node-steam-user) pour se connecter à Steam et écouter les messages entrants et sortants.

Les options de formatage du temps utilisent moment.js. [Documentation du formatage de moment.js](https://momentjs.com/docs/#/displaying/)

- `logindata.json` stockera votre nom d'utilisateur et clé de connexion (pas votre mot de passe) pour se reconnecter automatiquement
- `logData.json` stockera les informations sur les logs de chat (profils, noms, derniers messages)
- `config.json` contient les paramètres sauvegardés du chat logger

## Utilisation sur serveur

Cette application peut être exécutée directement sur un serveur Linux.

Première étape : installer node.js sur votre serveur Linux. [Guide d'installation Node.js](https://nodejs.org/en/download/package-manager/)

Deuxième étape : télécharger et installer cette application

Puis exécutez ces commandes :

```shell
npm run chatlogger-install
npm run chatlogger
```

Le script va démarrer, créer le fichier de configuration sous `./logdata/config.json` et vous demander vos identifiants de connexion.

Si vous éditez la configuration, l'application nécessite un redémarrage avant d'utiliser les changements.

Pour faire tourner cette application en continu, je recommande d'utiliser [forever](https://www.npmjs.com/package/forever) pour exécuter le script en arrière-plan.

Exemple de configuration :

```shell
npm install forever -g
# Assurez-vous de démarrer le script dans le bon répertoire
cd ChatLogger.JS

forever start -a -o out.log -e err.log src/chatlogger.js
```

Il est possible de démarrer accidentellement plusieurs instances, donc assurez-vous que votre instance est complètement arrêtée avant d'en démarrer une autre.

## Docker

Une version Docker est également disponible. Consultez `README.Docker.md` pour plus d'informations.
