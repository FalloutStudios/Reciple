import type { Client, GuildMember, GuildResolvable, User, UserMention, UserResolvable } from 'discord.js';
import { FormattingPatterns } from 'discord-api-types/globals';

export interface FetchMentionOrIdOptions {
    client: Client;
    user: UserResolvable|UserMention;
    guild?: GuildResolvable;
    force?: boolean;
}

export function getMentionId(user: UserResolvable|UserMention): string|null {
    const id = typeof user === 'string'
        ? user.match(FormattingPatterns.User)?.[1] ?? null
        : 'author' in user
            ? user.author.id
            : user.id;

    return !id && typeof user === 'string' ? user : id;
}

export async function fetchMentionOrId(options: Omit<FetchMentionOrIdOptions, 'guild'>): Promise<User>;
export async function fetchMentionOrId(options: FetchMentionOrIdOptions): Promise<GuildMember>;
export async function fetchMentionOrId(options: FetchMentionOrIdOptions): Promise<User|GuildMember> {
    const id = getMentionId(options.user);
    if (!id) throw new Error(`Invalid user resolvable ${id}`);

    if (!options.guild) return options.client.users.fetch(id, { force: options.force });

    const guild = await options.client.guilds.fetch({ guild: options.guild, force: options.force });
    return guild.members.fetch({ user: id, force: options.force });
}
