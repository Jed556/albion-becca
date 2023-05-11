const
    { EmbedBuilder, SlashCommandBuilder, ActivityType } = require('discord.js'),
    { toError } = require('../../system/functions'),
    { searchUsers } = require('../../system/albionAPI'),
    emb = require('../../config/embed.json'),
    axios = require('axios');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("search-player")
            .setDescription("Search Albion player username")
            .setDefaultMemberPermissions()
            .setDMPermission(true)
            .addStringOption(option => option
                .setName("server")
                .setDescription("Server to search")
                .setRequired(true)
                .addChoices(
                    { name: "East", value: "east" },
                    { name: "West", value: "west" },
                )
            )
            .addStringOption(option => option
                .setName("username")
                .setDescription("Player's username")
                .setRequired(true)
            ),
        help: "/search-player [server] [username]",
        cooldown: 3,
        allowedUIDs: [],

        run: async (client, interaction) => {
            interaction.deferReply({ ephemeral: true });
            const
                { options } = interaction,
                server = options.getString("server"),
                username = options.getString("username");

            users = await searchUsers(server, username, false);
            interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setTitle("Search Results")
                    .setColor(emb.color)
                    .setTimestamp()
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`**${users.size}** results found for **${username}** on **${server}**`)
                    .addField("Results", users.map((user, i) => `**${i + 1}.** [${user.AllianceName}] [${user.GuildName}] ${user.Name}`).join("\n"))
                ]
            });
        }
    }
} catch (e) { toError(e, null, 0, false) }