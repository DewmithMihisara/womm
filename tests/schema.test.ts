import { describe, expect, it } from "vitest";
import { ruleErrors } from "../src/rules/schema.js";

const valid = {
  id: "a-rule",
  title: "T",
  why: "W",
  fix: "F",
  source: "https://example.com/x",
  when: [{ finding: "node", range: ">=17" }],
};

describe("ruleErrors", () => {
  it("accepts a valid rule", () => {
    expect(ruleErrors(valid)).toEqual([]);
  });

  it("accepts a rule combining a machine fact and a dependency", () => {
    const when = [
      { finding: "node", range: ">=17" },
      { dependency: "webpack", range: "<5" },
    ];
    expect(ruleErrors({ ...valid, when })).toEqual([]);
  });

  it("accepts equals and missing tests", () => {
    expect(ruleErrors({ ...valid, when: [{ finding: "a", equals: ["b"] }] })).toEqual([]);
    expect(ruleErrors({ ...valid, when: [{ finding: "a", missing: true }] })).toEqual([]);
  });

  it.each([
    ["a non-object", null, "object"],
    ["an unknown key", { ...valid, run: "rm -rf /" }, 'unknown key "run"'],
    ["a missing title", { ...valid, title: "" }, '"title"'],
    ["a bad id", { ...valid, id: "Bad Id" }, '"id"'],
    ["an http source", { ...valid, source: "http://x.com" }, "https"],
    ["a non-URL source", { ...valid, source: "my friend said" }, "https"],
    ["an empty when", { ...valid, when: [] }, "non-empty"],
    ["a bad range", { ...valid, when: [{ finding: "a", range: "soon" }] }, "range"],
    ["no test", { ...valid, when: [{ finding: "a" }] }, "exactly one"],
    [
      "two tests",
      { ...valid, when: [{ finding: "a", range: "1", missing: true }] },
      "exactly one",
    ],
    ["bad equals", { ...valid, when: [{ finding: "a", equals: "b" }] }, "equals"],
    ["false missing", { ...valid, when: [{ finding: "a", missing: false }] }, "missing"],
    ["an empty condition", { ...valid, when: [{}] }, "finding"],
    ["a condition key typo", { ...valid, when: [{ finding: "a", rnage: "1" }] }, "rnage"],
    ["dependencies alone", { ...valid, when: [{ dependency: "a" }] }, "machine fact"],
  ])("rejects %s", (_name, data, message) => {
    expect(ruleErrors(data).join("\n")).toContain(message);
  });

  it("reports several problems at once", () => {
    expect(ruleErrors({ id: "x" }).length).toBeGreaterThan(3);
  });
});
