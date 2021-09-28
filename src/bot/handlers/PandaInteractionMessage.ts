import { CommandInteraction, MessageComponentInteraction, MessagePayload, WebhookEditMessageOptions } from "discord.js";
import { PandaMessage } from "./PandaMessage.js";

export class PandaInteractionMessage extends PandaMessage {
    int: CommandInteraction | MessageComponentInteraction;

    /**
     * Custom implementation of discord.js Message with Interactions.
     * @param createdTimestamp 
     * @param int 
     */
    constructor(createdTimestamp: number, int: CommandInteraction | MessageComponentInteraction) {
        super(createdTimestamp, undefined);
        this.int = int;
    }

    async delete(): Promise<PandaMessage> {
        try {
            await this.int.deleteReply();
            this.deleted = true;
            return this;
        }
        catch (e: any) {
            let msg = e.message;
            /* Other Error */
            if (!msg.startsWith('Unknown Message')) console.warn(e.message);
            return this;
        }
    }

    async edit(out: string | WebhookEditMessageOptions | MessagePayload): Promise<PandaMessage> {
        try {
            if (this.deleted) return this;

            let startTime = Date.now();
            await this.int.editReply(out);
            let endTime = Date.now();
            let createdTimestamp = this.int.createdTimestamp + endTime - startTime;
            return new PandaInteractionMessage(createdTimestamp, this.int);
        }
        catch (e: any) {
            let msg = e.message;
            /* Other Error */
            if (!msg.startsWith('Unknown Message')) console.warn(e.message);
            return this;
        }
    }
}