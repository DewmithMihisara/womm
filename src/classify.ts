import semver from "semver";
import type { Difference } from "./diff.js";

/** Facts where any difference is worth a look, even without a version jump. */
const SENSITIVE = new Set([
  "os.platform",
  "os.arch",
  "fs.caseSensitive",
  "timezone",
  "locale",
  "eol",
  "env.NODE_ENV",
  "node.abi",
  "proxy",
  "wsl",
  "git.autocrlf",
  "git.eol",
  "git.filemode",
  "git.ignorecase",
  "git.symlinks",
  "git.longpaths",
]);

/** True when a difference could plausibly change behaviour. */
export function isSuspicious(difference: Difference): boolean {
  if (SENSITIVE.has(difference.id)) return true;
  if (difference.id.startsWith("gnu.") || difference.id.startsWith("set.")) return true;
  // Theirs works with a tool yours lacks. The reverse is much less telling.
  if (difference.kind === "only-b") return true;
  if (difference.kind === "only-a") return false;
  // These contain numbers but aren't versions, so "major gaps" mean nothing.
  if (difference.id.startsWith("hw.") || difference.id === "os.release") return false;
  const a = semver.coerce(difference.a);
  const b = semver.coerce(difference.b);
  if (!a || !b) return false;
  return a.major !== b.major;
}
