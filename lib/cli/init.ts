import { cheerio, colors, Denomander, DOMParser, Logger, path, TurndownService, usefulTags } from "../../deps.ts";
import { downloadInput, getChallengeText, Status } from "../module/api.ts";
import { malformedDirectoryError, noConfigurationError, noSessionKeyError } from "../_utils.ts";
import { getConfig, defaultConfig } from "./config.ts";
import filesToCreate from "./init/files.ts";
import { VERSION } from "../../version.ts";

export default function init(program: Denomander, args: { day?: string | number }) {
    if (args.day) {
        if (typeof args.day === "string") {
            if (args.day.toLowerCase() == "all") {
                Logger.error("Cannot download all days at once");
                Logger.info("To avoid excessive burden on the Advent of Code servers, please download one day at a time");
            } else {
                Logger.error("Invalid day");
                Logger.info("Please specify a valid numeric day");
            }

            Deno.exit(1);
        } else if (args.day < 1 || args.day > 25) {
            Logger.error("Invalid day");
            Logger.info("Please specify a valid numeric day in the range 1-25");

            Deno.exit(1);
        }
        args.day = ~~args.day;

        initDay(program, args.day);
    } else {
        initDirectory(program);
    }
}

async function initDirectory(program: Denomander) {
    const config = getConfig() ?? defaultConfig(program.year);

    const dir = Deno.cwd();
    if ((await Deno.permissions.query({ name: "write", path: dir })).state !== "granted") {
        Logger.error(`I don't have permission to modify the current directory.`);
        Deno.exit(1);
    }

    // Check if the directory is empty
    if ([...Deno.readDirSync(dir)].filter(file => file.name != ".env").length > 0) {
        Logger.error(`The current directory is not empty.`);
        Logger.warn(`Please use the "init" command in an empty directory.`);
        Logger.info(`Are you trying to use the "init" command inside an init repository?`);
        Deno.exit(1);
    }

    // Create the files
    const files = filesToCreate(config);
    for (const file of files) {
        if (file.name.includes("/")) {
            const dirname = file.name.split("/").slice(0, -1).join("/");
            Deno.mkdirSync(dirname, { recursive: true });
        }
        await Deno.writeFile(file.name, new TextEncoder().encode(file.content));
    }
}

async function initDay(_program: Denomander, day: number) {
    const config = getConfig();

    if (!config) {
        noConfigurationError();
    }

    const pad = (n: number) => n.toString().padStart(2, "0");

    const srcDir = path.join(Deno.cwd(), "src");
    const dayDir = path.join(srcDir, `day${pad(day)}`);
    const templateFile = path.join(srcDir, "template", `index.ts`);

    if (!Deno.lstatSync(srcDir).isDirectory) {
        malformedDirectoryError();
    }

    let dayDirExists = false;
    try {
        dayDirExists = Deno.lstatSync(dayDir).isDirectory;
    } catch {
        // Do nothing
    }
    if (dayDirExists) {
        if ([...Deno.readDirSync(dayDir)].length > 0) {
            Logger.error(`The files for day ${colors.bold(colors.yellow(`${day}`))} already exist.`);
            Logger.info(`If you're trying to download the input for day ${colors.bold(colors.yellow(`${day}`))}, please use the "download" command.`);
            Deno.exit(1);
        } else {
            Logger.info(`Creating files for day ${colors.bold(colors.yellow(`${day}`))}...`);
        }
    } else {
        Logger.info(`Generating a basic structure for day ${colors.bold(colors.yellow(`${day}`))}...`);
        Deno.mkdirSync(dayDir, { recursive: true });
    }

    let content = "";
    try {
        content = await Deno.readTextFile(templateFile);
    } catch {
        Logger.warn(`No template file has been found.\nPlease create a template file at ${colors.bold(colors.yellow(`${templateFile}`))}.`);
    }

    Deno.writeTextFileSync(path.resolve(dayDir, "index.ts"), content.replaceAll("{{VERSION}}", VERSION));
    Deno.writeTextFileSync(path.resolve(dayDir, "README.md"), await _getDayReadme(config.year, day));
    const input = await downloadInput(config.year, day);
    if (input.status == Status.OK) {
        Deno.writeTextFileSync(path.resolve(dayDir, "input.txt"), input.data!);
    } else {
        noSessionKeyError();
    }
}

export async function _getDayReadme(year: number, day: number, defaultContent = ""): Promise<string> {
    // ## Info
    //
    // Task description: [link](https://adventofcode.com/${year}/day/${day}).

    const [apiPart1, apiPart2] = await getChallengeText(year, day);
    const parser = new DOMParser();
    const service = new TurndownService({
        codeBlockStyle: "fenced",
        headingStyle: "atx",
        // Using the strong delimiter here because
        // the website CSS styles is as such.
        emDelimiter: "**",
    });

    let part1, part2;

    if (apiPart1.status == Status.OK && !!apiPart1.data) {
        part1 = `<!--PART1-->\n${service.turndown(parser.parseFromString(apiPart1.data!, "text/html")!)}\n<!--/PART1-->`;
    } else {
        part1 = `<!--PART1-->\nPart 1 locked\n<!--/PART1-->`;
    }

    if (apiPart2.status == Status.OK && !!apiPart2.data) {
        part2 = `<!--PART2-->\n${service.turndown(parser.parseFromString(apiPart2.data!, "text/html")!)}\n<!--/PART2-->`;
    } else {
        part2 = `<!--PART2-->\nPart 2 locked\n<!--/PART2-->`;
    }

    if (defaultContent) {
        return defaultContent
            .replace(/<!--PART1-->.*<!--\/PART1-->/s, part1)
            .replace(/<!--PART2-->.*<!--\/PART2-->/s, part2);
    }

    return usefulTags.stripAllIndents`
    <!-- Content between the PART1 and PART2 tags will be automatically replaced with the challenge's description. -->

    # 🎄 Advent of Code ${year} - day ${day} 🎄

    ${part1}

    ${part2}

    ## Notes

    ...
    `;
}