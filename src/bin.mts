#!/usr/bin/env node

import { RecipleClient } from './reciple/classes/RecipleClient.js';
import { RecipleConfig } from './reciple/classes/RecipleConfig.js';
import { rawVersion } from './reciple/version.js';
import { existsSync, readdirSync } from 'fs';
import { cwd, flags } from './reciple/flags.js';
import { input } from 'fallout-utility';
import chalk from 'chalk';
import 'dotenv/config';
import path from 'path';
import { inspect } from 'util';

const allowedFiles = ['node_modules', 'reciple.yml', 'package.json'];
const configPath = path.join(cwd, './reciple.yml');

if (readdirSync(cwd).filter(f => !f.startsWith('.') && allowedFiles.indexOf(f)).length > 0 && !existsSync(flags.config ?? configPath)) {
    const ask = (flags.yes ? 'y' : null) ?? input('This directory does not contain reciple.yml. Would you like to init axis here? [y/n] ') ?? '';
    if (ask.toString().toLowerCase() !== 'y') process.exit(0);
}

let configParser;

try {
    configParser = new RecipleConfig(flags.config ?? configPath).parseConfig();
} catch (err) {
    console.error(`${chalk.bold.red('Config Error')}: ${inspect(err)}`);
    process.exit(1);
}

const config = configParser.getConfig();
const client = new RecipleClient({ config: config, ...config.client });

/**
 * Start
 */

if (!client.isClientLogsSilent) client.logger.info('Starting Reciple client v' + rawVersion);

client.addCommandListeners();

await client.modules.startModules(
    await client.modules.getModulesFromFiles({
        files: await client.modules.getModulePaths({
            filter: file => file.endsWith('.js') || file.endsWith('.cjs') || file.endsWith('.mjs'),
        }),
    })
);

client.on('ready', async () => {
    await client.modules.loadModules(client.modules.modules.toJSON(), true);

    if (!client.isClientLogsSilent) client.logger.log(`Loaded ${client.commands.slashCommands.size} slash commands`, `Loaded ${client.commands.messageCommands.size} message commands`);

    if (client.config.commands.slashCommand.registerCommands) await client.commands.registerApplicationCommands();
    if (!client.isClientLogsSilent) client.logger.warn(`Logged in as ${client.user?.tag || 'Unknown'}!`);

    client.on('cacheSweep', () => client.cooldowns.clean());
});

client.login(config.token).catch(err => {
    if (!client.isClientLogsSilent) client.logger.error(err);
});