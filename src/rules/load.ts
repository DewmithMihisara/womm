import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { parse } from "yaml";
import { ruleErrors } from "./schema.js";
import type { Rule } from "./types.js";

export interface LoadResult {
  rules: Rule[];
  errors: string[];
}

/** The rules folder that ships with the package, next to dist. */
export function defaultRulesDirectory(): string {
  return fileURLToPath(new URL("../rules/", import.meta.url));
}

/** Loads every YAML rule. A bad file is reported and never stops the others. */
export async function loadRules(
  directory = defaultRulesDirectory(),
): Promise<LoadResult> {
  let names: string[];
  try {
    names = await readdir(directory);
  } catch {
    return { rules: [], errors: [] };
  }
  const rules: Rule[] = [];
  const errors: string[] = [];
  for (const name of names.filter((n) => n.endsWith(".yaml")).sort()) {
    const text = await readFile(join(directory, name), "utf8");
    let data: unknown;
    try {
      data = parse(text);
    } catch {
      errors.push(`${name}: not valid YAML`);
      continue;
    }
    const problems = ruleErrors(data);
    if (problems.length > 0) {
      errors.push(...problems.map((problem) => `${name}: ${problem}`));
      continue;
    }
    const rule = data as Rule;
    if (rules.some((existing) => existing.id === rule.id)) {
      errors.push(`${name}: duplicate id "${rule.id}"`);
      continue;
    }
    if (name !== `${rule.id}.yaml`) {
      errors.push(`${name}: file name must match its id "${rule.id}"`);
      continue;
    }
    rules.push(rule);
  }
  return { rules, errors };
}
