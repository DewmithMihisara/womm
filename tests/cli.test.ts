import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const dir = mkdtempSync(join(tmpdir(), "womm-"));
const cli = resolve("dist/cli.js");
const womm = (...args: string[]) =>
  spawnSync(process.execPath, [cli, ...args], { encoding: "utf8", cwd: dir });
const snapshot = (node: string) =>
  JSON.stringify({
    womm: 1,
    createdAt: "2026-01-01",
    findings: [{ id: "node", label: "Node.js", value: node }],
  });

beforeAll(() => {
  writeFileSync(join(dir, "a.json"), snapshot("18.0.0"));
  writeFileSync(join(dir, "b.json"), snapshot("22.0.0"));
});

afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe("womm CLI", () => {
  it("shows help", () => {
    const result = womm("--help");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Usage:");
  });

  it("exits 2 with no command", () => {
    expect(womm().status).toBe(2);
  });

  it("rejects an unknown command", () => {
    const result = womm("dance");
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("Unknown command");
  });

  it("rejects an unknown option cleanly", () => {
    const result = womm("--dance");
    expect(result.status).toBe(2);
    expect(result.stderr).not.toContain("at ");
  });

  it("prints valid JSON to stdout from snapshot", () => {
    const result = womm("snapshot");
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout).womm).toBe(1);
  });

  it("compares two snapshot files", () => {
    const result = womm("diff", "a.json", "b.json");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("18.0.0");
    expect(result.stdout).toContain("22.0.0");
  });

  it("reports a missing file without a stack trace", () => {
    const result = womm("diff", "a.json", "nope.json");
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("Could not read nope.json");
  });
});
