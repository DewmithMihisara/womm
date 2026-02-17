import { describe, expect, it } from "vitest";
import { diffSnapshots, onlyDifferences } from "../src/diff.js";
import type { Finding, Snapshot } from "../src/types.js";

const snap = (findings: Finding[]): Snapshot => ({
  womm: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
  findings,
});
const node = (value: string | null): Finding => ({
  id: "node",
  label: "Node.js",
  value,
});

describe("diffSnapshots", () => {
  it("reports identical snapshots as having no differences", () => {
    const result = diffSnapshots(snap([node("22.0.0")]), snap([node("22.0.0")]));
    expect(onlyDifferences(result)).toEqual([]);
  });

  it("reports a changed value", () => {
    const [entry] = diffSnapshots(snap([node("18.0.0")]), snap([node("22.0.0")]));
    expect(entry).toMatchObject({ kind: "changed", a: "18.0.0", b: "22.0.0" });
  });

  it("reports a tool installed only on A", () => {
    const [entry] = diffSnapshots(snap([node("18.0.0")]), snap([node(null)]));
    expect(entry?.kind).toBe("only-a");
  });

  it("reports a tool installed only on B", () => {
    const [entry] = diffSnapshots(snap([node(null)]), snap([node("22.0.0")]));
    expect(entry?.kind).toBe("only-b");
  });

  it("treats a finding missing from one snapshot as not installed", () => {
    const [entry] = diffSnapshots(snap([]), snap([node("22.0.0")]));
    expect(entry).toMatchObject({ kind: "only-b", a: null });
  });

  it("treats a tool missing on both as the same", () => {
    const [entry] = diffSnapshots(snap([node(null)]), snap([node(null)]));
    expect(entry?.kind).toBe("same");
  });
});
