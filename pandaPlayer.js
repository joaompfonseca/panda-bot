const Discord = require('discord.js')
const yts = require('yt-search');
const ytdl = require('ytdl-core');

const m = {
    error: 'Ocorreu um erro ao executar o comando!',
    join: {
        already: (VC) => `Já estou conectado a <#${VC.id}>! Não tens olhos na vista?`,
        userNotVC: 'Como é que queres que eu entre se não estás num canal de voz?'
    },
    connectTo: {
        success: (VC) => `Conectado a <#${VC.id}>.`
    },
    leave: {
        success: (VC) => `Desconectado de <#${VC.id}>.`,
        botNotVC: 'Como é que queres que eu saia se não estou num canal de voz?'
    },
    play: {
        emptyQuery: 'Nem sei o que te faço, então pedes-me para tocar nada?',
        userNotVC: 'Não me podes pedir discos antes de entrares num canal de voz!'
    },
    addToQueue: {
        success: (info) => `Adicionei \`${info.title}\` à playlist.`,
        notFound: 'Não encontrei nada que correspondesse ao teu pedido.'
    },
    start: {
        isPaused: 'Estou em pausa!',
        emptyQueue: 'A minha playlist está vazia!',
        currentReq: (info) => `Agora: \`${info.title}\`.`,
        endedReq: (info) => `Terminou: \`${info.title}\`.`
    },
    pause: {
        success: 'Finalmente uma pausa, já não era sem tempo!',
        userNotVC: 'Não estás num canal de voz!',
        botNotVC: 'Não estou num canal de voz!',
        notPlaying: 'Não posso parar se nem sequer comecei!',
        already: 'Eu já estou na minha pausa, não me chateies.'
    },
    resume: {
        success: 'Estou a tocar novamente!',
        userNotVC: 'Não estás num canal de voz!',
        botNotVC: 'Não estou num canal de voz!',
        notPlaying: 'Não posso continuar se nem sequer comecei!',
        already: 'Eu já estou a tocar, não me chateies.'
    },
    skip: {
        success: (info) => `Saltei: \`${info.title}\`.`,
        userNotVC: 'Não estás num canal de voz!',
        botNotVC: 'Não estou num canal de voz!',
        notPlaying: 'Não posso saltar sem primeiro estar a tocar!'
    },
    clear: {
        success: (num) => `Limpei \`${num}\` ${(num == 1) ? 'pedido' : 'pedidos'} da playlist.`,
        userNotVC: 'Não estás num canal de voz!',
        botNotVC: 'Não estou num canal de voz!',
        already: 'Não há nada para limpar!'
    },
    queue: {
        emptyQueue: 'A minha playlist está vazia!',
        currentReq: (info) => `Agora: \`${info.title}\`.`,
        nextReq: (info) => `Depois: \`${info.title}\``
    }
}

module.exports = class PandaPlayer {
    /*
    References:
        - prevMsg       > previous Discord.Message
        - chat          > current Discord.TextChannel
        - userVC        > current USER Discord.VoiceChannel
        - botVC         > current BOT Discord.VoiceChannel
        - connection    > current Discord.VoiceConnection
        - dispatcher    > current Discord.StreamDispatcher
    Boolean:
        - isPlaying     > current playing status
        - isPaused      > current paused status
    Integer:
        - seekTime      > current request Discord.StreamDispatcher.streamTime
    Array:
        - queue         > current request list
    */
    constructor() {
        this.prevMsg = this.chat = this.userVC = this.botVC = this.connection = this.dispatcher = null;         
        this.isPlaying = this.isPaused = false;                                             
        this.seekTime = 0;                                                             
        this.queue = [];
    }

    /*
    BOT joins USER's VC
    */
    async join(msg) {
        try {
            this.prevMsg = msg;
            this.chat = msg.channel;
            this.userVC = msg.member.voice.channel;
            /*
            USER is not in a VC -> return
            */
            if (this.userVC == null) return this.chat.send(m.join.userNotVC);
            /*
            BOT is in same VC as USER -> return
            */
            if (this.botVC != null && this.botVC == this.userVC) return this.chat.send(m.join.already(this.botVC));
            /*
            BOT is in different VC of USER -> leave current VC
            */
            if (this.botVC != null && this.botVC != this.userVC) await this.leave(msg);
            /*
            create a new connection
            */
            this.connectTo(this.userVC);
        }
        catch (e) {
            console.log(e.message);
            this.chat.send(m.error);
        }
    }

    /*
    BOT connects to VC
    */
    async connectTo(VC) {
        try {
            /*
            create a new connection
            */
            this.connection = await VC.join();
            this.botVC = this.connection.channel;
            this.chat.send(m.connectTo.success(this.botVC));
            /*
            create connection listeners ('disconnect' and 'reconnecting')
            */
            this.connection
                .once('disconnect', () => {
                    this.leave(this.prevMsg);
                })
                .once('reconnecting', async () => {
                    await this.leave(this.prevMsg);
                    this.botVC = this.connection.channel;
                    this.connectTo(this.botVC);
                });
            /*
            BOT is playing -> continue to play where it left
            */
            if (this.isPlaying) this.start(this.seekTime);
        }
        catch (e) {
            console.log(e.message);
            this.chat.send(m.error);
        }
    }

    /*
    BOT leaves current VC
    */
    async leave(msg) {
        try {
            this.prevMsg = msg;
            this.chat = msg.channel;
            /*
            BOT is not in a VC -> return
            */
            if (this.botVC == null) return this.chat.send(m.leave.botNotVC);
            /*
            save seekTime
            remove connection listeners ('disconnect' and 'reconnecting')
            remove dispatcher listener ('finish')
            */
            if (this.isPlaying) this.seekTime += this.dispatcher.streamTime;
            if (this.connection != null) this.connection.removeAllListeners();
            if (this.dispatcher != null) this.dispatcher.removeAllListeners();
            /*
            leave VC
            */
            this.botVC.leave();
            await this.chat.send(m.leave.success(this.botVC));
            this.botVC = null;
        }
        catch (e) {
            console.log(e.message);
            this.chat.send(m.error);
        }
    }

    /*
    BOT handles play request of USER
    */
    async play(msg, req) {
        try {
            this.prevMsg = msg;
            this.chat = msg.channel;
            this.userVC = msg.member.voice.channel;
            /*
            request is empty
            */
            if (req.length == 0) return this.chat.send(m.play.emptyQuery);
            /*
            USER is not in a VC -> return
            */
            if (this.userVC == null) return this.chat.send(m.play.userNotVC);
            /*
            BOT is in different VC of USER -> leave current VC
            */
            if (this.botVC != null && this.botVC != this.userVC) await this.leave(msg);
            /*
            BOT is not in VC of USER -> create a new connection
            */
            if (this.botVC != this.userVC) await this.connectTo(this.userVC);
            /*
            add request to queue
            */
            await this.addToQueue(req);
            /*
            BOT is not playing -> start to play
            */
            if (!this.isPlaying) this.start();
        }
        catch (e) {
            console.log(e.message);
            this.chat.send(m.error);
        }
    }

    /*
    BOT adds request to queue
    */
    async addToQueue(req) {
        try {
            let data, info;
            /*
            request is a Youtube video link
            */
            if (req.includes('youtube.com/watch?v=') || req.includes('youtu.be/')) {
                /*
                get videoId from request
                */
                let videoID;
                if (req.includes('youtube.com/watch?v=')) {
                    videoID = req.substring(
                        req.search('=') + 1,
                        (req.search('&') == -1) ? req.length : req.search('&')
                    );
                }
                else if (req.includes('youtu.be/')) {
                    videoID = req.substring(req.search('e/') + 2);
                }
                /*
                get video data
                */
                data = await yts({
                    videoId: videoID
                });
                /*
                format video data
                */
                info = {
                    type: 'yt-video',
                    title: data.title,
                    url: data.url
                }
                /*
                add video to queue
                */
                this.queue.push(info);
                chat.send(m.addToQueue.success(info));
            }
            /*
            request is a Youtube playlist
            */
            else if (req.includes('youtube.com/playlist?list=')) {
                /*
                get listId from request
                */
                let listID = req.substring(req.search('=') + 1);
                /*
                get playlist data
                */
                data = await yts({
                    listId: listID
                });
                /*
                add playlist videos to queue
                */
                for (let i = 0; i < data.videos.length; i++) {
                    info = {
                        type: 'yt-video',
                        title: data.videos[i].title,
                        url: 'https://youtube.com/watch?v=' + data.videos[i].videoId
                    }
                    this.queue.push(info);
                }
                this.chat.send(m.addToQueue.success(data));
            }
            /*
            request is a Youtube search query
            */
            else {
                /*
                get video data
                */
                data = await yts(req);
                /*
                format video data
                */
                info = {
                    type: 'yt-video',
                    title: data.videos[0].title,
                    url: data.videos[0].url
                }
                /*
                add video to queue
                */
                this.queue.push(info);
                this.chat.send(m.addToQueue.success(info));
            }
        }
        catch (e) {
            /*
            Youtube video is unavailable -> return
            */
            if (e == 'video unavailable') return this.chat.send(m.addToQueue.notFound);
            console.log(e.message);
            this.chat.send(m.error);
        }
    }

    /*
    BOT plays leading request on queue + time shift in milliseconds (default - 0)
    */
    async start(time = 0) {
        try {
            /*
            BOT is paused -> return
            */
            if (this.isPaused) return this.chat.send(m.start.isPaused);
            /*
            queue is empty -> return
            */
            if (this.queue.length == 0) return this.chat.send(m.start.emptyQueue);
            /*
            create a new dispatcher
            */
            this.dispatcher = await this.connection.play(ytdl(this.queue[0].url), {
                seek: Math.floor(time / 1000)
            });
            this.isPlaying = true;
            this.chat.send(m.start.currentReq(this.queue[0]))
            /*
            create dispatcher listener ('finish')
            */
            this.dispatcher.once('finish', () => {
                /*
                BOT is not playing
                reset seekTime
                remove the request from queue
                play next request
                */
                this.isPlaying = false;
                this.seekTime = 0;
                this.chat.send(m.start.endedReq(this.queue.shift()));
                this.start();
            });
        }
        catch (e) {
            console.log(e.message);
            this.chat.send(m.error);
        }
    }

    /*
    BOT pauses current dispatcher
    */
    async pause(msg) {
        try {
            this.prevMsg = msg;
            this.chat = msg.channel;
            this.userVC = msg.member.voice.channel;
            /*
            USER is not in a VC -> return
            */
            if (this.userVC == null) return this.chat.send(m.pause.userNotVC);
            /*
            BOT is not in a VC -> return
            */
            if (this.botVC == null) return this.chat.send(m.pause.botNotVC);
            /*
            BOT is not playing -> return
            */
            if (!this.isPlaying) return this.chat.send(m.pause.notPlaying);
            /*
            BOT is already paused -> return
            */
            if (this.isPaused) return this.chat.send(m.pause.already);
            /*
            pause dispatcher
            */
            this.isPaused = true;
            this.dispatcher.pause();
            this.chat.send(m.pause.success);
        }
        catch (e) {
            console.log(e.message);
            this.chat.send(m.error);
        }
    }

    /*
    BOT resumes current dispatcher
    */
    async resume(msg) {
        try {
            this.prevMsg = msg;
            this.chat = msg.channel;
            this.userVC = msg.member.voice.channel;
            /*
            USER is not in a VC -> return
            */
            if (this.userVC == null) return this.chat.send(m.resume.userNotVC);
            /*
            BOT is not in a VC -> return
            */
            if (this.botVC == null) return this.chat.send(m.resume.botNotVC);
            /*
            BOT is not playing -> return
            */
            if (!this.isPlaying) return this.chat.send(m.resume.notPlaying);
            /*
            BOT is already resumed -> return
            */
            if (!this.isPaused) return this.chat.send(m.resume.already);
            /*
            BOT is not paused
            */
            this.isPaused = false;
            /*
            BOT is playing && BOT has no dispatcher -> create a new dispatcher
            */
            if (this.isPlaying && this.dispatcher.destroyed) await this.start(this.seekTime);
            this.dispatcher.resume(); this.dispatcher.pause(); this.dispatcher.resume();
            this.chat.send(m.resume.success);
        }
        catch (e) {
            console.log(e.message);
            this.chat.send(m.error);
        }
    }

    /*
    BOT skips current request
    */
    async skip(msg) {
        try {
            this.prevMsg = msg;
            this.chat = msg.channel;
            this.userVC = msg.member.voice.channel;
            /*
            USER is not in a VC -> return
            */
            if (this.userVC == null) return this.chat.send(m.skip.userNotVC);
            /*
            BOT is not in a VC -> return
            */
            if (this.botVC == null) return this.chat.send(m.skip.botNotVC);
            /*
            BOT is not playing -> return
            */
            if (!this.isPlaying) return this.chat.send(m.skip.notPlaying);
            /*
            remove dispatcher listener ('finish')
            */
            if (this.dispatcher != null) this.dispatcher.removeAllListeners();
            /*
            BOT is not playing
            reset seekTime
            remove the request from queue
            play next request
            */
            this.isPlaying = false;
            this.seekTime = 0;
            this.chat.send(m.skip.success(this.queue.shift()));
            this.start();
        }
        catch (e) {
            console.log(e.message);
            this.chat.send(m.error);
        }
    }

    /*
    BOT clears playlist
    */
    async clear(msg) {
        try {
            this.prevMsg = msg;
            this.chat = msg.channel;
            this.userVC = msg.member.voice.channel;
            /*
            USER is not in a VC -> return
            */
            if (this.userVC == null) return this.chat.send(m.clear.userNotVC);
            /*
            BOT is not in a VC -> return
            */
            if (this.botVC == null) return this.chat.send(m.clear.botNotVC);
            /*
            determine number of requests to clear
            */
            let numClear = this.queue.length;
            if (this.isPlaying) numClear -= 1;
            /*
            number of requests to clear is 0 -> return
            */
            if (numClear == 0) return this.chat.send(m.clear.already);
            /*
            clear playlist
            */
            this.queue = (this.isPlaying) ? [this.queue[0]] : [];
            this.chat.send(m.clear.success(numClear));
        }
        catch (e) {
            console.log(e.message);
            this.chat.send(m.error);
        }
    }

    /*
    BOT shows playlist content
    */
    async getQueue(msg) {
        try {
            this.prevMsg = msg;
            this.chat = msg.channel;
            /*
            queue is empty -> return
            */
            if (this.queue.length == 0) return this.chat.send(m.queue.emptyQueue);
            /*
            show first five requests in queue
            */
            let num = (this.queue.length > 5) ? 5 : this.queue.length;
            let str = m.queue.currentReq(this.queue[0]);
            for (let i = 1; i < num; i++)
                str += '\n' + m.queue.nextReq(this.queue[i]);
            if (this.queue.length > 5)
                str += `\n+ \`${this.queue.length - num}\``;
            this.chat.send(str);
        }
        catch (e) {
            console.log(e.message);
            this.chat.send(m.error);
        }
    }
}