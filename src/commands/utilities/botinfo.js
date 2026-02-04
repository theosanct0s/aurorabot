const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { version, repository } = require('../../../package.json');
const { embedColor, applicationId } = require('../../config');

module.exports = {
  category: 'utilities',
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Shows bot info.'),
  async execute(interaction) {
    const client = interaction.client;
    const latency = Math.round(client.ws.ping);
    const uptimeMs = client.uptime || 0;
    const uptime = `<t:${Math.floor((Date.now() - uptimeMs) / 1000)}:R>`;
    // repository URL from package.json (handles git+ and .git suffixes)
    const repoUrlRaw = typeof repository === 'object' ? repository.url : repository;
    const repoUrl = repoUrlRaw ? repoUrlRaw.replace(/^git\+/, '').replace(/\.git$/, '') : null;

    const descriptionLines = [
      'Hello! I’m Aurora 🌟',
      'I’m always happy to help! Type `/help` to see what I can do.',
    ];

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setDescription(descriptionLines.join('\n'))
      .addFields(
        { name: 'Latency', value: `${latency}ms`, inline: true },
        { name: 'Version', value: `v${version}`, inline: true },
        { name: 'Uptime', value: uptime, inline: true },
      )
      .setFooter({ text: 'Aurora is open source — made with love ❤' });

    const components = [];

    const row = new ActionRowBuilder();

    if (repoUrl) {
      const repoButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel('Repository')
        .setEmoji('<:githubAurora:1468742266268156050>')
        .setURL(repoUrl);

      row.addComponents(repoButton);
    }

    if (applicationId) {
      const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${applicationId}&permissions=2184309767&scope=bot%20applications.commands`;
      const inviteButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel('Invite Aurora')
        .setEmoji('<:heartAurora:1464695815204372634>')
        .setURL(inviteUrl);

      row.addComponents(inviteButton);
    }

    if (row.components.length > 0) {
      components.push(row);
    }

    await interaction.reply({ embeds: [embed], components });
  },
};
