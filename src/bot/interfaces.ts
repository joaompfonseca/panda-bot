import { InteractionCollector, MessageComponentInteraction, MessageOptions } from 'discord.js';
import { VoiceConnection, AudioPlayer, AudioResource } from '@discordjs/voice';
import { PandaChat } from './commands/PandaChat.js';
import { PandaMessage } from './commands/PandaMessage.js';
import { PandaPlayer } from './commands/PandaPlayer.js';

/* PandaRequestTypes */
export enum PandaRequestTypes {
    SOUNDCLOUD_TRACK = 'soundcloud track',
    SPOTIFY_TRACK = 'spotify track',
    YOUTUBE_VIDEO = 'youtube video'
}

/* PandaQueueFrame */
export interface PandaQueueFrame {
    collector: InteractionCollector<MessageComponentInteraction>,
    msg: PandaMessage
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
    queueFrames: PandaQueueFrame[];
    resource: AudioResource | null;
    vcId: string | null;

    join(chat: PandaChat, vcId: string | null): Promise<void>;
    connectTo(vcId: string): Promise<void>;
    leave(chat: PandaChat): Promise<void>;
    play(chat: PandaChat, vcId: string | null, req: string): Promise<void>;
    addToQueue(req: string): Promise<void>;
    start(): Promise<void>;
    pause(chat: PandaChat, vcId: string | null): Promise<void>;
    unpause(chat: PandaChat, vcId: string | null): Promise<void>;
    skip(chat: PandaChat, vcId: string | null): Promise<void>;
    clear(chat: PandaChat, vcId: string | null): Promise<void>;
    getQueue(chat: PandaChat): Promise<void>;
    getQueuePage(page: number, time?: number): Promise<{data: MessageOptions, time: number}>;
}

/* PandaGuild */
export interface PandaGuild { pandaPlayer: PandaPlayer }

/* PandaGuilds */
export interface PandaGuilds { [guildId: string]: PandaGuild }