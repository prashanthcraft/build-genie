import path from "path";
import { findUpSync } from "find-up";
import { readFileSync } from "fs";

const CONFIGURATION_FILES = [
  ".versionrc",
  ".versionrc.cjs",
  ".versionrc.json",
  ".versionrc.js",
];

export function getConfiguration(): Record<string, any> {
  let config: Record<string, any> = {};
  const configPath = findUpSync(CONFIGURATION_FILES);
  if (!configPath) {
    return config;
  }
  const ext = path.extname(configPath);
  if (ext === ".js" || ext === ".cjs") {
    const jsConfiguration = require(configPath);
    if (typeof jsConfiguration === "function") {
      config = jsConfiguration();
    } else {
      config = jsConfiguration;
    }
  } else {
    config = JSON.parse(readFileSync(configPath, "utf-8"));
  }

  /**
   * todo: we could eventually have deeper validation of the configuration (using `ajv`) and
   * provide a more helpful error.
   */
  if (typeof config !== "object") {
    throw new Error(
      `[commit-and-tag-version] Invalid configuration in ${configPath} provided. Expected an object but found ${typeof config}.`
    );
  }

  return config;
}
