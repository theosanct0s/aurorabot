const { SlashCommandBuilder, codeBlock, EmbedBuilder } = require('discord.js');
const util = require('node:util');
const { ownerId, embedColor } = require('../../config');

module.exports = {
  category: 'owner',
  // owner-only commands are intentionally hidden from /help
  hidden: true,
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('Evaluate JavaScript (owner only).')
    .addStringOption((option) =>
      option
        .setName('code')
        .setDescription('Code to evaluate')
        .setRequired(true),
    ),
  async execute(interaction) {
    if (!ownerId || interaction.user.id !== ownerId) {
      await interaction.reply({ content: 'You are not allowed to use this command.', ephemeral: true });
      return;
    }

    const code = interaction.options.getString('code');

    await interaction.deferReply({ ephemeral: true });

    try {
      const context = {
        interaction,
        client: interaction.client,
        guild: interaction.guild,
        channel: interaction.channel,
        user: interaction.user,
        member: interaction.member,
      };

      const argNames = Object.keys(context);
      const argValues = Object.values(context);

      const runEval = async (source, asExpression = false) => {
        // eslint-disable-next-line no-new-func
        const asyncFn = new Function(
          ...argNames,
          `return (async () => { ${asExpression ? 'return ( ' + source + ' );' : source} })();`,
        );

        return asyncFn(...argValues);
      };

      let result = await runEval(code, false);

      if (typeof result === 'undefined' && !/return\s/.test(code)) {
        result = await runEval(code, true);
      }

      const output = util.inspect(result, { depth: 2, maxArrayLength: 20, maxStringLength: 1_000 });

      const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle('Eval result')
        .setDescription(codeBlock('js', output));

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      const message = error?.stack || String(error);
      const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle('Eval error')
        .setDescription(codeBlock('ansi', message));

      await interaction.editReply({ embeds: [embed] });
    }
  },
};
