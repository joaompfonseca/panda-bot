const Discord = require('discord.js');
const ytdl = require('ytdl-core');

//const msg = new Discord.Message();
//const connection = new Discord.VoiceConnection();

/*
let connection;
let dispatcher;
let queue = [];
let seekTime = 0;
let isPlaying = false;
*/

let msg = null;
let chat = null;

let userVC = null;
let botVC = null;

let connection = null;
let dispatcher = null;

let isPlaying = false; //== dispatcher ativo
let isPaused = false;

let seekTime = 0;

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

module.exports = class PandaPlayer {

    async seek() {

    }

    async join(msg) {
        /*
        BOT joins USER's VC
        */
        try {
            this.msg = msg;
            chat = msg.channel;
            userVC = msg.member.voice.channel;
            /*
            Returns IF:
                > USER is in not in a VC
            */
            if (userVC == null) {
                chat.send(m.join.userNotVC);
                return;
            }
            /*
            Returns IF:
                > BOT is in a VC
                AND
                > BOT is in same VC as USER
            */
            if (botVC != null && botVC == userVC) {
                chat.send(m.join.already(botVC));
                return;
            }
            /*
            BOT leaves its VC IF:
                > BOT is in a VC
                AND
                > BOT is in different VC of USER
            */
            if (botVC != null && botVC != userVC) {
                this.leave(msg);
            }
            //Create a new connection
            connection = await userVC.join();
            botVC = connection.channel;
            chat.send(m.join.success(botVC));
            //Create 'disconnect' listner
            connection.on('disconnect', () => {
                this.leave(this.msg);
            });
            /*
            Continues playing where it left IF:
                > BOT was playing
                AND
                > BOT wasn't paused
            */
            if (isPlaying && !isPaused) this.seek();

        }
        catch (e) {
            console.log(e.message);
            chat.send(m.error);
        }
    }

    leave(msg) {
        /*
        BOT leaves current VC
        */
        try {
            this.msg = msg;
            chat = msg.channel;
            /*
            Returns IF:
                > BOT is not in a VC
            */
            if (botVC == null) {
                chat.send(m.leave.botNotVC);
                return;
            }
            //Save seekTime
            if (isPlaying) seekTime += dispatcher.streamTime;
            //Remove 'disconnect' listner
            connection.removeAllListeners();
            //Leave channel
            botVC.leave();
            chat.send(m.leave.success(botVC));
            //Set botVC to null
            botVC = null;
        }
        catch (e) {
            console.log(e.message);
            chat.send(m.error);
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