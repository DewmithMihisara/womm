import { isSuspicious } from "./classify.js";
import { diffSnapshots, onlyDifferences, type Difference } from "./diff.js";
import { checkRequirements, type CheckResult } from "./project/check.js";
import type { Requirement } from "./project/sources.js";
import { ruleApplies, type Dependencies } from "./rules/engine.js";
import type { Rule } from "./rules/types.js";
import type { Snapshot } from "./types.js";

export type Verdict = "guilty" | "suspicious" | "acquitted";

export interface Charge {
  verdict: Verdict;
  subject: string;
  evidence: string;
  fix?: string;
  source?: string;
}

export interface CaseFile {
  requirements: Requirement[];
  dependencies: Dependencies;
  rules: Rule[];
  missingEnvKeys: string[];
  lockfileConflicts: string[][];
}

const ORDER: Verdict[] = ["guilty", "suspicious", "acquitted"];

const show = (value: string | null) => value ?? "not found";

function requirementCharge(result: CheckResult): Charge {
  const subject = `${result.tool} ${show(result.actual)}`;
  return {
    verdict: "guilty",
    subject,
    evidence: `${result.source} requires ${result.tool} ${result.range}`,
    fix: `Install a ${result.tool} version matching ${result.range}.`,
  };
}

/**
 * A rule naming a package the project uses is direct evidence. A rule about the
 * machine alone may not affect this project, so it stays suspicious.
 */
function ruleCharge(rule: Rule): Charge {
  const usesPackage = rule.when.some((condition) => "dependency" in condition);
  return {
    verdict: usesPackage ? "guilty" : "suspicious",
    subject: rule.title,
    evidence: rule.why,
    fix: rule.fix,
    source: rule.source,
  };
}

function differenceCharge(difference: Difference): Charge {
  return {
    verdict: isSuspicious(difference) ? "suspicious" : "acquitted",
    subject: `${difference.label} ${show(difference.a)}`,
    evidence: `Theirs: ${show(difference.b)}`,
  };
}

/**
 * Rules count only if they apply to you and not to them, because a known issue
 * on both machines can't explain why the code works on theirs.
 */
export function holdTrial(mine: Snapshot, theirs: Snapshot, file: CaseFile): Charge[] {
  const unmet = checkRequirements(file.requirements, mine.findings).filter(
    (result) => result.status === "unmet" || result.status === "missing",
  );
  const matched = file.rules.filter(
    (rule) =>
      ruleApplies(rule, mine.findings, file.dependencies) &&
      !ruleApplies(rule, theirs.findings, file.dependencies),
  );
  const envCharges = file.missingEnvKeys.map(
    (key): Charge => ({
      verdict: "suspicious",
      subject: `Missing environment variable ${key}`,
      evidence: "Listed in .env.example but not set on this machine",
    }),
  );
  const lockCharges = file.lockfileConflicts.map(
    (group): Charge => ({
      verdict: "suspicious",
      subject: "More than one lockfile",
      evidence: group.join(", "),
      fix: "Keep the lockfile for the package manager your team uses.",
    }),
  );
  const charges = [
    ...unmet.map(requirementCharge),
    ...matched.map(ruleCharge),
    ...envCharges,
    ...lockCharges,
    ...onlyDifferences(diffSnapshots(mine, theirs)).map(differenceCharge),
  ];
  return charges.sort((a, b) => ORDER.indexOf(a.verdict) - ORDER.indexOf(b.verdict));
}
