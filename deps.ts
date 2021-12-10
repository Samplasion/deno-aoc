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

// Cheerio
export { cheerio } from "https://deno.land/x/cheerio@1.0.4/mod.ts";

// Logger
import Logger from "./lib/logger.ts";
export { Logger };