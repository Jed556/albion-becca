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
            interaction.deferReply({ ephemeral: true });

            const
                { options } = interaction,
                server = options.getString("server");

            API = getAPI(server);

            // Fetch the latest kill data from the Albion Killboard API
            const { data } = await axios.get(`${API}/events`, { timeout: 0 });
            let previousData = [];

            let log = new EmbedBuilder()
                .setTitle("Killboard")
                .setColor(emb.color)
                .setTimestamp()
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

            // Log the latest kill data
            if (data) {
                for (const kill of data) {
                    // Check if the current kill object is already present in previousData
                    const alreadyExists = previousData.some((prevKill) => prevKill.EventId === kill.EventId);

                    if (!alreadyExists)
                        log.setDescription(`${kill.Killer.Name} killed ${kill.Victim.Name} using ${kill.Killer.Equipment.MainHand.Type} at ${kill.TimeStamp}`);

                    previousData.push(kill); // Add the current kill object to previousData (idk but API returns some duplicate data)
                }
            } else {
                log.setColor(emb.errColor).setDescription(`No killboard data found on **${server}**`);
            }

            interaction.reply({ embeds: [log] })
        }
    }
} catch (e) { toError(e, null, 0, false) }