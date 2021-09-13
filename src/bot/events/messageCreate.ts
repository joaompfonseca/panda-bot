import { Client, Message } from 'discord.js';
import { prefix } from '../config.js';
import { guildHandler } from '../handlers/guilds.js';
import { cmdHandler } from '../handlers/commands.js';
import { PandaChat } from '../commands/PandaChat.js';

/**
 * Runs when client's "messageCreate" event is triggered.
 * @param client 
 * @param msg 
 * @returns 
 */
export async function messageCreate(client: Client, msg: Message): Promise<void> {

    if (msg.author.bot) return;
    if (!msg.content.startsWith(prefix)) return;

    const content = msg.content;
    const argsPos = content.search(/\s/);

    const cmd = (argsPos == -1) ? content.substring(prefix.length) : content.substring(prefix.length, argsPos);
    const args = (argsPos == -1) ? '' : content.substring(argsPos).trimStart();
    const chat = new PandaChat(msg.channel);
    const guild = guildHandler(msg.guildId!, chat, msg.guild!.voiceAdapterCreator);
    const time = msg.createdTimestamp;
    const vcId = msg.member!.voice.channelId;

    await cmdHandler(client, cmd, args, chat, guild, time, vcId); return;
}