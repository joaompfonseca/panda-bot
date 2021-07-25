const Discord = require('discord.js');
const ytdl = require('ytdl-core');

let connection;
let dispatcher;
let queue = [];
let seekTime = 0;
let isPlaying = false;


module.exports = class PandaPlayer {
    addSong(song) {
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
}