import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderRulesDoc } from "../src/report/rulesdoc.js";
import { loadRules } from "../src/rules/load.js";

describe("docs/rules.md", () => {
  it("matches the rule files", async () => {
    const { rules } = await loadRules();
    const onDisk = readFileSync("docs/rules.md", "utf8").replace(/\r\n/g, "\n");
    expect(onDisk, "Run: node dist/cli.js rules docs > docs/rules.md").toBe(
      renderRulesDoc(rules),
    );
  });
});
