import { Logger, Transport } from "https://x.nest.land/Yogger@2.2.6/src/mod.ts";
import { colors } from "./../deps.ts";

export const LogLevel = {
    debug: {
        name: "DEBUG",
        color: colors.brightMagenta,
        messageColor: colors.white,
        log: console.debug,
    },
    info: {
        name: "INFO",
        color: colors.cyan,
        messageColor: colors.white,
        log: console.info,
    },
    success: {
        name: "SUCCESS",
        color: colors.green,
        messageColor: colors.brightGreen,
        log: console.log,
    },
    warn: {
        name: "WARN",
        color: (string: string) => colors.rgb8(string, 214),
        messageColor: (string: string) => colors.rgb8(string, 208),
        log: console.warn,
    },
    error: {
        name: "ERROR",
        color: colors.red,
        messageColor: colors.brightRed,
        log: console.error,
    },
    fatal: {
        name: "FATAL",
        color: (string: string) => colors.bgBrightRed(colors.black(string)),
        messageColor: (string: string) => colors.bgBrightRed(colors.black(string)),
        log: console.error,
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
                logLevel.log(`${logLevel.messageColor(message)}`);
            }
        })
    ],
});

export default logger;