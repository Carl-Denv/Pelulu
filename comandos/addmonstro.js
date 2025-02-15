const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adicionar_monstro')
        .setDescription('Adiciona informações sobre um monstro (ADMIN ONLY - Simplificado).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option.setName('nome').setDescription('Nome do Monstro').setRequired(true))
        .addIntegerOption(option => option.setName('nivel').setDescription('Nível do Monstro').setRequired(true))
        .addIntegerOption(option => option.setName('hp').setDescription('HP do Monstro').setRequired(true))
        .addStringOption(option => option.setName('localizacao').setDescription('Localização do Monstro').setRequired(true))
        .addStringOption(option => option.setName('elemento').setDescription('Elemento do Monstro').setRequired(true)),

    async execute(interaction) {
        // Obtém os valores das opções
        const nome = interaction.options.getString('nome');
        const nivel = interaction.options.getInteger('nivel');
        const hp = interaction.options.getInteger('hp');
        const localizacao = interaction.options.getString('localizacao');
        const elemento = interaction.options.getString('elemento');

        // --- Validação básica (opcional, mas recomendado) ---
        if (isNaN(nivel) || isNaN(hp)) {
            return interaction.reply({ content: 'Nível e HP precisam ser números!', ephemeral: true });
        }


        // --- Carrega os monstros existentes ---
        let monstros = {};
        try {
            const data = fs.readFileSync('monstros.json', 'utf8');
            monstros = JSON.parse(data);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error('Erro ao ler monstros.json:', error);
                return interaction.reply({ content: 'Erro ao adicionar monstro.', ephemeral: true });
            }
        }

        // --- Adiciona o novo monstro ---
        monstros[nome.toLowerCase()] = {
            nome: nome,
            nivel: nivel,
            hp: hp,
            localizacao: localizacao,
            elemento: elemento,
            // ... outros campos (se você quiser adicionar mais opções) ...
        };

        // --- Salva os dados ---
        try {
            fs.writeFileSync('monstros.json', JSON.stringify(monstros, null, 2), 'utf8');
            await interaction.reply({ content: `Monstro "${nome}" adicionado com sucesso!`, ephemeral: true });
        } catch (error) {
            console.error('Erro ao salvar monstros.json:', error);
            await interaction.reply({ content: 'Erro ao adicionar monstro.', ephemeral: true });
        }
    }
};