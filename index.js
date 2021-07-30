require('dotenv').config();
const express = require('express');
const Discord = require('discord.js');
const PandaPlayer = require('./pandaPlayer');
const mc = require('minecraft-server-util');
const ytdl = require('ytdl-core');
const yts = require('yt-search')

const app = express();
const client = new Discord.Client();
const pandaPlayer = new PandaPlayer();
const prefix = "pb.";
const help = {
    'help': 'é trivial',
    'ping': 'digo pong',
    'mc': 'status do servidor',
    'join': 'dj panda ao serviço',
    'leave': 'volto para o gabinete',
    'play [...]': 'dou-te música',
    'pause': 'para kit-kat',
    'resume': 'a festa continua'
};

app.get('/', (req, res) => {
    res.send('Bot is online!');
});

app.listen(3000, () => {
    console.log('Server is ready!');
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    let chat = msg.channel;
    let text = msg.content.trim();
    let argsPos = text.search("\\s");

    let pfx = text.substring(0, prefix.length);
    let cmd = (argsPos == -1) ? text.substring(prefix.length) : text.substring(prefix.length, argsPos);
    let args = (argsPos == -1) ? '' : text.slice(argsPos).trim();

    if (msg.author.bot) return;
    if (pfx != prefix) return;

    switch (cmd) {
        case 'help':
            let output = '>>> **Comandos**';
            for (let key in help) {
                output += `\n\t\`${key}\` : ${help[key]}`;
            }
            chat.send(output);
            break;
        case 'ping':
            chat.send('Pinging...').then(m => {
                let ping = m.createdTimestamp - msg.createdTimestamp;
                m.delete();
                chat.send(`Pong! ${ping} ms`);
            });
            break;
        case 'mc':
            mc.status('grelo.ddns.net')
                .then(data => {
                    let playerNames = '_ _';
                    if (data.onlinePlayers > 0) {
                        playerNames = [];
                        for (let i = 0; i < data.samplePlayers.length; i++)
                            playerNames.push(data.samplePlayers[i].name);
                        playerNames.join(', ');
                    }

                    let mcInfo = new Discord.MessageEmbed()
                        .setColor('#00FF00')
                        .setAuthor('ONLINE', 'https://www.freeiconspng.com/uploads/minecraft-icon-0.png')
                        .setTitle(`\`${data.host}\``)
                        .addField('Descrição', data.description.descriptionText, true)
                        .addField(`Jogadores (${data.onlinePlayers}/${data.maxPlayers})`, playerNames, true);

                        chat.send(mcInfo);
                })
                .catch(e => {
                    let mcInfo = new Discord.MessageEmbed()
                        .setColor('#FF0000')
                        .setAuthor('OFFLINE', 'https://www.freeiconspng.com/uploads/minecraft-icon-0.png')

                    chat.send(mcInfo);
                });
            break;
        case 'join':
            pandaPlayer.join(msg);
            break;
        /*case 'join':
            pandaPlayer.join(msg);
            break;
        case 'play':
            pandaPlayer.join(msg);
            yts(args)
                .then(data => {
                    pandaPlayer.addSong(data.all[0]);
                    pandaPlayer.play();
                });
            break;*/
        case 'leave':
            pandaPlayer.leave(msg);
            break;
        /*case 'pause':
            pandaPlayer.pause();
            break;
        case 'resume':
            pandaPlayer.resume();
            break;*/
        default:
            msg.channel.send('Esse comando não existe. Tenta `pb.help` para não passares vergonha novamente.');
    }
});

client.login(process.env.TOKEN);