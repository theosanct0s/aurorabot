const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const BATCH_SIZE = 100; // Discord bulkDelete max per call
const BATCH_DELAY_MS = 1200; // small delay to avoid hitting rate limits between batches
const MAX_BULK_DELETE_AGE_MS = 14 * 24 * 60 * 60 * 1000; // Discord refuses messages older than 14 days

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Bulk delete recent messages in this channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('How many messages to delete (2-500).')
        .setMinValue(2)
        .setMaxValue(500)
        .setRequired(true),
    )
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Delete only messages from this user.')
        .setRequired(false),
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: 'Use this command inside a server.', ephemeral: true });
      return;
    }

    const channel = interaction.channel;
    if (!channel || !channel.isTextBased() || channel.isDMBased()) {
      await interaction.reply({ content: 'I can only clear messages in text channels.', ephemeral: true });
      return;
    }

    const amount = interaction.options.getInteger('amount');
    const targetUser = interaction.options.getUser('user') || null;
    const reason = null;

    const me = interaction.guild.members.me;
    if (!me?.permissionsIn(channel).has(PermissionFlagsBits.ManageMessages)) {
      await interaction.reply({ content: 'I need the Manage Messages permission in this channel.', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
      await interaction.reply({ content: 'You need Manage Messages to do that.', ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    let remaining = amount;
    let deletedTotal = 0;
    let skippedOld = 0;

    while (remaining > 0) {
      const fetchSize = Math.min(remaining, BATCH_SIZE);
      const messages = await channel.messages.fetch({ limit: fetchSize });
      if (messages.size === 0) break;

      const filtered = targetUser ? messages.filter((m) => m.author.id === targetUser.id) : messages;

      if (filtered.size === 0) break; // no matching messages in this slice

      const now = Date.now();
      const recent = filtered.filter((m) => now - m.createdTimestamp < MAX_BULK_DELETE_AGE_MS);
      skippedOld += Math.max(filtered.size - recent.size, 0);

      if (recent.size === 0) break; // all matched messages are too old

      const deleted = await channel.bulkDelete(recent, true);
      const deletedCount = deleted.size;
      deletedTotal += deletedCount;
      remaining -= deletedCount;

      if (remaining > 0) {
        await sleep(BATCH_DELAY_MS);
      }
    }

    const parts = [];

    if (deletedTotal > 0) {
      parts.push(targetUser ? `Deleted ${deletedTotal} messages from ${targetUser}.` : `Deleted ${deletedTotal} messages.`);
    } else {
      parts.push('No messages were deleted.');
    }

    if (skippedOld > 0) {
      parts.push(`Skipped ${skippedOld} messages older than 14 days.`);
    }

    await interaction.editReply({ content: parts.join(' ') });
  },
};
