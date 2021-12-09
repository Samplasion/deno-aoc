import { Denomander } from "../deps.ts";
import run from "./run.ts";
import "https://deno.land/x/dotenv@v3.1.0/load.ts";
import init from "./init.ts";
import { VERSION } from "../../version.ts";

const program = new Denomander(
    {
        app_name: "Advent of Code CLI",
        app_description: "A CLI for Advent of Code",
        app_version: VERSION,
    }
);

export default function main() {
    program
        .command("run [day]")
        .alias("d")
        .description("Runs the day's solution")
        .argDescription("day", "The day to initialize. Specify \"all\" to run all days' solutions.")
        .option("-t --timeout", "Delays each day's execution")
        .action(run);

    program
        .command("init [day?]")
        .alias("i")
        .description("Initializes the basic file structure, or the structure for a day if specified")
        .option("-y --year", "The year to initialize. Only valid when not specifying a day.")
        .argDescription("day", "The day to initialize. If not specified, a basic file structure will be initialized.")
        .action(init.bind(null, program));

    program.parse(Deno.args);
}

if (import.meta.main) {
    main();
}