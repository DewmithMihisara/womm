import { mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Detector } from "./types.js";

/** Creates a file and looks for it under different casing. */
export async function isCaseSensitive(directory: string): Promise<boolean> {
  const folder = await mkdtemp(join(directory, "womm-case-"));
  try {
    await writeFile(join(folder, "probe"), "");
    await stat(join(folder, "PROBE"));
    return false;
  } catch {
    return true;
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
}

export function filesystemDetector(directory = tmpdir()): Detector {
  return async () => {
    let value: string | null = null;
    try {
      value = (await isCaseSensitive(directory)) ? "yes" : "no";
    } catch {
      // An unwritable folder just means this can't be determined.
    }
    return [{ id: "fs.caseSensitive", label: "Case-sensitive files", value }];
  };
}
