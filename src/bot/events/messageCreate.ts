import { Message } from 'discord.js';
import { prefix } from '../bot-config.js';
import { guildHandler } from '../handlers/guilds.js';
import { cmdHandler } from '../handlers/commands.js';

/**
 * Runs when client's "messageCreate" event is triggered.
 * @param msg 
 * @returns
 */
export function messageCreate(msg: Message): void {

    if (msg.author.bot) return;
    if (!msg.content.startsWith(prefix)) return;

    const content = msg.content;
    const argsPos = content.search(/\s/);

    const cmd = (argsPos == -1) ? content.substring(prefix.length) : content.substring(prefix.length, argsPos);
    const args = (argsPos == -1) ? '' : content.substring(argsPos).trimStart();
    const guild = guildHandler(msg.guildId!, msg.channel, msg.guild!.voiceAdapterCreator);
    const chat = msg.channel;
    const time = msg.createdTimestamp;
    const vcId = msg.member!.voice.channelId;

    cmdHandler(cmd, args, guild, chat, time, vcId); return;
}