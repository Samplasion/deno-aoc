// STL
export * as fs from "https://deno.land/std@0.117.0/fs/mod.ts";
export * as path from "https://deno.land/std@0.117.0/path/mod.ts";
export * as colors from "https://deno.land/std@0.117.0/fmt/colors.ts";

// CLI
import Denomander from "https://deno.land/x/denomander@0.9.1/mod.ts";
export { Denomander };

// Sleep
import { sleep } from "https://deno.land/x/sleep@v1.2.0/mod.ts";
export { sleep };

// Common tags
import * as usefulTags from "https://deno.land/x/usefultags@1.2.0/usefulTags.mjs";
import * as _usefulTags from "https://deno.land/x/usefultags@1.2.0/usefulTags.d.ts";
const ut = { ...usefulTags };
export { ut as usefulTags };

// @standards/duration
import parseDurationFn from "https://cdn.skypack.dev/@standards/duration";
type ParseDurationFunction1Args = (duration: string) => number;
type ParseDurationFunction2Args = (duration: string, options?: Record<string, unknown>) => number;
type ParseDurationFunction3Args = (duration: string, defaultValue?: number, options?: Record<string, unknown>) => number;
const parseDuration = parseDurationFn as ParseDurationFunction1Args | ParseDurationFunction2Args | ParseDurationFunction3Args;
export { parseDuration };

// pretty-ms
import _prettyMs from 'https://cdn.skypack.dev/pretty-ms';
interface PrettyMsOptions {
    secondsDecimalDigits?: number;
    millisecondsDecimalDigits?: number;
    keepDecimalsOnWholeSeconds?: boolean;
    compact?: boolean;
    unitCount?: number;
    verbose?: boolean;
    formatSubMilliseconds?: boolean;
    separateMilliseconds?: boolean;
    colonNotation?: boolean;
}
type PrettyMs = (ms: number, options?: PrettyMsOptions) => string;
const prettyMs = _prettyMs as PrettyMs;
const defaultPrettyMs = (ms: number) => {
    return prettyMs(ms, {
        verbose: true,
        secondsDecimalDigits: 0,
    });
}
export { prettyMs, defaultPrettyMs };

// Cheerio
export { cheerio } from "https://deno.land/x/cheerio@1.0.4/mod.ts";

// Deno DOM Parser
export * from "https://github.com/b-fuze/deno-dom/raw/188d7240e5371caf1b4add8bb7183933d142337e/deno-dom-wasm.ts"

// Turndown
import TurndownService from 'https://cdn.skypack.dev/turndown@7.1.1';
export * from 'https://cdn.skypack.dev/turndown@7.1.1';
export { TurndownService };

// Logger
import Logger from "./lib/logger.ts";
export { Logger };