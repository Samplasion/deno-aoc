import { colors, Denomander, Logger, path, usefulTags } from "../deps.ts";
import { downloadInput, Status } from "../module/api.ts";
import { malformedDirectoryError, noConfigurationError, noSessionKeyError } from "../_utils.ts";
import { getConfig, defaultConfig } from "./config.ts";
import filesToCreate from "./init/files.ts";

export default function init(program: Denomander, args: { day?: number }) {
    if (args.day) {
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
    if ([...Deno.readDirSync(dir)].length > 0) {
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

    Deno.writeTextFileSync(path.resolve(dayDir, "index.ts"), content);
    Deno.writeTextFileSync(path.resolve(dayDir, "README.md"), _getDayReadme(config.year, day));
    const input = await downloadInput(config.year, day);
    if (input.status == Status.OK) {
        Deno.writeTextFileSync(path.resolve(dayDir, "input.txt"), input.data!);
    } else {
        noSessionKeyError();
    }
}

function _getDayReadme(year: number, day: number) {
    return usefulTags.stripAllIndents`
    # 🎄 Advent of Code ${year} - day ${day} 🎄

    ## Info

    Task description: [link](https://adventofcode.com/${year}/day/${day}).

    ## Notes

    ...
    `;
}