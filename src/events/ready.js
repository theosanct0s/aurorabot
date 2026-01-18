const { Events } = require('discord.js');
const { logger } = require('../utils/logger');
const { registerCommands } = require('../lib/commandLoader');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    try {
      await registerCommands(client, client.commandData);
    } catch (error) {
      logger.error('Failed to register commands.', error);
    }

    try {
      client.user.setPresence({
        activities: [
          {
            name: '💜',
            type: 4, // 0=Playing | 1=Streaming | 2=Listening | 3=Watching | 4=Custom | 5=Competing
          },
        ],
        status: 'online',
      });
    } catch (error) {
      logger.error('Could not set presence.', error);
    }

    logger.success('Aurora is online 💜');
  },
};
