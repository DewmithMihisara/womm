import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Dependencies } from "../rules/engine.js";

const FIELDS = ["dependencies", "devDependencies", "optionalDependencies"];

/** Used only while judging. Dependency lists are never written to a snapshot. */
export async function readDependencies(directory: string): Promise<Dependencies> {
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(await readFile(join(directory, "package.json"), "utf8"));
  } catch {
    return {};
  }
  const result: Dependencies = {};
  for (const field of FIELDS) {
    const entries = data?.[field];
    if (typeof entries !== "object" || entries === null) continue;
    for (const [name, range] of Object.entries(entries)) {
      if (typeof range === "string") result[name] = range;
    }
  }
  return result;
}
