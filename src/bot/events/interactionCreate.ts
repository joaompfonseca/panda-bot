import { Client, Interaction } from "discord.js";
import { PandaInteractionChat } from "../commands/PandaInteractionChat.js";
import { guildHandler } from "../handlers/guilds.js";
import { cmdHandler } from "../handlers/commands.js";

/**
 * Runs when client's "interactionCreate" event is triggered.
 * @param int 
 * @returns
 */
export async function interactionCreate(client: Client, int: Interaction): Promise<void> {

    if (!int.isCommand()) return;
    await int.deferReply();

    const cmd = int.commandName;
    const args = (int.options.data.length == 0) ? '' : int.options.data[0].value!.toString();
    const chat = new PandaInteractionChat(int.channel!, int);
    const guild = guildHandler(chat, client, int.guild!);
    const time = int.createdTimestamp;
    const vcId = (int.guild!.voiceStates.cache.get(int.member!.user.id) == undefined) ? null : int.guild!.voiceStates.cache.get(int.member!.user.id)!.channelId;

    await cmdHandler(client, cmd, args, chat, guild, time, vcId); return;
}