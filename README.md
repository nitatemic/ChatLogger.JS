# ChatLogger.JS

A Node.js-based Steam chat logger that will store logs of all chats under your Steam account.

This application runs entirely in command line and will automatically create the configured log folders.

## Installation and startup

### Method 1: Install dependencies and start

```shell
npm install
npm start
```

### Method 2: Production install and start

```shell
npm run chatlogger-install
npm run chatlogger
```

## How it works

The application will ask for your Steam credentials on first startup:

- Steam username
- Steam password
- Steam Guard code (if enabled)
- Whether you want to remember login information

Once logged in, the application will automatically log all chat messages in separate files for each contact.

## Configuration

On first startup, the application will create a `config.json` file in the `./logdata/` folder. You can modify this file to customize:

- Log directory
- File name format
- Message format
- Date and time format
- And more...

An example configuration is available in `config.example.json`.

## File structure

- `src/chatlogger.js`: Main application
- `config.example.json`: Configuration example
- `logdata/`: Automatically created folder containing configuration and login data
- `logs/`: Default folder for chat logs (configurable)

## Config/Data files

The application uses [node-steam-user](https://github.com/DoctorMcKay/node-steam-user) to connect to Steam and listen for incoming and outgoing messages.

Time formatting options use moment.js. [moment.js formatting documentation](https://momentjs.com/docs/#/displaying/)

- `logindata.json` will store your username and login key (not your password) for automatic reconnection
- `logData.json` will store information about chat logs (profiles, names, last messages)
- `config.json` contains saved chat logger settings

## Server usage

This application can be run directly on a Linux server.

First step: install node.js on your Linux server. [Node.js installation guide](https://nodejs.org/en/download/package-manager/)

Second step: download and install this application

Then run these commands:

```shell
npm run chatlogger-install
npm run chatlogger
```

The script will start, create the configuration file under `./logdata/config.json` and ask for your login credentials.

If you edit the configuration, the application requires a restart before using the changes.

To run this application continuously, I recommend using [forever](https://www.npmjs.com/package/forever) to run the script in the background.

Configuration example:

```shell
npm install forever -g
# Make sure to start the script in the correct directory
cd ChatLogger.JS

forever start -a -o out.log -e err.log src/chatlogger.js
```

It's possible to accidentally start multiple instances, so make sure your instance is completely stopped before starting another one.

## Docker

### Option 1: Using Docker Hub (Recommended)

You can use the pre-built image from Docker Hub:

```bash
# Pull the latest image
docker pull nitatemic/chatloggerjs:latest

# Run with basic configuration
docker run -d \
  --name steam-chatlogger \
  -e STEAM_USERNAME=your_username \
  -e STEAM_PASSWORD=your_password \
  -v ./data:/app/logdata \
  -v ./logs:/app/logdata/logs \
  nitatemic/chatloggerjs:latest

# Or use docker-compose with the Docker Hub image
# Use docker-compose.hub.yml which already uses the Docker Hub image
docker-compose -f docker-compose.hub.yml up -d
```

### Option 2: Build from source

A Docker version is also available for building from source. See `README.Docker.md` for more information.

For quick Docker setup:

1. Edit the `.env` file with your Steam credentials
2. Run `docker-compose up -d`

## Notes importantes pour Portainer

Si vous utilisez Portainer et rencontrez des erreurs de permissions (`EACCES: permission denied`), utilisez la version **1.2.0** ou plus récente qui corrige ce problème en utilisant l'utilisateur root dans le conteneur.
