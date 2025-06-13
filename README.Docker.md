# Docker ChatLogger.JS

## Configuration and quick start

### 1. Prepare environment variables

Edit the `.env` file with your Steam information:
```bash
# Edit the existing .env file
nano .env
# or
code .env
```

Fill in your Steam credentials:
```bash
# Steam configuration (REQUIRED)
STEAM_USERNAME=your_steam_username
STEAM_PASSWORD=your_steam_password

# Steam Guard code (OPTIONAL - only if Steam Guard is enabled)
STEAM_GUARD_TOKEN=123456
```

### 2. Build and start the container

```bash
# Build the image
docker-compose build

# Start the service
docker-compose up -d

# View logs
docker-compose logs -f chatlogger
```

### 3. Stop the service

```bash
docker-compose down
```

## Data management

### Mounted folders

The docker-compose uses local folders to persist data:
- `./data/`: Configuration and connection data (corresponds to `/app/logdata` in the container)
- `./logs/`: Chat logs (corresponds to `/app/logdata/logs` in the container)

These folders will be created automatically on first startup.

### Backup data

```bash
# Data is already in your local folders!
# Create a backup archive
tar czf chatlogger-backup-$(date +%Y%m%d).tar.gz data/ logs/
```

### Restore data

```bash
# Restore from backup
tar xzf chatlogger-backup-YYYYMMDD.tar.gz
```

## Useful commands

### View logs in real time
```bash
docker-compose logs -f chatlogger
```

### Restart the service
```bash
docker-compose restart chatlogger
```

### Access the container
```bash
docker-compose exec chatlogger sh
```

### View service status
```bash
docker-compose ps
```

## Update

```bash
# Stop the service
docker-compose down

# Rebuild the image
docker-compose build --no-cache

# Restart
docker-compose up -d
```

## Troubleshooting

### Check environment variables
```bash
docker-compose config
```

### View error logs
```bash
docker-compose logs chatlogger | grep -i error
```

### Complete reset
```bash
# Stop the container
docker-compose down

# Delete data folders (warning!)
rm -rf data/ logs/

# Rebuild and restart
docker-compose up -d --build
```

## Security

⚠️ **Important**:
- Never commit your `.env` file to version control
- Use strong passwords
- Consider using Docker secrets for production environments

## Monitoring

The container includes a healthcheck that verifies every 30 seconds that Node.js is working properly.

```bash
# View health status
docker-compose ps
```

## Folder structure

After first startup, you will have:
```
ChatLogger.JS/
├── data/                    # Configuration and connection data
│   ├── config.json         # Application configuration
│   ├── loginData.json      # Saved Steam connection token
│   └── error.log           # Error logs (if applicable)
├── logs/                    # Chat logs
│   └── [SteamID] - [Name].txt
├── docker-compose.yml
└── .env                     # Your environment variables
```
