import type { Detector } from "./types.js";

/** Settings read directly from Git. Only an allowlisted set of keys. */
const SETTINGS: [id: string, label: string, key: string][] = [
  ["git.autocrlf", "Git core.autocrlf", "core.autocrlf"],
  ["git.eol", "Git core.eol", "core.eol"],
  // New Git settings go above this line.
];

export const gitConfigDetector: Detector = async ({ run }) =>
  Promise.all(
    SETTINGS.map(async ([id, label, key]) => ({
      id,
      label,
      value: await run("git", ["config", "--get", key]),
    })),
  );
