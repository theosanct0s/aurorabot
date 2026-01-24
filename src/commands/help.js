const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedColor } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show available commands.')
    .addStringOption((option) =>
      option
        .setName('command')
        .setDescription('Get help for a specific command.')
        .setRequired(false),
    ),
  async execute(interaction) {
    const query = interaction.options.getString('command');
    const commands = interaction.client.commands;

    if (!commands || commands.size === 0) {
      await interaction.reply({ content: 'No commands available yet.', ephemeral: true });
      return;
    }

    const normalizedQuery = query ? query.toLowerCase() : null;
    const matched = normalizedQuery ? commands.get(normalizedQuery) : null;

    if (normalizedQuery && !matched) {
      await interaction.reply({ content: `Command not found: /${normalizedQuery}`, ephemeral: true });
      return;
    }

    if (matched) {
      const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle(`/${matched.data.name}`)
        .setDescription(matched.data.description || 'No description provided.');

      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const lines = commands.map((cmd) => `• /${cmd.data.name} — ${cmd.data.description || 'No description provided.'}`);
    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle('Available commands')
      .setDescription(lines.join('\n'));

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
