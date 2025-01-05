import detectIndent from "detect-indent";
import { detectNewline } from "detect-newline";
import { stringifyPackage } from "../../stringify-package";

export function readVersion(contents: string): string {
  return JSON.parse(contents).version;
}

export function writeVersion(contents: string, version: string): string {
  const json = JSON.parse(contents);
  const indent = detectIndent(contents).indent || "  ";
  const newline = detectNewline(contents) || "\n";
  json.version = version;

  if (json.packages && json.packages[""]) {
    // package-lock v2 stores version there too
    json.packages[""].version = version;
  }

  return stringifyPackage(json, indent, newline);
}

export function isPrivate(contents: string): boolean {
  return JSON.parse(contents).private;
}
