const Discord = require('discord.js');
const { help, ping, mc, game, invalid } = require('../commands/general');
const PandaPlayer = require('../voice/PandaPlayer');

/**
 * Handles BOT's commands
 * @param {{pandaPlayer: PandaPlayer}} guild
 * @param {Discord.Message} msg 
 * @param {string} cmd 
 * @param {string} args 
 */
module.exports = (guild, msg, cmd, args = '') => {
    switch (cmd) {
        // General
        case 'help' :       help(msg);                          break;
        case 'ping' :       ping(msg);                          break;
        case 'mc'   :       mc(msg);                            break;
        case 'game' :       game(msg, args);                    break;
        // Panda Player
        case 'join':        guild.pandaPlayer.join(msg);        break;
        case 'leave':
        case 'disconnect':  guild.pandaPlayer.leave(msg);       break;
        case 'play':        guild.pandaPlayer.play(msg, args);  break;
        case 'pause':       guild.pandaPlayer.pause(msg);       break;
        case 'resume':      guild.pandaPlayer.resume(msg);      break;
        case 'skip':        guild.pandaPlayer.skip(msg);        break;
        case 'clear':       guild.pandaPlayer.clear(msg);       break;
        case 'queue':       guild.pandaPlayer.getQueue(msg);    break;
        // Invalid Command
        default:            invalid(msg);                       break;
    }
}