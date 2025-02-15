require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, Events, ChannelType, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'comandos');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`Comando carregado: ${command.data.name}`);
    } else {
        console.log(`[WARNING] O comando em ${filePath} está faltando a propriedade "data" ou "execute".`);
    }
}

client.once('ready', () => {
    console.log('Bot online!');
});

client.on(Events.InteractionCreate, async interaction => {

    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'recrutamentoModal') {
            // Coleta os dados do modal (APENAS OS CAMPOS QUE VOCÊ MANTEVE)
            const nome = interaction.fields.getTextInputValue('nome');
            const nivel = parseInt(interaction.fields.getTextInputValue('nivel'), 10);
            const classe = interaction.fields.getTextInputValue('classe');
            const world = interaction.fields.getTextInputValue('world');

            // --- Validação básica ---
            if (isNaN(nivel)) {
                return interaction.reply({ content: 'Nível precisa ser um número!', ephemeral: true });
            }

            // --- Monta a mensagem de confirmação (SIMPLIFICADA) ---
            let confirmacao = `Recrutamento para a guilda Myth!\n\n`;
            confirmacao += `**Nome:** ${nome}\n`;
            confirmacao += `**Nível:** ${nivel}\n`;
            confirmacao += `**Classe:** ${classe}\n`;
            confirmacao += `**Mundo:** ${world}\n`;

            // --- Cria o Canal do Ticket ---
            try {
                const cargoSuporteId = '896731643904131103'; // ID do cargo de suporte
                const categoriaTicketsId = '1108707286827946025'; // ID da categoria (opcional)

                const ticketChannel = await interaction.guild.channels.create({
                    name: `📜╺╸Recrutamento-${nome.replace(/\s+/g, '-')}`, // Formata o nome do canal
                    type: ChannelType.GuildText,
                    parent: categoriaTicketsId,  // Categoria (opcional)
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone, // @everyone
                            deny: [PermissionFlagsBits.ViewChannel], // Não pode ver
                        },
                        {
                            id: interaction.user.id, // Usuário que *enviou* o modal
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                        },
                        {
                            id: cargoSuporteId, // Cargo de suporte
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                        },
                    ],
                    topic: interaction.user.id, // Define o tópico do canal como o ID do usuário
                });

                  // --- Cria o Embed de LOG ---
                const logEmbed = new EmbedBuilder()  // <--  Cria o Embed
                    .setColor(0x0099ff)  // <--  Define a cor
                    .setTitle('Novo Pedido de Recrutamento') // <--  Título
                    .addFields( // <--  Adiciona os campos
                        { name: "Nome", value: nome },
                        { name: "Nível", value: nivel.toString(), inline: true },
                        { name: "Classe", value: classe, inline: true },
                        { name: "Mundo", value: world, inline: true},
                    )
                    .setTimestamp(); // <--  Adiciona o timestamp

                // --- Envia a Mensagem no Canal do Ticket (usando o Embed) ---
                const mentionRole = `<@&${cargoSuporteId}>`; // Formata a menção ao cargo
                //await ticketChannel.send(confirmacao + `\n${mentionRole}`); //  Substitui pela linha de baixo.
                await ticketChannel.send({ embeds: [logEmbed], content: `${mentionRole}`}); //Envia o embed.


                // Responde ao usuário (ephemeral)
                await interaction.reply({ content: `Seu ticket foi criado: ${ticketChannel}`, ephemeral: true });

                // --- (Opcional) Botão de Fechar Ticket ---
                const closeButton = new ButtonBuilder()
                    .setCustomId('suporte_fechar_ticket')
                    .setLabel('Fechar Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒');

                const closeRow = new ActionRowBuilder().addComponents(closeButton);

                // Envia mensagem com botão no canal criado
                await ticketChannel.send({
                    components: [closeRow],
                });
                // --- Coletor para o Botão "Fechar Ticket" ---
                const closeFilter = closeI => closeI.customId === 'suporte_fechar_ticket' && (closeI.user.id === interaction.user.id || closeI.member.roles.cache.has(cargoSuporteId));
                const closeCollector = ticketChannel.createMessageComponentCollector({ closeFilter, time: 60000 * 60 * 24 });

                closeCollector.on('collect', async closeInteraction => {
                    await closeInteraction.deferUpdate();
                    await ticketChannel.delete(); // Ou arquivar, se preferir
                });
                closeCollector.on('end', collected => { //Adiciona o coletor.
                    if(collected.size === 0){
                      ticketChannel.send({content: 'O tempo para fechar este ticket expirou. Se precisar encerrá-lo, clique no botão novamente ou entre em contato com a equipe de suporte.'})
                    }
                });

            } catch (error) {
                console.error("Erro ao criar o canal do ticket:", error);
                await interaction.reply({ content: 'Houve um erro ao criar o seu ticket. Tente novamente.', ephemeral: true });
            }

            return; // Sai da função
        }
    }

    if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

    let command = null;

    if (interaction.isChatInputCommand()) {
        command = client.commands.get(interaction.commandName);
    } else if (interaction.isButton()) {
        const commandName = interaction.customId.split('_')[0];
        command = client.commands.get(commandName);
    }

    if (!command) {
        console.error(`Nenhum comando correspondente a ${interaction.commandName || interaction.customId} foi encontrado.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Ocorreu um erro ao executar este comando!', ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);