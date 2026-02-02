const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedColor } = require('../../config');

function formatTimestamp(date) {
  const ts = Math.floor(date.getTime() / 1000);
  return `<t:${ts}:f> (<t:${ts}:R>)`;
}

module.exports = {
  category: 'utilities',
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Show info about a user.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('User to show info for.'),
    ),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const avatarUrl = targetUser.displayAvatarURL({ size: 1024, forceStatic: false });

    let member = null;
    if (interaction.guild) {
      try {
        member = await interaction.guild.members.fetch(targetUser.id);
      } catch (error) {
        if (error.code !== 10007) {
          throw error;
        }
      }
    }

    const createdAt = formatTimestamp(targetUser.createdAt);
    const fields = [
      { name: 'ID', value: targetUser.id, inline: true },
      { name: 'Account created on', value: createdAt, inline: true },
    ];

    if (member) {
      const joinedAt = member.joinedAt ? formatTimestamp(member.joinedAt) : 'Not found';
      fields.push({ name: 'Joined this server on', value: joinedAt, inline: true });
    }

    const infoEmoji = '<:infoAurora:1463356043202396302>';
    const houseEmoji = '<:houseAurora:1463356115877101618>';
    const calendarEmoji = '<:calendarAurora:1463356167085494292>';

    fields[0].name = `${infoEmoji} ID`;
    fields[1].name = `${houseEmoji} Account created on`;
    const calendarField = fields.find((f) => f.name === 'Joined this server on');
    if (calendarField) {
      calendarField.name = `${calendarEmoji} Joined this server on`;
    }

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle(`Info for ${targetUser.username}`)
      .setThumbnail(avatarUrl)
      .addFields(fields);

    await interaction.reply({ embeds: [embed] });
  },
};
