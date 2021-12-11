import { getConfig } from "./config.ts";
import { noConfigurationError } from "../_utils.ts";
import { updateReadme } from "./init/files.ts";
import { colors, Logger, path } from "../../deps.ts";
import { _getDayReadme } from "./init.ts";

export default async function regen({ day }: { day?: number }) {
    const config = getConfig();

    if (!config) {
        noConfigurationError();
    }

    if (!day) {
        updateReadme(config);
    } else if (day > 1 && day <= 25) {
        const strDay = day.toString().padStart(2, "0");
        try {
            const dayPath = path.join(Deno.cwd(), "src", `day${strDay}`);
            if (Deno.lstatSync(dayPath).isDirectory) {
                let content;
                try {
                    content = Deno.readTextFileSync(path.join(dayPath, "README.md"));
                } catch {
                    // ignore
                }

                Logger.info("Downloading challenge description...");

                const readme = await _getDayReadme(config.year, day, content);

                Deno.writeTextFileSync(path.join(dayPath, "README.md"), readme);
            }
        } catch (e) {
            console.error(e);
            Logger.error(`Incomplete structure`);
            Logger.warn(`Please run ${colors.yellow(colors.bold(`aoc init ${day}`))} to generate the structure`);
            Deno.exit(1);
        }
    } else {
        Logger.error(`Invalid day: ${day}`);
        Logger.info(`Valid days are 1-25`);
        Deno.exit(1);
    }

    Logger.success("Successfully updated README.md");
}