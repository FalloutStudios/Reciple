import { rawVersion } from './version';
import { Command } from 'commander';
import path from 'path';

/**
 * Commander
 */
export const commander = new Command()
        .name('reciple')
        .description('Reciple.js - Discord.js handler cli')
        .version(`v${rawVersion}`, '-v, --version')
        .argument('[current-working-directory]', 'Change the current working directory')
        .option('-t, --token <token>', 'Replace used bot token')
        .option('-c, --config <config>', 'Change path to config file')
        .option('-D, --debugmode', 'Enable debug mode')
        .option('-y, --yes', 'Automatically agree to Reciple confirmation prompts')
        .option('-v, --version', 'Display version')
        .parse();

/**
 * Used flags
 */
export const flags = commander.opts();

/**
 * Token flag
 */
export const token: string|undefined = flags.token;

/**
 * Current working directory
 */
export const cwd = path.join(process.cwd(), commander.args[0] || '.');
