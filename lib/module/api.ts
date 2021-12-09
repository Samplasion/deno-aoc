import { colors, Logger } from "../../deps.ts";

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
}

export interface APIResponse<T> {
    data: T | null;
    status: Status;
}

export async function downloadInput(year: number, day: number): Promise<APIResponse<string>> {
    const KEY = Deno.env.get("AOC_SESSION_KEY") ?? "";

    console.log(KEY);

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

function handleError<T>(err: Error): APIResponse<T> {
    if (err.message === "400" || err.message === "500") {
        console.log(
            colors.red("INVALID SESSION KEY\n\n") +
            "Please make sure that the session key in the .env file is correct.\n" +
            "You can find your session key in the 'session' cookie at:\n" +
            "https://adventofcode.com\n\n" +
            colors.bold("Restart the script after changing the .env file.\n"),
        )
    } else if (err.message.startsWith("5")) {
        console.log(colors.red("SERVER ERROR"))
    } else if (err.message === "404") {
        console.log(colors.yellow("CHALLENGE NOT YET AVAILABLE"))
    } else {
        Logger.error("UNEXPECTED ERROR\nPlease check your internet connection.\n\nIf you think it's a bug, create an issue on github.\nHere are some details to include:\n");
        console.log(err)
    }

    return {
        data: null,
        status: Status.ERROR,
    };
}