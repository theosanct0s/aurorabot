const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { embedColor } = require('../../config');

const ACTION = 'hug';
const EMOJI = '🤗';
const SEND_TITLE = 'Incoming hug!';
const RETURN_TITLE = 'Hug returned!';

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
      .setLabel('Hug back')
      .setEmoji(EMOJI)
      .setStyle(ButtonStyle.Primary)
      .setDisabled(disabled),
    createDownloadButton(gifUrl),
  );

module.exports = {
  category: 'fun',
  data: new SlashCommandBuilder()
    .setName(ACTION)
    .setDescription('Send a cozy hug to someone.')
    .addUserOption((option) =>
      option
        .setName('target')
        .setDescription('Who should receive the hug?')
        .setRequired(true),
    ),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('target');

    if (!targetUser) {
      await interaction.reply({ content: 'Pick someone to hug first.', ephemeral: true });
      return;
    }

    let gifUrl;

    try {
      gifUrl = await fetchActionGif();
    } catch (error) {
      await interaction.reply({
        content: 'I could not fetch a hug right now. Try again later.',
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

    const description = `${interaction.user} sends a warm hug to ${targetUser}!`;
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
          content: "Hey, you're trying to steal someone else's hug?",
          ephemeral: true,
        });
        return;
      }

      let returnGif;

      try {
        returnGif = await fetchActionGif();
      } catch (error) {
        await buttonInteraction.reply({
          content: 'I could not send a return hug right now. Try again in a moment.',
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
        `${targetUser} sends a hug back to ${interaction.user}!`,
        returnGif,
      );

      const returnRow = new ActionRowBuilder().addComponents(createDownloadButton(returnGif));

      await buttonInteraction.followUp({ embeds: [returnEmbed], components: [returnRow] });
      collector.stop('hug-returned');
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'messageDelete' || reason === 'hug-returned') return;

      const disabledRow = buildActionButtons(gifUrl, customId, true);

      await sentMessage.edit({ components: [disabledRow] }).catch(() => {});
    });
  },
};
