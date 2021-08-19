import { Client } from 'discord.js';

/**
 * Runs when client's "ready" event is triggered.
 * @param client 
 * @returns
 */
export function ready(client: Client): void {
    console.log(`Logged in as ${client.user.tag}!`); return;
}