import { path, usefulTags } from "../../deps.ts";
import { REPO } from "../../_utils.ts";
import { Config } from "../config.ts";

export default function getFiles(config: Config) {
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
            content: getTemplate(),
        },
        {
            name: ".env",
            content: "AOC_SESSION_KEY=",
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

    const results = usefulTags.stripAllIndents`
    <!--RESULTS-->
    ${config.days.map((day, i) => {
        const p1 = day.part1.solved ? `✅ (in ${day.part1.time}ms)` : "❌";
        const p2 = day.part2.solved ? `✅ (in ${day.part2.time}ms)` : "❌";
        return `
            ### Day ${i + 1}
            
            * Part 1: ${p1}
            * Part 2: ${p2}
            
            Total time: ${(day.part1.time ?? 0) + (day.part2.time ?? 0)}ms
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

        ## Running in dev mode

        \`\`\`
        aoc watch <day>
        \`\`\`

        Example:

        \`\`\`
        aoc watch 1
        \`\`\`

        ---

        ## Results

        ${results}

        ---

        ✨🎄🎁🎄🎅🎄🎁🎄✨`;
    }
}

function getTemplate() {
    let cur = import.meta.url.replace(/files.ts$/, "template.ts");
    if (cur.startsWith("file:")) {
        cur = path.resolve(path.fromFileUrl(cur));
    }
    return Deno.readTextFileSync(cur);
}