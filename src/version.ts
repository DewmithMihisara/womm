import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Reads the version from the package root, from either src or dist. */
export function packageVersion(): string {
  let directory = dirname(fileURLToPath(import.meta.url));
  while (!existsSync(join(directory, "package.json"))) {
    const parent = dirname(directory);
    if (parent === directory) return "unknown";
    directory = parent;
  }
  const manifest = JSON.parse(readFileSync(join(directory, "package.json"), "utf8"));
  return String(manifest.version);
}
