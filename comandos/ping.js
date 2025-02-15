const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping') // Nome do comando (o mesmo que você usará no Discord)
        .setDescription('Responde com Pong!'),
    async execute(interaction) {
        await interaction.reply('Pong!');
    },
};