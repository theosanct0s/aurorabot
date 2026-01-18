const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config');
const { loadCommands } = require('./lib/commandLoader');
const { loadEvents } = require('./lib/eventLoader');
const { logger } = require('./utils/logger');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();
client.commandData = [];

const commandsPath = path.join(__dirname, 'commands');
const eventsPath = path.join(__dirname, 'events');

try {
  const { commands, commandData } = loadCommands(commandsPath);
  client.commands = commands;
  client.commandData = commandData;
  loadEvents(client, eventsPath);
} catch (error) {
  logger.error('Could not load commands or events.', error);
  process.exit(1);
}

client.login(token).catch((error) => {
  logger.error('Failed to authenticate the bot.', error);
});
