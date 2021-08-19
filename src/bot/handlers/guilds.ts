import { PandaGuilds } from '../interfaces.js';
import { PandaPlayer } from '../commands/PandaPlayer.js';

let guilds: PandaGuilds = {};

/**
 * Handles Bot's guilds.
 * @param guildId 
 * @returns 
 */
export function guildHandler(guildId: string) {
    if (!guilds[guildId])
        guilds[guildId] = { pandaPlayer: new PandaPlayer() }
    return guilds[guildId];
}