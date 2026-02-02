const { SlashCommandBuilder } = require('discord.js');
const { version } = require('../../../package.json');

module.exports = {
  category: 'utilities',
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Shows bot info.'),
  async execute(interaction) {
    const client = interaction.client;
    const latency = Math.round(client.ws.ping);
    const content = [
      `⏱️ Latency: ${latency}ms`,
      `🧬 Version: v${version}`,
    ].join('\n');

    await interaction.reply(content);
  },
};
