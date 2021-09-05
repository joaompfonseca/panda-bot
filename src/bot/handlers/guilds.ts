import { DiscordGatewayAdapterCreator } from '@discordjs/voice';
import { PandaGuild, PandaGuilds } from '../interfaces.js';
import { PandaPlayer } from '../commands/PandaPlayer.js';
import { PandaChat } from '../commands/PandaChat.js';

let guilds: PandaGuilds = {};

/**
 * Handles Bot's guilds.
 * @param guildId 
 * @param chat 
 * @param adapterCreator 
 * @returns 
 */
export function guildHandler(guildId: string, chat: PandaChat, adapterCreator: DiscordGatewayAdapterCreator): PandaGuild {
    if (!guilds[guildId])
        guilds[guildId] = { pandaPlayer: new PandaPlayer(adapterCreator, chat, guildId) }
    return guilds[guildId];
}