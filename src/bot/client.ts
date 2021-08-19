import { Client, Intents } from 'discord.js';
import dotenv from 'dotenv'; dotenv.config();
import { ready } from './events/ready.js';
import { messageCreate } from './events/messageCreate.js';

/**
 * Initializes the client.
 * @returns
 */
export function client(): void {
    const client = new Client({
        intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
    });

    client.on('ready', () => ready(client));
    client.on('messageCreate', msg => messageCreate(msg));
    client.login(process.env.TOKEN);

    return;
}