import { colors, Logger, path } from "../../deps.ts";
import { APIResponse, Status, submitResult } from "../module/api.ts";
import { noConfigurationError } from "../_utils.ts";
import { getConfig, saveConfig } from "./config.ts";
import { updateReadme } from "./init/files.ts";

export default async function submit({ day }: { day: number }) {
    const config = getConfig();

    if (!config) {
        noConfigurationError();
    }

    try {
        const timeoutPath = path.join(Deno.cwd(), `.aoc-timeout-day-${day}`);
        const timeoutEndDate = new Date(Number(Deno.readTextFileSync(timeoutPath)));
        console.log(timeoutEndDate, new Date());
        if (timeoutEndDate > new Date()) {
            Logger.error("You can't submit your solution right now.");
            Logger.info(colors.yellow(`You have to wait ${timeoutEndDate.getTime() - Date.now()} seconds.`));

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

    
    let part1solved = false;
    if (cfgday.part1.result == null) {
        Logger.warn(colors.yellow(`You haven't solved the first part of day ${day}.`));
        Logger.info(`You must run ${colors.bold(colors.yellow(`aoc run ${day}`))} first to get the solutions.`);
        Deno.exit(1);
    } else if (!cfgday.part1.solved && !cfgday.part2.solved) {
        const res = await submitResult(day, config.year, 1, cfgday.part1.result.toString());
        if (res.status == Status.PART_SOLVED) {
            part1solved = true;
            cfgday.part1.solved = true;
        }
        handleResult(day, 1, res);
    } else {
        Logger.info(colors.green(`You already solved the first part of day ${day}.`));
    }

    if (part1solved) {
        Logger.info(colors.yellow(`Skipping part 2 to avoid double submission.`));
    } else {
        if (!cfgday.part2.result) {
            Logger.warn(colors.yellow(`You haven't solved the second part of day ${day}.`));
            Logger.info(`You must run ${colors.bold(colors.yellow(`aoc run ${day}`))} first to get the solutions.`);
            Deno.exit(1);
        } else if (!cfgday.part2.solved) {
            const res = await submitResult(day, config.year, 2, cfgday.part2.result.toString());
            if (res.status == Status.PART_SOLVED) cfgday.part2.solved = true;
            handleResult(day, 2, res);
        } else {
            Logger.info(colors.green(`You already solved the second part of day ${day}.`));
        }
    }

    config.days[day - 1] = cfgday;
    saveConfig(config);
    updateReadme(config);
}

function handleResult(day: number, part: 1 | 2, result: APIResponse<string | number>) {
    if (typeof result.data == "number") {
        Logger.error("You can't submit your solution right now.");
        Logger.info(colors.yellow(`You have to wait ${result.data} seconds.`));

        Deno.writeTextFileSync(path.join(Deno.cwd(), `.aoc-timeout-day-${day}`), (Date.now() + result.data).toString());
    }
    switch (result.status) {
        case Status.OK:
        case Status.PART_SOLVED:
            Logger.info(colors.green(`Submitted solution for day ${day} part ${part}.`));
            break;
        case Status.PART_WRONG:
            Logger.warn(colors.red(`Your solution for day ${day} part ${part} is not correct.`));
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
}