import { CommandInteraction, Message } from "discord.js";
import { PandaMessage } from "./PandaMessage.js";

export class PandaInteractionMessage extends PandaMessage {
    int: CommandInteraction;

    /**
     * Custom implementation of discord.js Message with Interactions.
     * @param createdTimestamp 
     * @param int 
     */
    constructor(createdTimestamp: number, int: CommandInteraction) {
        super(createdTimestamp, undefined);
        this.int = int;
    }

    async edit(out: string | Object): Promise<PandaMessage> {
        let startTime = Date.now();
        await this.int.editReply(out);
        let endTime = Date.now();
        let createdTimestamp = this.int.createdTimestamp + endTime - startTime;
        return new PandaInteractionMessage(createdTimestamp, this.int);
    }
}