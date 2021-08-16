import { Client } from 'discord.js';

export function ready(client: Client) {
    console.log(`Logged in as ${client.user.tag}!`);
}