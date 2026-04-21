import { describe, expect, it } from "vitest";
import { ruleApplies, type Dependencies } from "../src/rules/engine.js";
import { loadRules } from "../src/rules/load.js";
import type { Finding } from "../src/types.js";

type Facts = Record<string, string>;

/** [rule id, a machine it applies to, a machine it does not, dependencies] */
const samples: [string, Facts, Facts, Dependencies][] = [
  ["node-sass-needs-9-on-node-20", {"node":"20.1.0"}, {"node":"16.0.0"}, {"node-sass":"^7.0.0"}],
  ["node-sass-needs-8-on-node-18", {"node":"18.1.0"}, {"node":"16.0.0"}, {"node-sass":"^6.0.0"}],
  ["webpack-4-on-openssl-3", {"node":"22.0.0"}, {"node":"16.0.0"}, {"webpack":"^4.0.0"}],
  ["node-17-dns-order", {"node":"22.0.0"}, {"node":"16.0.0"}, {}],
  ["node-15-unhandled-rejections", {"node":"22.0.0"}, {"node":"14.0.0"}, {}],
  ["node-18-global-fetch", {"node":"16.0.0"}, {"node":"22.0.0"}, {}],
  ["node-21-global-navigator", {"node":"22.0.0"}, {"node":"20.0.0"}, {}],
  ["node-below-16-apple-silicon", {"node":"14.0.0","os.platform":"darwin","os.arch":"arm64"}, {"node":"14.0.0","os.platform":"darwin","os.arch":"x64"}, {}],
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
