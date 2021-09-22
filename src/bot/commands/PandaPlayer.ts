import { MessageActionRow, MessageButton, MessageComponentInteraction, MessageEmbed, MessageOptions } from 'discord.js';
import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, joinVoiceChannel, NoSubscriberBehavior, VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import { SoundCloud, Track as Soundcloud_Track } from 'scdl-core'; const scdl = new SoundCloud(); scdl.connect();
import spinfo, { Preview as Spotify_Track, Tracks as Spotify_Playlist_Track } from 'spotify-url-info';
import ytinfo, { YoutubeVideo as Youtube_Video, Playlist as Youtube_Playlist, YoutubeSearchResults as Youtube_Query } from 'youtube-scrapper';
import ytdl from 'ytdl-core-discord';
import { queuePageSize } from '../config.js';
import { unknown } from './general.js';
import { PandaAudio, PandaQueueFrame, PandaRequest, PandaRequestTypes } from '../interfaces.js';
import { PandaChat } from './PandaChat.js';
import { mError, mPanda } from './messages.js';

export class PandaPlayer implements PandaAudio {
    adapterCreator: DiscordGatewayAdapterCreator;
    chat: PandaChat;
    connection: VoiceConnection | null;
    guildId: string;
    player: AudioPlayer;
    queue: PandaRequest[];
    queueFrames: PandaQueueFrame[];
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
        this.queueFrames = [];
        this.resource = null;
        this.vcId = null;
    }

    /**
     * Joins given vc.
     * @param chat 
     * @param vcId 
     * @returns 
     */
    async join(chat: PandaChat, vcId: string | null): Promise<void> {
        try {
            this.chat = chat;
            /* User is not in a vc -> return */
            if (vcId == null) { await this.chat.send(mPanda.join.userNotVC); return; }
            /* Bot is in the same vc as User -> return */
            if (this.vcId == vcId) { await this.chat.send(mPanda.join.already(this.vcId)); return; }

            /* Bot is in a different vc of User -> leave current vc */
            if (this.vcId != null && this.vcId != vcId) await this.leave(chat);
            /* Create a connection */
            await this.connectTo(vcId); return;
        }
        catch (e: any) {
            console.warn(e.message);
            await this.chat.send(mError.executeCmd); return;
        }
    }

    /**
     * Connects to given vc.
     * @param vcId 
     * @returns 
     */
    async connectTo(vcId: string): Promise<void> {
        try {
            /* Create a connection */
            this.connection = joinVoiceChannel({ channelId: vcId, guildId: this.guildId, adapterCreator: this.adapterCreator });

            /* Bot is connected */
            this.connection.once(VoiceConnectionStatus.Ready, async () => {
                this.vcId = vcId;
                await this.chat.send(mPanda.connectTo.connected(this.vcId!));

                /* Subscribe the player */
                this.connection!.subscribe(this.player);

                /* Bot is disconnected */
                this.connection!.once(VoiceConnectionStatus.Disconnected, async () => {
                    await this.chat.send(mPanda.connectTo.disconnected(this.vcId!));
                    /* Save potencial vc to connect to */
                    let vcId = this.connection!.joinConfig.channelId;
                    /* Destroy connection */
                    this.connection!.destroy();

                    /* Bot is moved to another vc */
                    if (vcId != null && vcId != this.vcId) { await this.connectTo(vcId); return; }
                    /* Clear vars */
                    this.connection = null;
                    this.vcId = null;
                });
            });
            return;
        }
        catch (e: any) {
            console.warn(e.message);
            await this.chat.send(mError.executeCmd); return;
        }
    }

    /**
     * Leaves current vc.
     * @param chat 
     * @returns 
     */
    async leave(chat: PandaChat): Promise<void> {
        try {
            this.chat = chat;
            /* Bot is not in a vc -> return */
            if (this.vcId == null) { await this.chat.send(mPanda.leave.botNotVC); return; };

            /* Leave vc */
            this.connection!.disconnect(); return;
        }
        catch (e: any) {
            console.warn(e.message);
            await this.chat.send(mError.executeCmd); return;
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
            if (req.length == 0) { await this.chat.send(mPanda.play.emptyQuery); return; }
            /* User is not in a vc -> return */
            if (vcId == null) { await this.chat.send(mPanda.play.userNotVC); return; }

            /* Bot is in a different vc of User -> leave current vc */
            if (this.vcId != null && this.vcId != vcId) await this.leave(chat);
            /* Bot is not in the same vc as User -> create a connection */
            if (this.vcId != vcId) await this.connectTo(vcId);

            /* Add request to queue */
            await this.addToQueue(req);

            /* Bot is not playing -> start playing */
            if (this.player.state.status == AudioPlayerStatus.Idle) { await this.start(); }
            return;
        }
        catch (e: any) {
            console.warn(e.message);
            await this.chat.send(mError.executeCmd); return;
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
                await this.chat.send(mPanda.addToQueue.success(pandaRequest));
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
                await this.chat.send(mPanda.addToQueue.success(pandaRequest));
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
                    if (i != 0 && i % 5 == 0) await msg.edit(mPanda.addToQueue.progress(titles.length - i));
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
                await msg.edit(mPanda.addToQueue.successNum(titles.length));
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
                await this.chat.send(mPanda.addToQueue.success(pandaRequest));
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
                await this.chat.send(mPanda.addToQueue.success(data));
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
                await this.chat.send(mPanda.addToQueue.success(pandaRequest));
            }
            return;
        }
        catch (e: any) {
            let msg: string = (e.message == undefined) ? e : e.message;
            /* Invalid Url -> return */
            if (msg.startsWith('Invalid url') ||
                msg.startsWith('Video id') ||
                msg.startsWith(`Cannot read property 'videoId' of undefined`)) { await this.chat.send(mPanda.addToQueue.invalidUrl); return; }
            /* Unavailable -> return */
            if (msg.startsWith('Unexpected token ;') ||
                msg.startsWith('adaptationSet.Representation is not iterable') ||
                msg.startsWith(`Cannot read property 'title' of undefined`)) { await this.chat.send(mPanda.addToQueue.unavailable); return; }
            /* Other Error */
            console.warn(msg);
            await this.chat.send(mError.executeCmd); return;
        }
    }

    /**
     * Plays leading request in queue.
     * @returns 
     */
    async start(): Promise<void> {
        try {
            /* Queue is empty -> return */
            if (this.queue.length == 0) { await this.chat.send(mPanda.start.empty); return; }

            /* Create a resource */
            switch (this.queue[0].type) {
                case PandaRequestTypes.SOUNDCLOUD_TRACK: this.resource = createAudioResource(await scdl.download(this.queue[0].url, { highWaterMark: 1 << 25 })); break;
                case PandaRequestTypes.SPOTIFY_TRACK:
                case PandaRequestTypes.YOUTUBE_VIDEO: this.resource = createAudioResource(await ytdl(this.queue[0].url, { filter: 'audioonly', highWaterMark: 1 << 25, quality: 'highestaudio' })); break;
            }

            /* Play the resource */
            this.player.play(this.resource);
            /* Player listners */
            this.player
                .on(AudioPlayerStatus.Idle, async () => {
                    await this.chat.send(mPanda.start.ended(this.queue.shift()!));
                    /* Remove all listners */
                    this.player.removeAllListeners();
                    /* Play next request */
                    await this.start();
                })
                .on(AudioPlayerStatus.Paused, async () => {
                    await this.chat.send(mPanda.start.paused);
                })
                .on(AudioPlayerStatus.Playing, async () => {
                    await this.chat.send(mPanda.start.playing(this.queue[0]));
                });
            return;
        }
        catch (e: any) {
            let msg: string = (e.message == undefined) ? e : e.message;
            /* Age Restricted -> return */
            if (msg.startsWith('Status code: 410')) {
                await this.chat.send(mPanda.start.ageRestricted);
                await this.skip(this.chat, this.vcId); return;
            }
            /* Other Error */
            console.warn(e.message);
            await this.chat.send(mError.executeCmd); return;
        }
    }

    /**
     * Pauses player.
     * @param chat 
     * @param vcId 
     * @returns 
     */
    async pause(chat: PandaChat, vcId: string | null): Promise<void> {
        try {
            this.chat = chat;
            /* User is not in a vc -> return */
            if (vcId == null) { await this.chat.send(mPanda.pause.userNotVC); return; }
            /* Bot is not in a vc -> return */
            if (this.vcId == null) { await this.chat.send(mPanda.pause.botNotVC); return; }
            /* Bot is not playing -> return */
            if (this.player.state.status == AudioPlayerStatus.Idle) { await this.chat.send(mPanda.pause.notPlaying); return; }
            /* Bot is already paused -> return */
            if (this.player.state.status == AudioPlayerStatus.Paused) { await this.chat.send(mPanda.pause.already); return; }

            /* Pause the player */
            this.player.pause();
        }
        catch (e: any) {
            console.warn(e.message);
            await this.chat.send(mError.executeCmd); return;
        }
    }

    /**
     * Unpauses player.
     * @param chat 
     * @param vcId 
     * @returns 
     */
    async unpause(chat: PandaChat, vcId: string | null): Promise<void> {
        try {
            this.chat = chat;
            /* User is not in a vc -> return */
            if (vcId == null) { await this.chat.send(mPanda.resume.userNotVC); return; }
            /* Bot is not in a vc -> return */
            if (this.vcId == null) { await this.chat.send(mPanda.resume.botNotVC); return; }
            /* Bot is not playing -> return */
            if (this.player.state.status == AudioPlayerStatus.Idle) { await this.chat.send(mPanda.resume.notPlaying); return; }
            /* Bot is already unpaused -> return */
            if (this.player.state.status == AudioPlayerStatus.Playing) { await this.chat.send(mPanda.resume.already); return; }

            /* Unpaused the player */
            this.player.unpause();
        }
        catch (e: any) {
            console.warn(e.message);
            await this.chat.send(mError.executeCmd); return;
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
            if (vcId == null) { await this.chat.send(mPanda.skip.userNotVC); return; }
            /* Bot is not in a vc -> return */
            if (this.vcId == null) { await this.chat.send(mPanda.skip.botNotVC); return; }
            /* Queue is empty -> return */
            if (this.queue.length == 0) { await this.chat.send(mPanda.skip.empty); return; }

            /* Remove all listners */
            this.player.removeAllListeners();
            /* Skip current request */
            this.player.stop();
            await this.chat.send(mPanda.skip.success(this.queue.shift()!));
            /* Play next request */
            await this.start(); return;
        }
        catch (e: any) {
            console.warn(e.message);
            await this.chat.send(mError.executeCmd); return;
        }
    }

    /**
     * Clears queue.
     * @param chat 
     * @param vcId 
     * @returns 
     */
    async clear(chat: PandaChat, vcId: string | null): Promise<void> {
        try {
            this.chat = chat;
            /* User is not in a vc -> return */
            if (vcId == null) { await this.chat.send(mPanda.clear.userNotVC); return; }
            /* Bot is not in a vc -> return */
            if (this.vcId == null) { await this.chat.send(mPanda.clear.botNotVC); return; }

            /* Determine number of requests to clear */
            let numClear = this.queue.length;
            if (this.player.state.status == AudioPlayerStatus.Playing) numClear -= 1;
            /* Number of requests to clear is zero -> return */
            if (numClear == 0) { await this.chat.send(mPanda.clear.already); return; }
            /* Clear requests */
            this.queue = (this.player.state.status == AudioPlayerStatus.Playing) ? [this.queue[0]] : [];
            await this.chat.send(mPanda.clear.success(numClear)); return;
        }
        catch (e: any) {
            console.warn(e.message);
            await this.chat.send(mError.executeCmd); return;
        }
    }

    /**
     * Shows queue.
     * @param chat 
     * @returns 
     */
    async getQueue(chat: PandaChat): Promise<void> {
        try {
            this.chat = chat;
            /* Queue is empty -> return */
            if (this.queue.length == 0) { await this.chat.send(mPanda.getQueue.empty); return; }

            /* Get queue page */
            let { data, time } = await this.getQueuePage(1);

            /* Send the message */
            let msg = await this.chat.send(data);
            /* Create the filter - time when this queue page was created */
            let filter = (int: MessageComponentInteraction): boolean => {
                return parseInt(int.customId.split('-')[0]) == time;
            };
            /* Create the collector */
            let collector = this.chat.createMessageComponentCollector({
                filter: filter,
                idle: 1000 * 60 * 5 // 1000 * 60 * minutes
            });
            /* Collector listeners */
            collector
                .on('collect', async int => {
                    /* Get time, page and command */
                    let data = int.customId.split('-');
                    let time: number = parseInt(data[0]);
                    let page: number = parseInt(data[1]);
                    let cmd: string | undefined = data[2];

                    /* A command is provided */
                    if (cmd != undefined) {
                        /* Get User's vcId */
                        let vcId = int.guild!.members.cache.get(int.user.id)!.voice.channelId;
                        /* Execute a command */
                        switch (cmd) {
                            case 'clear':   await this.clear(this.chat, vcId); break;
                            default:        await unknown(this.chat); break;    
                        }
                    }
                    /* Get requested page of queue */
                    int.update((await this.getQueuePage(page, time)).data);
                })
                .on('end', async () => {
                    /* Delete messages associated to ended collectors */
                    this.queueFrames.forEach(async f => { if (f.collector.ended) await f.msg.edit({ content: mPanda.getQueue.closed, embeds: [], components: [] }); });
                    /* Remove ended collectors' frames from array */
                    this.queueFrames = this.queueFrames.filter(f => !f.collector.ended);
                });
            /* Add collector and message to array */
            this.queueFrames.push({ collector: collector, msg: msg }); return;
        }
        catch (e: any) {
            console.warn(e.message);
            await this.chat.send(mError.executeCmd); return;
        }
    }

    /**
     * Returns the requested queue page and the time this queue page was created.
     * @param page starting in 1, the requested page number.
     * @param time in seconds, when this queue page was created.
     * @returns 
     */
    async getQueuePage(page: number, time?: number): Promise<{ data: MessageOptions, time: number }> {
        /* Get the time of page creation if none is provided */
        time = (time == undefined) ? Date.now() : time;
        try {
            /* Get array of requests to display */
            let reqs: PandaRequest[] = [];
            for (let p = page; p > 0; p--) {
                reqs = this.queue.slice((p - 1) * queuePageSize, p * queuePageSize);
                /* Array has requests -> break */
                if (reqs.length > 0) { page = (p < 2) ? 1 : p; break; }
            }
            /* Get number of total pages */
            let totalPages = (this.queue.length == 0 || this.queue.length % queuePageSize != 0) ? Math.floor(this.queue.length / queuePageSize) + 1 : this.queue.length / queuePageSize;

            /* Create the string */
            let str;
            if (reqs.length == 0) {
                /* Display empty queue message */
                str = mPanda.getQueuePage.empty;
            }
            else {
                /* Format requests */
                str = reqs.map((req, pos) => mPanda.getQueuePage.request(req, (page - 1) * queuePageSize + pos)).join('\n');
                /* Add pagination info */
                str += `\n\n${mPanda.getQueuePage.pageCounter(page, totalPages)}`;
            }
            /* Create the string's embed */
            let embed = new MessageEmbed({ description: str });

            /* Create the buttons */
            let btn_prev = new MessageButton({
                customId: `${time}-${page - 1}`,
                label: mPanda.getQueuePage.button.prev,
                style: 'SECONDARY'
            });
            let btn_next = new MessageButton({
                customId: `${time}-${page + 1}`,
                label: mPanda.getQueuePage.button.next,
                style: 'SECONDARY'
            });
            let btn_reload = new MessageButton({
                customId: `${time}-${page}`,
                label: mPanda.getQueuePage.button.reload,
                style: 'SECONDARY'
            });
            let btn_clear = new MessageButton({
                customId: `${time}-${page}-clear`,
                label: mPanda.getQueuePage.button.clear,
                style: 'SECONDARY'
            });
            /* Disable buttons according to current page */
            if (page < 2) btn_prev.setDisabled();
            if (page == totalPages) btn_next.setDisabled();
            if (this.queue.length < 2) btn_clear.setDisabled();
            /* Create the buttons' row */
            let buttons = new MessageActionRow({ components: [btn_prev, btn_next, btn_reload, btn_clear] });

            return { data: { embeds: [embed], components: [buttons] }, time };
        }
        catch (e: any) {
            console.warn(e.message);
            return { data: { content: mError.executeCmd, embeds: [], components: [] }, time };
        }
    }
}