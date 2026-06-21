import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import type { CommandRunner } from "./types.js";

// JVM tools such as Gradle can take several seconds just to print a version.
const TIMEOUT_MS = 15000;

/** Only plain words may reach the Windows command interpreter. */
const SAFE_WORD = /^[\w.\-=/]+$/;

/**
 * Windows looks in the current folder before PATH, so a hostile repository could
 * supply its own npm.cmd or git.exe and have it executed. Commands therefore run
 * from a neutral folder, with current-folder lookup switched off in cmd.exe.
 */
export function windowsSafeOptions(
  env: NodeJS.ProcessEnv = process.env,
): { cwd: string; env: NodeJS.ProcessEnv } {
  return {
    cwd: tmpdir(),
    env: { ...env, NoDefaultCurrentDirectoryInExePath: "1" },
  };
}

function exec(command: string, args: string[]): Promise<string | null> {
  const safety = process.platform === "win32" ? windowsSafeOptions() : {};
  return new Promise((resolve) => {
    execFile(
      command,
      args,
      { timeout: TIMEOUT_MS, windowsHide: true, encoding: "utf8", ...safety },
      (error, stdout, stderr) => {
        if (error) return resolve(null);
        // Some tools, such as `java -version`, print their version to stderr.
        resolve(stdout.trim() || stderr.trim() || null);
      },
    );
  });
}

/** Builds the fallback call for Windows .cmd shims, or null if unsafe. */
export function windowsShimCall(
  command: string,
  args: string[],
): [string, string[]] | null {
  if (![command, ...args].every((word) => SAFE_WORD.test(word))) return null;
  return ["cmd.exe", ["/d", "/s", "/c", [command, ...args].join(" ")]];
}

/**
 * Runs a fixed command with no shell. A missing tool, a non-zero exit or a
 * timeout all return null, because "not installed" is a normal result.
 *
 * Node refuses to run .cmd files such as npm.cmd without a shell, so Windows
 * retries through cmd.exe, but only when every word is plainly safe.
 */
export const runCommand: CommandRunner = async (command, args) => {
  const output = await exec(command, args);
  if (output !== null || process.platform !== "win32") return output;
  const shim = windowsShimCall(command, args);
  return shim ? exec(...shim) : null;
};
