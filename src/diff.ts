import type { Snapshot } from "./types.js";

export type ChangeKind = "same" | "changed" | "only-a" | "only-b";

export interface Difference {
  id: string;
  label: string;
  a: string | null;
  b: string | null;
  kind: ChangeKind;
}

function classify(a: string | null, b: string | null): ChangeKind {
  if (a === b) return "same";
  if (b === null) return "only-a";
  if (a === null) return "only-b";
  return "changed";
}

/** Compares every finding in two snapshots, keeping the order of snapshot A. */
export function diffSnapshots(a: Snapshot, b: Snapshot): Difference[] {
  const labels = new Map<string, string>();
  const valuesA = new Map<string, string | null>();
  const valuesB = new Map<string, string | null>();
  for (const finding of a.findings) {
    labels.set(finding.id, finding.label);
    valuesA.set(finding.id, finding.value);
  }
  for (const finding of b.findings) {
    if (!labels.has(finding.id)) labels.set(finding.id, finding.label);
    valuesB.set(finding.id, finding.value);
  }
  return [...labels].map(([id, label]) => {
    const valueA = valuesA.get(id) ?? null;
    const valueB = valuesB.get(id) ?? null;
    return { id, label, a: valueA, b: valueB, kind: classify(valueA, valueB) };
  });
}

/** Only the entries that actually differ. */
export function onlyDifferences(differences: Difference[]): Difference[] {
  return differences.filter((difference) => difference.kind !== "same");
}
