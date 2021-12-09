import { SolutionType } from "../types.ts";

export interface Config {
    year: number;
    days: ConfigDay[];
}

export interface ConfigDay {
    part1: ConfigDayPart;
    part2: ConfigDayPart;
}

export interface ConfigDayPart {
    solved: boolean;
    time: number | null;
    result: SolutionType;
    attempts: Exclude<SolutionType, undefined | void>[];
}

export function getConfig(): Config {
    let content = "null";
    try {
        content = Deno.readTextFileSync("./.aoc.json");
    } catch (e) {
        if (e instanceof Deno.errors.NotFound) {
            // ignore
        } else {
            throw e;
        }
    }
    const config = JSON.parse(content);
    return config;
}

export function defaultConfig(year?: number): Config {
    return {
        year: year ?? new Date().getFullYear(),
        days: new Array(25).fill({
            part1: {
                solved: false,
                time: null,
                result: undefined,
                attempts: [],
            },
            part2: {
                solved: false,
                time: null,
                result: undefined,
                attempts: [],
            },
        }),
    };
}

export function saveConfig(config: Config): void {
    Deno.writeTextFileSync("./.aoc.json", JSON.stringify(config, null, 2));
}