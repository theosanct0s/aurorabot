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

async function registerCommands(client, commandData) {
  if (!commandData || commandData.length === 0) {
    logger.warn('No commands to register.');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    await rest.put(Routes.applicationCommands(client.application.id), {
      body: commandData,
    });
    logger.success(`Registered commands: ${commandData.length}.`);
  } catch (error) {
    logger.error('Failed to register commands.', error);
    throw error;
  }
}

module.exports = {
  loadCommands,
  registerCommands,
};
