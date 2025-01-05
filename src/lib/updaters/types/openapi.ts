import yaml from "yaml";
import { detectNewline } from "detect-newline";

export function readVersion(contents: string): string {
  return yaml.parse(contents).info.version;
}

export function writeVersion(contents: string, version: string): string {
  const newline = detectNewline(contents);
  const document = yaml.parseDocument(contents);

  (document.get("info") as yaml.YAMLMap).set("version", version);

  return document.toString().replace(/\r?\n/g, newline ?? "\n");
}
