const { Schema, model } = require('mongoose');

module.exports = model("API", new Schema({
    _id: {
        type: String,
        required: true
    },
    dcGuildId: {
        type: String,
        required: true
    },
    serverAPI: {
        type: String,
        default: "west"
    },
    guildName: {
        type: String,
        required: true
    },
    killChannel: {
        type: Number,
        required: true
    },
    deathChannel: {
        type: Number,
        required: true
    },
    statusChannel: {
        type: Number,
        required: true
    },
}), "api");