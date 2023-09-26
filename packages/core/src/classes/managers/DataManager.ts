import { Collection } from 'discord.js';
import { ReadonlyCollection } from '@discordjs/collection';
import { RecipleClient } from '../structures/RecipleClient';
import { randomBytes } from 'crypto';

export abstract class DataManager<T> {
    protected _cache: Collection<string, T> = new Collection();

    get cache() { return this._cache as ReadonlyCollection<string, T>; }

    constructor(readonly client: RecipleClient<true>) {}

    public static generateId(): string {
        return randomBytes(8).toString('hex');
    }
}
