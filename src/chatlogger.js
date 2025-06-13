const fs = require('fs');
const moment = require('moment');
const SteamUser = require('steam-user');
const readline = require('readline');
const path = require('path');
const SteamID = require('steamid');
const endOfLine = require('os').EOL;

let keytar = null;
try {
  keytar = require('keytar');
} catch (e) {
    // Not using keytar.
}

const client = new SteamUser({
  machineIdType: 'PersistentRandom',
  protocol: SteamUser.EConnectionProtocol.WebSocket,
});
let steamUserName;
let appPath = '.';

// Lecture des variables d'environnement et arguments CLI
function getEnvConfig() {
  // Parse command line arguments first
  const args = process.argv.slice(2);
  let cliUsername = null;
  let cliPassword = null;
  let cliGuardCode = null;
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--username':
      case '-u':
        cliUsername = args[i + 1];
        i++; // Skip next argument as it's the value
        break;
      case '--password':
      case '-p':
        cliPassword = args[i + 1];
        i++; // Skip next argument as it's the value
        break;
      case '--guard-code':
      case '-g':
        cliGuardCode = args[i + 1];
        i++; // Skip next argument as it's the value
        break;
    }
  }
  
  return {
    username: cliUsername || process.env.STEAM_USERNAME,
    password: cliPassword || process.env.STEAM_PASSWORD,
    steamGuardCode: cliGuardCode || process.env.STEAM_GUARD_TOKEN,
    logDirectory: process.env.LOG_DIRECTORY,
    saveLoginData: process.env.SAVE_LOGIN_DATA ? process.env.SAVE_LOGIN_DATA.toLowerCase() === 'true' : null
  };
}

const envConfig = getEnvConfig();

// Default config.
let config = {
  logDirectory: envConfig.logDirectory || './logs',
  fileFormat: '{SteamID64} - {Nickname}.txt',
  messageFormat: '[{date} {Time}] {BothNames}: {Message}',
  invalidCharReplacement: '_',
  seperationString: '──────────{Date}──────────',
  bothNameFormat: '{Name} ({Nickname})',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:MM',
  // Si on utilise les variables d'environnement (mode non-interactif), sauvegarder par défaut
  saveLoginData: envConfig.saveLoginData !== null ? envConfig.saveLoginData : 
                 (envConfig.username && envConfig.password ? true : false),
};

let logData = {};
let logDataFile = 'logData.json';
let configFile = 'config.json';
const scriptFileName = path.basename(__filename);
let logdataDir = './logdata';

// Default login prompts for running through console.
let loginPrompt = function () {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Steam Username: ', (value) => {
    rl.stdoutMuted = true; // Don't show password.
    rl.query = 'Steam Password: ';
    rl.question(rl.query, (value) => {
      rl.stdoutMuted = false;
      rl.query = 'Remember Password (Y/N): ';
      rl.question(rl.query, (value) => {
        steamUserName = rl.history[2];
        const pass = rl.history[1];
        const remember = !(/N|0/ig.test(value));
        rl.close();
        loginToSteam({
          username: steamUserName,
          password: pass,
          rememberPassword: remember,
        });
      });
    });
        // Password Mask, pretty hacky.
    rl._writeToOutput = function _writeToOutput(stringToWrite) {
      let tempString = stringToWrite;
      if (rl.stdoutMuted) {
        const index = stringToWrite.indexOf(rl.query);
        if (index > -1) {
          tempString = rl.query + stringToWrite.slice(index + rl.query.length).replace(/[A-Za-z0-9]/g, '*');
        } else {
          tempString = stringToWrite.replace(/[A-Za-z0-9]/g, '*');
        }
      }
      rl.output.write(tempString);
    };
  });
};
let sgPrompt = function (callback) {
  // Vérifier si un token Steam Guard est fourni via variable d'environnement
  if (envConfig.steamGuardCode) {
    console.log('Utilisation du code Steam Guard depuis la variable d\'environnement.');
    callback(envConfig.steamGuardCode);
    return;
  }
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('SteamGuard Code: ', (value) => {
    rl.close();
    callback(value);
  });
};

module.exports = {
  setAppPath(path) {
    appPath = path;
  },
  getLogFolder() {
    return config.logDirectory;
  },
  getConfig() {
    return config;
  },
  setConfig(newConfig) {
    config = newConfig;
    saveConfig();
  },
  getSteamClient() {
    return client;
  },
  setLoginPrompt(loginFunction) {
    loginPrompt = loginFunction;
  },
  setSteamGuardPrompt(steamguardFunction) {
    sgPrompt = steamguardFunction;
  },
  run() {
    runApp();
  },
  login(newLoginData) {
    loginToSteam(newLoginData);
  },
  logout() {
    client.logOff();
    loginToSteam(null);
  },
};

function runApp() {
  logdataDir = path.join(appPath, 'logdata');
  createDirIfNotExists(logdataDir);
  logData = {};
  logDataFile = path.join(logdataDir, 'logData.json');
  configFile = path.join(logdataDir, 'config.json');
  getConfig(() => {
    // Si les variables d'environnement sont définies, utiliser le mode non-interactif
    if (envConfig.username && envConfig.password) {
      console.log('Mode non-interactif détecté via les variables d\'environnement.');
      loginToSteam({
        username: envConfig.username,
        password: envConfig.password,
        rememberPassword: config.saveLoginData
      });
    } else {
      loginToSteam({});
    }
  });
  getLogData();
}

async function loginToSteam(loginData) {
  if (loginData !== null) {
    if (loginData.hasOwnProperty('key')) {
            // Reverse compatablity.
      loginData.loginKey = loginData.key;
    }
    if ('username' in loginData) {
      steamUserName = loginData.username;
      if ('password' in loginData) {
                // Fresh username and password given
        let rememberPassword = config.saveLoginData;
        if ('rememberPassword' in loginData) {
          rememberPassword = loginData.rememberPassword;
        } else {
          rememberPassword = false;
        }
        if (config.saveLoginData !== rememberPassword) {
          config.saveLoginData = rememberPassword;
          saveConfig();
        }
        client.logOn({
          accountName: loginData.username,
          password: loginData.password,
          twoFactorCode: envConfig.steamGuardCode, // Inclure le code Steam Guard si disponible
          rememberPassword,
          logonID: 350,
        });
        return;
      } else if ('loginKey' in loginData) {
        client.logOn({
          accountName: loginData.username,
          loginKey: loginData.loginKey,
          rememberPassword: true,
          logonID: 350,
        });
        return;
      }
    } else if (config.saveLoginData) {
      if (keytar) {
        console.log('Getting username from keytar. ');
                // Get username from keytar
        keytar.findCredentials(scriptFileName).then((result) => {
                    // Convert list to something usable.
          if (result) {
            const tmpLoginData = {};
            result.forEach((value) => {
              tmpLoginData[value.account] = value.password;
            });
            if (tmpLoginData.hasOwnProperty('username') && tmpLoginData.hasOwnProperty('loginKey')) {
              steamUserName = tmpLoginData.username;
              loginToSteam(tmpLoginData);
              return;
            }
          }
          console.log('Login key not found, reprompting.');
          loginToSteam(null);
        }).catch((er) => {
          console.error(er);
        });
        return;
      }
                // keytar isn't provided, let's find from file.
      const loginDataFile = path.join(logdataDir, 'loginData.json');
      if (fs.existsSync(loginDataFile)) {
        fs.readFile(loginDataFile, (err, data) => {
          if (err) {
            throw err;
          }
          try {
            loginToSteam(JSON.parse(data));
          } catch (e) {
                            // Something went wrong, let's just have them login through prompt.
            loginToSteam(null);
          }
        });
        return;
      }
    }
  }
  
  // Vérifier si on est en mode non-interactif avec les variables d'environnement
  if (envConfig.username && envConfig.password) {
    console.log('Utilisation des informations de connexion depuis les variables d\'environnement.');
    loginToSteam({
      username: envConfig.username,
      password: envConfig.password,
      rememberPassword: config.saveLoginData
    });
    return;
  }
  
  loginPrompt();
}

client.on('steamGuard', (domain, callback) => {
  console.log(`Steam Guard code needed from email ending in ${domain}`);
  sgPrompt(callback);
});

client.on('loggedOn', (details) => {
  console.log(`Logged into Steam as ${client.steamID.getSteam3RenderedID()}`);
  client.setPersona(SteamUser.EPersonaState.Invisible);
});

client.on('loginKey', (key) => {
    // Save the key.
  if (config.saveLoginData) {
    if (keytar) {
      console.log('Login key storing in keytar.');
      keytar.setPassword(scriptFileName, 'username', steamUserName);
      keytar.setPassword(scriptFileName, 'loginKey', key);
      console.log('Login key stored.');
    } else {
      fs.writeFileSync(path.join(logdataDir, 'loginData.json'), JSON.stringify({ loginKey: key, username: steamUserName }));
      console.log('Login key saved.');
    }
  }
});
client.on('error', (err) => {
	// Some error occurred during logon
  if (err.eresult === 5) {
        // Remove old instances of stored username/loginKey so we don't use bad creds next time.
    if (keytar) {
      keytar.deletePassword(scriptFileName, 'username');
      keytar.deletePassword(scriptFileName, 'loginKey');
    } else {
      const loginDataFile = path.join(logdataDir, 'loginData.json');
      if (fs.existsSync(loginDataFile)) {
        fs.unlinkSync(loginDataFile);
      }
    }
    console.log('Invalid Password or loginKey, reprompting login.');
    loginToSteam(null);
  } else {
    console.log(err);
    fs.appendFile(path.join(logdataDir, 'error.log'), `${new Date()} : ${err.toString()}${endOfLine}`, (error) => {
      if (error) {
        throw error;
      }
    });
  }
});

client.on('licenses', (licenses) => {
  console.log(`Your account owns ${licenses.length} license${licenses.length == 1 ? '' : 's'}.`);
});

client.chat.on('friendMessage', (message) => {
  userChat(message.steamid_friend, message.steamid_friend, message);
});

client.chat.on('friendMessageEcho', (message) => {
  userChat(message.steamid_friend, client.steamID, message);
});

const nonFriendNames = {};
function userChat(friendSteam, sender, message) {
    // Check if the player is on your friends list:
  const friendName = getFriendName(friendSteam.getSteamID64());
  if (friendName === null) {
    client.getPersonas([friendSteam], (err, personas) => {
      Object.keys(personas).forEach((sId) => {
        const persona = personas[sId];
        nonFriendNames[sId] = persona ? persona.player_name : sId;
      });
      userChatEx(friendSteam, sender, message);
    });
    return;
  }
  userChatEx(friendSteam, sender, message);
}
function userChatEx(friendSteam, sender, message) {
    // Check if it's a command bbcode, usually these don't get printed in plain text.
  if (message.message_bbcode_parsed && message.message_bbcode_parsed.length === 1 && typeof message.message_bbcode_parsed[0] === 'object' && 'content' in message.message_bbcode_parsed[0] && message.message_bbcode_parsed[0].content && message.message_bbcode_parsed[0].content.length === 0) {
        // Convert single bbcode into readable text.
    message.message_no_bbcode = changeBBCodeToMessage(message.message_bbcode_parsed[0]);
    if (message.message_no_bbcode === null) {
            // Something went wrong, set it back.
      message.message_no_bbcode = message.message;
    }
  }
  const steam64 = friendSteam.getSteamID64();
  const formattedMessage = formatMessage(sender, message).replace(/(?:\n)/g, endOfLine);
  const friendName = getFriendName(steam64);
  const fileName = getChatIdFile(friendSteam).replace(/[/\\?%*:|"<>]/g, config.invalidCharReplacement);
  const newFilePath = path.join(config.logDirectory, fileName);
    // Update Logdata also.
  let isSame = false;
  if (steam64 in logData) {
    if ('lastMessage' in logData[steam64]) {
      isSame = moment(logData[steam64].lastMessage).isSame(message.server_timestamp, 'day');
    }
    if ('logFile' in logData[steam64]) {
      if (logData[steam64].logFile !== fileName) {
        const oldLogFile = path.join(config.logDirectory, logData[steam64].logFile);
        if (fs.existsSync(oldLogFile)) {
                    // Rename old file before appending text message, only if something in the filename changed.
          if (fs.existsSync(newFilePath)) {
                        // If the new file name is already taken then append .old to avoid conflicts.
            fs.renameSync(oldLogFile, `${newFilePath}.old`);
          } else {
            fs.renameSync(oldLogFile, newFilePath);
          }
        }
      }
    }
  } else {
    logData[steam64] = {};
  }
  logData[steam64].lastMessage = message.server_timestamp;
  if (friendName !== null) {
    logData[steam64].name = friendName;
  }
  logData[steam64].profile = `http://steamcommunity.com/profiles/${steam64}`;
  logData[steam64].logFile = fileName;
  fs.writeFileSync(logDataFile, JSON.stringify(logData, null, 2));

  let appendLine = '';
  if (!isSame) {
    appendLine = config.seperationString + endOfLine;
    appendLine = appendLine.replace('{Date}', moment(message.server_timestamp).format(config.dateFormat));
  }
  fs.appendFile(path.join(config.logDirectory, fileName), appendLine + formattedMessage + endOfLine, (err) => {
    if (err) throw err;
  });

    // return "- " + getFriendName(sender) + ": " + message.message;
  console.log(`[${friendName}]${formattedMessage}`);
  return formattedMessage;
}

function getFriendName(steamid64) {
  if (steamid64 === null || steamid64 === client.steamID.getSteamID64()) {
    return client.accountInfo.name;
  }
  if (steamid64 in client.users) {
    return client.users[steamid64].player_name;
  }
  if (steamid64 in nonFriendNames) {
        // User isn't a friend but we've cached his name.
    return nonFriendNames[steamid64];
  }
  return null;
}

function getFriendNickName(steamid64) {
  if (steamid64 in client.myNicknames) {
    return client.myNicknames[steamid64];
  }
  return getFriendName(steamid64);
}

function formatMessage(user, message) {
  return formatDynamicString(config.messageFormat, moment(message.server_timestamp), message, user);
}

const bbTagsFormat = {
  random: '/random {min}-{max}: {result}',
  flip: '/flip: {upperCase({result})}',
  tradeoffer: 'Trade Offer From: {aidToCommunity({sender})}',
};
// Maybe I'll expand on these types of variable scopes to include an external js into the app for others to add onto.
const functionReg = /{(.+)\((.*)\)}/gi;
const conversionFuncs = {
  aidToCommunity(accountId) {
    return SteamID.fromIndividualAccountID(parseInt(accountId));
  },
  upperCase(argument) {
    return argument.toUpperCase();
  },
};

function changeBBCodeToMessage(messbb) {
  if (messbb.tag in bbTagsFormat) {
    let formattedMessage = `${bbTagsFormat[messbb.tag]}`;
    if ('attrs' in messbb) {
      Object.keys(messbb.attrs).forEach((key) => {
        const tempKey = `{${key}}`;
        if (formattedMessage.includes(tempKey)) {
          formattedMessage = formattedMessage.replace(tempKey, messbb.attrs[key]);
        }
      });
            // If there are any replacements left
      if (formattedMessage.includes('{') && formattedMessage.includes('}')) {
        formattedMessage = formattedMessage.replace(functionReg, (str, funcName, funcArg, offset, s) => {
          if (funcName in conversionFuncs) {
            return conversionFuncs[funcName](funcArg);
          }
          return str; // If the function name isn't matching to our object map then we ignore it.
        });
      }
    }
    return formattedMessage;
  }
  return null;
}

function formatDynamicString(formatString, timeMoment, message, user) {
  const steam64 = user.getSteamID64();
  let formattedMessage = `${formatString}`;
  const friendName = getFriendName(steam64);
  const friendNick = getFriendNickName(steam64);
  let bothNameFormat = friendName;
  if (friendNick !== friendName) {
    bothNameFormat = (`${config.bothNameFormat}`);
  }
  const formatArgs = {
    '{BothNames}': bothNameFormat, // First so the variables it contains can be replaced properly.
    '{Date}': timeMoment.format(config.dateFormat),
    '{Time}': timeMoment.format(config.timeFormat),
    '{MyName}': getFriendName(null),
    '{MySteamID}': client.steamID.getSteam3RenderedID(),
    '{MySteamID2}': client.steamID.getSteam2RenderedID(),
    '{MySteamID64}': client.steamID.getSteamID64(),
    '{SteamID}': user.getSteam3RenderedID(),
    '{SteamID2}': user.getSteam2RenderedID(),
    '{SteamID64}': steam64,
    '{Nickname}': friendNick,
    '{Name}': friendName,
    '{Message}': message.message_no_bbcode,
    '{MessageBB}': message.message,
  };
  Object.keys(formatArgs).forEach((key) => {
    if (formattedMessage.includes(key)) {
      formattedMessage = formattedMessage.replace(key, formatArgs[key]);
    }
  });
  return formattedMessage;
}

function getChatIdFile(user) {
  return formatDynamicString(config.fileFormat, moment(), { message: '<Message Unknown>', message_no_bbcode: '' }, user);
}

function getLogData() {
  if (fs.existsSync(logDataFile)) {
    fs.readFile(logDataFile, (err, data) => {
      if (err) {
        throw err;
      }
      try {
        logData = JSON.parse(data);
      } catch (e) {
                // Do nothing I guess?
      }
    });
  }
}

function getConfig(callback) {
  if (fs.existsSync(configFile)) {
    fs.readFile(configFile, (err, data) => {
      if (err) {
        throw err;
      }
      const loadedConfig = JSON.parse(data);
      let changedConfig = false;
      Object.keys(config).forEach((key) => {
        if (!(key in loadedConfig)) {
                    // Add anything new in the default config to the saved config.
          loadedConfig[key] = config[key];
          changedConfig = true;
        }
      });
      config = loadedConfig;
      if (changedConfig) {
        saveConfig();
      }
      createDirIfNotExists(config.logDirectory);
      callback();
    });
  } else {
    config.logDirectory = path.join(appPath, 'logdata', 'logs');
    createDirIfNotExists(config.logDirectory);
    saveConfig();
    callback();
  }
}

function saveConfig() {
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
}

function createDirIfNotExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

if (require.main === module) {
  // chatlogger.js was ran directly from the cmd line.
  console.log('Running ChatLogger.js in standalone mode.');
  
  // Check for help argument
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node src/chatlogger.js [options]

Options:
  -u, --username <username>    Steam username
  -p, --password <password>    Steam password
  -g, --guard-code <code>      Steam Guard code (6 digits)
  -h, --help                   Show this help message

Environment variables (alternative to CLI args):
  STEAM_USERNAME               Steam username
  STEAM_PASSWORD               Steam password
  STEAM_GUARD_TOKEN            Steam Guard code
  LOG_DIRECTORY                Log directory path
  SAVE_LOGIN_DATA              Save login data (true/false)

Examples:
  node src/chatlogger.js -u myuser -p mypass -g 123456
  STEAM_USERNAME=myuser STEAM_PASSWORD=mypass node src/chatlogger.js
    `);
    process.exit(0);
  }
  
  runApp();
}
