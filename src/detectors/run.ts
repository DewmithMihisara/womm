import { execFile } from "node:child_process";
import type { CommandRunner } from "./types.js";

const TIMEOUT_MS = 5000;

/**
 * Runs a fixed command with no shell. A missing tool, a non-zero exit or a
 * timeout all return null, because "not installed" is a normal result.
 */
export const runCommand: CommandRunner = (command, args) =>
  new Promise((resolve) => {
    execFile(
      command,
      args,
      { timeout: TIMEOUT_MS, windowsHide: true, encoding: "utf8" },
      (error, stdout, stderr) => {
        if (error) return resolve(null);
        // Some tools, such as `java -version`, print their version to stderr.
        resolve(stdout.trim() || stderr.trim() || null);
      },
    );
  });
