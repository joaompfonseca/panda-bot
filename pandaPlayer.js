const Discord = require('discord.js');
const ytdl = require('ytdl-core');

//const msg = new Discord.Message();
//const connection = new Discord.VoiceConnection();

const m = {
    error: 'Ocorreu um erro ao executar o comando!',
    join: {
        success: (VC) => `Conectado a <#${VC.id}>.`,
        already: (VC) => `Já estou conectado a <#${VC.id}>! Não tens olhos na vista?`,
        userNotVC: 'Como é que queres que eu entre se não estás num canal?' 
    },
    leave: {
        success: (VC) => `Desconectado de <#${VC.id}>.`,
        botNotVC: 'Como é que queres que eu saia se não estou num canal?'
    }
}

/*
Defining PandaPlayer vars outside the class to eliminate 'this' references inside the code for better reading
*/
let self, prevMsg = chat = userVC = botVC = connection = listners = dispatcher = null;    // refs
let isPlaying, isPaused = false;                                      // boolean
let seekTime = 0;                                                       // int

module.exports = class PandaPlayer {
    
    constructor() {
        self = this;
    }

    join(msg) {
        /*
        BOT joins USER's VC
        */
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
            if (botVC != null && botVC != userVC) self.leave(msg);
            /*
            create a new connection
            */
            setTimeout(() => self.connectTo(userVC), 150);
        }
        catch (e) {
            console.log(e.message);
            return chat.send(m.error);
        }
    }

    async connectTo(VC) {
        /*
        BOT connects to VC
        */
        try {
            /*
            create a new connection
            */
            connection = await VC.join();
            botVC = connection.channel;
            await chat.send(m.join.success(botVC));
            /*
            create connection listeners ('disconnect' and 'reconnecting')
            */
            connection
                .once('disconnect', () => {
                    self.leave(prevMsg);
                })
                .once('reconnecting', function() {
                    this.removeAllListeners();
                    self.leave(prevMsg);
                    botVC = connection.channel;
                    setTimeout(() => self.connectTo(botVC), 150);
                })
            /*
            BOT was playing && BOT was not paused -> continue to play where it left
            */
            if (isPlaying && !isPaused) self.seek();
            return;
        }
        catch (e) {
            console.log(e.message);
            return chat.send(m.error);
        }
    }

    async leave(msg) {
        /*
        BOT leaves current VC
        */
        try {
            prevMsg = msg;
            chat = msg.channel;
            /*
            BOT is not in a VC -> return
            */
            if (botVC == null) return chat.send(m.leave.botNotVC); // PROBLEMA QUANDO MOVEMOS BOT DE SALA EM SALA
            /*
            save seekTime
            remove connection listeners ('disconnect' and 'reconnecting')
            */
            if (isPlaying) seekTime += dispatcher.streamTime;
            connection.removeAllListeners();
            /*
            leave VC
            */
            botVC.leave();
            await chat.send(m.leave.success(botVC));
            botVC = null;
            return;
        }
        catch (e) {
            console.log(e.message);
            return chat.send(m.error);
        }
    }














    /*    addSong(song) {
            queue.push({
                title: song.title,
                url: song.url
            });
        }
    
        isEmpty() {
            return (queue.length == 0) ? true : false;
        }
    
        join(msg) {
            msg.member.voice.channel.join()
                .then(con => {
                    connection = con;
                    if (seekTime != 0)
                        this.play(seekTime);
                });
        }
    
        play(seekTime = 0) {
            if (!this.isEmpty() && !isPlaying) {
                isPlaying = true;
                dispatcher = connection.play(ytdl(queue[0].url), {
                    seek: Math.floor(seekTime / 1000)
                })
                .on('finish', () => {
                    queue.shift();
                    seekTime = 0;
                    isPlaying = false;
                    this.play();
                });
            }
        }
    
        pause() {
            dispatcher.pause();
        }
    
        resume() {
            dispatcher.resume();
            dispatcher.pause();
            dispatcher.resume();
        }
    
        leave(msg) {
            if (dispatcher != undefined)
                seekTime += dispatcher.streamTime;
            isPlaying = false;
            msg.member.voice.channel.leave();
        }
    */
}