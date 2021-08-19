import { TextBasedChannels, VoiceChannel, StageChannel } from 'discord.js';
import { PandaGuild } from '../interfaces.js'
import { help, ping, mc, game, unknown } from '../commands/general.js';
import { PandaPlayer } from '../commands/PandaPlayer.js'

/**
 * Handles Bot's commands.
 * @param cmd 
 * @param args 
 * @param guild 
 * @param chat 
 * @param vc 
 */
export function cmdHandler(cmd: string, args: string, guild: PandaGuild, chat: TextBasedChannels, vc: VoiceChannel | StageChannel, time: number): void {
    switch (cmd) {
        // General
        case 'help' :       help(chat);                         break;
        case 'ping' :       ping(chat, time);                   break;
        case 'mc'   :       mc(chat);                           break;
        case 'game' :       game(chat, args);                   break;
        // Panda Player
        //case 'join':        guild.pandaPlayer.join(msg);        break;
        //case 'leave':
        //case 'disconnect':  guild.pandaPlayer.leave(msg);       break;
        //case 'play':        guild.pandaPlayer.play(msg, args);  break;
        //case 'pause':       guild.pandaPlayer.pause(msg);       break;
        //case 'resume':      guild.pandaPlayer.resume(msg);      break;
        //case 'skip':        guild.pandaPlayer.skip(msg);        break;
        //case 'clear':       guild.pandaPlayer.clear(msg);       break;
        //case 'queue':       guild.pandaPlayer.getQueue(msg);    break;
        // Invalid Command
        default     :       unknown(chat);                       break;
    }
    return;
}