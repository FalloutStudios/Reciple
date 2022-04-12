#!/usr/bin/env node
import { RecipleConfig } from './reciple/classes/Config';
import { RecipleClient } from './reciple/classes/Client';
import { readdirSync, existsSync } from 'fs';
import { input } from 'fallout-utility';

const allowedFiles = ['node_modules', 'reciple.yml', 'package.json', 'package.lock.json'];

if (readdirSync('./').filter(f => !f.startsWith('.') && allowedFiles.indexOf(f)).length > 0 && !existsSync('./reciple.yml')) {
    const ask = input('This directory does not contain reciple.yml. Would you like to init axis here? [y/n] ');
    if (ask !== 'y') process.exit(0);
}

const config = new RecipleConfig('./reciple.yml').parseConfig().getConfig();
const client = new RecipleClient({ config: config, ...config.client });

(async () => {
    await client.startModules();

    client.on('ready', async () => {
        client.logger.warn(`Logged in as ${client.user?.tag || 'Unknown'}!`);

        await client.loadModules();
        client.addCommandListeners();
    });

    client.login(config.token);
})();