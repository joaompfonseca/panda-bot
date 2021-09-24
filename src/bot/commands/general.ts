import { MessageEmbed, Client } from 'discord.js';
import msu from 'minecraft-server-util';
import dotenv from 'dotenv'; dotenv.config();
import { mcServer } from '../config.js';
import { PandaChat } from './PandaChat.js';
import { mError, mHelp, mPing, mGame, mInfo } from './messages.js';

/**
 * Sends a random game to the given chat.
 * @param chat 
 * @param args separated by commas, User given games to randomize.
 * @returns 
 */
 export async function game(chat: PandaChat, args: string): Promise<void> {
    let list = args.split(',').map(g => g.trim()).filter(g => g.length > 0);

    /* Invalid arguments */
    if (args.length != 0 && list.length == 0) { await chat.send(mError.invalidArgs); return; }
    /* No arguments */
    if (args.length == 0) list = mGame;

    /* Generate a random index */
    let index = Math.floor(Math.random() * list.length);

    await chat.send(list[index]); return;
}

/**
 * Sends Bot's command info to the given chat.
 * @param chat
 * @returns
 */
export async function help(chat: PandaChat): Promise<void> {
    let embed = new MessageEmbed({ title: 'Comandos' });

    for (let category in mHelp) {
        let text = '';
        for (let term in mHelp[category])
            text += `\n. \`${term}\` : ${mHelp[category][term]}`;
        embed.addField(category, text);
    }

    await chat.send({ embeds: [embed] }); return;
}

/**
 * Sends Bot's info to given chat.
 * @param client 
 * @param chat 
 * @returns 
 */
export async function info(client: Client, chat: PandaChat): Promise<void> {
    let embed = new MessageEmbed({
        title: mInfo.title,
        description: mInfo.description(client.application!.id, process.env.npm_package_version!)
    });

    await chat.send({ embeds: [embed] }); return;
}

/**
 * Sends Bot's ping to the given chat.
 * @param chat 
 * @param time in seconds, when message was created.
 * @returns
 */
export async function ping(chat: PandaChat, time: number): Promise<void> {
    let msg = await chat.send(mPing.pinging);
    let ping = msg.createdTimestamp - time;

    await msg.edit(mPing.done(ping)); return;
}

/**
 * Sends Minecraft Server status to the given chat.
 * @param chat 
 * @param args User given ip address.
 * @returns 
 */
export async function mc(chat: PandaChat, args: string): Promise<void> {
    let ip = (args.length == 0) ? mcServer : args;
    let embed = new MessageEmbed({ title: `\`${ip}\`` });

    try {
        let data = await msu.status(ip);
        let description = (data.description != null && data.description.toRaw().length > 0) ? data.description.toRaw() : '_ _';
        let playerNames = (data.samplePlayers != null && data.samplePlayers.length > 0) ? data.samplePlayers.map(p => p.name).join(', ') : '_ _';
        
        embed.setColor('#00FF00')
            .setAuthor('ONLINE', 'https://i.imgur.com/JytGYe6.png')
            .addField('Descrição', description, true)
            .addField(`Jogadores (${data.onlinePlayers}/${data.maxPlayers})`, playerNames, true);
    }
    catch (e) {
        embed.setColor('#FF0000')
            .setAuthor('OFFLINE', 'https://i.imgur.com/JytGYe6.png');
    }

    await chat.send({ embeds: [embed] }); return;
}

/**
 * Sends unknown command message to the given chat.
 * @param chat 
 * @returns 
 */
export async function unknown(chat: PandaChat): Promise<void> { await chat.send(mError.unknownCmd); return; }