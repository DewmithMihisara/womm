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
  ["node-gyp-on-python-312", {"python":"3.12.0"}, {"python":"3.11.0"}, {"node-gyp":"^9.0.0"}],
  ["npm-7-peer-dependencies", {"npm":"10.0.0"}, {"npm":"6.14.0"}, {}],
  ["git-safe-directory", {"git":"2.52.0"}, {"git":"2.30.0"}, {}],
  ["go-122-loop-variables", {"go":"1.22.0"}, {"go":"1.21.0"}, {}],
  ["go-116-modules-default", {"go":"1.22.0"}, {"go":"1.15.0"}, {}],
  ["go-118-sha1-certificates", {"go":"1.22.0"}, {"go":"1.17.0"}, {}],
  ["go-121-strict-go-line", {"go":"1.22.0"}, {"go":"1.20.0"}, {}],
  ["python-312-distutils", {"python":"3.12.0"}, {"python":"3.11.0"}, {}],
  ["python-312-imp", {"python":"3.12.0"}, {"python":"3.11.0"}, {}],
  ["python-312-asyncore", {"python":"3.12.0"}, {"python":"3.11.0"}, {}],
  ["python-313-dead-batteries", {"python":"3.13.0"}, {"python":"3.12.0"}, {}],
  ["python-310-collections-abc", {"python":"3.10.0"}, {"python":"3.9.0"}, {}],
  ["python-311-asyncio-coroutine", {"python":"3.11.0"}, {"python":"3.10.0"}, {}],
  ["python-311-getargspec", {"python":"3.11.0"}, {"python":"3.10.0"}, {}],
  ["python-37-async-keyword", {"python":"3.8.0"}, {"python":"3.6.0"}, {}],
  ["java-16-illegal-access", {"java":"16.0.1"}, {"java":"11.0.1"}, {}],
  ["java-17-strong-encapsulation", {"java":"21.0.1"}, {"java":"11.0.1"}, {}],
  ["java-11-removed-jaxb", {"java":"17.0.1"}, {"java":"8.0.301"}, {}],
  ["java-18-default-utf8", {"java":"21.0.1"}, {"java":"17.0.1"}, {}],
  ["java-24-security-manager", {"java":"24.0.1"}, {"java":"21.0.1"}, {}],
  ["gradle-too-old-for-java-17", {"gradle":"7.0.0","java":"17.0.1"}, {"gradle":"7.0.0","java":"11.0.1"}, {}],
  ["gradle-too-old-for-java-21", {"gradle":"8.0.0","java":"21.0.1"}, {"gradle":"8.5.0","java":"21.0.1"}, {}],
  ["maven-381-blocks-http", {"maven":"3.9.9"}, {"maven":"3.6.3"}, {}],
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
