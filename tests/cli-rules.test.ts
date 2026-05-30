import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const cli = resolve("dist/cli.js");
const womm = (...args: string[]) =>
  spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });

describe("womm rules", () => {
  it("lists shipped rules", () => {
    const result = womm("rules", "list");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("python-312-distutils");
  });

  it("validates shipped rules", () => {
    expect(womm("rules", "check").status).toBe(0);
  });

  it("fails on an invalid rule and names the problem", () => {
    const dir = mkdtempSync(join(tmpdir(), "womm-check-"));
    writeFileSync(join(dir, "bad.yaml"), "id: bad\n");
    const result = womm("rules", "check", dir);
    rmSync(dir, { recursive: true, force: true });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("bad.yaml");
  });

  it("rejects an unknown action", () => {
    expect(womm("rules", "dance").status).toBe(2);
  });
});
