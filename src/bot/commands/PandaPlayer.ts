import { TextBasedChannels } from 'discord.js';
import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, joinVoiceChannel, NoSubscriberBehavior, VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import { SoundCloud, Track as Soundcloud_Track } from 'scdl-core'; const scdl = new SoundCloud(); scdl.connect();
import yts, { PlaylistMetadataResult as Youtube_Playlist, SearchResult as Youtube_Query, VideoMetadataResult as Youtube_Video } from 'yt-search';
import ytdl from 'ytdl-core';
import { PandaAudio, PandaRequest, PandaRequestTypes } from '../interfaces.js';
import { mError, mPanda } from './messages.js';

export class PandaPlayer implements PandaAudio {
    adapterCreator: DiscordGatewayAdapterCreator;
    chat: TextBasedChannels;
    connection: VoiceConnection | null;
    guildId: string;
    player: AudioPlayer;
    queue: PandaRequest[];
    resource: AudioResource | null;
    vcId: string | null;

    constructor(adapterCreator: DiscordGatewayAdapterCreator, chat: TextBasedChannels, guildId: string) {
        this.adapterCreator = adapterCreator;
        this.chat = chat;
        this.connection = null;
        this.guildId = guildId;
        this.player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
        this.queue = [];
        this.resource = null;
        this.vcId = null;
    }

    /**
     * Joins given vc.
     * @param chat 
     * @param vcId 
     * @returns 
     */
    join(chat: TextBasedChannels, vcId: string | null): void {
        try {
            this.chat = chat;
            /* User is not in a vc -> return */
            if (vcId == null) { this.chat.send(mPanda.join.userNotVC); return; }
            /* Bot is in the same vc as User -> return */
            if (this.vcId == vcId) { this.chat.send(mPanda.join.already(this.vcId)); return; }

            /* Bot is in a different vc of User -> leave current vc */
            if (this.vcId != null && this.vcId != vcId) this.leave(chat);
            /* Create a connection */
            this.connectTo(vcId); return;
        }
        catch (e) {
            console.warn(e.message);
            this.chat.send(mError.executeCmd); return;
        }
    }

    /**
     * Connects to given vc.
     * @param vcId 
     * @returns 
     */
    connectTo(vcId: string): void {
        try {
            /* Create a connection */
            this.connection = joinVoiceChannel({ channelId: vcId, guildId: this.guildId, adapterCreator: this.adapterCreator });
            /* Subscribe the player */
            this.connection.subscribe(this.player);
            /* Bot is connected */
            this.connection.once(VoiceConnectionStatus.Ready, () => {
                this.vcId = vcId;
                this.chat.send(mPanda.connectTo.connected(this.vcId!));

                /* Bot is disconnected */
                this.connection!.once(VoiceConnectionStatus.Disconnected, () => {
                    this.chat.send(mPanda.connectTo.disconnected(this.vcId!));
                    /* Save potencial vc to connect to */
                    let vcId = this.connection!.joinConfig.channelId;
                    /* Destroy connection */
                    this.connection!.destroy();

                    /* Bot is moved to another vc */
                    if (vcId != null && vcId != this.vcId) { this.connectTo(vcId); return; }
                    /* Clear vars */
                    this.connection = null;
                    this.vcId = null; return;
                });
            });
            return;
        }
        catch (e) {
            console.warn(e.message);
            this.chat.send(mError.executeCmd); return;
        }
    }

    /**
     * Leaves current vc.
     * @param chat 
     * @returns 
     */
    leave(chat: TextBasedChannels): void {
        try {
            this.chat = chat;
            /* Bot is not in a vc -> return */
            if (this.vcId == null) { this.chat.send(mPanda.leave.botNotVC); return; };

            /* Leave vc */
            this.connection!.disconnect(); return;
        }
        catch (e) {
            console.warn(e.message);
            this.chat.send(mError.executeCmd); return;
        }
    }

    /**
     * Handles play request.
     * @param chat 
     * @param vcId 
     * @param req 
     * @returns 
     */
    async play(chat: TextBasedChannels, vcId: string | null, req: string): Promise<void> {
        try {
            this.chat = chat;
            /* Request is empty -> return */
            if (req.length == 0) { this.chat.send(mPanda.play.emptyQuery); return; }
            /* User is not in a vc -> return */
            if (vcId == null) { this.chat.send(mPanda.play.userNotVC); return; }

            /* Bot is in a different vc of User -> leave current vc */
            if (this.vcId != null && this.vcId != vcId) this.leave(chat);
            /* Bot is not in the same vc as User -> create a connection */
            if (this.vcId != vcId) this.connectTo(vcId);

            /* Add request to queue */
            await this.addToQueue(req);

            /* Bot is not playing -> start playing */
            if (this.player.state.status == AudioPlayerStatus.Idle) { this.start() }
            return;
        }
        catch (e) {
            console.warn(e.message);
            this.chat.send(mError.executeCmd); return;
        }
    }

    /**
     * Adds given request to queue.
     * @param req 
     * @returns 
     */
    async addToQueue(req: string): Promise<void> {
        try {
            let data: Soundcloud_Track | Youtube_Video | Youtube_Playlist | Youtube_Query; let pandaRequest: PandaRequest;
            /* Request is a Soundcloud track (link) */
            if (req.includes('soundcloud.com/')) {
                /* Get data */
                data = await scdl.tracks.getTrack(req);
                /* Format data */
                pandaRequest = {
                    title: `${data.user.username} - ${data.title}`,
                    type: PandaRequestTypes.SOUNDCLOUD_TRACK,
                    url: data.permalink_url
                };
                /* Add request to queue */
                this.queue.push(pandaRequest);
                this.chat.send(mPanda.addToQueue.success(pandaRequest));
            }
            /* Request is a Youtube video (link) */
            else if (req.includes('youtube.com/watch?v=') || req.includes('youtu.be/')) {
                /* Get videoId */
                let videoId = ytdl.getURLVideoID(req);
                /* Get data */
                data = await yts({ videoId: videoId });
                /* Format data */
                pandaRequest = {
                    title: data.title,
                    type: PandaRequestTypes.YOUTUBE_VIDEO,
                    url: data.url
                };
                /* Add request to queue */
                this.queue.push(pandaRequest);
                this.chat.send(mPanda.addToQueue.success(pandaRequest));
            }
            /* Request is a Youtube playlist (link) */
            else if (req.includes('youtube.com/playlist?list=')) {
                /* Get listId */
                let listId = req.substring(req.search('=') + 1);
                /* Get data */
                data = await yts({ listId: listId });
                /* Format data */
                for (let i = 0; i < data.videos.length; i++) {
                    pandaRequest = {
                        title: data.videos[i].title,
                        type: PandaRequestTypes.YOUTUBE_VIDEO,
                        url: `https://youtube.com/watch?v=${data.videos[i].videoId}`
                    };
                    /* Add request to queue */
                    this.queue.push(pandaRequest);
                }
                this.chat.send(mPanda.addToQueue.success(data));
            }
            /* Request is a Youtube video (query) */
            else {
                /* Get data */
                data = await yts(req);
                /* Format data */
                pandaRequest = {
                    title: data.videos[0].title,
                    type: PandaRequestTypes.YOUTUBE_VIDEO,
                    url: data.videos[0].url
                }
                /* Add request to queue */
                this.queue.push(pandaRequest);
                this.chat.send(mPanda.addToQueue.success(pandaRequest));
            }
            return;
        }
        catch (e) {
            let msg: string = (e.message == undefined) ? e : e.message;
            /* Invalid Url -> return */
            if (msg.startsWith('Invalid url') || msg.startsWith('No video id found') || msg.startsWith('Video id')) { this.chat.send(mPanda.addToQueue.invalidUrl); return; }
            /* Not Found -> return */
            if (msg.startsWith('Request failed') || msg.startsWith('video unavailable')) { this.chat.send(mPanda.addToQueue.notFound); return; }
            /* Other Error */
            console.warn(msg);
            this.chat.send(mError.executeCmd); return;
        }
    }

    /**
     * Plays leading request in queue.
     * @returns 
     */
    async start(): Promise<void> {
        try {
            /* Queue is empty -> return */
            if (this.queue.length == 0) { this.chat.send(mPanda.start.empty); return; }

            /* Create a resource */
            switch (this.queue[0].type) {
                case PandaRequestTypes.SOUNDCLOUD_TRACK: this.resource = createAudioResource(await scdl.download(this.queue[0].url)); break;
                case PandaRequestTypes.YOUTUBE_VIDEO: this.resource = createAudioResource(ytdl(this.queue[0].url)); break;
            }
            /* Play the resource */
            this.player.play(this.resource);
            /* Player listners */
            this.player
                .on(AudioPlayerStatus.Idle, () => {
                    this.chat.send(mPanda.start.ended(this.queue.shift()!));
                    /* Remove all listners */
                    this.player.removeAllListeners();
                    /* Play next request */
                    this.start();
                })
                .on(AudioPlayerStatus.Paused, () => {
                    this.chat.send(mPanda.start.paused);
                })
                .on(AudioPlayerStatus.Playing, () => {
                    this.chat.send(mPanda.start.playing(this.queue[0]));
                });
            return;
        }
        catch (e) {
            console.warn(e.message);
            this.chat.send(mError.executeCmd); return;
        }
    }

    /**
     * Pauses player.
     * @param chat 
     * @param vcId 
     * @returns 
     */
    pause(chat: TextBasedChannels, vcId: string | null): void {
        try {
            this.chat = chat;
            /* User is not in a vc -> return */
            if (vcId == null) { this.chat.send(mPanda.pause.userNotVC); return; }
            /* Bot is not in a vc -> return */
            if (this.vcId == null) { this.chat.send(mPanda.pause.botNotVC); return; }
            /* Bot is not playing -> return */
            if (this.player.state.status == AudioPlayerStatus.Idle) { this.chat.send(mPanda.pause.notPlaying); return; }
            /* Bot is already paused -> return */
            if (this.player.state.status == AudioPlayerStatus.Paused) { this.chat.send(mPanda.pause.already); return; }

            /* Pause the player */
            this.player.pause();
        }
        catch (e) {
            console.warn(e.message);
            this.chat.send(mError.executeCmd); return;
        }
    }

    /**
     * Unpauses player.
     * @param chat 
     * @param vcId 
     * @returns 
     */
    unpause(chat: TextBasedChannels, vcId: string | null): void {
        try {
            this.chat = chat;
            /* User is not in a vc -> return */
            if (vcId == null) { this.chat.send(mPanda.resume.userNotVC); return; }
            /* Bot is not in a vc -> return */
            if (this.vcId == null) { this.chat.send(mPanda.resume.botNotVC); return; }
            /* Bot is not playing -> return */
            if (this.player.state.status == AudioPlayerStatus.Idle) { this.chat.send(mPanda.resume.notPlaying); return; }
            /* Bot is already unpaused -> return */
            if (this.player.state.status == AudioPlayerStatus.Playing) { this.chat.send(mPanda.resume.already); return; }

            /* Unpaused the player */
            this.player.unpause();
        }
        catch (e) {
            console.warn(e.message);
            this.chat.send(mError.executeCmd); return;
        }
    }

    /**
     * Skips current request.
     * @param chat 
     * @param vcId 
     * @returns 
     */
    skip(chat: TextBasedChannels, vcId: string | null): void {
        try {
            this.chat = chat;
            /* User is not in a vc -> return */
            if (vcId == null) { this.chat.send(mPanda.skip.userNotVC); return; }
            /* Bot is not in a vc -> return */
            if (this.vcId == null) { this.chat.send(mPanda.skip.botNotVC); return; }
            /* Bot is not playing -> return */
            if (this.player.state.status == AudioPlayerStatus.Idle) { this.chat.send(mPanda.skip.notPlaying); return; }

            /* Remove all listners */
            this.player.removeAllListeners();
            /* Skip current request */
            this.player.stop();
            this.chat.send(mPanda.skip.success(this.queue.shift()!));
            /* Play next request */
            this.start(); return;
        }
        catch (e) {
            console.warn(e.message);
            this.chat.send(mError.executeCmd); return;
        }
    }

    /**
     * Clears queue.
     * @param chat 
     * @param vcId 
     * @returns 
     */
    clear(chat: TextBasedChannels, vcId: string | null): void {
        try {
            this.chat = chat;
            /* User is not in a vc -> return */
            if (vcId == null) { this.chat.send(mPanda.clear.userNotVC); return; }
            /* Bot is not in a vc -> return */
            if (this.vcId == null) { this.chat.send(mPanda.clear.botNotVC); return; }

            /* Determine number of requests to clear */
            let numClear = this.queue.length;
            if (this.player.state.status == AudioPlayerStatus.Playing) numClear -= 1;
            /* Number of requests to clear is zero -> return */
            if (numClear == 0) { this.chat.send(mPanda.clear.already); return; }
            /* Clear requests */
            this.queue = (this.player.state.status == AudioPlayerStatus.Playing) ? [this.queue[0]] : [];
            this.chat.send(mPanda.clear.success(numClear)); return;
        }
        catch (e) {
            console.warn(e.message);
            this.chat.send(mError.executeCmd); return;
        }
    }

    /**
     * Shows queue.
     * @param chat 
     * @returns 
     */
    getQueue(chat: TextBasedChannels): void {
        try {
            this.chat = chat;
            /* Queue is empty -> return */
            if (this.queue.length == 0) { this.chat.send(mPanda.getQueue.empty); return; }

            /* Show first five requests in queue */
            let num = (this.queue.length > 5) ? 5 : this.queue.length;
            let str = mPanda.getQueue.playing(this.queue[0]);
            for (let i = 1; i < num; i++) { str += `\n${mPanda.getQueue.next(this.queue[i])}`; }
            if (this.queue.length > 5) { str += `\n+ \`${this.queue.length - num}\``; }
            this.chat.send(str); return;
        }
        catch (e) {
            console.warn(e.message);
            this.chat.send(mError.executeCmd); return;
        }
    }
}

