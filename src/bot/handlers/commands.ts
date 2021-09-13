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
export async function cmdHandler(client: Client, cmd: string, args: string, chat: PandaChat, guild: PandaGuild, time: number, vcId: string | null): Promise<void> {
    switch (cmd) {
        /* General */
        case 'help':        await help(chat); break;
        case 'info':        await info(client, chat); break;
        case 'ping':        await ping(chat, time); break;
        case 'mc':          await mc(chat, args); break;
        case 'game':        await game(chat, args); break;
        /* Panda Player */
        case 'join':        await guild.pandaPlayer.join(chat, vcId); break;
        case 'leave':
        case 'disconnect':  await guild.pandaPlayer.leave(chat); break;
        case 'play':        await guild.pandaPlayer.play(chat, vcId, args); break;
        case 'pause':       await guild.pandaPlayer.pause(chat, vcId); break;
        case 'unpause':
        case 'resume':      await guild.pandaPlayer.unpause(chat, vcId); break;
        case 'skip':        await guild.pandaPlayer.skip(chat, vcId); break;
        case 'clear':       await guild.pandaPlayer.clear(chat, vcId); break;
        case 'queue':       await guild.pandaPlayer.getQueue(chat); break;
        /* Invalid Command */
        default:            await unknown(chat); break;
    }
    return;
}