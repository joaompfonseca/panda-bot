import { ApplicationCommandManager } from "discord.js";
import { commands } from './config.js'

/**
 * Registers Bot's slash commands.
 * @param manager 
 * @returns
 */
export function registerSlash(manager: ApplicationCommandManager): void { commands.forEach(async cmd => await manager.create(cmd)); return; }