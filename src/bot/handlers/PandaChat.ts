import { MessageCollector, MessageCollectorOptions, TextBasedChannels } from "discord.js";
import { PandaMessage } from "./PandaMessage.js";

export class PandaChat {
    chat: TextBasedChannels;

    /**
     * Custom implementation of discord.js TextBasedChannels.
     * @param chat 
     */
    constructor(chat: TextBasedChannels) {
        this.chat = chat;
    }

    createMessageCollector(options?: MessageCollectorOptions | undefined): MessageCollector {
        return this.chat.createMessageCollector(options);
    }

    async send(out: string | Object): Promise<PandaMessage> {
        let msg = await this.chat.send(out);
        return new PandaMessage(msg.createdTimestamp, msg);
    }
}