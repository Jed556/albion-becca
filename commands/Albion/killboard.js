const
    { EmbedBuilder, SlashCommandBuilder } = require('discord.js'),
    { toError } = require('../../system/functions'),
    { getAPI } = require('../../system/albionAPI'),
    emb = require('../../config/embed.json'),
    axios = require('axios');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("killboard")
            .setDescription("Display latest Albion killboard events")
            .setDefaultMemberPermissions()
            .setDMPermission(true)
            .addStringOption(option => option
                .setName("server")
                .setDescription("Server to search")
                .setRequired(true)
                .addChoices(
                    { name: "East", value: "East" },
                    { name: "West", value: "West" },
                )
            ),
        help: "/killboard [server]",
        cooldown: 3,
        allowedUIDs: [],

        run: async (client, interaction) => {
            const { options } = interaction;
            const server = options.getString("server");

            // Defer the initial reply
            await interaction.deferReply();

            // Get the Albion Killboard API URL for the specified server
            const API = getAPI(server);

            try {
                // Fetch the latest kill data from the Albion Killboard API
                const { data } = await axios.get(`${API}/events`, { timeout: 0 });

                let log = new EmbedBuilder().setColor(emb.color);

                // Log the latest kill data
                if (data) {
                    interaction.editReply({ embeds: [log.setDescription(`**${data.length}** killboard events found on **${server}** server`)] });
                    let previousData = [];
                    for (const kill of data) {
                        const alreadyExists = previousData.some((prevKill) => prevKill.EventId === kill.EventId);
                        if (!alreadyExists) {
                            log.setDescription(`**${kill.Killer.Name}** killed **${kill.Victim.Name}** using **${kill.Killer.Equipment.MainHand.Type}** (${kill.TimeStamp})`);
                            interaction.channel.send({ embeds: [log] });
                            previousData.push(kill); // Add the current kill object to previousData (idk but API returns some duplicate data)
                        }
                    };
                } else {
                    log.setColor(emb.errColor).setDescription(`No killboard data found on **${server}**`);
                    interaction.followUp({ embeds: [log] });
                }
            } catch (e) {
                // Handle any errors that may occur
                toError(e);
                const errorEmbed = new EmbedBuilder()
                    .setColor(emb.errColor)
                    .setDescription(`An error occurred while fetching latest ${server} server killboard data:\`\`\`${e}\`\`\``);
                interaction.followUp({ embeds: [errorEmbed] });
            }
        }
    }
} catch (e) { toError(e, null, 0, false) }