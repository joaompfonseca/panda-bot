import { Client, Intents } from 'discord.js';
import dotenv from 'dotenv'; dotenv.config();
import { ready } from './events/ready.js';
import { messageCreate } from './events/messageCreate.js';
import { interactionCreate } from './events/interactionCreate.js';

/**
 * Initializes the client.
 * @returns
 */
export async function client(): Promise<void> {
    const client = new Client({
        intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]
    });

    client
        .on('ready', () => ready(client))
        .on('messageCreate', async msg => await messageCreate(client, msg))
        .on('interactionCreate', async int => await interactionCreate(client, int));
    await client.login(process.env.TOKEN); return;
}