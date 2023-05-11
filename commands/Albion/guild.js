const
    { EmbedBuilder, SlashCommandBuilder } = require('discord.js'),
    { toError } = require('../../system/functions'),
    { searchGuilds } = require('../../system/albionAPI'),
    emb = require('../../config/embed.json'),
    axios = require('axios');

try {
    module.exports = {
        data: new SlashCommandBuilder()
            .setName("search-guild")
            .setDescription("Search Albion player username")
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
            )
            .addStringOption(option => option
                .setName("username")
                .setDescription("Guild's name")
                .setRequired(true)
            ),
        help: "/search-guild [server] [name]",
        cooldown: 3,
        allowedUIDs: [],

        run: async (client, interaction) => {
            interaction.deferReply({ ephemeral: true });
            const
                { options } = interaction,
                server = options.getString("server"),
                name = options.getString("username");

            const embed = new EmbedBuilder()
                .setTitle("Search Results")
                .setColor(emb.color)
                .setTimestamp()
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) })

            guilds = await searchGuilds(server, name, false);

            if (guilds) {
                embed
                    .setDescription(`**${guilds.length}** results found for **${name}** on **${server}** server`)
                    .setFields({ name: "Results", value: guilds.map((user, i) => `**${i + 1}.** [${guilds.AllianceName}] ${guilds.GuildName}`).join("\n") })
            } else {
                embed.setDescription(`No results found for **${name}** on **${server}**`)
            }

            interaction.editReply({
                embeds: [embed]
            });
        }
    }
} catch (e) { toError(e, null, 0, false) }