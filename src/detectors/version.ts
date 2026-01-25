const VERSION = /\d+(?:\.\d+)+(?:[-+][0-9A-Za-z.-]+)?/;

/** Pulls the first version number out of tool output, e.g. "git version 2.52.0". */
export function parseVersion(output: string | null): string | null {
  if (!output) return null;
  return VERSION.exec(output)?.[0] ?? null;
}
