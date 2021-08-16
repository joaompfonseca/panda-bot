import { Client, Intents } from 'discord.js';
import { ready } from './events/ready.js';
import { messageCreate } from './events/messageCreate.js';
import dotenv from 'dotenv'; dotenv.config();

export function client() {
    const client = new Client({
        intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
    });

    client.on('ready', () => ready(client));
    client.on('messageCreate', msg => messageCreate(msg));
    client.login(process.env.TOKEN);
}