const Discord = require('discord.js');
const mc = require('minecraft-server-util');
const { helpJson, pingJson, gameJson, invalidJson } = require('./messages');

/**
 * Transforms helpJson.data into a Discord.MessageEmbed and sends it to the respective Discord.TextChannel
 * @param {Discord.Message} msg 
 * @returns 
 */
exports.help = (msg) => {
    let chat = msg.channel;
    let embed = new Discord.MessageEmbed().setTitle('Comandos');

    for (let category in helpJson.data) {
        let text = '';
        for (let term in helpJson.data[category])
            text += `\n. \`${term}\` : ${helpJson.data[category][term]}`;
        embed.addField(category, text);
    }

    return chat.send(embed);
}

/**
 * Determines BOT ping and sends it to the respective Discord.TextChannel
 * @param {Discord.Message} msg 
 * @returns 
 */
exports.ping = async (msg) => {
    let chat = msg.channel;

    let newMsg = await chat.send(pingJson.pinging);
    let ping = newMsg.createdTimestamp - msg.createdTimestamp;
    newMsg.delete();

    return chat.send(pingJson.done(ping));
}

/**
 * Determines the status of the Minecraft server and sends it to the respective Discord.TextChannel
 * @param {Discord.Message} msg 
 * @returns 
 */
exports.mc = async (msg) => {
    let chat = msg.channel;
    let embed = new Discord.MessageEmbed();

    try {
        let data = await mc.status('grelo.ddns.net');
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

    return chat.send(embed);
}

/**
 * Gets random game from gameJson.data or args (if provided) and sends it to the respective Discord.TextChannel
 * @param {Discord.Message} msg 
 * @param {string} args 
 * @returns 
 */
exports.game = (msg, args = '') => {
    let chat = msg.channel;
    let list = args.split(',').map(g => g.trim()).filter(g => g.length > 0);

    /**
     * Invalid arguments provided
     */
    if (args.length != 0 && list.length == 0) return chat.send(gameJson.error.invalidArguments);
    /**
     * No arguments provided
     */
    if (args.length == 0) list = gameJson.data;
    /**
     * Generate random index
     */
    let index = Math.floor(Math.random() * list.length);

    return chat.send(list[index]);
}

/**
 * Sends invalid command alert to the respective Discord.TextChannel
 * @param {Discord.Message} msg 
 * @returns 
 */
exports.invalid = (msg) => {
    let chat = msg.channel;

    return chat.send(invalidJson);
}