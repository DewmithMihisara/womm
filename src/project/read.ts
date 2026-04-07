import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { sources, type Requirement } from "./sources.js";

/** Reads every known requirement file that exists in a folder. */
export async function readRequirements(directory: string): Promise<Requirement[]> {
  const found = await Promise.all(
    sources.map(async (source) => {
      try {
        const text = await readFile(join(directory, source.file), "utf8");
        return source.parse(text).map((w) => ({ ...w, source: source.file }));
      } catch {
        return [];
      }
    }),
  );
  return found.flat();
}
