import { TextBasedChannels } from 'discord.js';
import { VoiceConnection, AudioPlayer, AudioResource } from '@discordjs/voice';
import { PandaPlayer } from './commands/PandaPlayer.js';

/* PandaRequestTypes */
export enum PandaRequestTypes {
    SOUNDCLOUD_TRACK = 'soundcloud track',
    SPOTIFY_TRACK = 'spotify track',
    YOUTUBE_VIDEO = 'youtube video'
}

/* PandaRequest */
export interface PandaRequest {
    title: string,
    type: PandaRequestTypes,
    url: string
}

/* PandaAudio */
export interface PandaAudio {
    adapterCreator: Function;
    chat: TextBasedChannels | null;
    connection: VoiceConnection | null;
    guildId: string;
    player: AudioPlayer;
    queue: PandaRequest[];
    resource: AudioResource | null;
    vcId: string | null;

    join(chat: TextBasedChannels, vcId: string | null): void;
    connectTo(vcId: string): void;
    leave(chat: TextBasedChannels): void;
    play(chat: TextBasedChannels, vcId: string | null, req: string): Promise<void>;
    addToQueue(req: string): Promise<void>;
    start(): Promise<void>;
    pause(chat: TextBasedChannels, vcId: string | null): void;
    unpause(chat: TextBasedChannels, vcId: string | null): void;
    skip(chat: TextBasedChannels, vcId: string | null): void;
    clear(chat: TextBasedChannels, vcId: string | null): void;
    getQueue(chat: TextBasedChannels): void;
}

/* PandaGuild */
export interface PandaGuild { pandaPlayer: PandaPlayer }

/* PandaGuilds */
export interface PandaGuilds { [guildId: string]: PandaGuild }