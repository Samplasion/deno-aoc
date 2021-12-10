import { Logger, Transport } from "https://x.nest.land/Yogger@2.2.6/src/mod.ts";
import { colors } from "./../deps.ts";

export const LogLevel = {
    debug: {
        name: "DEBUG",
        color: colors.brightMagenta,
        messageColor: colors.white,
    },
    info: {
        name: "INFO",
        color: colors.cyan,
        messageColor: colors.white,
    },
    success: {
        name: "SUCCESS",
        color: colors.green,
        messageColor: colors.brightGreen,
    },
    warn: {
        name: "WARN",
        color: (string: string) => colors.rgb8(string, 214),
        messageColor: (string: string) => colors.rgb8(string, 208),
    },
    error: {
        name: "ERROR",
        color: colors.red,
        messageColor: colors.brightRed,
    },
    fatal: {
        name: "FATAL",
        color: (string: string) => colors.bgBrightRed(colors.black(string)),
        messageColor: (string: string) => colors.bgBrightRed(colors.black(string)),
    },
}

const logger = Logger.create<typeof LogLevel>({
    levels: LogLevel,
    transports: [
        new Transport<typeof LogLevel>({
            levels: LogLevel,
            logMethod(level) {
                // const date = level.date.toLocaleString();
                const logLevel = LogLevel[level.level as keyof typeof LogLevel];
                const message = level.message;
                // [${colors.blue(date)}] ${logLevel.color(logLevel.name)} 
                console.log(`${logLevel.messageColor(message)}`);
            }
        })
    ],
});

export default logger;