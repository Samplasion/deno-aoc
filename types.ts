type _OptionsDay = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23" | "24" | "25" | "all";

export interface CLIRunOptions {
    day: _OptionsDay;
    timeout?: number;
}

export type SolutionType = string | number | bigint | undefined;
export type Solution = (input: string) => SolutionType | Promise<SolutionType> | void;

export interface Test {
    input: string;
    expected: SolutionType;
}

export interface Part {
    solution: Solution;
    tests?: Test[];
}

export interface ModuleRunOptions {
    part1: Part;
    part2: Part;
    /**
     * @deprecated Use `commonTags` instead
     */
    trimTestInputs?: boolean;
    onlyTests?: boolean;
}