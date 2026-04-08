import semver from "semver";
import type { Finding } from "../types.js";
import type { Condition, Rule } from "./types.js";

export type Dependencies = Record<string, string>;

function rangesOverlap(wanted: string, rule: string | undefined): boolean {
  if (!rule) return true;
  // Non-registry versions such as workspace:* can't be compared, so don't guess.
  if (!semver.validRange(wanted)) return false;
  return semver.intersects(wanted, rule);
}

function conditionHolds(
  condition: Condition,
  findings: Finding[],
  dependencies: Dependencies,
): boolean {
  if ("dependency" in condition) {
    const wanted = dependencies[condition.dependency];
    return wanted !== undefined && rangesOverlap(wanted, condition.range);
  }
  const value = findings.find((f) => f.id === condition.finding)?.value ?? null;
  if (condition.missing) return value === null;
  if (value === null) return false;
  if (condition.equals) return condition.equals.includes(value);
  const version = semver.coerce(value);
  return version !== null && semver.satisfies(version, condition.range ?? "*");
}

/** A rule applies only when all of its conditions hold. */
export function ruleApplies(
  rule: Rule,
  findings: Finding[],
  dependencies: Dependencies = {},
): boolean {
  return rule.when.every((c) => conditionHolds(c, findings, dependencies));
}
