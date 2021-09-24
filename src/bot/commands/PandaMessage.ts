import { Message, MessageEditOptions, MessagePayload } from "discord.js";

export class PandaMessage {
    createdTimestamp: number;
    msg: Message | undefined;

    /**
     * Custom implementation of discord.js Message.
     * @param createdTimestamp 
     * @param msg 
     */
    constructor(createdTimestamp: number, msg: Message | undefined) {
        this.createdTimestamp = (!msg) ? createdTimestamp : msg.createdTimestamp;
        this.msg = msg;
    }

    async delete(): Promise<PandaMessage> {
        try {
            await this.msg!.delete();
        }
        catch (e: any) {
            let msg = e.message;
            /* Other Error */
            if (!msg.startsWith('Unknown Message')) console.warn(e.message);
        }
        return this;
    }

    async edit(out: string | MessageEditOptions | MessagePayload): Promise<PandaMessage> {
        try {
            let msg = await this.msg!.edit(out);
            return new PandaMessage(msg!.createdTimestamp, msg);
        }
        catch (e: any) {
            let msg = e.message;
            /* Other Error */
            if (!msg.startsWith('Unknown Message')) console.warn(e.message);
            return this;
        }
    }
}