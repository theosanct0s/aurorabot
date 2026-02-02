const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { embedColor } = require('../../config');

module.exports = {
  category: 'utilities',
  data: new SlashCommandBuilder()
    .setName('servericon')
    .setDescription('Shows the server icon.')
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
        content: 'You need to share that server with me to view its icon.',
        ephemeral: true,
      });
      return;
    }

    const iconUrl = guild.iconURL({ size: 4096 });

    if (!iconUrl) {
      await interaction.reply({ content: 'This server does not have an icon set.', ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle(`${guild.name}`)
      .setImage(iconUrl);

    const downloadButton = new ButtonBuilder()
      .setLabel('Download icon')
      .setStyle(ButtonStyle.Link)
      .setURL(iconUrl);

    const row = new ActionRowBuilder().addComponents(downloadButton);

    const ephemeral = Boolean(requestedServer && guild.id !== interaction.guildId);

    await interaction.reply({ embeds: [embed], components: [row], ephemeral });
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
