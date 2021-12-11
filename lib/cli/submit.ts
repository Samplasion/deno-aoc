import { colors, Logger, path, defaultPrettyMs } from "../../deps.ts";
import { APIResponse, Status, submitResult } from "../module/api.ts";
import { noConfigurationError } from "../_utils.ts";
import { Config, getConfig, saveConfig } from "./config.ts";
import { updateReadme } from "./init/files.ts";

export default async function submit({ day }: { day: number }) {
    const config = getConfig();

    if (!config) {
        noConfigurationError();
    }

    try {
        const timeoutPath = path.join(Deno.cwd(), `.aoc-timeout-day-${day}`);
        const timeoutEndDate = new Date(Number(Deno.readTextFileSync(timeoutPath)));
        if (timeoutEndDate > new Date()) {
            Logger.error("You can't submit your solution right now.");
            Logger.info(colors.yellow(`You have to wait ${colors.bold(colors.brightYellow(defaultPrettyMs(timeoutEndDate.getTime() - Date.now())))}.`));

            Deno.exit(1);
        } else {
            // Delete the file
            Deno.removeSync(timeoutPath);
        }
    } catch {
        // File doesn't exist
    }

    const cfgday = config.days[day - 1];
    if (cfgday.part1.solved && cfgday.part2.solved) {
        Logger.info(colors.green(`You already solved both parts of day ${day}.`));
    }

    Logger.info(colors.brightYellow("PART 1"));
    let part1solved = false;
    if (cfgday.part1.result == null) {
        Logger.warn(colors.yellow(`You haven't solved the first part of day ${day}.`));
        Logger.info(`You must run ${colors.bold(colors.yellow(`aoc run ${day}`))} first to get the solutions.`);
        Deno.exit(1);
    } else if (!cfgday.part1.solved && !cfgday.part2.solved) {
        if (cfgday.part1.attempts.includes(cfgday.part1.result.toString())) {
            Logger.warn(colors.yellow(`You already tried submitting this (wrong) result: ${colors.yellow(colors.bold(cfgday.part1.result.toString()))}.`));
            Deno.exit(1);
        }
        const res = await submitResult(day, config.year, 1, cfgday.part1.result.toString());
        if (res.status == Status.PART_SOLVED) {
            part1solved = true;
            cfgday.part1.solved = true;
        }
        handleResult(cfgday, cfgday.part1.result.toString(), day, 1, res);
    } else {
        Logger.info(colors.green(`You already solved the first part of day ${day}.`));
    }
    console.log();

    Logger.info(colors.brightYellow("PART 2"))
    if (part1solved) {
        Logger.info(colors.yellow(`Skipping part 2 to avoid double submission.`));
    } else {
        if (!cfgday.part2.result) {
            Logger.warn(colors.yellow(`You haven't solved the second part of day ${day}.`));
            Logger.info(`You must run ${colors.bold(colors.yellow(`aoc run ${day}`))} first to get the solutions.`);
            Deno.exit(1);
        } else if (!cfgday.part2.solved) {
            if (cfgday.part2.attempts.includes(cfgday.part2.result.toString())) {
                Logger.warn(colors.yellow(`You already tried submitting this (wrong) result: ${colors.yellow(colors.bold(cfgday.part2.result.toString()))}.`));
                Deno.exit(1);
            }
            const res = await submitResult(day, config.year, 2, cfgday.part2.result.toString());
            if (res.status == Status.PART_SOLVED) cfgday.part2.solved = true;
            handleResult(cfgday, cfgday.part2.result.toString(), day, 2, res);
        } else {
            Logger.info(colors.green(`You already solved the second part of day ${day}.`));
        }
    }

    config.days[day - 1] = cfgday;
    saveConfig(config);
    updateReadme(config);
}

function handleResult(cfgday: Config["days"][number], attempt: string, day: number, part: 1 | 2, result: APIResponse<string | number>) {
    if (typeof result.data == "number") {
        Logger.error("Your solution is wrong.");
        Logger.info(colors.yellow(`You have to wait ${colors.bold(colors.brightYellow(defaultPrettyMs(result.data)))} before you can submit again.`));

        Deno.writeTextFileSync(path.join(Deno.cwd(), `.aoc-timeout-day-${day}`), (Date.now() + result.data).toString());
    }
    switch (result.status) {
        case Status.OK:
        case Status.PART_SOLVED:
            Logger.info(colors.green(`Submitted solution for day ${day} part ${part}.`));
            return;
        case Status.PART_WRONG:
            Logger.warn(colors.red(`Your solution for day ${day} part ${part} is not correct.`));
            Logger.info(colors.reset(`${result.data}`));
            break;
        case Status.TOO_SOON:
            Logger.warn(colors.yellow(`You can't submit a solution for day ${day} part ${part} yet.`));
            break;
        case Status.LOCKED:
            Logger.warn(colors.yellow(`Day ${day} part ${part} is locked, or you've already completed it.`));
            break;
        case Status.ERROR:
            Logger.error(colors.red(`An error occured while submitting your solution for day ${day} part ${part}.`));
            break;
    }

    cfgday[`part${part}`].attempts.push(attempt);
}