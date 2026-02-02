const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  category: 'utilities',
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Shows bot latency.'),
  async execute(interaction) {
    await interaction.reply({ content: 'Pinging...' });
    const sent = await interaction.fetchReply();
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    await interaction.editReply(`Pong! Latency: ${latency}ms | API: ${apiLatency}ms`);
  },
};
