import pc from "picocolors";
import type { Difference } from "../diff.js";
import type { Finding } from "../types.js";

const MISSING = "not installed";

const show = (value: string | null): string => value ?? MISSING;

/** Lists what a snapshot recorded, so it can be reviewed before sharing. */
export function renderFindings(findings: Finding[]): string {
  const width = Math.max(0, ...findings.map((f) => f.label.length));
  return findings
    .map((f) => {
      const value = f.value === null ? pc.dim(MISSING) : f.value;
      return `  ${f.label.padEnd(width)}  ${value}`;
    })
    .join("\n");
}

/** Lists differences between two machines as aligned columns. */
export function renderDifferences(differences: Difference[]): string {
  if (differences.length === 0) return "No differences found.";
  const width = Math.max(...differences.map((d) => d.label.length));
  return differences
    .map(
      (d) =>
        `  ${d.label.padEnd(width)}  ${show(d.a)} ${pc.dim("->")} ${show(d.b)}`,
    )
    .join("\n");
}
