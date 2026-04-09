import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const dir = mkdtempSync(join(tmpdir(), "womm-trial-"));
const cli = resolve("dist/cli.js");
const womm = (...args: string[]) =>
  spawnSync(process.execPath, [cli, ...args], {
    encoding: "utf8",
    cwd: dir,
    env: { ...process.env, NO_COLOR: "1" },
  });
const snapshot = (node: string) =>
  JSON.stringify({
    womm: 1,
    createdAt: "2026-01-01",
    findings: [{ id: "node", label: "Node.js", value: node }],
  });

beforeAll(() => {
  writeFileSync(join(dir, "mine.json"), snapshot("18.0.0"));
  writeFileSync(join(dir, "theirs.json"), snapshot("22.0.0"));
  const project = join(dir, "project");
  mkdirSync(project);
  writeFileSync(join(project, ".nvmrc"), "22.11.0\n");
  writeFileSync(join(project, ".env.example"), "WOMM_TEST_ONLY_KEY=\n");
});

afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe("womm trial", () => {
  it("requires --against", () => {
    const result = womm("trial");
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("--against");
  });

  it("exits 0 and reports a major gap as suspicious, with no requirements", () => {
    const result = womm("trial", "--against", "theirs.json", "--mine", "mine.json");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("THE PEOPLE v. YOUR MACHINE");
    expect(result.stdout).toContain("SUSPICIOUS");
  });

  it("exits 1 on a guilty verdict from project requirements", () => {
    const result = womm(
      "trial",
      "--against",
      "theirs.json",
      "--mine",
      "mine.json",
      "--project",
      "project",
    );
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("GUILTY");
    expect(result.stdout).toContain(".nvmrc requires node 22.11.0");
    expect(result.stdout).toContain("WOMM_TEST_ONLY_KEY");
  });

  it("prints JSON on request", () => {
    const result = womm(
      "trial",
      "--against",
      "theirs.json",
      "--mine",
      "mine.json",
      "--json",
    );
    expect(JSON.parse(result.stdout)[0].verdict).toBe("suspicious");
  });
});
