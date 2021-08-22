import { TextBasedChannels } from 'discord.js';
import { AudioPlayer, createAudioPlayer, DiscordGatewayAdapterCreator, joinVoiceChannel, NoSubscriberBehavior, VoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import { PandaAudio, PandaRequest } from '../interfaces.js';
import { mError, mPanda } from './messages.js';

export class PandaPlayer implements PandaAudio {
    adapterCreator: DiscordGatewayAdapterCreator;
    chat: TextBasedChannels;
    connection: VoiceConnection | null;
    guildId: string;
    isPaused: boolean;
    isPlaying: boolean;
    player: AudioPlayer;
    queue: PandaRequest[];
    seekTime: number;
    vcId: string | null;

    constructor(adapterCreator: DiscordGatewayAdapterCreator, chat: TextBasedChannels, guildId: string) {
        this.adapterCreator = adapterCreator;
        this.chat = chat;
        this.connection = null;
        this.guildId = guildId;
        this.isPaused = false;
        this.isPlaying = false;
        this.player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
        this.queue = [];
        this.seekTime = 0;
        this.vcId = null;
    }

    /**
     * Bot joins User's voice channel.
     * @param chat 
     * @param vcId 
     * @returns 
     */
    async join(chat: TextBasedChannels, vcId: string | null): Promise<void> {
        try {
            this.chat = chat;
            /* User is not in a vc -> return */
            if (vcId == null) { chat.send(mPanda.join.userNotVC); return; }
            /* Bot is in the same vc as User -> return */
            if (this.vcId == vcId) { chat.send(mPanda.join.already(this.vcId)); return; }

            /* Bot is in a different vc of User -> leave current vc */
            if (this.vcId != null && this.vcId != vcId) await this.leave(chat);
            /* Create a connection */
            this.connectTo(vcId); return;
        }
        catch (e) {
            console.warn(e.message);
            this.chat.send(mError.executeCmd); return;
        }
    }

    /**
     * Bot connects to vc
     * @param vcId 
     * @returns
     */
    async connectTo(vcId: string): Promise<void> {
        try {
            /* Create a connection */
            this.connection = joinVoiceChannel({ channelId: vcId, guildId: this.guildId, adapterCreator: this.adapterCreator });
            /* Create connection listeners */
            this.connection
                /* Bot is connected to the vc */
                .on(VoiceConnectionStatus.Ready, () => {
                    this.vcId = vcId;
                    this.chat.send(mPanda.connectTo.success(this.vcId));
                    /* Bot is moved to another vc */
                    this.connection!.on(VoiceConnectionStatus.Connecting, () => {
                        /* Save new vcId before destroying connection */
                        let vcId = this.connection!.joinConfig.channelId!;
                        //this.connection!.destroy();
                        /* Create a new connection */
                        this.connectTo(vcId);
                    })
                })
                /* Bot is disconnected from the vc */
                .on(VoiceConnectionStatus.Disconnected, () => {
                    this.leave(this.chat);
                })
            /* Bot is playing -> continue to play where it left */
            if (this.isPlaying) this.start(this.seekTime);
            return;
        }
        catch (e) {
            console.warn(e.message);
            this.chat.send(mError.executeCmd); return;
        }
    }


    async leave(chat: TextBasedChannels): Promise<void> {
        try {
            this.chat = chat;
            /* User is not in a vc -> return */
            if (this.vcId == null) { chat.send(mPanda.leave.botNotVC); return };
            /* Save seekTime */
            //if (this.isPlaying) this.seekTime += this.dispatcher.streamTime;
            //         this.prevMsg = msg;
            //         this.chat = msg.channel;
            //         /*
            //         BOT is not in a VC -> return
            //         */
            //         if (this.botVC == null) return this.chat.send(m.leave.botNotVC);
            //         /*
            //         save seekTime
            //         remove connection listeners ('disconnect' and 'reconnecting')
            //         remove dispatcher listener ('finish')
            //         */
            //         if (this.isPlaying) this.seekTime += this.dispatcher.streamTime;
            //         if (this.connection != null) this.connection.removeAllListeners();
            //         if (this.dispatcher != null) this.dispatcher.removeAllListeners();
            //         /*
            //         leave VC
            //         */
            //         this.botVC.leave();
            //         await this.chat.send(m.leave.success(this.botVC));
            //         this.botVC = null;
            //     }
            //     catch (e) {
            //         console.log(e.message);
            //         this.chat.send(m.error);
            //     }
        }
        catch (e) {
            console.warn(e.message);
            this.chat.send(mError.executeCmd); return;
        }
    }

    async play(): Promise<void> { }
    async addToQueue(): Promise<void> { }
    async start(time: number = 0): Promise<void> { }
    async pause(): Promise<void> { }
    async resume(): Promise<void> { }
    async skip(): Promise<void> { }
    async clear(): Promise<void> { }
    async getQueue(): Promise<void> { }
}

// /*
// BOT connects to VC
// */
// async connectTo(VC) {
//     try {
//         /*
//         create a new connection
//         */
//         this.connection = await VC.join();
//         this.botVC = this.connection.channel;
//         this.chat.send(m.connectTo.success(this.botVC));
//         /*
//         create connection listeners ('disconnect' and 'reconnecting')
//         */
//         this.connection
//             .once('disconnect', () => {
//                 this.leave(this.prevMsg);
//             })
//             .once('reconnecting', async () => {
//                 await this.leave(this.prevMsg);
//                 this.botVC = this.connection.channel;
//                 this.connectTo(this.botVC);
//             });
//         /*
//         BOT is playing -> continue to play where it left
//         */
//         if (this.isPlaying) this.start(this.seekTime);
//     }
//     catch (e) {
//         console.log(e.message);
//         this.chat.send(m.error);
//     }
// }

// /*
// BOT leaves current VC
// */
// async leave(msg) {
//     
// }

// /*
// BOT handles play request of USER
// */
// async play(msg, req) {
//     try {
//         this.prevMsg = msg;
//         this.chat = msg.channel;
//         this.userVC = msg.member.voice.channel;
//         /*
//         request is empty
//         */
//         if (req.length == 0) return this.chat.send(m.play.emptyQuery);
//         /*
//         USER is not in a VC -> return
//         */
//         if (this.userVC == null) return this.chat.send(m.play.userNotVC);
//         /*
//         BOT is in different VC of USER -> leave current VC
//         */
//         if (this.botVC != null && this.botVC != this.userVC) await this.leave(msg);
//         /*
//         BOT is not in VC of USER -> create a new connection
//         */
//         if (this.botVC != this.userVC) await this.connectTo(this.userVC);
//         /*
//         add request to queue
//         */
//         await this.addToQueue(req);
//         /*
//         BOT is not playing -> start to play
//         */
//         if (!this.isPlaying) this.start();
//     }
//     catch (e) {
//         console.log(e.message);
//         this.chat.send(m.error);
//     }
// }

// /*
// BOT adds request to queue
// */
// async addToQueue(req) {
//     try {
//         let data, info;
//         /*
//         request is a Soundcloud track link
//         */
//         if (req.includes('soundcloud.com/')) {
//             /*
//             get track data
//             */
//             data = await scdl.getInfo(req);
//             /*
//             format track data
//             */
//             info = {
//                 type: 'sc-track',
//                 title: `${data.user.username} - ${data.title}`,
//                 url: data.permalink_url
//             }
//             /*
//             add track to queue
//             */
//             this.queue.push(info);
//             this.chat.send(m.addToQueue.success(info));
//         }
//         /*
//         request is a Youtube video link
//         */
//         else if (req.includes('youtube.com/watch?v=') || req.includes('youtu.be/')) {
//             /*
//             get videoId from request
//             */
//             let videoID;
//             if (req.includes('youtube.com/watch?v=')) {
//                 videoID = req.substring(
//                     req.search('=') + 1,
//                     (req.search('&') == -1) ? req.length : req.search('&')
//                 );
//             }
//             else if (req.includes('youtu.be/')) {
//                 videoID = req.substring(req.search('e/') + 2);
//             }
//             /*
//             get video data
//             */
//             data = await yts({
//                 videoId: videoID
//             });
//             /*
//             format video data
//             */
//             info = {
//                 type: 'yt-video',
//                 title: data.title,
//                 url: data.url
//             }
//             /*
//             add video to queue
//             */
//             this.queue.push(info);
//             this.chat.send(m.addToQueue.success(info));
//         }
//         /*
//         request is a Youtube playlist
//         */
//         else if (req.includes('youtube.com/playlist?list=')) {
//             /*
//             get listId from request
//             */
//             let listID = req.substring(req.search('=') + 1);
//             /*
//             get playlist data
//             */
//             data = await yts({
//                 listId: listID
//             });
//             /*
//             add playlist videos to queue
//             */
//             for (let i = 0; i < data.videos.length; i++) {
//                 info = {
//                     type: 'yt-video',
//                     title: data.videos[i].title,
//                     url: 'https://youtube.com/watch?v=' + data.videos[i].videoId
//                 }
//                 this.queue.push(info);
//             }
//             this.chat.send(m.addToQueue.success(data));
//         }
//         /*
//         request is a Youtube search query
//         */
//         else {
//             /*
//             get video data
//             */
//             data = await yts(req);
//             /*
//             format video data
//             */
//             info = {
//                 type: 'yt-video',
//                 title: data.videos[0].title,
//                 url: data.videos[0].url
//             }
//             /*
//             add video to queue
//             */
//             this.queue.push(info);
//             this.chat.send(m.addToQueue.success(info));
//         }
//     }
//     catch (e) {
//         /*
//         Soundcloud track || Youtube video is unavailable -> return
//         */
//         if (e.message == 'Request failed with status code 404, could not find the song... it may be private - check the URL'
//             || e == 'video unavailable') return this.chat.send(m.addToQueue.notFound);
//         console.log(e.message);
//         this.chat.send(m.error);
//     }
// }

// /*
// BOT plays leading request on queue + time shift in milliseconds (default - 0)
// */
// async start(time = 0) {
//     try {
//         /*
//         queue is empty -> return
//         */
//         if (this.queue.length == 0) return this.chat.send(m.start.emptyQueue);
//         /*
//         create a stream
//         */
//         let stream;
//         switch (this.queue[0].type) {
//             case 'sc-track': stream = await scdl.download(this.queue[0].url); break;
//             case 'yt-video': stream = ytdl(this.queue[0].url); break;
//         }
//         /*
//         create a new dispatcher
//         */
//         this.dispatcher = await this.connection.play(stream, {
//             seek: Math.floor(time / 1000)
//         });
//         this.isPlaying = true;
//         this.chat.send(m.start.currentReq(this.queue[0]))
//         /*
//         create dispatcher listener ('finish')
//         */
//         this.dispatcher.once('finish', () => {
//             /*
//             BOT is not playing
//             reset seekTime
//             remove the request from queue
//             play next request
//             */
//             this.isPlaying = false;
//             this.seekTime = 0;
//             this.chat.send(m.start.endedReq(this.queue.shift()));
//             this.start();
//         });
//         /*
//         BOT is paused -> pause dispatcher
//         */
//         if (this.isPaused) {
//             this.dispatcher.pause();
//             this.chat.send(m.start.isPaused);
//         }
//     }
//     catch (e) {
//         console.log(e.message);
//         this.chat.send(m.error);
//     }
// }

// /*
// BOT pauses current dispatcher
// */
// async pause(msg) {
//     try {
//         this.prevMsg = msg;
//         this.chat = msg.channel;
//         this.userVC = msg.member.voice.channel;
//         /*
//         USER is not in a VC -> return
//         */
//         if (this.userVC == null) return this.chat.send(m.pause.userNotVC);
//         /*
//         BOT is not in a VC -> return
//         */
//         if (this.botVC == null) return this.chat.send(m.pause.botNotVC);
//         /*
//         BOT is not playing -> return
//         */
//         if (!this.isPlaying) return this.chat.send(m.pause.notPlaying);
//         /*
//         BOT is already paused -> return
//         */
//         if (this.isPaused) return this.chat.send(m.pause.already);
//         /*
//         pause dispatcher
//         */
//         this.isPaused = true;
//         this.dispatcher.pause();
//         this.chat.send(m.pause.success);
//     }
//     catch (e) {
//         console.log(e.message);
//         this.chat.send(m.error);
//     }
// }

// /*
// BOT resumes current dispatcher
// */
// async resume(msg) {
//     try {
//         this.prevMsg = msg;
//         this.chat = msg.channel;
//         this.userVC = msg.member.voice.channel;
//         /*
//         USER is not in a VC -> return
//         */
//         if (this.userVC == null) return this.chat.send(m.resume.userNotVC);
//         /*
//         BOT is not in a VC -> return
//         */
//         if (this.botVC == null) return this.chat.send(m.resume.botNotVC);
//         /*
//         BOT is not playing -> return
//         */
//         if (!this.isPlaying) return this.chat.send(m.resume.notPlaying);
//         /*
//         BOT is already resumed -> return
//         */
//         if (!this.isPaused) return this.chat.send(m.resume.already);
//         /*
//         BOT is not paused
//         */
//         this.isPaused = false;
//         /*
//         BOT is playing && BOT has no dispatcher -> create a new dispatcher
//         */
//         if (this.isPlaying && this.dispatcher.destroyed) await this.start(this.seekTime);
//         this.dispatcher.resume(); this.dispatcher.pause(); this.dispatcher.resume();
//         this.chat.send(m.resume.success);
//     }
//     catch (e) {
//         console.log(e.message);
//         this.chat.send(m.error);
//     }
// }

// /*
// BOT skips current request
// */
// async skip(msg) {
//     try {
//         this.prevMsg = msg;
//         this.chat = msg.channel;
//         this.userVC = msg.member.voice.channel;
//         /*
//         USER is not in a VC -> return
//         */
//         if (this.userVC == null) return this.chat.send(m.skip.userNotVC);
//         /*
//         BOT is not in a VC -> return
//         */
//         if (this.botVC == null) return this.chat.send(m.skip.botNotVC);
//         /*
//         BOT is not playing -> return
//         */
//         if (!this.isPlaying) return this.chat.send(m.skip.notPlaying);
//         /*
//         remove dispatcher listener ('finish')
//         */
//         if (this.dispatcher != null) this.dispatcher.removeAllListeners();
//         /*
//         BOT is not playing
//         reset seekTime
//         remove the request from queue
//         play next request
//         */
//         this.isPlaying = false;
//         this.seekTime = 0;
//         this.chat.send(m.skip.success(this.queue.shift()));
//         this.start();
//     }
//     catch (e) {
//         console.log(e.message);
//         this.chat.send(m.error);
//     }
// }

// /*
// BOT clears playlist
// */
// async clear(msg) {
//     try {
//         this.prevMsg = msg;
//         this.chat = msg.channel;
//         this.userVC = msg.member.voice.channel;
//         /*
//         USER is not in a VC -> return
//         */
//         if (this.userVC == null) return this.chat.send(m.clear.userNotVC);
//         /*
//         BOT is not in a VC -> return
//         */
//         if (this.botVC == null) return this.chat.send(m.clear.botNotVC);
//         /*
//         determine number of requests to clear
//         */
//         let numClear = this.queue.length;
//         if (this.isPlaying) numClear -= 1;
//         /*
//         number of requests to clear is 0 -> return
//         */
//         if (numClear == 0) return this.chat.send(m.clear.already);
//         /*
//         clear playlist
//         */
//         this.queue = (this.isPlaying) ? [this.queue[0]] : [];
//         this.chat.send(m.clear.success(numClear));
//     }
//     catch (e) {
//         console.log(e.message);
//         this.chat.send(m.error);
//     }
// }

// /*
// BOT shows playlist content
// */
// async getQueue(msg) {
//     try {
//         this.prevMsg = msg;
//         this.chat = msg.channel;
//         /*
//         queue is empty -> return
//         */
//         if (this.queue.length == 0) return this.chat.send(m.queue.emptyQueue);
//         /*
//         show first five requests in queue
//         */
//         let num = (this.queue.length > 5) ? 5 : this.queue.length;
//         let str = m.queue.currentReq(this.queue[0]);
//         for (let i = 1; i < num; i++)
//             str += '\n' + m.queue.nextReq(this.queue[i]);
//         if (this.queue.length > 5)
//             str += `\n+ \`${this.queue.length - num}\``;
//         this.chat.send(str);
//     }
//     catch (e) {
//         console.log(e.message);
//         this.chat.send(m.error);
//     }
// }
// }


// require('@discordjs/opus');
// require('ffmpeg-static');
// const yts = require('yt-search');
// const ytdl = require('ytdl-core');
// const scdl = require('soundcloud-downloader').default;

