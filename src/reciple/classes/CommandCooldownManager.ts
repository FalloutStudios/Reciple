import { RecipleCommandBuilderType } from '../types/builders';
import { Guild, TextBasedChannel, User } from 'discord.js';

export interface CooledDownUser {
    user: User;
    command: string;
    type: RecipleCommandBuilderType;
    guild?: Guild|null;
    channel?: TextBasedChannel;
    expireTime: number;
}

export class CommandCooldownManager extends Array<CooledDownUser> {
    /**
     * Alias for `CommandCooldownManager#push()`
     */
    public add(...options: CooledDownUser[]) { 
        return this.push(...options);
    }

    /**
     * Remove cooldown from specific user, channel or guild
     */
    public remove(options: Partial<CooledDownUser>, limit: number = 0) {
        if (!Object.keys(options).length) throw new TypeError('Provide atleast one option to remove cooldown data.');

        let i = 0;

        for (const index in this) {
            if (!CommandCooldownManager.checkOptions(options, this[index])) continue;
            if (options.expireTime && this[index].expireTime > Date.now()) continue;
            if (limit && i >= limit) continue;

            this.splice(Number(index));
            i++;
        }
    }

    /**
     * Check if the given user is cooled-down 
     */
    public isCooledDown(options: Partial<Omit<CooledDownUser, 'expireTime'>>): boolean {
        const data = this.get(options);
        if (!data) return false;

        this.remove({ ...data, channel: undefined, guild: undefined, type: undefined, command: undefined });
        if (data.expireTime < Date.now()) return false;
        return true;
    }

    /**
     * Clear non cooled-down users from this array 
     */
    public clean(options?: Partial<Omit<CooledDownUser, 'expireTime'>>): void {
        for (const index in this) {
            if (options && !CommandCooldownManager.checkOptions(options, this[index])) return;
            if (this[index].expireTime > Date.now()) return;
            this.slice(Number(index));
        }
    }

    /**
     * Get someone's cooldown data 
     */
    public get(options: Partial<Omit<CooledDownUser, 'expireTime'>>): CooledDownUser|undefined {
        return this.find(data => CommandCooldownManager.checkOptions(options, data));
    }

    /**
     * Check if the options are valid
     */
    public static checkOptions(options: Partial<Omit<CooledDownUser, 'expireTime'>>, data: CooledDownUser): boolean {
        if (options?.user && options.user.id !== data.user.id) return false;
        if (options?.guild && options.guild.id !== data.guild?.id) return false;
        if (options?.channel && options.channel.id !== data.channel?.id) return false;
        if (options?.command && options.command !== data.command) return false;
        if (options?.type && options.type !== data.type) return false;

        return true;
    }
}
