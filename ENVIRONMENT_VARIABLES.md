# Environment Variables for ChatLogger.JS

This document describes the available environment variables to control ChatLogger.JS in non-interactive mode.

## Supported variables

### `STEAM_USERNAME`
- **Description**: Steam username for automatic login
- **Type**: String
- **Required**: Yes (for non-interactive mode)
- **Example**: `export STEAM_USERNAME="myusername"`

### `STEAM_PASSWORD`
- **Description**: Steam password for automatic login
- **Type**: String
- **Required**: Yes (for non-interactive mode)
- **Example**: `export STEAM_PASSWORD="mypassword"`

### `STEAM_GUARD_TOKEN`
- **Description**: Steam Guard code for two-factor authentication
- **Type**: String (6 digits)
- **Required**: No (only if Steam Guard is enabled)
- **Example**: `export STEAM_GUARD_TOKEN="123456"`
- **Note**: This token changes regularly, use Steam authenticator

### `LOG_DIRECTORY`
- **Description**: Directory where to save chat logs
- **Type**: File path
- **Required**: No
- **Default**: `./logs`
- **Example**: `export LOG_DIRECTORY="/path/to/my/logs"`

### `SAVE_LOGIN_DATA`
- **Description**: Determines if login data should be saved
- **Type**: Boolean (`true` or `false`)
- **Required**: No
- **Default**: `true` (in non-interactive mode), `false` (in interactive mode)
- **Example**: `export SAVE_LOGIN_DATA="false"`

## Usage

### Interactive mode (default)
```bash
node src/chatlogger.js
```

### Non-interactive mode
```bash
export STEAM_USERNAME="your_username"
export STEAM_PASSWORD="your_password"
export STEAM_GUARD_TOKEN="123456"  # Optional: Steam Guard code if enabled
export LOG_DIRECTORY="/path/to/logs"
export SAVE_LOGIN_DATA="true"
node src/chatlogger.js
```

### With a bash script
```bash
#!/bin/bash
export STEAM_USERNAME="your_username"
export STEAM_PASSWORD="your_password"
export STEAM_GUARD_TOKEN="123456"  # Steam Guard code (optional)
export LOG_DIRECTORY="./my_chat_logs"
export SAVE_LOGIN_DATA="false"

node src/chatlogger.js
```

### With a .env file (if using dotenv)
Create a `.env` file:
```
STEAM_USERNAME=your_username
STEAM_PASSWORD=your_password
STEAM_GUARD_TOKEN=123456
LOG_DIRECTORY=./my_chat_logs
SAVE_LOGIN_DATA=true
```

## Security

⚠️ **Warning**: Be careful never to expose your Steam credentials in versioned files or logs. Use environment variables or secure configuration files.

## Behavior

- If `STEAM_USERNAME` and `STEAM_PASSWORD` are defined, the application starts in non-interactive mode
- In non-interactive mode, `saveLoginData` is automatically set to `true` to allow automatic reconnections
- If these variables are not defined, the application uses the usual interactive mode
- Other environment variables are optional and override default values if defined
- To explicitly disable saving login data in non-interactive mode, set `SAVE_LOGIN_DATA="false"`
