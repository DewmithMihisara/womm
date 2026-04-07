import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** Key names only. Everything after the = sign is discarded immediately. */
export function parseEnvKeys(text: string): string[] {
  const keys = text.split(/\r?\n/).flatMap((line) => {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(line);
    return match ? [match[1]!] : [];
  });
  return [...new Set(keys)];
}

async function keysIn(path: string): Promise<string[] | null> {
  try {
    return parseEnvKeys(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

/** Keys the project declares that this machine has not set. */
export async function missingEnvKeys(
  directory: string,
  env: Record<string, string | undefined> = process.env,
): Promise<string[]> {
  const declared = await keysIn(join(directory, ".env.example"));
  if (!declared) return [];
  const present = (await keysIn(join(directory, ".env"))) ?? [];
  return declared.filter((key) => !present.includes(key) && !env[key]);
}
