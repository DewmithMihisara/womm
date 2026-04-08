import semver from "semver";
import type { Finding } from "../types.js";
import type { Requirement } from "./sources.js";

export type CheckStatus = "met" | "unmet" | "missing" | "unknown";

export interface CheckResult extends Requirement {
  actual: string | null;
  status: CheckStatus;
}

/** `unknown` means womm has no detector for this tool, so it can't judge. */
export function checkRequirements(
  requirements: Requirement[],
  findings: Finding[],
): CheckResult[] {
  return requirements.map((requirement) => {
    const finding = findings.find((f) => f.id === requirement.tool);
    if (!finding) return { ...requirement, actual: null, status: "unknown" };
    const actual = finding.value;
    if (actual === null) return { ...requirement, actual, status: "missing" };
    const version = semver.coerce(actual);
    if (!version) return { ...requirement, actual, status: "unknown" };
    const met = semver.satisfies(version, requirement.range);
    return { ...requirement, actual, status: met ? "met" : "unmet" };
  });
}
