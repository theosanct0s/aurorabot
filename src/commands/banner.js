const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { embedColor } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banner')
    .setDescription('Show a user banner.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('User whose banner will be shown.'),
    ),
  async execute(interaction) {
    const selectedUser = interaction.options.getUser('user');
    const targetId = selectedUser?.id || interaction.user.id;

    let user;
    try {
      user = await interaction.client.users.fetch(targetId, { force: true });
    } catch (error) {
      await interaction.reply({ content: 'User not found.', ephemeral: true });
      return;
    }

    const bannerUrl = user.bannerURL({ size: 4096 }) || user.bannerURL();

    if (!bannerUrl) {
      await interaction.reply({ content: 'That user has no banner set.', ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle(`${user.username}'s banner`)
      .setImage(bannerUrl);

    const downloadButton = new ButtonBuilder()
      .setLabel('Download banner')
      .setStyle(ButtonStyle.Link)
      .setURL(bannerUrl);

    const row = new ActionRowBuilder().addComponents(downloadButton);

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
