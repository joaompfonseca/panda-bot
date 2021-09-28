import { Client } from 'discord.js';
import { PandaGuild } from '../interfaces.js';
import { PandaChat } from './PandaChat.js';
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
export async function cmdHandler(client: Client, cmd: string, args: string, chat: PandaChat, guild: PandaGuild, time: number, vcId: string | null): Promise<void> {
    switch (cmd) {
        /* General */
        case 'game':        await game(chat, args); break;
        case 'help':        await help(chat); break;
        case 'info':        await info(client, chat); break;
        case 'ping':        await ping(chat, time); break;
        case 'mc':          await mc(chat, args); break;
        /* Panda Player */
        case 'clear':       await guild.pandaPlayer.clear(chat, vcId); break;
        case 'join':        await guild.pandaPlayer.join(chat, vcId); break;
        case 'disconnect':
        case 'leave':
        case 'stop':        await guild.pandaPlayer.leave(chat, vcId); break;
        case 'pause':       await guild.pandaPlayer.pause(chat, vcId); break;
        case 'play':        await guild.pandaPlayer.play(chat, vcId, args); break;
        case 'playlist':
        case 'queue':       await guild.pandaPlayer.playlist(chat, args); break;
        case 'skip':        await guild.pandaPlayer.skip(chat, vcId); break;
        case 'resume':
        case 'unpause':      await guild.pandaPlayer.unpause(chat, vcId); break;
        /* Invalid Command */
        default:            await unknown(chat); break;
    }
    return;
}