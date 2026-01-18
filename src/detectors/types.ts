import type { Finding } from "../types.js";

/** Runs a fixed command and returns stdout, or null if it could not run. */
export type CommandRunner = (
  command: string,
  args: string[],
) => Promise<string | null>;

export interface DetectorContext {
  run: CommandRunner;
}

export type Detector = (ctx: DetectorContext) => Promise<Finding[]>;
