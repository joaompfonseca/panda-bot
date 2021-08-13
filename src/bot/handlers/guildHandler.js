const Discord = require('discord.js');
const PandaPlayer = require('../voice/PandaPlayer');

let guilds = {};

/**
 * Handles BOT's guilds
 * @param {string} guildID 
 * @returns {Discord.Guild}
 */
module.exports = (guildID) => {
    if (!guilds[guildID])
        guilds[guildID] = {
            pandaPlayer: new PandaPlayer()
        };
    return guilds[guildID];
}