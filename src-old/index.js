require('dotenv').config();
const express = require('express');
const axios = require('axios').default;
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
    let text = msg.content.trim();
    let argsPos = text.search("\\s");
    let pfx = text.substring(0, prefix.length);

    if (msg.author.bot) return;
    if (pfx != prefix) return;

    let guildID = msg.guild.id;
    let guild = guildHandler(guildID);

    let cmd = (argsPos == -1) ? text.substring(prefix.length) : text.substring(prefix.length, argsPos);
    let args = (argsPos == -1) ? '' : text.slice(argsPos).trim();

    cmdHandler(guild, msg, cmd, args);
});

client.ws.on('INTERACTION_CREATE', async interaction => {
    let guildID = interaction.guild_id;
    let guild = guildHandler(guildID);

    /*let disGuild = await client.guilds.fetch(interaction.guild_id);
    let chat = {
        reply: true,
        newMsgDel: false,
        send: async msg => {
            if (chat.reply) {
                let url = `https://discord.com/api/v8/interactions/${interaction.id}/${interaction.token}/callback`;
                let json = { type: 4, data: { content: msg } };
                if (msg instanceof Discord.MessageEmbed)
                    json.data = { embeds: [msg] };

                r = await axios.post(url, json = json);

                chat.reply = false;
                chat.newMsgDel = true;
                let newMsg = {
                    createdTimestamp: Date.now(),
                    delete: () => {
                        return
                        //let url = `https://discord.com/api/v8/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`;
                        //axios.delete(url);
                    }
                };
                return newMsg;
            }
            if (chat.newMsgDel) {
                let url = `https://discord.com/api/v8/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`;
                let json = { content: msg };
                axios.patch(url, json = json);
                return;
            }
            return disGuild.channels.cache.get(interaction.channel_id).send(msg);
        }
    }
    let userVState = disGuild.voiceStates.cache.get(interaction.member.user.id);
    let userVC = null;
    if (userVState != undefined) {
        let userVCID = userVState.channelID;
        userVC = disGuild.channels.cache.get(userVCID);
    }
    let msg = {
        createdTimestamp: Date.now(),
        channel: chat,
        member: {
            voice: {
                channel: userVC
            }
        }
    }*/

    /*let testMSG = new Discord.Message(client, {
        id: '123',
        type: Discord.Constants.MessageTypes.indexOf('DEFAULT'),
        content: 'Hello',
        author: client.user,
        pinned: false,
        tts: false,
        embeds: [],
        attachments: [],
        nonce: '123'
    }, chat);
    console.log(testMSG)*/

    let cmd = interaction.data.name;


    cmdHandler(guild, msg, cmd);
});

client.on('error', (e) => {
    console.log(e.message);
    process.exit(1);
});

client.login(process.env.TOKEN);