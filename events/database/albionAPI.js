const
    { EmbedBuilder } = require('discord.js'),
    { toError } = require('../../system/functions'),
    apiConfig = require('../../schemas/Status'),
    mongoose = require('mongoose'),
    axios = require('axios'),
    emb = require('../../config/embed.json');

// Variable checks (Use .env if present)
require('dotenv').config();
let OwnerID
if (process.env.ownerID) {
    OwnerID = process.env.ownerID;
} else {
    const { ownerID } = require('../../config/client.json');
    OwnerID = ownerID;
}

module.exports = {
    name: "ready",
    once: true,

    run: async (client) => {
        try {
            // The Albion Killboard API endpoint
            const server = "east"; // east / west
            const interval = 1; // update interval in minutes

            // Build api url
            const albionApi = `https://gameinfo${server.toLowerCase() == "east" ? "-sgp" : ""}.albiononline.com/api/gameinfo`;

            // The previously retrieved data
            let previousData = [];

            // Retrieve the latest kill data
            const getKillData = async () => {
                try {
                    // Fetch the latest kill data from the Albion Killboard API
                    const response = await axios.get(`${albionApi}/events`, { timeout: 0 });
                    const data = response.data;

                    // Log the latest kill data
                    if (data.length > 0) {
                        for (const kill of data) {
                            // Check if the current kill object is already present in previousData
                            const alreadyExists = previousData.some((prevKill) => prevKill.EventId === kill.EventId);

                            if (!alreadyExists) {
                                let
                                    send = 0,
                                    log = new EmbedBuilder()
                                        .setTitle("Kill")
                                        .setColor(emb.color)
                                        .setTimestamp()
                                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

                                if (kill.Killer.GuildName == "EDGERUNNERS") {
                                    //console.log(`${kill.Killer.Name} killed ${kill.Victim.Name} using ${kill.Killer.Equipment.MainHand.Type} at ${kill.TimeStamp}`);
                                    log.setDescription(`${kill.Killer.Name} killed ${kill.Victim.Name} using ${kill.Killer.Equipment.MainHand.Type} at ${kill.TimeStamp}`);
                                    send++;
                                } else if (kill.Victim.GuildName == "EDGERUNNERS") {
                                    //console.log(`${kill.Victim.Name} was killed by ${kill.Killer.Name} using ${kill.Killer.Equipment.MainHand.Type} at ${kill.TimeStamp}`);
                                    log.setDescription(`${kill.Victim.Name} was killed by ${kill.Killer.Name} using ${kill.Killer.Equipment.MainHand.Type} at ${kill.TimeStamp}`);
                                    send++;
                                }

                                if (send) {
                                    client.users.fetch(OwnerID, false).then((user) => {
                                        user.send({ embeds: [log] });
                                    });
                                }
                            }
                            previousData.push(kill); // Add the current kill object to previousData (idk but API returns some duplicate data)
                        }

                        previousData = data; // Update the previously retrieved data
                    }
                } catch (error) {
                    if (error.code === 'ECONNRESET') {
                        toError("A connection error occurred. Please check your network connection.", "ECONNRESET");
                    } else if (error.code === 'ETIMEDOUT') {
                        toError("Connection timed out. Server did not respond immediately", "ETIMEDOUT");
                    } else {
                        toError(error);
                    }
                }
            };

            // Call the getKillData function to retrieve the latest kill data
            setInterval(getKillData, interval * 1000 * 60);
        } catch (e) {
            console.log(toError(e, "Database Error"));
        }
    }
}