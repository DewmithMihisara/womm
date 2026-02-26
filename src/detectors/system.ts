import { EOL } from "node:os";
import type { Detector } from "./types.js";

/** Where system detectors read outside facts, so tests can control them. */
export interface SystemFacts {
  env: Record<string, string | undefined>;
  eol: string;
  timeZone: string | undefined;
  locale: string | undefined;
}

export function realFacts(): SystemFacts {
  const options = Intl.DateTimeFormat().resolvedOptions();
  return {
    env: process.env,
    eol: EOL,
    timeZone: options.timeZone,
    locale: options.locale,
  };
}

/** Detectors reading only from SystemFacts. Add new ones to this list. */
export function systemDetectors(facts: SystemFacts = realFacts()): Detector[] {
  return [
    async () => [
      { id: "timezone", label: "Timezone", value: facts.timeZone ?? null },
    ],
    async () => [{ id: "locale", label: "Locale", value: facts.locale ?? null }],
    async () => [
      {
        id: "eol",
        label: "Default line ending",
        value: facts.eol === "\r\n" ? "CRLF" : "LF",
      },
    ],
    async () => {
      // Only the file name: the full path can reveal the user's directories.
      const path = facts.env.SHELL ?? facts.env.ComSpec;
      const name = path?.split(/[\\/]/).pop() ?? null;
      return [{ id: "shell", label: "Shell", value: name }];
    },
    async () => {
      // Only well-known values, in case someone stored something odd here.
      const value = facts.env.NODE_ENV;
      const known = ["development", "production", "test"];
      const shown = value === undefined ? null : known.includes(value) ? value : "other";
      return [{ id: "env.NODE_ENV", label: "NODE_ENV", value: shown }];
    },
    // New system detectors go above this line.
  ];
}
