import { Client, Intents } from 'discord.js';
import dotenv from 'dotenv'; dotenv.config();
import { ready } from './events/ready.js';
import { messageCreate } from './events/messageCreate.js';
import { interactionCreate } from './events/interactionCreate.js';

/**
 * Initializes the client.
 * @returns
 */
export function client(): void {
    const client = new Client({
        intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]
    });

    client.on('ready', () => ready(client));
    client.on('messageCreate', msg => messageCreate(client, msg));
    client.on('interactionCreate', int => interactionCreate(client, int));
    client.login(process.env.TOKEN); return;
}