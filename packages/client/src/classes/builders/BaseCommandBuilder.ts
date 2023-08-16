import { ContextMenuCommandBuilder, PermissionResolvable, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import { AnyCommandExecuteFunction, AnyCommandHaltFunction, CommandType } from '../../types/commands';
import { MessageCommandBuilder } from './MessageCommandBuilder';

export interface BaseCommandBuilderData {
    /**
     * The type of command.
     */
    commandType: CommandType;
    /**
     * The cooldown in milliseconds. This is the amount of time that must elapse before the command can be executed again.
     */
    cooldown?: number;
    /**
     * The required bot permissions to execute the command. This can be a permission resolvable or an array of permission resolvable.
     */
    requiredBotPermissions?: PermissionResolvable;
    /**
     * The required member permissions to execute the command.This can be a permission resolvable or an array of permission resolvable.
     */
    requiredMemberPermissions?: PermissionResolvable;
    /**
     * The halt execute function. This is a function that is called if the command is halted.
     */
    halt?: AnyCommandHaltFunction;
    /**
     * The command execute function. This is the function that is called when the command is executed.
     */
    execute?: AnyCommandExecuteFunction;
}

export abstract class BaseCommandBuilder implements BaseCommandBuilderData {
    abstract readonly commandType: CommandType;
    abstract halt?: AnyCommandHaltFunction;
    abstract execute?: AnyCommandExecuteFunction;

    public cooldown?: number;
    public requiredBotPermissions?: bigint;
    public requiredMemberPermissions?: bigint;

    constructor(data?: Omit<Partial<BaseCommandBuilderData>, 'commandType'>) {
        this.from(data);
    }

    /**
     * Sets the command halt execute function
     * @param halt The function executed when a command is halted
     */
    public setHalt(halt?: AnyCommandHaltFunction|null): this {
        this.halt = halt || undefined;
        return this;
    }

    /**
     * Sets the execute function
     * @param execute The function executed when the command is triggered
     */
    public setExecute(execute?: AnyCommandExecuteFunction|null): this {
        this.execute = execute || undefined;
        return this;
    }

    /**
     * Sets command execute cooldown
     * @param cooldown Command cooldown in milliseconds
     */
    public setCooldown(cooldown?: number|null): this {
        this.cooldown = cooldown || undefined;
        return this;
    }

    /**
     * Sets the required bot permissions to execute this command
     * @param permissions Permission resolvable
     */
    public setRequiredBotPermissions(permissions?: PermissionResolvable|null): this {
        this.requiredBotPermissions = permissions ? new PermissionsBitField(permissions).bitfield : undefined;
        return this;
    }

    /**
     * Sets the required member permissions to execute this command.
     * Unlike `.setDefaultMemberPermissions` it accepts string, array, and number permissions
     * @param permissions Permission resolvable
     */
    public setRequiredMemberPermissions(permissions?: PermissionResolvable|null): this {
        this.requiredMemberPermissions = permissions ? new PermissionsBitField(permissions).bitfield : undefined;
        return this;
    }

    public isContextMenu(): this is ContextMenuCommandBuilder {
        return this.commandType === CommandType.ContextMenuCommand;
    }

    public isSlashCommand(): this is SlashCommandBuilder {
        return this.commandType === CommandType.SlashCommand;
    }

    public isMessageCommand(): this is MessageCommandBuilder {
        return this.commandType === CommandType.MessageCommand;
    }

    protected toCommandData(): BaseCommandBuilderData {
        return {
            commandType: this.commandType,
            cooldown: this.cooldown,
            halt: this.halt,
            execute: this.execute,
            requiredBotPermissions: this.requiredBotPermissions,
            requiredMemberPermissions: this.requiredMemberPermissions
        };
    }

    protected from(data?: Omit<Partial<BaseCommandBuilderData>, 'commandType'>): void {
        if (data?.cooldown !== undefined) this.setCooldown(Number(data?.cooldown));
        if (data?.requiredBotPermissions !== undefined) this.setRequiredBotPermissions(data.requiredBotPermissions);
        if (data?.requiredMemberPermissions !== undefined) this.setRequiredMemberPermissions(data.requiredMemberPermissions);
        if (data?.halt !== undefined) this.setHalt(data.halt);
        if (data?.execute !== undefined) this.setExecute(data.execute);
    }
}