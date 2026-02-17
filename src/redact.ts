import { homedir, userInfo } from "node:os";
import type { Finding } from "./types.js";

export interface Identity {
  home: string;
  username: string;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Allows either slash direction, so C:\Users\a also matches C:/Users/a. */
function pathPattern(path: string): string {
  return path.split(/[\\/]+/).map(escapeRegExp).join("[\\\\/]+");
}

/** Replaces the user's home path and username with placeholders. */
export function redactText(text: string, who: Identity): string {
  let result = text;
  if (who.home) {
    result = result.replace(new RegExp(pathPattern(who.home), "gi"), "<home>");
  }
  if (who.username) {
    const name = escapeRegExp(who.username);
    result = result.replace(
      new RegExp(`(?<![\\w.-])${name}(?![\\w.-])`, "gi"),
      "<user>",
    );
  }
  return result;
}

export function currentIdentity(): Identity {
  let username = "";
  try {
    username = userInfo().username;
  } catch {
    // Some containers have no user entry. There is then nothing to redact.
  }
  return { home: homedir(), username };
}

export function redactFindings(findings: Finding[], who: Identity): Finding[] {
  return findings.map((finding) => ({
    ...finding,
    value: finding.value === null ? null : redactText(finding.value, who),
  }));
}
