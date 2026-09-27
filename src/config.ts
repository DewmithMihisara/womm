import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse } from "yaml";
import { UserError } from "./io.js";

export interface Config {
  /** Charge ids the team has decided to leave out of trials. */
  ignore: string[];
  /** A folder of the team's own rules, relative to the project. */
  rules?: string;
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function parseConfig(text: string): Config {
  let data: unknown;
  try {
    data = parse(text);
  } catch {
    throw new UserError(".womm.yaml is not valid YAML.");
  }
  if (data === null || data === undefined) return { ignore: [] };
  if (typeof data !== "object") throw new UserError(".womm.yaml must be a mapping.");
  const { ignore = [], rules, ...unknown } = data as Record<string, unknown>;
  const extra = Object.keys(unknown);
  if (extra.length > 0) throw new UserError(`.womm.yaml has unknown key "${extra[0]}".`);
  if (!isStringList(ignore)) throw new UserError(".womm.yaml: ignore must be a list of ids.");
  if (rules !== undefined && typeof rules !== "string") {
    throw new UserError(".womm.yaml: rules must be a folder path.");
  }
  return rules === undefined ? { ignore } : { ignore, rules };
}

export async function readConfig(project: string): Promise<Config> {
  let text: string;
  try {
    text = await readFile(join(project, ".womm.yaml"), "utf8");
  } catch {
    return { ignore: [] };
  }
  return parseConfig(text);
}
