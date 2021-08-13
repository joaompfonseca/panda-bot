require('dotenv').config();
const express = require('express');
const Discord = require('discord.js');
const guildHandler = require('./bot/handlers/guildHandler');
const cmdHandler = require('./bot/handlers/cmdHandler');

const app = express();
const client = new Discord.Client();
const prefix = "pb.";


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
    
    let guildID = msg.guild.id;
    let guild = guildHandler(guildID);

    cmdHandler(guild, msg, cmd, args);
});

client.on('error', (e) => {
    console.log(e.message);
    process.exit(1);
});

client.login(process.env.TOKEN);