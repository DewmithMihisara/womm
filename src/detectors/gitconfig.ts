import type { Detector } from "./types.js";

/** Settings read directly from Git. Only an allowlisted set of keys. */
const SETTINGS: [id: string, label: string, key: string][] = [
  ["git.autocrlf", "Git core.autocrlf", "core.autocrlf"],
  ["git.eol", "Git core.eol", "core.eol"],
  ["git.filemode", "Git core.filemode", "core.filemode"],
  ["git.ignorecase", "Git core.ignorecase", "core.ignorecase"],
  ["git.symlinks", "Git core.symlinks", "core.symlinks"],
  ["git.longpaths", "Git core.longpaths", "core.longpaths"],
  ["git.precomposeunicode", "Git core.precomposeunicode", "core.precomposeunicode"],
  ["git.pullRebase", "Git pull.rebase", "pull.rebase"],
  ["git.defaultBranch", "Git init.defaultBranch", "init.defaultBranch"],
  ["git.mergeFf", "Git merge.ff", "merge.ff"],
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
