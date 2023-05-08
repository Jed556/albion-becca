const { Schema, model } = require('mongoose');

module.exports = model("API", new Schema({
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
    serverStatChannel: {
        type: Number,
        required: true
    },
    serverAPI: {
        type: String,
        default: "east"
    },
    time: Number
}), "api");