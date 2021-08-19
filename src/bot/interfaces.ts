import { PandaPlayer } from '../bot/commands/PandaPlayer.js';

export interface PandaGuild { pandaPlayer: PandaPlayer }
export interface PandaGuilds { [guildId: string]: PandaGuild }