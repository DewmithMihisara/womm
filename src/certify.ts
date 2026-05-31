import { checkRequirements, type CheckResult } from "./project/check.js";
import type { Requirement } from "./project/sources.js";
import type { Finding } from "./types.js";

export interface Certification {
  certified: boolean;
  results: CheckResult[];
  missingEnvKeys: string[];
}

/**
 * Certifies only what womm can actually check. Tools it can't detect don't
 * block a certificate, and a project with no requirements earns no certificate.
 */
export function certify(
  requirements: Requirement[],
  findings: Finding[],
  missingEnvKeys: string[],
): Certification {
  const results = checkRequirements(requirements, findings);
  const checked = results.filter((result) => result.status !== "unknown");
  const certified =
    checked.length > 0 &&
    checked.every((result) => result.status === "met") &&
    missingEnvKeys.length === 0;
  return { certified, results, missingEnvKeys };
}
