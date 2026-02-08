const fs = require('node:fs');
const path = require('node:path');
const { SlashCommandBuilder, Collection } = require('discord.js');
const { loadCommands, registerCommands } = require('../../lib/commandLoader');
const { ownerId } = require('../../config');
const { logger } = require('../../utils/logger');

// find the file that matches a command name (by basename)
function findCommandFile(commandsPath, targetName) {
  const queue = [commandsPath];
  const targetFile = `${targetName}.js`;

  while (queue.length > 0) {
    const current = queue.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);

      if (entry.isDirectory()) {
        queue.push(entryPath);
        continue;
      }

      if (entry.isFile() && entry.name.toLowerCase() === targetFile) {
        return entryPath;
      }
    }
  }

  return null;
}

module.exports = {
  category: 'owner',
  hidden: true,
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reload bot commands (owner only).')
    .addSubcommand((sub) =>
      sub
        .setName('all')
        .setDescription('Reload all commands and re-register them.'),
    )
    .addSubcommand((sub) =>
      sub
        .setName('command')
        .setDescription('Reload just one command and re-register it.')
        .addStringOption((opt) =>
          opt
            .setName('name')
            .setDescription('Command name to reload')
            .setRequired(true),
        ),
    ),

  async execute(interaction) {
    if (!ownerId || interaction.user.id !== ownerId) {
      await interaction.reply({ content: 'You are not allowed to use this command.', ephemeral: true });
      return;
    }

    const sub = interaction.options.getSubcommand();
    const targetName = interaction.options.getString('name');

    await interaction.deferReply({ ephemeral: true });

    try {
      const commandsPath = path.join(__dirname, '..');
      let commands = interaction.client.commands;
      let commandData = interaction.client.commandData;

      if (sub === 'all') {
        const loaded = loadCommands(commandsPath, { logLabel: 'Reloaded' });
        commands = loaded.commands;
        commandData = loaded.commandData;
      } else {
        const normalized = targetName?.toLowerCase();
        const filePath = findCommandFile(commandsPath, normalized);

        if (!filePath) {
          throw new Error(`Command "${normalized}" file not found.`);
        }

        delete require.cache[require.resolve(filePath)];
        const command = require(filePath);

        if (!command?.data || typeof command.execute !== 'function') {
          throw new Error(`Command "${normalized}" is invalid.`);
        }

        const commandName = command.data.name?.toLowerCase();
        if (commandName !== normalized) {
          throw new Error(`Command file does not match requested name (${commandName} !== ${normalized}).`);
        }

        commands = new Collection(commands);
        commands.set(commandName, command);

        const updatedJson = command.data.toJSON();
        const existingIndex = commandData.findIndex((c) => c.name === commandName);
        if (existingIndex >= 0) {
          commandData = [...commandData];
          commandData[existingIndex] = updatedJson;
        } else {
          commandData = [...commandData, updatedJson];
        }

        logger.info(`Reloaded command "${commandName}".`);
      }

      if (!commandData.length) {
        throw new Error('No commands found during reload.');
      }

      interaction.client.commands = commands;
      interaction.client.commandData = commandData;

      const scopeLabel = sub === 'all' ? 'all commands' : `command "${targetName}"`;
      await interaction.editReply({ content: `✅ Reloaded successfully: ${scopeLabel}.` });

      // register commands in the background so the user sees the success message immediately
      registerCommands(interaction.client, commandData, {
        registerGuilds: true,
        registerGlobal: false,
      }).catch(async (error) => {
        logger.error('Failed to register commands after reload.', error);
        try {
          await interaction.editReply({
            content: 'Reloaded locally, but failed to register commands with Discord: ' + (error.message || 'Unknown error.'),
          });
        } catch (editError) {
          logger.error('Failed to update interaction after registration error.', editError);
        }
      });
    } catch (error) {
      logger.error('Error reloading commands via /reload.', error);
      await interaction.editReply({ content: 'Failed to reload commands: ' + (error.message || 'Unknown error.') });
    }
  },
};