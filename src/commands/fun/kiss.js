const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { embedColor } = require('../../config');

const ACTION = 'kiss';
const EMOJI = '😘';
const SEND_TITLE = 'Incoming kiss!';
const RETURN_TITLE = 'Kiss returned!';

async function fetchActionGif() {
  const response = await fetch(`https://nekos.best/api/v2/${ACTION}`);

  if (!response.ok) {
    throw new Error(`nekos.best responded with ${response.status}`);
  }

  const payload = await response.json();
  return payload?.results?.[0]?.url || null;
}

const createActionEmbed = (title, description, gifUrl) =>
  new EmbedBuilder()
    .setColor(embedColor)
    .setTitle(title)
    .setDescription(description)
    .setImage(gifUrl)
    .setFooter({ text: 'GIFs by nekos.best' });

const createDownloadButton = (gifUrl) =>
  new ButtonBuilder().setLabel('Download GIF').setStyle(ButtonStyle.Link).setURL(gifUrl);

const buildActionButtons = (gifUrl, customId, disabled = false) =>
  new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(customId)
      .setLabel('Kiss back')
      .setEmoji(EMOJI)
      .setStyle(ButtonStyle.Primary)
      .setDisabled(disabled),
    createDownloadButton(gifUrl),
  );

module.exports = {
  category: 'fun',
  data: new SlashCommandBuilder()
    .setName(ACTION)
    .setDescription('Send a sweet kiss to someone.')
    .addUserOption((option) =>
      option
        .setName('target')
        .setDescription('Who should receive the kiss?')
        .setRequired(true),
    ),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('target');

    if (!targetUser) {
      await interaction.reply({ content: 'Pick someone to kiss first.', ephemeral: true });
      return;
    }

    let gifUrl;

    try {
      gifUrl = await fetchActionGif();
    } catch (error) {
      await interaction.reply({
        content: 'I could not fetch a kiss right now. Try again later.',
        ephemeral: true,
      });
      return;
    }

    if (!gifUrl) {
      await interaction.reply({
        content: 'The API returned an unexpected response.',
        ephemeral: true,
      });
      return;
    }

    const description = `${interaction.user} sends a sweet kiss to ${targetUser}!`;
    const embed = createActionEmbed(SEND_TITLE, description, gifUrl);

    const customId = `${ACTION}-return-${interaction.id}`;
    const row = buildActionButtons(gifUrl, customId);

    const sentMessage = await interaction.reply({
      embeds: [embed],
      components: [row],
    });

    const collector = sentMessage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 120_000,
    });

    collector.on('collect', async (buttonInteraction) => {
      if (buttonInteraction.customId !== customId) return;

      if (buttonInteraction.user.id !== targetUser.id) {
        await buttonInteraction.reply({
          content: "Hey, you're trying to steal someone else's kiss?",
          ephemeral: true,
        });
        return;
      }

      let returnGif;

      try {
        returnGif = await fetchActionGif();
      } catch (error) {
        await buttonInteraction.reply({
          content: 'I could not send a return kiss right now. Try again in a moment.',
          ephemeral: true,
        });
        return;
      }

      if (!returnGif) {
        await buttonInteraction.reply({
          content: 'The API returned an unexpected response.',
          ephemeral: true,
        });
        return;
      }

      const disabledRow = buildActionButtons(gifUrl, customId, true);

      await buttonInteraction.update({ components: [disabledRow] });

      const returnEmbed = createActionEmbed(
        RETURN_TITLE,
        `${targetUser} sends a kiss back to ${interaction.user}!`,
        returnGif,
      );

      const returnRow = new ActionRowBuilder().addComponents(createDownloadButton(returnGif));

      await buttonInteraction.followUp({ embeds: [returnEmbed], components: [returnRow] });
      collector.stop('kiss-returned');
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'messageDelete' || reason === 'kiss-returned') return;

      const disabledRow = buildActionButtons(gifUrl, customId, true);

      await sentMessage.edit({ components: [disabledRow] }).catch(() => {});
    });
  },
};
