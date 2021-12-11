import { Logger, fs, sleep, colors, path } from "../../deps.ts";
import { CLIRunOptions } from "../types.ts";
import { noConfigurationError } from "../_utils.ts";
import { getConfig, saveConfig } from "./config.ts";
import { getReadme, updateReadme } from "./init/files.ts";

export default async function run(args: CLIRunOptions) {
    const config = getConfig();

    if (!config) {
        noConfigurationError();
    }

    let { day, timeout } = args;
    day = day.toString().replaceAll("..", "").replaceAll(".", "") as CLIRunOptions["day"];
    const dayNumber = parseInt(day);
    if (isNaN(dayNumber) && day != "all") {
        Logger.error(`Invalid day: ${day}`);
        Deno.exit(1);
    }
    if ((dayNumber > 25 || dayNumber < 1) && day != "all") {
        Logger.error(`Invalid day: ${day}`);
        Deno.exit(1);
    }
    const pad = (num: number) => num < 10 ? `0${num}` : num;
    // deno-lint-ignore require-await
    const run = async (day: string, logFailure = false) => {
        const cwd = Deno.cwd();
        if (fs.existsSync(path.resolve(cwd, "src", `day${day}`))) {
            const proc = Deno.run({
                cwd: path.resolve(cwd, "src", `day${day}`),
                cmd: [
                    Deno.execPath(),
                    "run",
                    "--allow-read",
                    "--allow-write",
                    "--allow-env",
                    "--allow-hrtime",
                    path.resolve(cwd, "src", `day${day}`, "index.ts"),
                ],
                stdout: "piped",
                stderr: "piped",
            });
            const [_status, stdout, stderr] = await Promise.all([
                proc.status(),
                proc.output(),
                proc.stderrOutput()
            ]);
            console.log();
            Deno.stdout.writeSync(stdout);
            Deno.stderr.writeSync(stderr);
            console.log();
            proc.close();
        } else if (logFailure) {
            Logger.error(`Files for day ${day} not found.`);
            Logger.info(colors.green(`Please run "${colors.bold(colors.yellow(`aoc init ${dayNumber}`))}" to create the files.`));
            Deno.exit(1);
        }
    }
    if (day == "all") {
        for (let i = 1; i <= 25; i++) {
            const day = pad(i).toString();
            Logger.info(colors.cyan(`Running day ${day}...`));
            await run(day);
            await sleep((timeout ?? 500) / 1000);
        }
    } else {
        await run(pad(dayNumber).toString(), true);
    }

    updateReadme(config);
}

// function updateReadme() {
//     const config = getConfig()!;

//     try {
//         const filePath = path.resolve(Deno.cwd(), "README.md");
//         const readme = Deno.readTextFileSync(filePath).toString();
//         Deno.writeTextFileSync(filePath, getReadme(config, readme));
//     } catch {
//         Logger.error(`Failed to update ${colors.bold(colors.yellow("README.md"))}. Please ensure the file exists and is writable.`);
//         Deno.exit(1);
//     }
// }