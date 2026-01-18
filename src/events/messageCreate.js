const { Events, EmbedBuilder } = require('discord.js');
const { logger } = require('../utils/logger');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;

    const botUser = message.client.user;
    if (!botUser) return;

    const botMentioned = message.mentions.has(botUser, {
      ignoreEveryone: true,
      ignoreRoles: true,
    });

    if (!botMentioned) return;

    const displayName = message.member?.displayName || message.author.username;

    const replyEmbed = new EmbedBuilder()
      .setColor(0x8b5cf6)
      .setTitle(`Hi, ${displayName}!`)
      .setDescription('All good? :)');

    try {
      await message.react('💜');
    } catch (error) {
      logger.warn('Could not add heart reaction.', error);
    }

    try {
      await message.reply({ embeds: [replyEmbed] });
    } catch (error) {
      logger.error('Failed to reply to mention.', error);
    }
  },
};
