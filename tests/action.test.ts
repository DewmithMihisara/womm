import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

const action = parse(readFileSync("action.yml", "utf8"));

describe("action.yml", () => {
  it("declares a required snapshot input", () => {
    expect(action.inputs.against.required).toBe(true);
  });

  it("never interpolates inputs inside run scripts", () => {
    for (const step of action.runs.steps) {
      expect(step.run).not.toContain("${{");
    }
  });
});
