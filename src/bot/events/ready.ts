import { Client } from 'discord.js';
import { regSlash } from '../config.js';
import { registerSlash } from '../slash/register.js';

/**
 * Runs when client's "ready" event is triggered.
 * @param client 
 * @returns
 */
export function ready(client: Client): void {
    console.log(`Logged in as ${client.user!.tag}!`);
    /* Register slash commands */
    if (regSlash) registerSlash(client.application!.commands); return;
}