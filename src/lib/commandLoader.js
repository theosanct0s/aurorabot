const fs = require('node:fs');
const path = require('node:path');
const { Collection, REST, Routes } = require('discord.js');
const { token } = require('../config');
const { logger } = require('../utils/logger');

function loadCommands(commandsPath) {
  const commands = new Collection();
  const commandData = [];

  if (!fs.existsSync(commandsPath)) {
    logger.warn(`Commands folder not found: ${commandsPath}`);
    return { commands, commandData };
  }

  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if (!command?.data || typeof command.execute !== 'function') {
      logger.warn(`Skipping invalid command: ${file}`);
      continue;
    }

    commands.set(command.data.name, command);
    commandData.push(command.data.toJSON());
  }
  logger.info(`Loaded ${commands.size} commands.`);
  return { commands, commandData };
}

async function registerCommands(client, commandData, options = {}) {
  const { registerGuilds = true, registerGlobal = false } = options;

  if (!commandData || commandData.length === 0) {
    logger.warn('No commands to register.');
    return;
  }

  const applicationId = client.application?.id || client.user?.id;

  if (!applicationId) {
    throw new Error('Application ID unavailable; cannot register commands.');
  }

  const rest = new REST({ version: '10' }).setToken(token);

  if (registerGlobal) {
    try {
      await rest.put(Routes.applicationCommands(applicationId), {
        body: commandData,
      });
      logger.success(`Registered global commands: ${commandData.length}.`);
    } catch (error) {
      logger.error('Failed to register global commands.', error);
      throw error;
    }
  }

  if (!registerGuilds) return;

  const guilds = Array.from(client.guilds.cache.values());

  for (const guild of guilds) {
    try {
      await rest.put(Routes.applicationGuildCommands(applicationId, guild.id), {
        body: commandData,
      });
    } catch (error) {
      logger.error(`Failed to register commands for guild ${guild.id}.`, error);
    }
  }
}

module.exports = {
  loadCommands,
  registerCommands,
};
