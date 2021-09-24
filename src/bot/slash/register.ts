import { ApplicationCommandManager } from "discord.js";
import { commands } from './config.js'

/**
 * Registers Bot's (/) commands.
 * @param manager 
 * @returns
 */
export async function registerSlash(manager: ApplicationCommandManager): Promise<void> {
    try {
        /* Determine already registered (/) commands that are not in config file */
        let cmdsNameInConfig: string[] = commands.map(c => c.name);
        let cmdsToDelete = (await manager.fetch()).filter(c => !cmdsNameInConfig.includes(c.name));

        /* Delete (/) commands not present in config file */
        if (cmdsToDelete.size > 0) {
            console.log(`(/) Deleting ${cmdsToDelete.size} commands...`);
            for (let cmd of cmdsToDelete) {
                await manager.delete(cmd[0]);
                console.log(`(/) Deleted: ${cmd[1].name}`);
            }
        }
        /* Register (/) commands present in config file */
        if (commands.length > 0) {
            console.log(`(/) Registering ${commands.length} commands...`);
            for (let cmd of commands) {
                await manager.create(cmd);
                console.log(`(/) Registered: ${cmd.name}`);
            }
        }
        console.log(`(/) Success! You may now disable this [regSlash = false] in Bot's config file.`);
        console.log('(/) Enable once [regSlash = true] to update (/) commands if modified in slash/config.ts.'); return;
    }
    catch (e: any) {
        console.log(`(/) Error! ${e.message}`); return;
    }
}