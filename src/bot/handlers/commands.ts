import { Client } from 'discord.js';
import { PandaGuild } from '../interfaces.js';
import { PandaChat } from '../commands/PandaChat.js';
import { game, help, info, mc, ping, unknown } from '../commands/general.js';

/**
 * Handles Bot's commands.
 * @param client 
 * @param cmd 
 * @param args 
 * @param guild 
 * @param chat 
 * @param time 
 * @param vcId 
 * @returns 
 */
export function cmdHandler(client: Client, cmd: string, args: string, chat: PandaChat, guild: PandaGuild, time: number, vcId: string | null): void {
    switch (cmd) {
        /* General */
        case 'help':        help(chat); break;
        case 'info':        info(client, chat); break;
        case 'ping':        ping(chat, time); break;
        case 'mc':          mc(chat, args); break;
        case 'game':        game(chat, args); break;
        /* Panda Player */
        case 'join':        guild.pandaPlayer.join(chat, vcId); break;
        case 'leave':
        case 'disconnect':  guild.pandaPlayer.leave(chat); break;
        case 'play':        guild.pandaPlayer.play(chat, vcId, args); break;
        case 'pause':       guild.pandaPlayer.pause(chat, vcId); break;
        case 'unpause':
        case 'resume':      guild.pandaPlayer.unpause(chat, vcId); break;
        case 'skip':        guild.pandaPlayer.skip(chat, vcId); break;
        case 'clear':       guild.pandaPlayer.clear(chat, vcId); break;
        case 'queue':       guild.pandaPlayer.getQueue(chat); break;
        /* Invalid Command */
        default:            unknown(chat); break;
    }
    return;
}