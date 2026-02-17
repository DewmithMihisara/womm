import type { Detector } from "./types.js";
import { parseVersion } from "./version.js";

/** Builds a detector for a tool that reports its version from a command. */
export function versionDetector(
  id: string,
  label: string,
  command: string,
  args: string[] = ["--version"],
): Detector {
  return async ({ run }) => [
    { id, label, value: parseVersion(await run(command, args)) },
  ];
}
