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

let chat = null;
let voiceChannel = null;
let connection = null;
let dispatcher = null;

let seekTime = 0;

let isPlaying = false;
let isPaused = false;

const m = {
    error: 'Ocorreu um erro ao executar o comando!',
    join: {
        success: (connection) => `Conectado a <#${connection.channel.id}>.`,
        already: (connection) => `Já estou conectado a <#${connection.channel.id}>! Não tens olhos na vista?`,
        noChannel: 'Como é que queres que eu entre se não estás num canal?'
    },
    leave: {
        success: (connection) => `Desconectado de <#${connection.channel.id}>.`,
        noChannel: 'Como é que queres que eu saia se não estou num canal?'
    }
}

module.exports = class PandaPlayer {

    async seek() {

    }

    async join(msg) {
        /*
        BOT joins the voice channel where USER is
        */
        try {
            chat = msg.channel;
            voiceChannel = msg.member.voice.channel;
            /*
            Returns IF:
                > USER is in not in a voice channel
            */
            if (voiceChannel == null) {
                chat.send(m.join.noChannel);
                return;
            }
            /*
            Returns IF:
                > BOT has a conection
                AND
                > BOT is in the same voice channel as USER
            */
            if (connection != null && connection.channel == voiceChannel) {
                chat.send(m.join.already(connection));
                return;
            }
            /*
            Leaves current channel IF:
                > BOT has a conection
                AND
                > BOT is in a different voice channel than USER
            */
            if (connection != null && connection.channel != voiceChannel) {
                this.leave(msg);
            }
            /*
            Attempts to create a new connection and a disconnect listener
            */
            connection = await voiceChannel.join();
            connection.on('disconnect', () => {
                this.leave(msg, true);
            });
            chat.send(m.join.success(connection));
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

    leave(msg, resetVars = false) {
        /*
        BOT leaves current voice channel
        */
        try {
            chat = msg.channel;
            /*
            Returns IF:
                > BOT is in not in a voice channel
            */
            if (voiceChannel == null) {
                chat.send(m.leave.noChannel);
                return;
            }
            /*
            Saves seekTime and removes all connection listeners
            */
            if (dispatcher != null) seekTime += dispatcher.streamTime;
            connection.removeAllListeners();
            /*
            BOT leaves current voice channel
            */
            voiceChannel.leave();
            chat.send(m.leave.success(connection));
            /*
            Resets variables
            */
            if (resetVars) {
                chat = null;
                voiceChannel = null;
                connection = null;
                dispatcher = null;
            }
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