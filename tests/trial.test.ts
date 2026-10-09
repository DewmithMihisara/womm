import { describe, expect, it } from "vitest";
import { holdTrial, type CaseFile } from "../src/trial.js";
import type { Rule } from "../src/rules/types.js";
import type { Snapshot } from "../src/types.js";

const snap = (node: string | null): Snapshot => ({
  womm: 1,
  createdAt: "x",
  findings: [{ id: "node", label: "Node.js", value: node }],
});
const none: CaseFile = {
  requirements: [],
  dependencies: {},
  rules: [],
  missingEnvKeys: [],
  lockfileConflicts: [],
};
const rule: Rule = {
  id: "r",
  title: "Known issue",
  why: "Because",
  fix: "Upgrade",
  source: "https://example.com",
  when: [{ finding: "node", range: "<20" }],
};

describe("holdTrial", () => {
  it("has no charges for identical machines", () => {
    expect(holdTrial(snap("22.0.0"), snap("22.0.0"), none)).toEqual([]);
  });

  it("finds an unmet requirement guilty, even if both machines match", () => {
    const requirements = [{ tool: "node", range: ">=20", source: ".nvmrc" }];
    const charges = holdTrial(snap("18.0.0"), snap("18.0.0"), { ...none, requirements });
    expect(charges[0]).toMatchObject({ verdict: "guilty", evidence: ".nvmrc requires node >=20" });
  });

  it("does not charge a met requirement", () => {
    const requirements = [{ tool: "node", range: ">=20", source: ".nvmrc" }];
    expect(holdTrial(snap("22.0.0"), snap("22.0.0"), { ...none, requirements })).toEqual([]);
  });

  it("finds a rule suspicious when it only concerns the machine", () => {
    const charges = holdTrial(snap("18.0.0"), snap("22.0.0"), { ...none, rules: [rule] });
    expect(charges[0]).toMatchObject({
      verdict: "suspicious",
      subject: "Known issue",
      source: "https://example.com",
    });
  });

  it("finds a rule guilty when the project uses the package", () => {
    const packageRule: Rule = {
      ...rule,
      when: [...rule.when, { dependency: "webpack" }],
    };
    const charges = holdTrial(snap("18.0.0"), snap("22.0.0"), {
      ...none,
      rules: [packageRule],
      dependencies: { webpack: "^4.0.0" },
    });
    expect(charges[0]?.verdict).toBe("guilty");
  });

  it("does not charge a rule that applies to both machines", () => {
    const charges = holdTrial(snap("18.0.0"), snap("18.0.0"), { ...none, rules: [rule] });
    expect(charges).toEqual([]);
  });

  it("does not charge a rule that applies only to them", () => {
    const charges = holdTrial(snap("22.0.0"), snap("18.0.0"), { ...none, rules: [rule] });
    expect(charges.some((c) => c.verdict === "guilty")).toBe(false);
  });

  it("reports contradicting requirements", () => {
    const requirements = [
      { tool: "ruby", range: "2.7.0", source: ".ruby-version" },
      { tool: "ruby", range: ">=3", source: "Gemfile" },
    ];
    const charges = holdTrial(snap("1.0.0"), snap("1.0.0"), { ...none, requirements });
    expect(charges[0]?.id).toBe("conflict.ruby");
    expect(charges[0]?.evidence).toContain(".ruby-version asks for 2.7.0");
  });

  it("lists missing env keys as suspicious", () => {
    const charges = holdTrial(snap("1.0.0"), snap("1.0.0"), {
      ...none,
      missingEnvKeys: ["DATABASE_URL"],
    });
    expect(charges[0]).toMatchObject({ verdict: "suspicious" });
    expect(charges[0]?.subject).toContain("DATABASE_URL");
  });

  it("lists lockfile conflicts as suspicious", () => {
    const charges = holdTrial(snap("1.0.0"), snap("1.0.0"), {
      ...none,
      lockfileConflicts: [["yarn.lock", "package-lock.json"]],
    });
    expect(charges[0]?.evidence).toBe("yarn.lock, package-lock.json");
  });

  it("orders guilty before suspicious before acquitted", () => {
    const mine: Snapshot = {
      ...snap("18.0.0"),
      findings: [
        { id: "git", label: "Git", value: "2.47.0" },
        { id: "node", label: "Node.js", value: "18.0.0" },
      ],
    };
    const theirs: Snapshot = {
      ...snap("22.0.0"),
      findings: [
        { id: "git", label: "Git", value: "2.52.0" },
        { id: "node", label: "Node.js", value: "22.0.0" },
      ],
    };
    const requirements = [{ tool: "node", range: ">=20", source: ".nvmrc" }];
    const charges = holdTrial(mine, theirs, { ...none, requirements });
    expect(charges.map((c) => c.verdict)).toEqual(["guilty", "suspicious", "acquitted"]);
  });
});
