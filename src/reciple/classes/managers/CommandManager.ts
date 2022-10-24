import { ApplicationCommandData, Collection, GuildResolvable, normalizeArray, RestOrArray } from 'discord.js';
import { AnyCommandBuilder, AnyCommandData, AnySlashCommandBuilder, CommandType, MessageCommandData, SlashCommandData } from '../../types/builders';
import { MessageCommandBuilder } from '../builders/MessageCommandBuilder';
import { SlashCommandBuilder } from '../builders/SlashCommandBuilder';
import { RecipleClient } from '../RecipleClient';
import { ApplicationCommandBuilder } from './ApplicationCommandManager';

export interface CommandManagerOptions {
    client: RecipleClient;
    messageCommands?: (MessageCommandBuilder | MessageCommandData)[];
    slashCommands?: (AnySlashCommandBuilder | SlashCommandData)[];
}

export class CommandManager {
    readonly client: RecipleClient;
    readonly slashCommands: Collection<string, AnySlashCommandBuilder> = new Collection();
    readonly messageCommands: Collection<string, MessageCommandBuilder> = new Collection();
    readonly additionalApplicationCommands: (ApplicationCommandBuilder | ApplicationCommandData)[] = [];

    constructor(options: CommandManagerOptions) {
        this.client = options.client;

        options.slashCommands?.forEach(e => this.slashCommands.set(e.name, SlashCommandBuilder.resolveSlashCommand(e)));
        options.messageCommands?.forEach(e => this.messageCommands.set(e.name, MessageCommandBuilder.resolveMessageCommand(e)));
    }

    /**
     * Add command to command manager
     * @param commands Any command data or builder
     */
    public add(...commands: RestOrArray<AnyCommandBuilder | AnyCommandData>): this {
        for (const command of normalizeArray(commands)) {
            if (command.type === CommandType.SlashCommand) {
                this.slashCommands.set(command.name, SlashCommandBuilder.resolveSlashCommand(command));
            } else if (command.type === CommandType.MessageCommand) {
                this.messageCommands.set(command.name, MessageCommandBuilder.resolveMessageCommand(command));
            } else {
                throw new Error(`Unknown reciple command type`);
            }
        }

        return this;
    }

    /**
     * Get command builder by name or alias if it's a message command
     * @param command Command name
     * @param type Command type
     */
    public get(command: string, type?: undefined): AnyCommandBuilder | undefined;
    public get(command: string, type?: CommandType.MessageCommand): MessageCommandBuilder | undefined;
    public get(command: string, type?: CommandType.SlashCommand): SlashCommandBuilder | undefined;
    public get(command: string, type?: CommandType): AnyCommandBuilder | undefined {
        switch (type) {
            case CommandType.SlashCommand:
                return this.slashCommands.get(command);
            case CommandType.MessageCommand:
                return this.messageCommands.get(command.toLowerCase()) ?? (this.client.config.commands.messageCommand.allowCommandAlias ? this.messageCommands.find(c => c.aliases.some(a => a == command?.toLowerCase())) : undefined);
            default:
                throw new TypeError('Unknown command type');
        }
    }

    /**
     * Register application commands
     * @param guilds Register application commands to guilds
     */
    public async registerApplicationCommands(...guilds: RestOrArray<GuildResolvable>): Promise<this> {
        guilds = normalizeArray(guilds);
        guilds = guilds.length ? guilds : normalizeArray([this.client.config.commands.slashCommand.guilds] as RestOrArray<string>);

        if (!this.client.isClientLogsSilent) this.client.logger.log(`Regestering ${this.client.applicationCommands.size} application command(s) ${!guilds.length ? 'globaly' : 'to ' + guilds.length + ' guilds'}...`);

        await this.client.applicationCommands.set([...this.client.applicationCommands.commands], guilds);

        this.client.emit('recipleRegisterApplicationCommands');
        return this;
    }
}