import { recursiveDefaults } from '@reciple/client';
import { lstat, mkdir, readdir } from 'fs/promises';
import { Awaitable } from 'fallout-utility';
import { IConfig } from '../classes/Config';
import micromatch from 'micromatch';
import { existsSync } from 'fs';
import { cli } from './cli';
import path from 'path';

export async function getModules(config: IConfig['modules'], filter?: (filename: string) => Awaitable<boolean>): Promise<string[]> {
    const modules: string[] = [];
    const { globby, isDynamicPattern } = await import('globby');

    await Promise.all(config.modulesFolders.map(async folder => {
        const dir = path.isAbsolute(folder) ? folder : path.join(cli.cwd, folder);

        if (isDynamicPattern(folder, { cwd: cli.cwd })) {
            let modulesFolders = await globby(folder, {
                    cwd: cli.cwd,
                    onlyDirectories: true,
                    absolute: true
                });

                modulesFolders = modulesFolders.filter(f => !micromatch.isMatch(path.basename(f), config.exclude));

            modules.push(...await getModules({
                ...config,
                modulesFolders
            }));

            return;
        }

        if (!existsSync(dir)) await mkdir(dir, { recursive: true });
        if (!(await lstat(dir)).isDirectory()) return;

        const files = (await readdir(dir)).map(file => path.join(dir, file)).filter(f => !micromatch.isMatch(path.basename(f), config.exclude));
        modules.push(...files.filter(file => (filter ? filter(file) : file.endsWith('.js'))));
    }));

    return modules;
}

export async function getJsConfig<T>(file: string): Promise<T|undefined> {
    file = path.resolve(path.isAbsolute(file) ? file : path.join(cli.cwd, file));

    return recursiveDefaults<T>(await import(`file://${file}`));
}
