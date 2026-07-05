import { readFile, stat, writeFile } from "node:fs/promises";
import { SNAPSHOT_VERSION, type Finding, type Snapshot } from "./types.js";

/** A problem the user can fix, shown without a stack trace. */
export class UserError extends Error {}

function isFinding(value: unknown): value is Finding {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.label === "string" &&
    (typeof item.value === "string" || item.value === null)
  );
}

/**
 * Removes control characters. Otherwise a hostile snapshot could use terminal
 * escape codes to rewrite a report, such as hiding a line or faking a verdict.
 */
export function stripControlCharacters(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\u0000-\u001f\u007f-\u009f]/g, "");
}

function cleanFinding(finding: Finding): Finding {
  return {
    id: stripControlCharacters(finding.id),
    label: stripControlCharacters(finding.label),
    value: finding.value === null ? null : stripControlCharacters(finding.value),
  };
}

/** Checks untrusted JSON, since snapshots arrive from other machines. */
export function parseSnapshot(text: string, source: string): Snapshot {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new UserError(`${source} is not valid JSON.`);
  }
  const snapshot = data as Partial<Snapshot> | null;
  if (typeof snapshot !== "object" || snapshot === null || !("womm" in snapshot)) {
    throw new UserError(`${source} is not a womm snapshot.`);
  }
  if (typeof snapshot.womm !== "number" || snapshot.womm > SNAPSHOT_VERSION) {
    throw new UserError(
      `${source} uses snapshot format ${String(snapshot.womm)}, but this version of womm reads up to ${SNAPSHOT_VERSION}. Try upgrading womm.`,
    );
  }
  if (
    typeof snapshot.createdAt !== "string" ||
    !Array.isArray(snapshot.findings) ||
    !snapshot.findings.every(isFinding)
  ) {
    throw new UserError(`${source} is a damaged womm snapshot.`);
  }
  return {
    womm: snapshot.womm,
    createdAt: stripControlCharacters(snapshot.createdAt),
    findings: snapshot.findings.map(cleanFinding),
  };
}

/** A real snapshot is a few kilobytes, so this leaves plenty of room. */
const MAX_SNAPSHOT_BYTES = 5 * 1024 * 1024;

export async function readSnapshot(path: string): Promise<Snapshot> {
  let text: string;
  try {
    if ((await stat(path)).size > MAX_SNAPSHOT_BYTES) {
      throw new UserError(`${path} is too large to be a womm snapshot.`);
    }
    text = await readFile(path, "utf8");
  } catch (error) {
    if (error instanceof UserError) throw error;
    throw new UserError(`Could not read ${path}.`);
  }
  return parseSnapshot(text, path);
}

export async function writeSnapshot(
  path: string,
  snapshot: Snapshot,
): Promise<void> {
  await writeFile(path, `${JSON.stringify(snapshot, null, 2)}\n`);
}
