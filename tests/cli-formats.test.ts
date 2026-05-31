import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const dir = mkdtempSync(join(tmpdir(), "womm-formats-"));
const cli = resolve("dist/cli.js");
const womm = (...args: string[]) =>
  spawnSync(process.execPath, [cli, ...args], { encoding: "utf8", cwd: dir });
const snapshot = (node: string) =>
  JSON.stringify({
    womm: 1,
    createdAt: "x",
    findings: [{ id: "node", label: "Node.js", value: node }],
  });

beforeAll(() => {
  writeFileSync(join(dir, "a.json"), snapshot("18.0.0"));
  writeFileSync(join(dir, "b.json"), snapshot("22.0.0"));
});
afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe("output formats", () => {
  it("prints diff as JSON", () => {
    const [entry] = JSON.parse(womm("diff", "a.json", "b.json", "--json").stdout);
    expect(entry).toMatchObject({ id: "node", a: "18.0.0", b: "22.0.0" });
  });

  it("prints a trial as Markdown", () => {
    const { stdout } = womm(
      "trial",
      "--against",
      "b.json",
      "--mine",
      "a.json",
      "--markdown",
    );
    expect(stdout).toContain("## The People v. Your Machine");
    expect(stdout).toContain("| suspicious |");
  });
});
