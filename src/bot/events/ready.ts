import { Client } from 'discord.js';
import { regSlash } from '../config.js';
import { registerSlash } from '../slash/register.js';

/**
 * Runs when client's "ready" event is triggered.
 * @param client 
 * @returns
 */
export async function ready(client: Client): Promise<void> {
    console.log(`Logged in as ${client.user!.tag}!`);
    /* Register (/) commands */
    if (regSlash) { await registerSlash(client.application!.commands); }
    return;
}