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
    // New system detectors go above this line.
  ];
}
