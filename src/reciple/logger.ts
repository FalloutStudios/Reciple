import { Logger, LogLevels } from 'fallout-utility';
import { flags } from './flags'
import chalk from 'chalk';

/**
 * Create new logger
 * @param stringifyJSON stringify json objects in console
 * @param debugmode display debug messages
 * @param colorizeMessage add logger colours to messages
 */
export function createLogger (stringifyJSON: boolean, debugmode: boolean = false, colorizeMessage: boolean = true) {
    return new Logger({
        stringifyJSON: stringifyJSON,
        enableDebugMode: flags.debugmode as boolean|undefined ?? debugmode,
        loggerName: 'Main',
        prefixes: {
            [LogLevels.INFO]: (name?: string) => `[${chalk.bold("INFO" + (name ? chalk.dim(" - ") + name : ''))}]`,
            [LogLevels.WARN]: (name?: string) => `[${chalk.bold.yellow("WARN" + (name ? chalk.dim(" - ") + name : ''))}]`,
            [LogLevels.ERROR]: (name?: string) => `[${chalk.bold.red("ERROR" + (name ? chalk.dim(" - ") + name : ''))}]`,
            [LogLevels.DEBUG]: (name?: string) => `[${chalk.bold.blue("DEBUG" + (name ? chalk.dim(" - ") + name : ''))}]`
        },
        colorMessages: {
            [LogLevels.INFO]: (message: string) => message,
            [LogLevels.WARN]: (message: string) => !colorizeMessage ? message : chalk.yellow(message),
            [LogLevels.ERROR]: (message: string) => !colorizeMessage ? message : chalk.red(message),
            [LogLevels.DEBUG]: (message: string) => !colorizeMessage ? message : chalk.blue(message)
        }
    });
}
