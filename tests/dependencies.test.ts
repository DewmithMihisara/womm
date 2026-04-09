import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readDependencies } from "../src/project/dependencies.js";

const withPackage = async (content: string) => {
  const dir = mkdtempSync(join(tmpdir(), "womm-deps-"));
  writeFileSync(join(dir, "package.json"), content);
  const result = await readDependencies(dir);
  rmSync(dir, { recursive: true, force: true });
  return result;
};

describe("readDependencies", () => {
  it("merges dependency fields", async () => {
    const json = JSON.stringify({
      dependencies: { a: "^1.0.0" },
      devDependencies: { b: "^2.0.0" },
    });
    expect(await withPackage(json)).toEqual({ a: "^1.0.0", b: "^2.0.0" });
  });

  it("survives broken JSON", async () => {
    expect(await withPackage("{")).toEqual({});
  });

  it("survives unexpected shapes", async () => {
    expect(await withPackage('{"dependencies":[1],"devDependencies":3}')).toEqual({});
  });

  it("returns nothing without a package.json", async () => {
    expect(await readDependencies(join(tmpdir(), "womm-none"))).toEqual({});
  });
});
