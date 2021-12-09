import { colors, Denomander, Logger, path } from "../deps.ts";
import { downloadInput, Status } from "../module/api.ts";
import { malformedDirectoryError, noConfigurationError, noSessionKeyError, REPO } from "../_utils.ts";
import { getConfig } from "./config.ts";

interface CLIDownloadArgs {
    day: string | number;
}

export default async function download(_program: Denomander, { day }: CLIDownloadArgs) {
    const config = getConfig();

    if (!config) {
        noConfigurationError();
    }

    const srcDir = path.join(Deno.cwd(), "src");

    if (!Deno.lstatSync(srcDir).isDirectory) {
        malformedDirectoryError();
    }

    if (typeof day === "string") {
        if (day.toLowerCase() == "all") {
            Logger.error("Cannot download all days at once");
            Logger.info("To avoid excessive burden on the Advent of Code servers, please download one day at a time");
        } else {
            Logger.error("Invalid day");
            Logger.info("Please specify a valid numeric day");
        }

        Deno.exit(1);
    } else if (day < 1 || day > 25) {
        Logger.error("Invalid day");
        Logger.info("Please specify a valid numeric day in the range 1-25");

        Deno.exit(1);
    }
    day = ~~day;

    const pad = (n: number) => n.toString().padStart(2, "0");

    let dir;
    try {
        dir = path.resolve(Deno.cwd(), "src", `day${pad(day)}`);
    } catch {
        Logger.fatal("Unexpected error");
        Logger.error("An unexpected error has happened while trying to resolve the directory.\n" +
            "Please report this issue to the GitHub repository: " + REPO);
        Deno.exit(255);
    }

    try {
        const lstat = Deno.lstatSync(dir);
        if (!lstat.isDirectory) {
            throw new Deno.errors.BadResource();
        }
    } catch (e) {
        if (e instanceof Deno.errors.NotFound) {
            Logger.error(`The structure for day ${day} hasn't been created yet.`);
            Logger.info(`Please run ${colors.bold(colors.yellow("aoc init " + day))} to create the files and download your input at once.`);
            Deno.exit(1);
        } else if (e instanceof Deno.errors.BadResource) {
            Logger.error(`The structure for day ${day} is invalid.`);
            Logger.info(`The file ${colors.bold(colors.yellow(dir))} is not a directory. Remove the file and run ${colors.bold(colors.yellow("aoc init " + day))}.`);
            Deno.exit(1);
        } else {
            Logger.fatal("Unexpected error");
            Logger.error("An unexpected error has happened while trying to resolve the directory.\n" +
                "Please report this issue to the GitHub repository: " + REPO);
            Deno.exit(255);
        }
    }

    const file = path.join(dir, "input.txt");
    let inputContents: string | null = null;
    try {
        inputContents = await Deno.readTextFile(file);
    } catch {
        // Do nothing
    }

    if (inputContents && inputContents.length > 0) {
        Logger.warn("Input already downloaded");
        Logger.info("To prevent excessive burden on the Advent of Code servers, the input for this day has been cached.\n" +
            "If you still wish to download the input again, please delete the file: " + colors.bold(colors.yellow(file)));
        Deno.exit(0);
    }

    const input = await downloadInput(config.year, day);
    if (input.status != Status.OK) {
        if (input.status == Status.NO_KEY) {
            noSessionKeyError();
        } else {
            Logger.fatal("Unexpected error");
            Logger.error("An unexpected error has happened while trying to download the input.\n" +
                "Please report this issue to the GitHub repository: " + REPO);
        }
        Deno.exit(1);
    }
    Deno.writeTextFileSync(file, input.data!);

    Logger.success(`Input for ${colors.bold(colors.yellow(`day ${pad(day)}`))} successfully downloaded`);
}