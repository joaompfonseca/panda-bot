const Discord = require('discord.js');
const yts = require('yt-search');
const ytdl = require('ytdl-core');

//const msg = new Discord.Message();
//const connection = new Discord.VoiceConnection();

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
        endedReq: (info) => `Terminei: \`${info.title}\`.`
    },
    pause: {
        success: 'Finalmente uma pausa, já não era sem tempo!',
        botNotVC: 'Não estou num canal de voz!',
        notPlaying: 'Não posso parar se nem sequer comecei!',
        already: 'Eu já estou na minha pausa, por favor não me incomodes.'
    },
    resume: {
        success: 'Estou a tocar novamente!',
        botNotVC: 'Não estou num canal de voz!',
        notPlaying: 'Não posso continuar se nem sequer comecei!',
        already: 'Eu já estou a tocar, não me chateies.'
    },
    skip: {
        success: (info) => `Saltei: \`${info.title}\`.`,
        botNotVC: 'Não estou num canal de voz!',
        notPlaying: 'Não posso saltar sem primeiro estar a tocar!',
    }
}

/*
Defining PandaPlayer vars outside the class to eliminate 'this' references inside the code for better reading
*/
let prevMsg = chat = userVC = botVC = connection = dispatcher = null;         // refs
let isPlaying = isPaused = false;                                             // boolean
let seekTime = 0;                                                             // int
let queue = [];                                                               // array {title: song.title, url: song.url}

module.exports = class PandaPlayer {
    /*
    BOT joins USER's VC
    */
    async join(msg) {
        try {
            prevMsg = msg;
            chat = msg.channel;
            userVC = msg.member.voice.channel;
            /*
            USER is not in a VC -> return
            */
            if (userVC == null) return chat.send(m.join.userNotVC);
            /*
            BOT is in same VC as USER -> return
            */
            if (botVC != null && botVC == userVC) return chat.send(m.join.already(botVC));
            /*
            BOT is in different VC of USER -> leave current VC
            */
            if (botVC != null && botVC != userVC) await this.leave(msg);
            /*
            create a new connection
            */
            this.connectTo(userVC);
        }
        catch (e) {
            console.log(e.message);
            chat.send(m.error);
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
            connection = await VC.join();
            botVC = connection.channel;
            chat.send(m.connectTo.success(botVC));
            /*
            create connection listeners ('disconnect' and 'reconnecting')
            */
            connection
                .once('disconnect', () => {
                    this.leave(prevMsg);
                })
                .once('reconnecting', async () => {
                    await this.leave(prevMsg);
                    botVC = connection.channel;
                    this.connectTo(botVC);
                });
            /*
            BOT is playing -> continue to play where it left
            */
            if (isPlaying) this.start(seekTime);
        }
        catch (e) {
            console.log(e.message);
            chat.send(m.error);
        }
    }

    /*
    BOT leaves current VC
    */
    async leave(msg) {
        try {
            prevMsg = msg;
            chat = msg.channel;
            /*
            BOT is not in a VC -> return
            */
            if (botVC == null) return chat.send(m.leave.botNotVC);
            /*
            save seekTime
            remove connection listeners ('disconnect' and 'reconnecting')
            remove dispatcher listener ('finish')
            */
            if (isPlaying) seekTime += dispatcher.streamTime;
            if (connection != null) connection.removeAllListeners();
            if (dispatcher != null) dispatcher.removeAllListeners();
            /*
            leave VC
            */
            botVC.leave();
            await chat.send(m.leave.success(botVC));
            botVC = null;
        }
        catch (e) {
            console.log(e.message);
            chat.send(m.error);
        }
    }

    /*
    BOT handles play request of USER
    */
    async play(msg, req) {
        try {
            prevMsg = msg;
            chat = msg.channel;
            userVC = msg.member.voice.channel;
            /*
            request is empty
            */
            if (req.length == 0) return chat.send(m.play.emptyQuery);
            /*
            USER is not in a VC -> return
            */
            if (userVC == null) return chat.send(m.play.userNotVC);
            /*
            BOT is in different VC of USER -> leave current VC
            */
            if (botVC != null && botVC != userVC) await this.leave(msg);
            /*
            BOT is not in VC of USER -> create a new connection
            */
            if (botVC != userVC) await this.connectTo(userVC);
            /*
            add request to queue
            */
            await this.addToQueue(req);
            /*
            BOT is not playing -> start to play
            */
            if (!isPlaying) this.start();
        }
        catch (e) {
            console.log(e.message);
            chat.send(m.error);
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
            if (req.includes('www.youtube.com/watch?v=')) {
                /*
                get videoId from request
                */
                let videoID = req.substring(
                    req.search('=') + 1,
                    (req.search('&') == -1) ? req.length : req.search('&')
                );
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
                    title: data.all[0].title,
                    url: data.all[0].url
                }
            }
            /*
            add to queue
            */
            queue.push(info);
            chat.send(m.addToQueue.success(info));
        }
        catch (e) {
            /*
            Youtube video is unavailable -> return
            */
            if (e == 'video unavailable') return chat.send(m.addToQueue.notFound);
            console.log(e.message);
            chat.send(m.error);
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
            if (isPaused) return chat.send(m.start.isPaused);
            /*
            queue is empty -> return
            */
            if (queue.length == 0) return chat.send(m.start.emptyQueue);
            /*
            create a new dispatcher
            */
            dispatcher = await connection.play(ytdl(queue[0].url), {
                seek: Math.floor(time / 1000)
            });
            isPlaying = true;
            chat.send(m.start.currentReq(queue[0]))
            /*
            create dispatcher listener ('finish')
            */
            dispatcher.once('finish', () => {
                /*
                BOT is not playing
                reset seekTime
                remove the request from queue
                play next request
                */
                isPlaying = false;
                seekTime = 0;
                chat.send(m.start.endedReq(queue.shift()));
                this.start();
            });
        }
        catch (e) {
            console.log(e.message);
            chat.send(m.error);
        }
    }

    /*
    BOT pauses current dispatcher
    */
    async pause(msg) {
        try {
            prevMsg = msg;
            chat = msg.channel;
            /*
            BOT is not in a VC
            */
            if (botVC == null) return chat.send(m.pause.botNotVC);
            /*
            BOT is not playing -> return
            */
            if (!isPlaying) return chat.send(m.pause.notPlaying);
            /*
            BOT is already paused -> return
            */
            if (isPaused) return chat.send(m.pause.already);
            /*
            pause dispatcher
            */
            isPaused = true;
            dispatcher.pause();
            chat.send(m.pause.success);
        }
        catch (e) {
            console.log(e.message);
            chat.send(m.error);
        }
    }

    /*
    BOT resumes current dispatcher
    */
    async resume(msg) {
        try {
            prevMsg = msg;
            chat = msg.channel;
            /*
            BOT is not in a VC
            */
            if (botVC == null) return chat.send(m.resume.botNotVC);
            /*
            BOT is not playing -> return
            */
            if (!isPlaying) return chat.send(m.resume.notPlaying);
            /*
            BOT is already resumed -> return
            */
            if (!isPaused) return chat.send(m.resume.already);
            /*
            BOT is not paused
            */
            isPaused = false;
            /*
            BOT is playing && BOT has no dispatcher -> create a new dispatcher
            */
            if (isPlaying && dispatcher.destroyed) await this.start(seekTime);
            dispatcher.resume(); dispatcher.pause(); dispatcher.resume();
            chat.send(m.resume.success);
        }
        catch (e) {
            console.log(e.message);
            chat.send(m.error);
        }
    }

    /*
    BOT skips current request
    */
    async skip(msg) {
        try {
            prevMsg = msg;
            chat = msg.channel;
            /*
            BOT is not in a VC
            */
            if (botVC == null) return chat.send(m.skip.botNotVC);
            /*
            BOT is not playing -> return
            */
            if (!isPlaying) return chat.send(m.skip.notPlaying);
            /*
            remove dispatcher listener ('finish')
            */
            if (dispatcher != null) dispatcher.removeAllListeners();
            /*
            BOT is not playing
            reset seekTime
            remove the request from queue
            play next request
            */
            isPlaying = false;
            seekTime = 0;
            chat.send(m.skip.success(queue.shift()));
            this.start();
        }
        catch {
            console.log(e.message);
            chat.send(m.error);
        }
    }
}