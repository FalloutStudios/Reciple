import { Awaitable, path } from 'fallout-utility';
import { IConfig } from '../classes/Config';
import { cwd } from './cli';
import { existsSync, lstatSync, mkdirSync, readdirSync } from 'fs';

export async function getModules(config: IConfig['modules'], filter?: (filename: string) => Awaitable<boolean>): Promise<string[]> {
    const modules: string[] = [];
    const { globby, isDynamicPattern } = await import('globby');

    for (const folder of config.modulesFolders) {
        const glob = folder.toLowerCase().split(':')[0] === 'glob';

        if (glob) {
            const pattern = folder.split(':')[1];
            if (!isDynamicPattern(pattern)) continue;

            modules.push(...await getModules({
                ...config,
                modulesFolders: await globby(pattern, {
                    cwd,
                    gitignore: true,
                    ignore: config.exclude,
                    onlyDirectories: true
                })
            }));
            continue;
        }

        if (!existsSync(folder)) mkdirSync(folder, { recursive: true });
        if (!lstatSync(folder).isDirectory()) continue;

        modules.push(
            ...readdirSync(folder)
                .map(file => path.join(cwd, folder, file))
                .filter(file => (filter ? filter(file) : file.endsWith('.js')))
        );
    }

    return modules;
}