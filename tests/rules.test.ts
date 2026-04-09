import { describe, expect, it } from "vitest";
import { ruleApplies, type Dependencies } from "../src/rules/engine.js";
import { loadRules } from "../src/rules/load.js";
import type { Finding } from "../src/types.js";

type Facts = Record<string, string>;

/** [rule id, a machine it applies to, a machine it does not, dependencies] */
const samples: [string, Facts, Facts, Dependencies][] = [
  // New rule samples go above this line.
];

const findings = (facts: Facts): Finding[] =>
  Object.entries(facts).map(([id, value]) => ({ id, label: id, value }));

describe("shipped rules", () => {
  it("all load without errors", async () => {
    expect((await loadRules()).errors).toEqual([]);
  });

  it("all have a sample", async () => {
    const { rules } = await loadRules();
    expect(samples.map(([id]) => id).sort()).toEqual(rules.map((r) => r.id).sort());
  });

  it.each(samples)("%s applies only to the right machine", async (id, yes, no, deps) => {
    const { rules } = await loadRules();
    const rule = rules.find((r) => r.id === id)!;
    expect(ruleApplies(rule, findings(yes), deps)).toBe(true);
    expect(ruleApplies(rule, findings(no), deps)).toBe(false);
  });
});
