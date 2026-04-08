import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { lockfileConflicts } from "../src/project/lockfiles.js";

const projectWith = async (...files: string[]) => {
  const dir = mkdtempSync(join(tmpdir(), "womm-lock-"));
  for (const file of files) writeFileSync(join(dir, file), "");
  const result = await lockfileConflicts(dir);
  rmSync(dir, { recursive: true, force: true });
  return result;
};

describe("lockfileConflicts", () => {
  it("flags two JavaScript lockfiles", async () => {
    expect(await projectWith("package-lock.json", "yarn.lock")).toEqual([
      ["package-lock.json", "yarn.lock"],
    ]);
  });

  it("accepts one lockfile", async () => {
    expect(await projectWith("yarn.lock")).toEqual([]);
  });

  it("accepts lockfiles from different languages", async () => {
    expect(await projectWith("yarn.lock", "poetry.lock")).toEqual([]);
  });
});
