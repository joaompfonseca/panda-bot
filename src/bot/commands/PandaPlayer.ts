import { Client, Guild, InteractionCollector, MessageActionRow, MessageButton, MessageComponentInteraction, MessageEmbed } from 'discord.js';
import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, joinVoiceChannel, NoSubscriberBehavior, VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import { SoundCloud, Track as Soundcloud_Track, Playlist as Soundcloud_Playlist } from 'scdl-core'; const scdl = new SoundCloud(); scdl.connect();
import spinfo, { Tracks as Spotify_Playlist_Track } from 'spotify-url-info';
import ytinfo, { YoutubeVideo as Youtube_Video, Playlist as Youtube_Playlist, YoutubeSearchResults as Youtube_Query } from 'youtube-scrapper';
import ytdl from 'ytdl-core-discord';
import { queuePageSize } from '../config.js';
import { formatDuration, formatTextSyntax, spdl } from '../util.js';
import { mError, mPanda } from './messages.js';
import { PandaAudio, PandaRequest, PandaRequestTypes } from '../interfaces.js';
import { PandaMessage } from '../handlers/PandaMessage.js';
import { PandaChat } from '../handlers/PandaChat.js';

export class PandaPlayer implements PandaAudio {
    adapterCreator: DiscordGatewayAdapterCreator;
    chat: PandaChat;
    connection: VoiceConnection | null;
    client: Client;
    guildId: string;
    intCollector: InteractionCollector<MessageComponentInteraction>;
    player: AudioPlayer;
    playerPanelMsg: PandaMessage | null;
    queue: PandaRequest[];
    resource: AudioResource | null;
    vcId: string | null;

    /**
     * Custom implementation of discord.js voice commands.
     * @param chat 
     * @param client 
     * @param guild 
     */
    constructor(chat: PandaChat, client: Client, guild: Guild) {
        this.adapterCreator = guild.voiceAdapterCreator;
        this.chat = chat;
        this.connection = null;
        this.client = client;
        this.guildId = guild.id;
        this.intCollector = new InteractionCollector<MessageComponentInteraction>(client, {
            guild: guild,
            componentType: 'BUTTON'
        })
            .on('collect', async int => await this.collect(int));
        this.player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
        this.playerPanelMsg = null;
        this.queue = [];
        this.resource = null;
        this.vcId = null;
    }

    /**
     * Adds given request to queue.
     * @param req 
     * @returns 
     */
    async addToPlaylist(req: string): Promise<boolean> {
        try {
            let data: Soundcloud_Track | Soundcloud_Playlist | Spotify_Playlist_Track[] | Youtube_Video | Youtube_Playlist | Youtube_Query; let pandaRequest: PandaRequest;
            /* Request is a Soundcloud track (link) */
            if (req.includes('soundcloud.com/') && (!req.includes('/sets/') || req.includes('?=in'))) {
                /* Get data */
                data = await scdl.tracks.getTrack(req);
                /* Format data */
                pandaRequest = {
                    duration: data.duration,
                    formatedDuration: formatDuration(data.duration),
                    title: `${data.user.username} - ${data.title}`,
                    type: PandaRequestTypes.SOUNDCLOUD,
                    url: data.permalink_url
                };
                /* Add request to queue */
                this.queue.push(pandaRequest);
                await this.chat.send(mPanda.addToPlaylist.success(pandaRequest.title));
            }
            /* Request is a Soundcloud playlist (link) */
            else if (req.includes('soundcloud.com/') && req.includes('/sets/')) {
                /* Get data */
                data = await scdl.playlists.getPlaylist(req);
                /* Format data */
                for (let i = 0; i < data.tracks.length; i++) {
                    pandaRequest = {
                        duration: data.tracks[i].duration,
                        formatedDuration: formatDuration(data.tracks[i].duration),
                        title: `${data.tracks[i].user.username} - ${data.tracks[i].title}`,
                        type: PandaRequestTypes.SOUNDCLOUD,
                        url: data.tracks[i].permalink_url
                    };
                    /* Add request to queue */
                    this.queue.push(pandaRequest);
                }
                await this.chat.send(mPanda.addToPlaylist.success(data.title));
            }
            /* Request is a Spotify track (link) */
            else if (req.includes('spotify.com/track/')) {
                /* Get data */
                let data: any = await spinfo.getData(req);
                /* Format data */
                pandaRequest = {
                    duration: data.duration_ms,
                    formatedDuration: formatDuration(data.duration_ms),
                    title: `${data.artists[0].name} - ${data.name}`,
                    type: PandaRequestTypes.SPOTIFY,
                    url: data.external_urls.spotify
                };
                /* Add request to queue */
                this.queue.push(pandaRequest);
                await this.chat.send(mPanda.addToPlaylist.success(pandaRequest.title));
            }
            /* Request is a Spotify playlist (link) */
            else if (req.includes('spotify.com/album/') || req.includes('spotify.com/playlist/')) {
                /* Get data */
                let data: any = await spinfo.getData(req);
                /* Format data */
                for (let i = 0; i < data.tracks.items.length; i++) {
                    pandaRequest = {
                        duration: data.tracks.items[i].track.duration_ms,
                        formatedDuration: formatDuration(data.tracks.items[i].track.duration_ms),
                        title: `${data.tracks.items[i].track.artists![0].name} - ${data.tracks.items[i].track.name}`,
                        type: PandaRequestTypes.SPOTIFY,
                        url: data.tracks.items[i].track.external_urls.spotify
                    };
                    /* Add request to queue */
                    this.queue.push(pandaRequest);
                }
                await this.chat.send(mPanda.addToPlaylist.success(data.name));
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
                    duration: data.details.duration,
                    formatedDuration: formatDuration(data.details.duration),
                    title: data.details.title,
                    type: PandaRequestTypes.YOUTUBE,
                    url: data.details.url
                };
                /* Add request to queue */
                this.queue.push(pandaRequest);
                await this.chat.send(mPanda.addToPlaylist.success(pandaRequest.title));
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
                        duration: data.tracks[i].duration,
                        formatedDuration: formatDuration(data.tracks[i].duration),
                        title: data.tracks[i].title,
                        type: PandaRequestTypes.YOUTUBE,
                        url: `https://youtube.com/watch?v=${data.tracks[i].id}`
                    };
                    /* Add request to queue */
                    this.queue.push(pandaRequest);
                }
                await this.chat.send(mPanda.addToPlaylist.success(data.title));
            }
            /* Request is a Youtube video (query) */
            else {
                /* Get data */
                data = await ytinfo.search(req);
                /* Format data */
                pandaRequest = {
                    duration: data.videos[0].duration,
                    formatedDuration: formatDuration(data.videos[0].duration),
                    title: data.videos[0].title,
                    type: PandaRequestTypes.YOUTUBE,
                    url: `https://youtube.com/watch?v=${data.videos[0].id}`
                }
                /* Add request to queue */
                this.queue.push(pandaRequest);
                await this.chat.send(mPanda.addToPlaylist.success(pandaRequest.title));
            }

            /* Remove player panel */
            if (this.playerPanelMsg != null) await this.playerPanelMsg.delete();
            /* Create new player panel */
            if (this.player.state.status == AudioPlayerStatus.Playing || this.player.state.status == AudioPlayerStatus.Paused) { this.playerPanelMsg = await this.chat.send(this.getPlayerPanel()); }

            return true;
        }
        catch (e: any) {
            let msg: string = (e.message == undefined) ? e : e.message;
            /* Not found -> return */
            if (msg.startsWith('Cannot read properties of undefined')) { await this.chat.send(mPanda.addToPlaylist.notFound); }
            /* Invalid Url -> return */
            else if (msg.startsWith(`Cannot read property 'videoId' of undefined`) ||
                msg.startsWith('Invalid url') ||
                msg.startsWith('Video id')) { await this.chat.send(mPanda.addToPlaylist.invalidUrl); }
            /* Unavailable -> return */
            else if (msg.startsWith('adaptationSet.Representation is not iterable') ||
                msg.startsWith(`Cannot read property 'title' of undefined`) ||
                msg.startsWith('Invalid ids') ||
                msg.startsWith('Unexpected token ;') ||
                msg.startsWith('Video unavailable')) { await this.chat.send(mPanda.addToPlaylist.unavailable); }
            /* Other Error */
            else {
            console.warn(`PandaPlayer [addToPlaylist] - ${msg}`);
                await this.chat.send(mError.executeCmd);
            }
            return false;
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
            /* Bot is in a different vc of User -> return */
            if (this.vcId != null && this.vcId != vcId) { await this.chat.send(mPanda.clear.notSameVC); return; }

            /* Determine number of requests to clear */
            let numClear = this.queue.length;
            if (this.player.state.status != AudioPlayerStatus.Idle) numClear -= 1;
            /* Number of requests to clear is zero -> return */
            if (numClear == 0) { await this.chat.send(mPanda.clear.already); return; }
            /* Clear requests */
            this.queue = (this.player.state.status != AudioPlayerStatus.Idle) ? [this.queue[0]] : [];
            await this.chat.send(mPanda.clear.success(numClear));

            /* Update player panel */
            if (this.playerPanelMsg != null) await this.playerPanelMsg.edit(this.getPlayerPanel());
            return;
        }
        catch (e: any) {
            console.warn(`PandaPlayer [clear] - ${e.message}`);
            await this.chat.send(mError.executeCmd); return;
        }
    }

    /**
     * Runs when collector's "collect" event is triggered.
     * @param int 
     * @returns
     */
    async collect(int: MessageComponentInteraction): Promise<void> {
        try {
            this.chat.chat = int.channel!;

            /**
             * Get type, command and data from interaction
             *  ________________________________
             * |  Type   | Command  |   Data    |
             * |_________|__________|___________|
             * | 'panel' | 'queue'  | undefined |
             * |         | 'skip'   | undefined |
             * |         | 'stop'   | undefined |
             * |         | 'toggle' | undefined |
             * | 'queue' | 'clear'  | 1         |
             * |         | 'page'   | number    |
             * |         | 'reload' | number    |
             * |_________|__________|___________|
             */
            let [type, cmd, data] = int.customId.split('-');
            /* Get User's vcId */
            let vcId = int.guild!.members.cache.get(int.user.id)!.voice.channelId;

            switch (type) {
                case 'panel':
                    switch (cmd) {
                        case 'queue':
                            /* Send the queue only to the User that pressed the button */
                            await int.reply({ ephemeral: true, ...this.getPlaylistPage(1, true) });
                            break;
                        case 'toggle':
                            await int.update({});
                            (this.player.state.status == AudioPlayerStatus.Playing) ? await this.pause(this.chat, vcId) : await this.unpause(this.chat, vcId);
                            break;
                        case 'skip':
                            await int.update({});
                            await this.skip(this.chat, vcId);
                            break;
                        case 'stop':
                            await int.update({});
                            await this.leave(this.chat, vcId);
                            break;
                    }
                    break;
                case 'queue':
                    switch (cmd) {
                        case 'clear':
                            await this.clear(this.chat, vcId);
                        case 'page':
                        case 'reload':
                            await int.update(this.getPlaylistPage(parseInt(data), true));
                            break;
                    }
                    break;
            }
        }
        catch (e: any) {
            console.warn(`PandaPlayer [collect] - ${e.message}`);
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
                    /* Remove player panel */
                    if (this.playerPanelMsg != null) await this.playerPanelMsg.delete();
                    /* Save potencial vc to connect to */
                    let vcId = this.connection!.joinConfig.channelId;
                    /* Destroy connection */
                    this.connection!.destroy();

                    /* Bot is moved to another vc */
                    if (vcId != null && vcId != this.vcId) { await this.connectTo(vcId); return; }

                    /* Remove all player listners */
                    this.player.removeAllListeners();
                    /* Stop current request */
                    this.player.stop(true);
                    /* Clear vars */
                    this.connection = null;
                    this.queue = [];
                    this.vcId = null;
                });
            });
            return;
        }
        catch (e: any) {
            console.warn(`PandaPlayer [connectTo] - ${e.message}`);
            await this.chat.send(mError.executeCmd); return;
        }
    }

    /**
     * Returns player panel.
     * @returns 
     */
    getPlayerPanel(): { components: MessageActionRow[], embeds: MessageEmbed[] } {
        try {
            /* Create the embed */
            let embed = new MessageEmbed({
                color: (this.player.state.status == AudioPlayerStatus.Playing) ? '#00FF00' : '#FFEA00',
                fields: [
                    {
                        name: 'Agora',
                        value: formatTextSyntax(mPanda.getPlayerPanel.request(this.queue[0]))
                    },
                    {
                        name: 'Seguinte',
                        value: (this.queue.length > 1) ? formatTextSyntax(mPanda.getPlayerPanel.request(this.queue[1])) : formatTextSyntax(mPanda.getPlayerPanel.noNextRequest)
                    }
                ]
            });

            /* Create the buttons */
            let btn_queue = new MessageButton({
                customId: 'panel-queue',
                style: 'SECONDARY',
                ...mPanda.getPlayerPanel.queue
            });
            let btn_skip = new MessageButton({
                customId: 'panel-skip',
                style: 'PRIMARY',
                ...mPanda.getPlayerPanel.skip
            });
            let btn_stop = new MessageButton({
                customId: 'panel-stop',
                style: 'DANGER',
                ...mPanda.getPlayerPanel.stop
            });
            let btn_toggle = new MessageButton({
                customId: 'panel-toggle',
                style: 'SUCCESS',
                ...mPanda.getPlayerPanel.toggle
            });
            /* Create the row */
            let row = new MessageActionRow({ components: [btn_toggle, btn_skip, btn_stop, btn_queue] });

            return { components: [row], embeds: [embed] };
        }
        catch (e: any) {
            console.warn(`PandaPlayer [getPlayerPanel] - ${e.message}`);
            return { components: [], embeds: [] };
        }
    }

    /**
     * Returns requested queue page.
     * @param page User/Interaction given queue page number.
     * @param showButtons
     * @returns 
     */
    getPlaylistPage(page: number, showButtons: boolean = false): { components: MessageActionRow[], embeds: MessageEmbed[] } {
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
            /* Get total playlist duration */
            let totalDuration = formatDuration(this.queue.map(r => r.duration).reduce((t, d) => t + d, 0));

            /* Create the string */
            let str;
            if (reqs.length == 0) {
                /* Empty queue */
                str = mPanda.getPlaylistPage.empty;
            }
            else {
                /* Format requests */
                str = reqs.map((req, idx) => mPanda.getPlaylistPage.request((page - 1) * queuePageSize + idx + 1, req)).join('\n');
                /* Add info */
                str += `\n\n${mPanda.getPlaylistPage.info(page, totalPages, this.queue.length, totalDuration)}`;
            }
            /* Create the string's embed */
            let embed = new MessageEmbed({ description: formatTextSyntax(str) });

            /* Create the buttons */
            let btn_clear = new MessageButton({
                customId: `queue-clear-1`,
                disabled: (this.queue.length < 2) ? true : false,
                style: 'SECONDARY',
                ...mPanda.getPlaylistPage.clear
            });
            let btn_next = new MessageButton({
                customId: `queue-page-${page + 1}`,
                disabled: (page == totalPages) ? true : false,
                style: 'SECONDARY',
                ...mPanda.getPlaylistPage.next
            });
            let btn_previous = new MessageButton({
                customId: `queue-page-${page - 1}`,
                disabled: (page == 1) ? true : false,
                style: 'SECONDARY',
                ...mPanda.getPlaylistPage.previous
            });
            let btn_reload = new MessageButton({
                customId: `queue-reload-${page}`,
                style: 'SECONDARY',
                ...mPanda.getPlaylistPage.reload
            });
            /* Create the row */
            let buttons = new MessageActionRow({ components: [btn_previous, btn_next, btn_reload, btn_clear] });

            return { components: showButtons ? [buttons] : [], embeds: [embed] };
        }
        catch (e: any) {
            console.warn(`PandaPlayer [getPlaylistPage] - ${e.message}`);
            return { components: [], embeds: [] };
        }
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
            /* Bot is in a different vc of User and is playing -> return */
            if (this.vcId != null && this.vcId != vcId && this.player.state.status != AudioPlayerStatus.Idle) { await this.chat.send(mPanda.join.playing(this.vcId)); return; }

            /* Bot is in a different vc of User -> leave current vc */
            if (this.vcId != null && this.vcId != vcId) this.connection!.disconnect();
            /* Create a connection */
            await this.connectTo(vcId); return;
        }
        catch (e: any) {
            console.warn(`PandaPlayer [join] - ${e.message}`);
            await this.chat.send(mError.executeCmd); return;
        }
    }

    /**
     * Leaves current vc.
     * @param chat 
     * @param vcId
     * @returns 
     */
    async leave(chat: PandaChat, vcId: string | null): Promise<void> {
        try {
            this.chat = chat;
            /* User is not in a vc -> return */
            if (vcId == null) { await this.chat.send(mPanda.leave.userNotVC); return; }
            /* Bot is not in a vc -> return */
            if (this.vcId == null) { await this.chat.send(mPanda.leave.botNotVC); return; };
            /* Bot is in a different vc of User -> return */
            if (this.vcId != null && this.vcId != vcId) { await this.chat.send(mPanda.leave.notSameVC); return; }

            /* Leave vc */
            this.connection!.disconnect(); return;
        }
        catch (e: any) {
            console.warn(`PandaPlayer [leave] - ${e.message}`);
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
            /* Bot is in a different vc of User -> return */
            if (this.vcId != null && this.vcId != vcId) { await this.chat.send(mPanda.pause.notSameVC); return; }
            /* Bot is not playing -> return */
            if (this.player.state.status == AudioPlayerStatus.Idle) { await this.chat.send(mPanda.pause.notPlaying); return; }
            /* Bot is already paused -> return */
            if (this.player.state.status == AudioPlayerStatus.Paused) { await this.chat.send(mPanda.pause.already); return; }

            /* Pause the player */
            this.player.pause(); return;
        }
        catch (e: any) {
            console.warn(`PandaPlayer [pause] - ${e.message}`);
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
            /* User is not in a vc -> return */
            if (vcId == null) { await this.chat.send(mPanda.play.userNotVC); return; }
            /* Request is empty -> return */
            if (req.length == 0) { await this.chat.send(mPanda.play.emptyQuery); return; }
            /* Bot is in a different vc of User and is playing -> return */
            if (this.vcId != null && this.vcId != vcId && this.player.state.status != AudioPlayerStatus.Idle) { await this.chat.send(mPanda.play.notSameVC); return; }
            /* Request is empty -> return */

            /* Add request to queue */
            if (!await this.addToPlaylist(req)) return;

            /* Bot is in a different vc of User -> leave current vc */
            if (this.vcId != null && this.vcId != vcId) this.connection!.disconnect();
            /* Bot is not in a vc or is in a different vc of User -> create a connection */
            if (this.vcId == null || this.vcId != vcId) await this.connectTo(vcId);

            /* Add request to queue */
            await this.addToPlaylist(req);
            /* Bot is not playing -> start playing */
            if (this.player.state.status == AudioPlayerStatus.Idle) { await this.start(); }

            /* A panel player was created and it wasn't deleted -> update player panel */
            if (this.playerPanelMsg != null && !this.playerPanelMsg.deleted) { await this.playerPanelMsg!.edit(this.getPlayerPanel()); } 
            return;
        }
        catch (e: any) {
            console.warn(`PandaPlayer [play] - ${e.message}`);
            await this.chat.send(mError.executeCmd); return;
        }
    }

    /**
     * Shows queue.
     * @param chat 
     * @param pageStr User given queue page number.
     * @returns 
     */
    async playlist(chat: PandaChat, pageStr: string): Promise<void> {
        try {
            this.chat = chat;
            /* Page number is not given, is less than one or is not a number -> request queue's first page */
            let page = (pageStr.length == 0 || parseInt(pageStr) < 1 || new RegExp(/\D/).test(pageStr)) ? 1 : parseInt(pageStr);

            /* Send requested queue page */
            await this.chat.send(this.getPlaylistPage(page)); return;
        }
        catch (e: any) {
            console.warn(`PandaPlayer [playlist] - ${e.message}`);
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
            /* Bot is in a different vc of User -> return */
            if (this.vcId != null && this.vcId != vcId) { await this.chat.send(mPanda.skip.notSameVC); return; }
            /* Queue is empty -> return */
            if (this.queue.length == 0) { await this.chat.send(mPanda.skip.empty); return; }

            /* Remove player panel */
            if (this.playerPanelMsg != null) await this.playerPanelMsg.delete();
            /* Remove all listners */
            this.player.removeAllListeners();
            /* Skip current request */
            this.player.stop(true);
            await this.chat.send(mPanda.skip.success(this.queue.shift()!));
            /* Play next request */
            await this.start(); return;
        }
        catch (e: any) {
            console.warn(`PandaPlayer [skip] - ${e.message}`);
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
            if (this.queue.length == 0) {
                /* Remove player panel */
                if (this.playerPanelMsg != null) await this.playerPanelMsg.delete();
                await this.chat.send(mPanda.start.empty); return;
            }

            /* Create a resource */
            switch (this.queue[0].type) {
                case PandaRequestTypes.SOUNDCLOUD: this.resource = createAudioResource(await scdl.download(this.queue[0].url, { highWaterMark: 1 << 25 })); break;
                case PandaRequestTypes.SPOTIFY: this.resource = createAudioResource(await spdl(this.queue[0].url, { filter: 'audioonly', highWaterMark: 1 << 25, quality: 'highestaudio' })); break;
                case PandaRequestTypes.YOUTUBE: this.resource = createAudioResource(await ytdl(this.queue[0].url, { filter: 'audioonly', highWaterMark: 1 << 25, quality: 'highestaudio' })); break;
            }

            /* Play the resource */
            this.player.play(this.resource);
            /* Player listners */
            this.player
                .on(AudioPlayerStatus.Idle, async () => {
                    /* Remove player panel */
                    if (this.playerPanelMsg != null) await this.playerPanelMsg.delete();
                    /* Remove all listners */
                    this.player.removeAllListeners();
                    /* Send ended request message */
                    await this.chat.send(mPanda.start.ended(this.queue.shift()!));
                    /* Play next request */
                    await this.start();
                })
                .on(AudioPlayerStatus.Paused, async () => {
                    /* No panel player was created or it was deleted -> create new player panel */
                    if (this.playerPanelMsg == null || this.playerPanelMsg.deleted) { this.playerPanelMsg = await this.chat.send(this.getPlayerPanel()); }
                    /* Update player panel */
                    if (this.playerPanelMsg != null) { await this.playerPanelMsg.edit(this.getPlayerPanel()); }
                    /* Create new player panel */
                    else { this.playerPanelMsg = await this.chat.send(this.getPlayerPanel()); }
                    /* Send paused request message */
                    await this.chat.send(mPanda.start.paused);
                })
                .on(AudioPlayerStatus.Playing, async () => {
                    /* Remove player panel */
                    if (this.playerPanelMsg != null) await this.playerPanelMsg.delete();
                    /* Create new player panel */
                    this.playerPanelMsg = await this.chat.send(this.getPlayerPanel());
                });
            return;
        }
        catch (e: any) {
            let msg: string = (e.message == undefined) ? e : e.message;
            /* Age Restricted -> return */
            if (msg.startsWith('Status code: 410')) {
                await this.chat.send(mPanda.start.ageRestricted);
                await this.skip(this.chat, this.vcId);
            }
            /* Other Error */
            else {
            console.warn(`PandaPlayer [start] - ${msg}`);
                await this.chat.send(mError.executeCmd);
            }
            return;
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
            if (vcId == null) { await this.chat.send(mPanda.unpause.userNotVC); return; }
            /* Bot is not in a vc -> return */
            if (this.vcId == null) { await this.chat.send(mPanda.unpause.botNotVC); return; }
            /* Bot is in a different vc of User -> return */
            if (this.vcId != null && this.vcId != vcId) { await this.chat.send(mPanda.unpause.notSameVC); return; }
            /* Bot is not playing -> return */
            if (this.player.state.status == AudioPlayerStatus.Idle) { await this.chat.send(mPanda.unpause.notPlaying); return; }
            /* Bot is already unpaused -> return */
            if (this.player.state.status == AudioPlayerStatus.Playing) { await this.chat.send(mPanda.unpause.already); return; }

            /* Unpaused the player */
            this.player.unpause(); return;
        }
        catch (e: any) {
            console.warn(`PandaPlayer [unpause] - ${e.message}`);
            await this.chat.send(mError.executeCmd); return;
        }
    }
}