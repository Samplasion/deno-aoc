import { cheerio, colors, Logger, parseDuration } from "../../deps.ts";

interface APIOptions {
    method: "GET" | "POST";
    body?: string;
    contentType?: string;
    apiKey: string;
}

async function api(path: string, options: APIOptions): Promise<Response> {
    const apiURL = new URL(path, "https://adventofcode.com");
    const headers = new Headers();
    headers.set("Content-Type", options.contentType ?? "");
    headers.set("Cookie", `session=${options.apiKey}`);
    const res = await fetch(apiURL.toString(), {
        method: options.method,
        body: options.body,
        headers,
    });
    return res;
}

export enum Status {
    OK,
    ERROR,
    NO_KEY,
    PART_SOLVED,
    PART_WRONG,
    TOO_SOON,
    LOCKED,
}

export interface APIResponse<T> {
    data: T | null;
    status: Status;
}

export async function downloadInput(year: number, day: number): Promise<APIResponse<string>> {
    const KEY = Deno.env.get("AOC_SESSION_KEY") ?? "";

    if (!KEY || KEY.length < 96) {
        // Logger.error(`Session key not found or invalid. Please set the environment variable ${colors.bold(colors.yellow("AOC_SESSION_KEY"))} to your session key.`);
        // Deno.exit(1);
        return {
            data: null,
            status: Status.NO_KEY,
        };
    }

    Logger.info(colors.green("Downloading input..."));

    return await api(`/${year}/day/${day}/input`, {
        method: "GET",
        apiKey: KEY,
    }).then((res) => res.text()).then(input => ({
        data: input,
        status: Status.OK,
    })).catch(e => handleError<string>(e));
}

export async function submitResult(day: number, year: number, part: number, result: string): Promise<APIResponse<string | number>> {
    const KEY = Deno.env.get("AOC_SESSION_KEY") ?? "";

    if (!KEY || KEY.length < 96) {
        return Promise.resolve({
            data: null,
            status: Status.NO_KEY,
        });
    }

    try {
        const res = await api(`/${year}/day/${day}/answer`, {
            method: "POST",
            body: `level=${part}&answer=${result}`,
            apiKey: KEY,
            contentType: "application/x-www-form-urlencoded",
        });
        const input = await res.text();

        if (input.includes("don't repeatedly request this endpoint")) {
            return {
                data: null,
                status: Status.TOO_SOON,
            };
        }

        const main = cheerio.load(input)("main");
        const info = main?.text().replace(/\[.*\]/, "").trim();

        if (!info) {
            return {
                data: main.text(),
                status: Status.ERROR,
            };
        }

        if (main.text().includes("That's the right answer")) {
            return {
                data: info,
                status: Status.PART_SOLVED,
            };
        } else {
            let status = Status.ERROR;

            if (info.includes("That's not the right answer")) {
                status = Status.PART_WRONG;
            } else if (info.includes("You gave an answer too recently")) {
                status = Status.TOO_SOON;
            } else if (info.includes("You don't seem to be solving the right level")) {
                status = Status.LOCKED;
            }

            const textNumbers = {
                "one": 1,
                "two": 2,
                "three": 3,
                "four": 4,
                "five": 5,
                "six": 6,
                "seven": 7,
                "eight": 8,
                "nine": 9,
                "ten": 10,
            };
            const regex = new RegExp(`${Object.keys(textNumbers).join("|")} (second|minute|hour|day)`);
            if (regex.test(info))
                timing: {
                    const [, number, unit] = info.match(regex) ?? [null, null, null];
                    if (!number || !unit) {
                        break timing;
                    }
                    const dur = parseDuration(`${textNumbers[number as keyof typeof textNumbers]} ${unit}`);
                    return {
                        data: dur,
                        status,
                    };
                }

            return {
                data: info,
                status,
            };
        }
    } catch (e) {
        return handleError<string>(e);
    }
}

function handleError<T>(err: Error): APIResponse<T> {
    if (err.message === "400" || err.message === "500") {
        Logger.error(
            colors.red("INVALID SESSION KEY") + "\n\n" +
            `Session key not found or invalid. Please set the environment variable ${colors.bold(colors.yellow("AOC_SESSION_KEY"))} to your session key.` +
            `To get your cookie, visit ${colors.bold(colors.yellow("https://adventofcode.com/"))}, log in and copy the value of the cookie named session.\n\n`);
    } else if (err.message.startsWith("5")) {
        Logger.error(colors.red("Server error. Please try again later."))
    } else if (err.message === "404") {
        Logger.error(colors.yellow("This challenge hasn't been unlocked yet."))
    } else {
        Logger.error(colors.bold(colors.red("Unexpected error")));
        Logger.error(colors.yellow("Please report the following error to the developer."));
        console.log(err)
    }

    return {
        data: null,
        status: Status.ERROR,
    };
}