const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('monstro')
        .setDescription('Busca informações sobre um monstro.')
        .addStringOption(option =>
            option.setName('nome')
                .setDescription('O nome do monstro para buscar.')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const monsterName = interaction.options.getString('nome').toLowerCase();

        try {
            // --- Ler os dados do arquivo JSON ---
            let monstros = {};
            try {
                const data = fs.readFileSync('monstros.json', 'utf8');
                monstros = JSON.parse(data);
            } catch (error) {
                if (error.code === 'ENOENT') {
                    await interaction.editReply({ content: 'Nenhum monstro cadastrado ainda.', ephemeral: true });
                    return;
                }
                throw error; // Se for outro erro, lança
            }

            // --- Buscar o monstro ---
            if (monstros[monsterName]) {
                const monstro = monstros[monsterName];

                // --- Criar o Embed ---
                const embed = new EmbedBuilder()
                    .setColor(0x0099ff)
                    .setTitle(monstro.nome)
                    .setDescription(`Informações sobre o monstro ${monstro.nome}.`)
                    //.setURL(monstro.url) //Se tiver link para coryn club
                    .setThumbnail(monstro.imagem)
                    .addFields(
                        { name: 'Nível', value: monstro.nivel.toString(), inline: true }, //Garante que são string
                        { name: 'HP', value: monstro.hp.toString(), inline: true },
                        { name: 'Elemento', value: monstro.elemento, inline: true },
                        { name: 'Localização', value: monstro.localizacao },
                        { name: 'Defesa Física', value: monstro.defFisica || "N/A", inline: true },
                        { name: 'Resistência Física', value: monstro.resFisica || "N/A", inline: true },
                        { name: 'Defesa Mágica', value: monstro.defMagica || "N/A", inline: true },
                        { name: 'Resistência Mágica', value: monstro.resMagica || "N/A", inline: true },
                        { name: 'Proration Física', value: monstro.prorFisica || "N/A", inline: true },
                        { name: 'Proration Mágica', value: monstro.prorMagica || "N/A", inline: true },
                        { name: 'Proration Neutra', value: monstro.prorNeutra || "N/A", inline: true },
                        { name: 'Resistência Crítica', value: monstro.critResist || "N/A", inline: true }
                    )
                    .setTimestamp();

                if (monstro.retaliacao) {
                    embed.addFields({ name: 'Retaliation', value: monstro.retaliacao });
                }

                await interaction.editReply({ embeds: [embed], ephemeral: true });

            } else {
                await interaction.editReply({ content: `Monstro "${monsterName}" não encontrado.`, ephemeral: true });
            }

        } catch (error) {
            console.error('Erro ao buscar informações do monstro:', error);
            await interaction.editReply({ content: `Erro ao buscar informações do monstro: ${error.message}`, ephemeral: true });
        }
    }
};