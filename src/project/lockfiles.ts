import { access } from "node:fs/promises";
import { join } from "node:path";

/** Groups of lockfiles that should not exist side by side. */
const GROUPS: string[][] = [
  ["package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb", "bun.lock"],
  ["poetry.lock", "uv.lock", "Pipfile.lock"],
];

const exists = (path: string) =>
  access(path).then(
    () => true,
    () => false,
  );

/** Returns each group where a project has more than one lockfile. */
export async function lockfileConflicts(directory: string): Promise<string[][]> {
  const results = await Promise.all(
    GROUPS.map(async (group) => {
      const checks = await Promise.all(
        group.map((file) => exists(join(directory, file))),
      );
      return group.filter((_file, index) => checks[index]);
    }),
  );
  return results.filter((group) => group.length > 1);
}
