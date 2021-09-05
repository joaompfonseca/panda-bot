import { CommandInteraction, TextBasedChannels } from "discord.js";
import { PandaChat } from "./PandaChat.js";
import { PandaInteractionMessage } from "./PandaInteractionMessage.js";
import { PandaMessage } from "./PandaMessage.js";

export class PandaInteractionChat extends PandaChat {
    int: CommandInteraction;

    /**
     * Custom implementation of discord.js TextBasedChannels with Interactions.
     * @param chat 
     * @param int 
     */
    constructor(chat: TextBasedChannels, int: CommandInteraction) {
        super(chat);
        this.int = int;
    }

    async send(out: string | Object): Promise<PandaMessage> {
        /* Replied to the interaction -> send a message */
        if (this.int.replied) { 
            let msg = await this.chat.send(out);
            return new PandaMessage(msg.createdTimestamp, msg); 
        }
        /* Reply to interaction */
        let startTime = Date.now();
        await this.int.editReply(out);
        let endTime = Date.now();
        let createdTimestamp = this.int.createdTimestamp + endTime - startTime;
        return new PandaInteractionMessage(createdTimestamp, this.int);
    }
}