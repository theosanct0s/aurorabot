const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const { embedColor } = require('../config');

function formatTimestamp(date) {
  const ts = Math.floor(date.getTime() / 1000);
  return `<t:${ts}:f> (<t:${ts}:R>)`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Show info about the server.')
    .addStringOption((option) =>
      option
        .setName('server')
        .setDescription('Server ID or name')
        .setAutocomplete(true),
    ),
  async execute(interaction) {
    const { client } = interaction;
    const requestedServer = interaction.options.getString('server');

    let guild = interaction.guild;

    if (requestedServer) {
      const lowered = requestedServer.toLowerCase();
      guild =
        client.guilds.cache.get(requestedServer) ||
        client.guilds.cache.find((g) => g.name.toLowerCase() === lowered) ||
        client.guilds.cache.find((g) => g.name.toLowerCase().includes(lowered));
    }

    if (requestedServer && !guild) {
      await interaction.reply({
        content: 'I could not find that server. I can only show servers I am in.',
        ephemeral: true,
      });
      return;
    }

    if (!requestedServer && !guild) {
      await interaction.reply({
        content: 'Use this inside a server, or specify a server I am in.',
        ephemeral: true,
      });
      return;
    }

    const requesterMember = await guild.members.fetch(interaction.user.id).catch(() => null);

    if (!requesterMember) {
      await interaction.reply({
        content: 'You need to share that server with me to view its info.',
        ephemeral: true,
      });
      return;
    }

    const owner = await guild.fetchOwner().catch(() => null);
    const ownerLine = owner ? `${owner.user.tag} (${owner.id})` : 'Owner not available';

    const memberCount = guild.memberCount ?? 'Unknown';

    const channels = guild.channels.cache;
    const textCount = channels.filter((ch) => ch.type === ChannelType.GuildText || ch.type === ChannelType.GuildAnnouncement).size;
    const voiceCount = channels.filter((ch) => ch.type === ChannelType.GuildVoice || ch.type === ChannelType.GuildStageVoice).size;
    const totalChannels = textCount + voiceCount;

    const createdAt = formatTimestamp(guild.createdAt);
    const botMember = guild.members.me || (await guild.members.fetch(client.user.id).catch(() => null));
    const botJoinedAt = botMember?.joinedAt ? formatTimestamp(botMember.joinedAt) : 'Unknown';

    const ownerEmoji = '<:crownAurora:1464695540485849310>';
    const membersEmoji = '<:groupAurora:1464695863602581606>';
    const channelsEmoji = '<:balloonsAurora:1464695664209432647>';
    const createdEmoji = '<:calendarAurora:1463356167085494292>';
    const joinedEmoji = '<:heartAurora:1464695815204372634>';
    const idEmoji = '<:idAurora:1464695419249365128>';

    const fields = [
      { name: `${ownerEmoji} Owner`, value: ownerLine, inline: false },
      { name: `${membersEmoji} Members`, value: `${memberCount} total`, inline: false },
      {
        name: `${channelsEmoji} Channels`,
        value: `${totalChannels} total (Text: ${textCount}, Voice: ${voiceCount})`,
        inline: false,
      },
      { name: `${createdEmoji} Created on`, value: createdAt, inline: true },
      { name: `${joinedEmoji} Aurora joined on`, value: botJoinedAt, inline: true },
      { name: `${idEmoji} Server ID`, value: guild.id, inline: true },
    ];

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ size: 512 }))
      .addFields(fields);

    const ephemeral = Boolean(requestedServer && guild.id !== interaction.guildId);

    await interaction.reply({ embeds: [embed], ephemeral });
  },

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused();
    const lowered = focused?.toLowerCase?.() ?? '';

    const matches = interaction.client.guilds.cache
      .filter((g) => !lowered || g.name.toLowerCase().includes(lowered) || g.id.startsWith(lowered))
      .first(25);

    const choices = Array.isArray(matches) ? matches : matches ? [matches] : [];

    await interaction.respond(
      choices.map((g) => ({
        name: `${g.name} (${g.id})`,
        value: g.id,
      })),
    );
  },
};
