const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { embedColor } = require('../../config');

module.exports = {
  category: 'utilities',
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Shows the avatar of a user.')
    .addUserOption((option) =>
      option.setName('user').setDescription('User to show the avatar of.'),
    ),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const avatarUrl = targetUser.displayAvatarURL({ size: 4096 });

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle(`${targetUser.username}'s avatar`)
      .setImage(avatarUrl);

    if (targetUser.id === '277375966341496832') { // bot creator's user ID
      embed.setFooter({ text: 'This is my creator :3' });
    } else if (targetUser.id === '1462181725680701666') { // bot application ID
      embed.setFooter({ text: "That's me!" });
    }

    const downloadButton = new ButtonBuilder()
      .setLabel('Download avatar')
      .setStyle(ButtonStyle.Link)
      .setURL(avatarUrl);

    const row = new ActionRowBuilder().addComponents(downloadButton);

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
