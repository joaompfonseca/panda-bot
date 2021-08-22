import { TextBasedChannels } from 'discord.js';
import { VoiceConnection, AudioPlayer, AudioResource } from '@discordjs/voice';
import { PandaPlayer } from './commands/PandaPlayer.js';

/* PandaRequestTypes */
export enum PandaRequestTypes {
    YOUTUBE_VIDEO = 'YOUTUBE_VIDEO',
    SOUNDCLOUD_TRACK = 'SOUNDCLOUD_TRACK'
}

/* PandaRequest */
export interface PandaRequest {
    resource: AudioResource
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
    isPaused: boolean;
    isPlaying: boolean;
    player: AudioPlayer;
    queue: PandaRequest[];
    seekTime: number;
    vcId: string | null;

    join(chat: TextBasedChannels, vcId: string | null): Promise<void>;
    connectTo(vcId: string): Promise<void>;
    leave(chat: TextBasedChannels): Promise<void>;
    play(): Promise<void>;
    addToQueue(): Promise<void>;
    start(): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    skip(): Promise<void>;
    clear(): Promise<void>;
    getQueue(): Promise<void>;
}

/* PandaGuild */
export interface PandaGuild { pandaPlayer: PandaPlayer }

/* PandaGuilds */
export interface PandaGuilds { [guildId: string]: PandaGuild }