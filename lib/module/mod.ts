import getCallerFile from "../getCallerFile.ts";
import { path, Logger, colors } from "../../deps.ts";
import { ModuleRunOptions, Solution, Test } from "../types.ts";
import { msFixed } from "../_utils.ts";
import { getConfig, saveConfig } from "../cli/config.ts";
import { updateReadme } from "../cli/init/files.ts";

type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Runs the current solution, benchmarks it, tests it agains a set of
 * tests, and logs the results.
 * 
 * In your solution files, this is your main entrypoint. You can
 * add your own tests by adding them to the `tests` array in each part.
 * It is recommended to add the examples in the challenge description.
 * 
 * You can use [options.onlyTests] to only run the tests, which is useful
 * when your algorithm is resource intensive and is still being developed.
 * Remember to disable it once you're done to send the solution!
 * 
 * @example
 * ```ts
 * import { run } from "./mod.ts";
 * 
 * const part1 = (input: string) => {
 *    // Your solution code goes here
 * };
 * 
 * const part2 = (input: string) => {
 *   // Your solution code goes here
 * };
 * 
 * run({
 *   part1: {
 *     tests: [
 *       {
 *         input: `1234`,
 *         expected: "4321",
 *       },
 *     ],
 *     solution: part1,
 *   },
 *   part2: {
 *     tests: [
 *       {
 *         input: `1234`,
 *         expected: "4321",
 *       },
 *     ],
 *     solution: part2,
 *   },
 *   onlyTests: false, // Enable this to only run tests
 * });
 * ```
 * 
 * @param options The options for the challenge (tests and solution function)
 * @param inputFile An alternative path for the input file, if applicable
 * @returns Nothing.
 */
export default async function run(options: ModuleRunOptions, inputFile?: string) {
    const cwd = Deno.cwd();
    const root = cwd.split(path.SEP).slice(0, -2).join(path.SEP);

    Deno.chdir(root);
    const config = getConfig();
    Deno.chdir(cwd);

    const perm = await Deno.permissions.query({ name: "hrtime" });
    if (perm.state != "granted") {
        Logger.warn(`Please provide the ${colors.red("--allow-hrtime")} permission to enable high resolution timers.`);
        Logger.warn(`If you don't provide it, the benchmarking results will be inaccurate.`);
        console.log();
    }

    if (!inputFile) {
        inputFile = path.join(cwd, "input.txt");
    }

    if ("trimTestInputs" in options) {
        Logger.warn(colors.red("DEPRECATION WARNING"));
        Logger.warn(`The ${colors.red("trimTestInputs")} option is deprecated.`);
        Logger.warn(`Please use the ${colors.red("usefultags")} module instead.`);
        console.log();
    }

    const dirname = path.basename(cwd);
    const day = Number(dirname.slice(dirname.length-2, dirname.length));

    if (options.part1.tests?.length) {
        await runTests({
            part: 1,
            tests: options.part1.tests,
            solution: options.part1.solution,
        });
    }
    if (options.part2.tests?.length) {
        await runTests({
            part: 2,
            tests: options.part2.tests,
            solution: options.part2.solution,
        });
    }

    if (options.onlyTests) {
        return;
    }

    let input: string;
    try {
        input = await Deno.readTextFile(inputFile);
    } catch {
        Logger.error(`
The input file hasn't been found at the default position, \`${colors.bold(colors.yellow("input.txt"))}\`.
Please either provide the path to the input file as the second argument,
or add an input file to the current directory.
(Checking: \`${colors.bold(colors.yellow(inputFile))}\`)
        `.trim());
        return;
    }

    let totalTime = 0;
    let out1: Awaited<ReturnType<typeof runSolution>>;
    let out2: Awaited<ReturnType<typeof runSolution>>;

    if (options.part1.solution) {
        out1 = await runSolution(options.part1.solution, input, 1);
        totalTime += out1[1];

        config.days[day - 1].part1.result = out1[0]!;
        config.days[day - 1].part1.time = out1[1];
    }
    if (options.part2.solution) {
        out2 = await runSolution(options.part2.solution, input, 2);
        totalTime += out2[1];

        config.days[day - 1].part2.result = out2[0]!;
        config.days[day - 1].part2.time = out2[1];
    }

    Logger.info(`Total time: ${colors.bold(colors.yellow(msFixed(totalTime)))}`);

    Deno.chdir(root);
    saveConfig(config);
    updateReadme(config);
    Deno.chdir(cwd);
}

async function runTests(options: {
    part: 1 | 2,
    tests: Test[],
    solution: Solution,
}) {
    const { part, tests, solution } = options;
    for (let i = 0; i < tests.length; i++) {
        const { input, expected } = tests[i];
        const actual = await solution(input);
        if (actual !== expected) {
            Logger.error(`Part ${part} test ${i + 1} failed`);
            console.log();
            Logger.info(`Expected: `);
            console.dir(expected);
            console.log();
            Logger.info(`Actual:`);
            console.dir(actual);
            console.log();
        } else {
            Logger.success(`Part ${part} test ${i + 1} passed`);
        }
    }
    console.log();
}

async function runSolution(solution: Solution, input: string, part: 1 | 2) {
    const t0 = performance.now();
    const result = await solution(input);
    const t1 = performance.now();
    const time = t1 - t0;

    if (!["string", "number", "bigint", "undefined"].includes(typeof result)) {
        Logger.warn(`Warning - the return type of part ${part} is a non-primitive value of type: ${colors.red(typeof result)}`);
        console.log();
    }

    Logger.info(`Part ${part} (in ${msFixed(time)})`);
    console.dir(result);
    console.log();

    return [result, time] as const;
}