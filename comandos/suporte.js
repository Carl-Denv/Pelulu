const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suporte')
        .setDescription('Abre o sistema de suporte.')
        .setDefaultMemberPermissions(0n), // Desabilita para todos (configure as permissões no Discord)

    async execute(interaction) {
        const cargoSuporteId = '896731643904131103'; // SUBSTITUA PELO ID DO CARGO DE SUPORTE
        const categoriaTicketsId = '1108707286827946025';  // SUBSTITUA PELO ID DA CATEGORIA (opcional)

        if (interaction.isChatInputCommand()) {
            // Comando /suporte: Envia o embed com o botão
            const embed = new EmbedBuilder()
                .setColor(0x00FA9A)
                .setTitle('⠀✧⠀⠀⠀⠀Recrutamento Myth     ...   :leaves:  .')
                .setDescription('__˒ Crie um ticket para recrutamento na guilda Myth!__ \n\nObtenha o Cargo: <@&1109597193863704607>*!*')
                .setThumbnail('https://media.discordapp.net/attachments/898052095452803103/1109698485344804966/24_Sem_Titulo_20230521012519.png?ex=67ae1d00&is=67accb80&hm=c6fd8260da73c977afaeeff19f31ad113e9fd38c9781331c3f0d30b36a228aa4&')
                .setFooter({ text: 'Clique no botão para abrir o ticket', iconURL: 'https://cdn.discordapp.com/attachments/898052095452803103/1130160420020297818/emoji_60.png?ex=67ae10e9&is=67acbf69&hm=235e072335299c3b7796cc5c6fec3f149655a5f3de7db54a87dcfb5bca3a7e2a&' });

            const abrirTicketButton = new ButtonBuilder()
                .setCustomId('suporte_abrir_ticket')
                .setLabel('Abrir Ticket')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('1110220902676828221');

            const row = new ActionRowBuilder().addComponents(abrirTicketButton);

            await interaction.reply({ embeds: [embed], components: [row], ephemeral: false });

        } else if (interaction.isButton()) {
            // Clique no botão "Abrir Ticket"
            if (interaction.customId === 'suporte_abrir_ticket') {
                // --- Cria o Modal (SIMPLIFICADO) ---
                const modal = new ModalBuilder()
                    .setCustomId('recrutamentoModal')
                    .setTitle('Recrutamento Myth');

                // --- Campos do Modal (APENAS OS QUE VOCÊ QUER) ---
                const nomeInput = new TextInputBuilder()
                    .setCustomId('nome')
                    .setLabel('Nome no Jogo (IGN)')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const nivelInput = new TextInputBuilder()
                    .setCustomId('nivel')
                    .setLabel('Nível do Personagem')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const classeInput = new TextInputBuilder()
                    .setCustomId('classe')
                    .setLabel('Classe(s) Principal(is)')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const worldInput = new TextInputBuilder()
                    .setCustomId('world')
                    .setLabel('Mundo (World)')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Ex: Global, Internacional 1, En1')
                    .setRequired(true);

                // --- ActionRows (APENAS PARA OS CAMPOS QUE VOCÊ QUER) ---
                const row1 = new ActionRowBuilder().addComponents(nomeInput);
                const row2 = new ActionRowBuilder().addComponents(nivelInput);
                const row3 = new ActionRowBuilder().addComponents(classeInput);
                const row4 = new ActionRowBuilder().addComponents(worldInput);

                // --- Adiciona ao Modal ---
                modal.addComponents(row1, row2, row3, row4); // Apenas 4 linhas agora

                // --- Mostra o Modal ---
                await interaction.showModal(modal);
                return;
            }

            //Se o botão apertado for o de fechar:
            if (interaction.customId.startsWith('suporte_fechar_ticket')) { // Usa startsWith
              const channel = interaction.channel;

              //Verifica Permissão
              if (!interaction.member.roles.cache.has(cargoSuporteId) && interaction.user.id !== channel.topic) {
                return interaction.reply({ content: 'Você não tem permissão para fechar este ticket.', ephemeral: true });
              }

                await interaction.reply({ content: 'Fechando Ticket...', ephemeral: true });


                setTimeout(async () => {
                    try {
                        await channel.delete(); // Exclui o canal
                    } catch (error) {
                        console.error('Erro ao fechar o canal do ticket:', error);
                        await interaction.followUp({ content: 'Houve um erro ao fechar o ticket.', ephemeral: true });
                    }
                }, 5000); // 5 segundos de delay (opcional)
            }
        }
    }
};