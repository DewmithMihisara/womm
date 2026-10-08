import semver from "semver";
import type { Requirement } from "./sources.js";

export interface RequirementConflict {
  tool: string;
  a: Requirement;
  b: Requirement;
}

/** Pairs asking for the same tool in ranges no single version can satisfy. */
export function findConflicts(requirements: Requirement[]): RequirementConflict[] {
  const conflicts: RequirementConflict[] = [];
  requirements.forEach((a, index) => {
    for (const b of requirements.slice(index + 1)) {
      if (a.tool !== b.tool) continue;
      if (!semver.validRange(a.range) || !semver.validRange(b.range)) continue;
      if (!semver.intersects(a.range, b.range)) conflicts.push({ tool: a.tool, a, b });
    }
  });
  return conflicts;
}
