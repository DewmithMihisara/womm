import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadRules } from "../src/rules/load.js";

const good = (id: string) => `id: ${id}
title: T
why: W
fix: F
source: https://example.com/x
when:
  - finding: node
    range: ">=17"
`;

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "womm-rules-"));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe("loadRules", () => {
  it("loads valid rules", async () => {
    writeFileSync(join(dir, "a-rule.yaml"), good("a-rule"));
    const { rules, errors } = await loadRules(dir);
    expect(rules.map((r) => r.id)).toEqual(["a-rule"]);
    expect(errors).toEqual([]);
  });

  it("reports invalid YAML and keeps loading", async () => {
    writeFileSync(join(dir, "a-rule.yaml"), good("a-rule"));
    writeFileSync(join(dir, "bad.yaml"), "a: [");
    const { rules, errors } = await loadRules(dir);
    expect(rules).toHaveLength(1);
    expect(errors[0]).toContain("bad.yaml");
  });

  it("reports schema problems", async () => {
    writeFileSync(join(dir, "x.yaml"), "id: x\n");
    expect((await loadRules(dir)).errors.join()).toContain("x.yaml");
  });

  it("requires the file name to match the id", async () => {
    writeFileSync(join(dir, "other.yaml"), good("a-rule"));
    expect((await loadRules(dir)).errors.join()).toContain("must match");
  });

  it("ignores other files", async () => {
    writeFileSync(join(dir, "README.md"), "hello");
    expect(await loadRules(dir)).toEqual({ rules: [], errors: [] });
  });

  it("returns nothing when the folder does not exist", async () => {
    expect(await loadRules(join(dir, "missing"))).toEqual({ rules: [], errors: [] });
  });
});
