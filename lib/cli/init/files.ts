import { path, usefulTags } from "../../../deps.ts";
import { VERSION } from "../../../version.ts";
import { msFixed, REPO } from "../../_utils.ts";
import { Config } from "../config.ts";

export default async function getFiles(config: Config) {
    return [
        {
            name: ".aoc.json",
            content: JSON.stringify(config, null, 2),
        },
        {
            name: "README.md",
            content: getReadme(config),
        },
        {
            name: "src/template/index.ts",
            content: await getTemplate(),
        },
        {
            name: ".env",
            content: "AOC_SESSION_KEY=",
        },
        {
            name: ".gitignore",
            content: usefulTags.stripAllIndents`
                node_modules
                *.temp.*
                */**/*.temp.*
                */**/input.txt
                */**/test.txt
                *.log
                */**/*.log
                .idea
                .vscode
                .env
            `,
        }
    ];
}

export function getReadme(config: Config, existingReadme?: string) {
    const Stars = {
        ZERO: "☆☆",
        ONE: "★☆",
        TWO: "★★",
    };
    function badge(left: string, right: string, color: string, url?: string) {
        const image = `![${left}](https://img.shields.io/badge/${encodeURIComponent(left).replaceAll("-", "--")}-${encodeURIComponent(right).replaceAll("-", "--")}-${encodeURIComponent(color).replaceAll("-", "--")}.svg?style=flat-square)`;
        return url ? `[${image}](${url})` : image;
    }

    const solutions = usefulTags.stripAllIndents`
    <!--SOLUTIONS-->
    ${config.days.map((day, i) => {
        const pad = (n: number) => n.toString().padStart(2, "0");
        if (day.part2.solved) {
            return badge(`Day ${pad(i + 1)}`, Stars.TWO, "brightgreen", `/src/day${pad(i + 1)}`);
        } else if (day.part1.solved) {
            return badge(`Day ${pad(i + 1)}`, Stars.ONE, "yellow", `/src/day${pad(i + 1)}`);
        } else {
            return badge(`Day ${pad(i + 1)}`, Stars.ZERO, "lightgrey");
        }
    }).join("\n")}
    <!--/SOLUTIONS-->`;

    const useTabularResults = existingReadme?.includes("<!--useTabularResults=true-->") ?? false;

    const tabularResults = usefulTags.stripAllIndents`
    <!--RESULTS-->
    | Day  | Part 1 | Part 2 | Total time |
    |------|--------|--------|------------|
    ${config.days.map((day, i) => {
        const p1 = day.part1.solved || day.part2.solved ? `✅ (in ${msFixed(day.part1.time!)})` : "❌";
        const p2 = day.part2.solved ? `✅ (in ${msFixed(day.part2.time!)})` : "❌";
        const total = (day.part1.time ?? 0) + (day.part2.time ?? 0);
        return `|  ${i + 1}  | ${p1} | ${p2} | ${total ? msFixed(total) : ""} |`;
    }).join("\n")}
    <!--/RESULTS-->`;

    const results = useTabularResults ? tabularResults :
        usefulTags.stripAllIndents`
        <!--RESULTS-->
        ${config.days.map((day, i) => {
            const p1 = day.part1.solved || day.part2.solved ? `✅ Part 1 (in ${msFixed(day.part1.time!)})` : "❌ Part 1";
            const p2 = day.part2.solved ? `✅ Part 2 (in ${msFixed(day.part2.time!)})` : "❌ Part 2";
            return `
                ### Day ${i + 1}
                
                ${p1}  
                ${p2}
                
                Total time: ${msFixed((day.part1.time ?? 0) + (day.part2.time ?? 0))}
                `;
        }).join("\n")}
        <!--/RESULTS-->`;

    // return solutions.join("\n");

    if (existingReadme) {
        return existingReadme
            .replace(/<!--SOLUTIONS-->.*<!--\/SOLUTIONS-->/s, solutions)
            .replace(/<!--RESULTS-->.*<!--\/RESULTS-->/s, results);
    } else {
        return usefulTags.stripAllIndents`
        <!-- Entries between SOLUTIONS and RESULTS tags are auto-generated -->

        # 🎄 Advent of Code ${config.year} 🎄

        ${badge("AoC", config.year.toString(), "blue", "https://adventofcode.com/")}
        ${badge("Deno", Deno.version.deno, "blue", "https://deno.land/")}
        ${badge("TypeScript", Deno.version.typescript, "blue", "https://www.typescriptlang.org/")}
        ${badge("Template", "deno-aoc", "blue", "https://github.com/samplasion/deno-aoc")} ${badge("Based on", "aocrunner", "blue", "https://github.com/caderek/aocrunner")}

        ## Solutions
        
        ${solutions}

        _Click a badge to go to the specific day's solution._

        ---

        ## Installation

        [Detailed and up-to-date installation instructions](${REPO})

        ## Running a solution

        \`\`\`
        aoc run <day>
        \`\`\`

        Example:

        \`\`\`
        aoc run 25
        \`\`\`

        ---

        ## Results

        ${results}

        ---

        ✨🎄🎁🎄🎅🎄🎁🎄✨`;
    }
}

export function updateReadme(config: Config) {
    const readme = path.resolve(path.join(Deno.cwd(), "README.md"));
    let content;
    try {
        if (Deno.statSync(readme).isFile) {
            content = Deno.readTextFileSync(readme);
        }
    } catch {
        // ignore
    }
    Deno.writeTextFileSync(readme, getReadme(config, content));
}

async function getTemplate() {
    let cur = import.meta.url.replace(/files.ts$/, "template.ts.template");
    if (cur.startsWith("file:")) {
        cur = path.resolve(path.fromFileUrl(cur));
    }
    let fileContent: string;
    if (cur.startsWith("https:")) {
        fileContent = await fetch(cur).then(res => res.text());
    } else {
        fileContent = Deno.readTextFileSync(cur);
    }
    return fileContent.replaceAll("{{VERSION}}", VERSION);
}