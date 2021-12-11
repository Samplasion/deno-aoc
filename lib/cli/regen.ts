import { getConfig } from "./config.ts";
import { noConfigurationError } from "../_utils.ts";
import { updateReadme } from "./init/files.ts";
import { Logger } from "../../deps.ts";

export default function regen() {
    const config = getConfig();

    if (!config) {
        noConfigurationError();
    }

    updateReadme(config);

    Logger.success("Successfully updated README.md");
}