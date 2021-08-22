import { TextBasedChannels } from 'discord.js';
import { DiscordGatewayAdapterCreator } from '@discordjs/voice';
import { PandaGuild, PandaGuilds } from '../interfaces.js';
import { PandaPlayer } from '../commands/PandaPlayer.js';

let guilds: PandaGuilds = {};

/**
 * Handles Bot's guilds.
 * @param guildId 
 * @param chat 
 * @param adapterCreator 
 * @returns 
 */
export function guildHandler(guildId: string, chat: TextBasedChannels, adapterCreator: DiscordGatewayAdapterCreator): PandaGuild {
    if (!guilds[guildId])
        guilds[guildId] = { pandaPlayer: new PandaPlayer(adapterCreator, chat, guildId) }
    return guilds[guildId];
}