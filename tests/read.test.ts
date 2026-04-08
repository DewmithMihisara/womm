import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readRequirements } from "../src/project/read.js";


describe("readRequirements", () => {
  it("reads present files and names the source", async () => {
    const project = mkdtempSync(join(tmpdir(), "womm-project-"));
    writeFileSync(join(project, ".nvmrc"), "22.1.0\n");
    expect(await readRequirements(project)).toEqual([
      { tool: "node", range: "22.1.0", source: ".nvmrc" },
    ]);
    rmSync(project, { recursive: true, force: true });
  });

  it("returns nothing for a folder without requirement files", async () => {
    expect(await readRequirements(join(tmpdir(), "womm-none"))).toEqual([]);
  });
});
