import { VoiceConnection, AudioPlayer, AudioResource } from '@discordjs/voice';
import { PandaPlayer } from './commands/PandaPlayer.js';
import { PandaChat } from './commands/PandaChat.js';

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
    chat: PandaChat;
    connection: VoiceConnection | null;
    guildId: string;
    player: AudioPlayer;
    queue: PandaRequest[];
    resource: AudioResource | null;
    vcId: string | null;

    join(chat: PandaChat, vcId: string | null): void;
    connectTo(vcId: string): void;
    leave(chat: PandaChat): void;
    play(chat: PandaChat, vcId: string | null, req: string): Promise<void>;
    addToQueue(req: string): Promise<void>;
    start(): Promise<void>;
    pause(chat: PandaChat, vcId: string | null): void;
    unpause(chat: PandaChat, vcId: string | null): void;
    skip(chat: PandaChat, vcId: string | null): Promise<void>;
    clear(chat: PandaChat, vcId: string | null): void;
    getQueue(chat: PandaChat): void;
}

/* PandaGuild */
export interface PandaGuild { pandaPlayer: PandaPlayer }

/* PandaGuilds */
export interface PandaGuilds { [guildId: string]: PandaGuild }