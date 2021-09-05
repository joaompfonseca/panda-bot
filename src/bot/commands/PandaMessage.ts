import { Message } from "discord.js";

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

    async edit(out: string | Object): Promise<PandaMessage> {
        let msg = await this.msg!.edit(out);
        return new PandaMessage(msg.createdTimestamp, msg); 
    }
}