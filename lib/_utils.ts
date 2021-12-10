import { Logger, colors } from "./../deps.ts";

export function msFixed(ms: number): string {
    if (ms > 1000) {
        return `${Math.floor(ms / 1000)}s`;
    } else if (ms > 100) {
        return `${~~ms}ms`;
    } else if (ms > 10) {
        return `${ms.toFixed(1)}ms`;
    } else return `${ms.toFixed(2)}ms`;
}

export function noConfigurationError() {
    Logger.error(`No configuration found.`);
    Logger.info(`Please make sure to be in the right directory (the one with a ${colors.bold(colors.yellow(".aoc.json"))} file). Alternatively, delete or move everything and use the "init" command without arguments to create a new structure.`);
    Deno.exit(1);
}

export function malformedDirectoryError() {
    Logger.error(`The current directory is not an AoC repository.`);
    Logger.warn(`The current directory is malformed. Missing: ${colors.bold(colors.yellow("src/"))} directory.`);
    Logger.info(`Please make sure to be in the right directory (the one with a ${colors.bold(colors.yellow(".aoc.json"))} file). Alternatively, delete or move everything and use the "init" command without arguments to create a new structure.`);
    Deno.exit(1);
}

export function noSessionKeyError() {
    Logger.error(`Session key not found or invalid.\nPlease set the environment variable ${colors.bold(colors.yellow("AOC_SESSION_KEY"))} to your .env file, or download your input manually.`);
}

export const REPO = "https://github.com/samplasion/deno-aoc";