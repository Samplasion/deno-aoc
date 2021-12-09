// import getCallerFile from "../../getCallerFile.ts";
import { path, Logger, colors } from "../../deps.ts";
import { ModuleRunOptions, Solution, Test } from "../../types.ts";
import { msFixed } from "./../_utils.ts";

type Awaited<T> = T extends Promise<infer U> ? U : T;

export async function run(options: ModuleRunOptions, inputFile?: string) {
    const perm = await Deno.permissions.query({ name: "hrtime" });
    if (perm.state != "granted") {
        Logger.warn(`Please provide the ${colors.red("--allow-hrtime")} permission to enable high resolution timers.`);
        Logger.warn(`If you don't provide it, the benchmarking results will be inaccurate.`);
    }

    if (!inputFile) {
        // const dir = path.parse(getCallerFile()).dir;
        // console.log(getCallerFile());
        const dir = Deno.cwd();
        inputFile = path.join(dir, "input.txt");
    }

    if ("trimTestInputs" in options) {
        Logger.warn(colors.red("DEPRECATION WARNING"));
        Logger.warn(`The ${colors.red("trimTestInputs")} option is deprecated.`);
        Logger.warn(`Please use the ${colors.red("usefultags")} module instead.`);
        console.log();
    }

    if (options.part1.tests) {
        await runTests({
            part: 1,
            tests: options.part1.tests,
            solution: options.part1.solution,
        });
    }
    if (options.part2.tests) {
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
        input = await readFile(inputFile);
    } catch {
        Logger.error(`
The input file hasn't been found at the default position, \`${colors.bold(colors.yellow("input.txt"))}\`.
Please either provide the path to the input file as the second argument,
or add an input file to the current directory.
(Checking: \`${colors.bold(colors.yellow(inputFile))}\`)
        `);
        return;
    }

    let totalTime = 0;
    let out1: Awaited<ReturnType<typeof runSolution>>;
    let out2: Awaited<ReturnType<typeof runSolution>>;

    if (options.part1.solution) {
        out1 = await runSolution(options.part1.solution, input, 1);
        totalTime += out1[1];
    }
    if (options.part2.solution) {
        out2 = await runSolution(options.part2.solution, input, 2);
        totalTime += out2[1];
    }

    Logger.info(`Total time: ${colors.bold(colors.yellow(msFixed(totalTime)))}`);
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
            console.log();
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

async function readFile(file: string) {
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(await Deno.readFile(file));
}