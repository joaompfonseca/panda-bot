require('dotenv').config();
const express = require('express');
const Discord = require('discord.js');
const PandaPlayer = require('./pandaPlayer');
const mc = require('minecraft-server-util');

const app = express();
const client = new Discord.Client();
const pandaPlayer = new PandaPlayer();
const prefix = "pb.";
const help = {
    'help': 'é trivial',
    'ping': 'digo pong',
    'mc': 'status do servidor',
    'game ?[...],[...]': 'sugiro-te um jogo',
    'join': 'dj panda ao serviço',
    'leave/disconnect': 'volto para o gabinete',
    'play [...]': 'dou-te música',
    'pause': 'para kit-kat',
    'resume': 'a festa continua',
    'skip': 'salto para a próximo som'
};
const game = [
    'Minecraft',
    'GTA V',
    'CS:GO',
    'Xadrez',
    'Team Fortress 2',
    'Portal 2'
];

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
        case 'game':
            let list = game;
            if (args.length != 0) {
                list = args.split(',');
                list.forEach(g => g.trim());
            }
            let index = Math.floor(Math.random() * list.length);
            chat.send(list[index]);
            break;
        case 'join':
            pandaPlayer.join(msg);
            break;
        case 'leave':
        case 'disconnect':
            pandaPlayer.leave(msg);
            break;
        case 'play':
            pandaPlayer.play(msg, args);
            break;
        case 'pause':
            pandaPlayer.pause(msg);
            break;
        case 'resume':
            pandaPlayer.resume(msg);
            break;
        case 'skip':
            pandaPlayer.skip(msg);
            break;
        default:
            msg.channel.send('Esse comando não existe. Tenta `pb.help` para não passares vergonha novamente.');
    }
});

client.login(process.env.TOKEN);