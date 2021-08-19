import { TextBasedChannels, MessageEmbed, TextChannel } from 'discord.js';
import msu from 'minecraft-server-util';
import { mcServer } from '../bot-config.js';
import { mError, mHelp, mPing, mGame } from './messages.js';

/**
 * Sends Bot's command info to the given chat.
 * @param chat
 * @returns
 */
export function help(chat: TextBasedChannels): void {
    let embed = new MessageEmbed({ title: 'Comandos' });

    for (let category in mHelp) {
        let text = '';
        for (let term in mHelp[category])
            text += `\n. \`${term}\` : ${mHelp[category][term]}`;
        embed.addField(category, text);
    }

    chat.send({ embeds: [embed] }); return;
}

/**
 * Sends Bot's ping to the given chat.
 * @param chat 
 * @param time in seconds, when message was created.
 * @returns
 */
export async function ping(chat: TextBasedChannels, time: number): Promise<void> {
    let msg = await chat.send(mPing.pinging);
    let ping = msg.createdTimestamp - time;

    msg.delete();

    chat.send(mPing.done(ping)); return;
}

/**
 * Sends Minecraft Server status to the given chat.
 * @param chat 
 * @returns
 */
export async function mc(chat: TextBasedChannels): Promise<void> {
    let embed = new MessageEmbed();

    try {
        let data = await msu.status(mcServer);
        let playerNames = (data.onlinePlayers > 0) ? data.samplePlayers.map(p => p.name).join(', ') : '_ _';

        embed.setColor('#00FF00')
            .setAuthor('ONLINE', 'https://i.imgur.com/JytGYe6.png')
            .setTitle(`\`${data.host}\``)
            .addField('Descrição', data.description.descriptionText, true)
            .addField(`Jogadores (${data.onlinePlayers}/${data.maxPlayers})`, playerNames, true);
    }
    catch (e) {
        embed.setColor('#FF0000')
            .setAuthor('OFFLINE', 'https://i.imgur.com/JytGYe6.png');
    }

    chat.send({ embeds: [embed] }); return;
}

/**
 * Sends a random game to the given chat.
 * @param chat 
 * @param args separated by commas, User given games to randomize.
 * @returns 
 */
export function game(chat: TextBasedChannels, args: string): void {
    let list = args.split(',').map(g => g.trim()).filter(g => g.length > 0);

    /* Invalid arguments */
    if (args.length != 0 && list.length == 0) { chat.send(mError.invalidArgs); return; }
    /* No arguments */
    if (args.length == 0) list = mGame;

    /* Generate a random index */
    let index = Math.floor(Math.random() * list.length);

    chat.send(list[index]); return;
}

/**
 * Sends unknown command message to the given chat.
 * @param chat 
 * @returns 
 */
export function unknown(chat: TextBasedChannels): void { chat.send(mError.unknownCmd); return; }