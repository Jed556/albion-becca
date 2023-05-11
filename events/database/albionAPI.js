const
    { EmbedBuilder } = require('discord.js'),
    { toError } = require('../../system/functions'),
    { getAPI } = require('../../system/albionAPI'),
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
            const interval = 1; // update interval in minutes

            // Build api url
            const API = getAPI("east");

            // The previously retrieved data
            let previousData = [];

            // Retrieve the latest kill data
            const getKillData = async () => {
                try {
                    // Fetch the latest kill data from the Albion Killboard API
                    const { data } = await axios.get(`${API}/events`, { timeout: 0 });

                    const log = new EmbedBuilder()
                        .setTitle("Killboard")
                        .setColor(emb.color)
                        .setTimestamp()
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

                    // Log the latest kill data
                    if (data.length > 0) {
                        for (const kill of data) {
                            // Check if the current kill object is already present in previousData
                            const alreadyExists = previousData.some((prevKill) => prevKill.EventId === kill.EventId);

                            if (!alreadyExists) {
                                let send = 0;

                                if (kill.Killer.GuildName == "EDGERUNNERS") {
                                    console.log(`${kill.Killer.Name} killed ${kill.Victim.Name} using ${kill.Killer.Equipment.MainHand.Type} at ${kill.TimeStamp}`);
                                    send = log.setDescription(`${kill.Killer.Name} killed ${kill.Victim.Name} using ${kill.Killer.Equipment.MainHand.Type} at ${kill.TimeStamp}`);
                                } else if (kill.Victim.GuildName == "EDGERUNNERS") {
                                    console.log(`${kill.Victim.Name} was killed by ${kill.Killer.Name} using ${kill.Killer.Equipment.MainHand.Type} at ${kill.TimeStamp}`);
                                    send = log.setDescription(`${kill.Victim.Name} was killed by ${kill.Killer.Name} using ${kill.Killer.Equipment.MainHand.Type} at ${kill.TimeStamp}`);
                                }

                                if (send) client.users.fetch(OwnerID, false).then((user) => user.send({ embeds: [send] }));
                            }
                            previousData.push(kill); // Add the current kill object to previousData (idk but API returns some duplicate data)
                        }

                        previousData = data; // Update the previously retrieved data
                    }
                } catch (error) {
                    if (error.code === 'ECONNRESET') {
                        toError("A connection error occurred. Please check your network connection.", "Albion API: ECONNRESET");
                    } else if (error.code === 'ETIMEDOUT') {
                        toError("Connection timed out. Server did not respond immediately", "Albion API: ETIMEDOUT");
                    } else {
                        toError(error);
                    }
                }
            };

            // Call the getKillData function to retrieve the latest kill data
            setInterval(getKillData, interval * 1000 * 60);
        } catch (e) {
            console.log(toError(e, "Albion API"));
        }
    }
}