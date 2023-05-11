const
    { toError } = require("./functions"),
    axios = require('axios');

/**
 *
 * @param {String} server Albion server (east / west)
 * @param {String} name Albion username
 * @param {Boolean} first Return first result (true / false)
 * @returns Albion user search results
 */
async function searchUsers(server, name, first) {
    const API = getAPI(server);
    const search = API + `/search?q=${name}`;

    const data = await axios.get(search, { timeout: 0 });

    if (first) return data.players[0];
    else return data.players;
}

/**
 *
 * @param {String} server Albion server (east / west)
 * @param {String} name Albion guild name
 * @param {Boolean} first Return first result (true / false)
 * @returns Albion user search results
 */
async function searchGuilds(server, name, first) {
    const API = getAPI(server);
    const search = API + `/search?q=${name}`;

    const data = await axios.get(search, { timeout: 0 });

    if (first) return data.guilds[0];
    else return data.guilds;
}

/**
 *
 * @param {String} server (east / west)
 * @returns API URL
 */
function getAPI(server) {
    if (!server) return toError("No server provided", "alpionAPI/getAPI", 0, false);
    server = server.toLowerCase();
    const API = `https://gameinfo${server == "east" ? "-sgp" : ""}.albiononline.com/api/gameinfo`;

    return API;
}

module.exports = {
    searchUsers,
    searchGuilds,
    getAPI
};