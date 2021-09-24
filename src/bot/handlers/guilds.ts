import { Client, Guild } from 'discord.js';
import { PandaGuild, PandaGuilds } from '../interfaces.js';
import { PandaPlayer } from '../commands/PandaPlayer.js';
import { PandaChat } from '../commands/PandaChat.js';

let guilds: PandaGuilds = {};

/**
 * Handles Bot's guilds.
 * @param chat 
 * @param client 
 * @param guild 
 * @returns 
 */
export function guildHandler(chat: PandaChat, client: Client, guild: Guild): PandaGuild {
    if (!guilds[guild.id])
        guilds[guild.id] = { pandaPlayer: new PandaPlayer(chat, client, guild) }
    return guilds[guild.id];
}