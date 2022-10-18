import { ApplicationCommand, ApplicationCommandData, ContextMenuCommandBuilder, Guild, GuildResolvable, RESTPostAPIApplicationCommandsJSONBody, SlashCommandBuilder as DiscordJsSlashCommandBuilder } from 'discord.js';
import { SlashCommandBuilder } from '../builders/SlashCommandBuilder';
import { AnySlashCommandBuilder } from '../../types/builders';
import { RecipleClient } from '../RecipleClient';

export type ApplicationCommandBuilder = AnySlashCommandBuilder|ContextMenuCommandBuilder|DiscordJsSlashCommandBuilder;

export class ApplicationCommandManager {
    readonly client: RecipleClient;

    get commands() { return this.client.application?.commands; }

    constructor(client: RecipleClient) {
        this.client = client;
    }

    public async set(commands: (ApplicationCommandBuilder|ApplicationCommandData)[], guilds?: GuildResolvable[]): Promise<void> {
        if (!this.client.isReady()) throw new Error('Client is not ready');
        if (guilds && guilds.length > 1) {
            for (const guild of guilds) {
                await this.set(commands, [guild]);
            }

            return;
        }

        const guild = guilds?.shift();

        if (!guild) {
            this.client.application.commands.set(commands);
        }
    }

    public async add(command: ApplicationCommandBuilder|ApplicationCommandData, guilds?: GuildResolvable[]): Promise<void> {
        if (!this.client.isReady()) throw new Error('Client is not ready');
        if (!command) throw new Error('Command is undefined');
        if (guilds && guilds.length > 1) {
            for (const guild of guilds) {
                await this.add(command, [guild]);
            }

            return;
        }

        const guild = guilds?.shift();

        if (!guild) {
            this.client.application.commands.create(command);
        }
    }

    public async remove(command: string|ApplicationCommand, guilds?: GuildResolvable[]): Promise<void> {
        if (!this.client.isReady()) throw new Error('Client is not ready');
        if (!command) throw new Error('Command is undefined');
        if (guilds && guilds.length > 1) {
            for (const guild of guilds) {
                await this.remove(command, [guild]);
            }

            return;
        }

        const guild = guilds?.shift();

        if (!guild) {
            this.client.application.commands.delete(command);
        }
    }

    public get(command: (ApplicationCommandData|ApplicationCommandBuilder|string), guild?: GuildResolvable): ApplicationCommand|undefined {
        const commands = guild ? this.client.guilds.resolve(guild)?.commands.cache : this.client.application?.commands.cache;
        if (!commands) throw new Error('Guild not found in cache');

        return commands.find(cmd => typeof command === 'string'
            ? (cmd.id === command || cmd.name === command)
            : (cmd.name === command.name || (command instanceof ApplicationCommand && cmd.id === command.id))
        );
    }

    public async fetch(commandId: string, guild?: GuildResolvable): Promise<ApplicationCommand> {
        const manager = guild ? this.client.guilds.resolve(guild)?.commands : this.client.application?.commands;
        if (!manager) throw new Error('Guild not found in cache');

        return manager.fetch(commandId);
    }

    protected parseCommands(commands: (ApplicationCommandData|ApplicationCommandBuilder|RESTPostAPIApplicationCommandsJSONBody)[], setPermissions: boolean = true): (ApplicationCommandData|RESTPostAPIApplicationCommandsJSONBody)[] {
        return commands.map(cmd => {
            if ((cmd as ApplicationCommandBuilder)?.toJSON === undefined) return <unknown>(cmd) as ApplicationCommandData;

            if (SlashCommandBuilder.isSlashCommandBuilder(cmd) && this.client.config.commands.slashCommand.setRequiredPermissions) {
                const permissions = (setPermissions || this.client.config.commands.slashCommand.permissions.enabled)
                        ? this.client.config.commands.slashCommand.permissions.commands.find(cmd_ => cmd_.command.toLowerCase() === cmd.name.toLowerCase())?.permissions
                        : undefined;

                if (permissions) {
                    cmd.setRequiredMemberPermissions(...permissions);
                    if (this.client.isClientLogsEnabled()) this.client.logger.debug(`Set required permissions for ${cmd.name}`);
                }
            }

            return (cmd as ApplicationCommandBuilder).toJSON();
        });
    }
}