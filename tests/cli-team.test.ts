import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const dir = mkdtempSync(join(tmpdir(), "womm-team-"));
const cli = resolve("dist/cli.js");
const womm = (...args: string[]) =>
  spawnSync(process.execPath, [cli, ...args], { encoding: "utf8", cwd: dir });
const snapshot = (value: string) =>
  JSON.stringify({
    womm: 1,
    createdAt: new Date().toISOString(),
    findings: [{ id: "shell", label: "Shell", value }],
  });
const TEAM_RULE = `id: team-rule
title: Our zsh setup breaks the build
why: Team knowledge.
fix: Use bash.
source: https://example.com/wiki
when:
  - finding: shell
    equals: [zsh]
`;

beforeAll(() => {
  writeFileSync(join(dir, "mine.json"), snapshot("zsh"));
  writeFileSync(join(dir, "theirs.json"), snapshot("bash"));
  mkdirSync(join(dir, "team-rules"));
  writeFileSync(join(dir, "team-rules", "team-rule.yaml"), TEAM_RULE);
  mkdirSync(join(dir, "ignoring"));
  writeFileSync(join(dir, "ignoring", ".womm.yaml"), "ignore: [shell]\n");
  mkdirSync(join(dir, "configured"));
  writeFileSync(join(dir, "configured", ".womm.yaml"), "rules: ../team-rules\n");
  mkdirSync(join(dir, "broken"));
  writeFileSync(join(dir, "broken", ".womm.yaml"), "wrong: true\n");
});
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const trial = (...extra: string[]) =>
  womm("trial", "--against", "theirs.json", "--mine", "mine.json", ...extra);

describe("team settings", () => {
  it("uses rules from --rules", () => {
    const { stdout } = trial("--rules", "team-rules");
    expect(stdout).toContain("Our zsh setup breaks the build");
  });

  it("uses a rules folder from .womm.yaml", () => {
    const { stdout } = trial("--project", "configured");
    expect(stdout).toContain("Our zsh setup breaks the build");
  });

  it("applies ignore from .womm.yaml", () => {
    const { stdout } = trial("--project", "ignoring", "--json");
    expect(JSON.parse(stdout)).toEqual([]);
  });

  it("explains an invalid config file", () => {
    const result = trial("--project", "broken");
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('unknown key "wrong"');
  });
});
