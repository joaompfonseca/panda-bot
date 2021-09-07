import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, joinVoiceChannel, NoSubscriberBehavior, VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import { SoundCloud, Track as Soundcloud_Track } from 'scdl-core'; const scdl = new SoundCloud(); scdl.connect();
import spinfo, { Preview as Spotify_Track, Tracks as Spotify_Playlist_Track } from 'spotify-url-info';
import ytinfo, { YoutubeVideo as Youtube_Video, Playlist as Youtube_Playlist, YoutubeSearchResults as Youtube_Query } from 'youtube-scrapper';
import ytdl from 'ytdl-core-discord';
import { PandaChat } from './PandaChat.js';
import { PandaAudio, PandaRequest, PandaRequestTypes } from '../interfaces.js';
import { mError, mPanda } from './messages.js';

export class PandaPlayer implements PandaAudio {
    adapterCreator: DiscordGatewayAdapterCreator;
    chat: PandaChat;
    connection: VoiceConnection | null;
    guildId: string;
    player: AudioPlayer;
    queue: PandaRequest[];
    resource: AudioResource | null;
    vcId: string | null;

    /**
     * Custom implementation of discord.js voice commands.
     * @param adapterCreator 
     * @param chat 
     * @param guildId 
     */
    constructor(adapterCreator: DiscordGatewayAdapterCreator, chat: PandaChat, guildId: string) {
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
    join(chat: PandaChat, vcId: string | null): void {
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
        catch (e: any) {
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
        catch (e: any) {
            console.warn(e.message);
            this.chat.send(mError.executeCmd); return;
        }
    }

    /**
     * Leaves current vc.
     * @param chat 
     * @returns 
     */
    leave(chat: PandaChat): void {
        try {
            this.chat = chat;
            /* Bot is not in a vc -> return */
            if (this.vcId == null) { this.chat.send(mPanda.leave.botNotVC); return; };

            /* Leave vc */
            this.connection!.disconnect(); return;
        }
        catch (e: any) {
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
    async play(chat: PandaChat, vcId: string | null, req: string): Promise<void> {
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
        catch (e: any) {
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
            let data: Soundcloud_Track | Spotify_Track | Spotify_Playlist_Track[] | Youtube_Video | Youtube_Playlist | Youtube_Query; let pandaRequest: PandaRequest;
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
            /* Request is a Spotify track (link) */
            else if (req.includes('spotify.com/track/')) {
                /* Get data - Spotify */
                data = await spinfo.getPreview(req);
                /* Get title */
                let title = `${data.artist} - ${data.title}`;
                /* Get data - Youtube */
                data = await ytinfo.search(title);
                /* Format data */
                pandaRequest = {
                    title: title,
                    type: PandaRequestTypes.SPOTIFY_TRACK,
                    url: `https://youtube.com/watch?v=${data.videos[0].id}`
                };
                /* Add request to queue */
                this.queue.push(pandaRequest);
                this.chat.send(mPanda.addToQueue.success(pandaRequest));
            }
            /* Request is a Spotify playlist (link) */
            else if (req.includes('spotify.com/album/') || req.includes('spotify.com/playlist/')) {
                /* Get data - Spotify */
                data = await spinfo.getTracks(req);
                /* Get titles */
                let titles = data.map(t => `${t.artists![0].name} - ${t.name}`);
                /* Send progress message */
                let msg = await this.chat.send(mPanda.addToQueue.progress(titles.length));
                for (let i = 0; i < titles.length; i++) {
                    /* Edit message every 5 requests */
                    if (i != 0 && i % 5 == 0) msg.edit(mPanda.addToQueue.progress(titles.length - i));
                    /* Get data - Youtube */
                    data = await ytinfo.search(titles[i]);
                    /* Format data */
                    pandaRequest = {
                        title: titles[i],
                        type: PandaRequestTypes.SPOTIFY_TRACK,
                        url: `https://youtube.com/watch?v=${data.videos[0].id}`
                    };
                    /* Add request to queue */
                    this.queue.push(pandaRequest);
                }
                msg.edit(mPanda.addToQueue.successNum(titles.length));
            }
            /* Request is a Youtube video (link) */
            else if (req.includes('youtube.com/watch?v=') || req.includes('youtu.be/')) {
                /* Get videoId */
                let videoId: string;
                if (req.includes('youtube.com/watch?v=')) { videoId = req.substring(req.search('=') + 1, (req.search('&') == -1) ? req.length : req.search('&')); }
                if (req.includes('youtu.be/')) { videoId = req.substring(req.search('e/') + 2); }
                /* Get data */
                data = await ytinfo.getVideoInfo(videoId!);
                /* Format data */
                pandaRequest = {
                    title: data.details.title,
                    type: PandaRequestTypes.YOUTUBE_VIDEO,
                    url: data.details.url
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
                data = await ytinfo.getPlaylistInfo(listId);
                /* Format data */
                for (let i = 0; i < data.tracks.length; i++) {
                    pandaRequest = {
                        title: data.tracks[i].title,
                        type: PandaRequestTypes.YOUTUBE_VIDEO,
                        url: `https://youtube.com/watch?v=${data.tracks[i].id}`
                    };
                    /* Add request to queue */
                    this.queue.push(pandaRequest);
                }
                this.chat.send(mPanda.addToQueue.success(data));
            }
            /* Request is a Youtube video (query) */
            else {
                /* Get data */
                data = await ytinfo.search(req);
                /* Format data */
                pandaRequest = {
                    title: data.videos[0].title,
                    type: PandaRequestTypes.YOUTUBE_VIDEO,
                    url: `https://youtube.com/watch?v=${data.videos[0].id}`
                }
                /* Add request to queue */
                this.queue.push(pandaRequest);
                this.chat.send(mPanda.addToQueue.success(pandaRequest));
            }
            return;
        }
        catch (e: any) {
            let msg: string = (e.message == undefined) ? e : e.message;
            /* Invalid Url -> return */
            if (msg.startsWith('Invalid url') ||
                msg.startsWith('Video id') ||
                msg.startsWith(`Cannot read property 'videoId' of undefined`)) { this.chat.send(mPanda.addToQueue.invalidUrl); return; }
            /* Unavailable -> return */
            if (msg.startsWith('Unexpected token ;') ||
                msg.startsWith('adaptationSet.Representation is not iterable')) { this.chat.send(mPanda.addToQueue.unavailable); return; }
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
                case PandaRequestTypes.SPOTIFY_TRACK:
                case PandaRequestTypes.YOUTUBE_VIDEO: this.resource = createAudioResource(await ytdl(this.queue[0].url)); break;
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
        catch (e: any) {
            let msg: string = (e.message == undefined) ? e : e.message;
            /* Age Restricted -> return */
            if (msg.startsWith('Status code: 410')) {
                this.chat.send(mPanda.start.ageRestricted);
                this.skip(this.chat, this.vcId); return;
            }
            /* Other Error */
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
    pause(chat: PandaChat, vcId: string | null): void {
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
        catch (e: any) {
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
    unpause(chat: PandaChat, vcId: string | null): void {
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
        catch (e: any) {
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
    async skip(chat: PandaChat, vcId: string | null): Promise<void> {
        try {
            this.chat = chat;
            /* User is not in a vc -> return */
            if (vcId == null) { this.chat.send(mPanda.skip.userNotVC); return; }
            /* Bot is not in a vc -> return */
            if (this.vcId == null) { this.chat.send(mPanda.skip.botNotVC); return; }
            /* Queue is empty -> return */
            if (this.queue.length == 0) { this.chat.send(mPanda.skip.empty); return; }

            /* Remove all listners */
            this.player.removeAllListeners();
            /* Skip current request */
            this.player.stop();
            await this.chat.send(mPanda.skip.success(this.queue.shift()!));
            /* Play next request */
            this.start(); return;
        }
        catch (e: any) {
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
    clear(chat: PandaChat, vcId: string | null): void {
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
        catch (e: any) {
            console.warn(e.message);
            this.chat.send(mError.executeCmd); return;
        }
    }

    /**
     * Shows queue.
     * @param chat 
     * @returns 
     */
    getQueue(chat: PandaChat): void {
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
        catch (e: any) {
            console.warn(e.message);
            this.chat.send(mError.executeCmd); return;
        }
    }
}

