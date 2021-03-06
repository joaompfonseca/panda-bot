import { Client, InteractionCollector, MessageActionRow, MessageComponentInteraction, MessageEmbed } from 'discord.js';
import { VoiceConnection, AudioPlayer, AudioResource } from '@discordjs/voice';
import { PandaChat } from './handlers/PandaChat.js';
import { PandaMessage } from './handlers/PandaMessage.js';
import { PandaPlayer } from './commands/PandaPlayer.js';

/* PandaRequest */
export interface PandaRequest {
    duration: number,
    formatedDuration: string,
    title: string,
    type: PandaRequestTypes,
    url: string
}

/* PandaRequestTypes */
export enum PandaRequestTypes {
    SOUNDCLOUD = 'SC',
    SPOTIFY = 'SP',
    YOUTUBE = 'YT'
}

/* PandaAudio */
export interface PandaAudio {
    adapterCreator: Function;
    chat: PandaChat;
    client: Client;
    connection: VoiceConnection | null;
    connectionTimeout: NodeJS.Timeout;
    guildId: string;
    intCollector: InteractionCollector<MessageComponentInteraction>;
    player: AudioPlayer;
    playerPanelMsg: PandaMessage | null;
    queue: PandaRequest[];
    resource: AudioResource | null;
    vcId: string | null;

    addToPlaylist(req: string): Promise<boolean>;
    clear(chat: PandaChat, vcId: string | null): Promise<void>;
    clearConnectionTimeout(): void;
    collect(int: MessageComponentInteraction): Promise<void>;
    connectTo(vcId: string): Promise<void>;
    getPlayerPanel(): { components: MessageActionRow[], embeds: MessageEmbed[] };
    getPlaylistPage(page: number, showButtons: boolean): { components: MessageActionRow[], embeds: MessageEmbed[] };
    join(chat: PandaChat, vcId: string | null): Promise<void>;
    leave(chat: PandaChat, vcId: string | null): Promise<void>;
    pause(chat: PandaChat, vcId: string | null): Promise<void>;
    play(chat: PandaChat, vcId: string | null, req: string): Promise<void>;
    playlist(chat: PandaChat, page: string): Promise<void>;
    setConnectionTimeout(): void;
    search(chat: PandaChat, userId: string, vcId: string | null, req: string): Promise<void>;
    skip(chat: PandaChat, vcId: string | null): Promise<void>;
    start(): Promise<void>;
    unpause(chat: PandaChat, vcId: string | null): Promise<void>;
}

/* PandaGuild */
export interface PandaGuild { pandaPlayer: PandaPlayer }

/* PandaGuilds */
export interface PandaGuilds { [guildId: string]: PandaGuild }