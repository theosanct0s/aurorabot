const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedColor } = require('../../config');

module.exports = {
  category: 'utilities',
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

    if (matched?.hidden) {
      await interaction.reply({ content: `Command not found: /${normalizedQuery}`, ephemeral: true });
      return;
    }

    if (normalizedQuery && !matched) {
      await interaction.reply({ content: `Command not found: /${normalizedQuery}`, ephemeral: true });
      return;
    }

    if (matched) {
      const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle(`/${matched.data.name}`)
        .setDescription(matched.data.description || 'No description provided.')
        .addFields({ name: 'Category', value: matched.category || 'Uncategorized', inline: true });

      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const grouped = commands.reduce((acc, cmd) => {
      if (cmd.hidden) return acc;
      const category = (cmd.category || 'utilities').toLowerCase();
      const normalized = category.charAt(0).toUpperCase() + category.slice(1);
      acc[normalized] = acc[normalized] || [];
      acc[normalized].push(cmd);
      return acc;
    }, {});

    const categoryOrder = ['Fun', 'Utilities', 'Moderation'];
    const categories = [...categoryOrder, ...Object.keys(grouped).filter((c) => !categoryOrder.includes(c))];

    const lines = categories
      .filter((category) => grouped[category]?.length)
      .map((category) => {
        const commandLines = grouped[category]
          .sort((a, b) => a.data.name.localeCompare(b.data.name))
          .map((cmd) => `• /${cmd.data.name} — ${cmd.data.description || 'No description provided.'}`)
          .join('\n');

        return `**${category}**\n${commandLines}`;
      });

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle('Available commands')
      .setDescription(lines.join('\n\n'));

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
