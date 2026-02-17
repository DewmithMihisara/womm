import { describe, expect, it } from "vitest";
import { takeSnapshot } from "../src/snapshot.js";
import type { Detector } from "../src/detectors/types.js";

const identity = { home: "/home/sam", username: "sam" };
const context = { run: async () => null };

describe("takeSnapshot", () => {
  it("includes version and timestamp", async () => {
    const snap = await takeSnapshot({
      detectors: [],
      context,
      identity,
      now: new Date("2026-01-02T03:04:05.000Z"),
    });
    expect(snap).toEqual({
      womm: 1,
      createdAt: "2026-01-02T03:04:05.000Z",
      findings: [],
    });
  });

  it("redacts every finding", async () => {
    const leaky: Detector = async () => [
      { id: "x", label: "X", value: "/home/sam/bin/x" },
    ];
    const snap = await takeSnapshot({ detectors: [leaky], context, identity });
    expect(snap.findings[0]?.value).toBe("<home>/bin/x");
  });

  it("keeps other findings when one detector throws", async () => {
    const broken: Detector = async () => {
      throw new Error("boom");
    };
    const fine: Detector = async () => [{ id: "y", label: "Y", value: "1" }];
    const snap = await takeSnapshot({
      detectors: [broken, fine],
      context,
      identity,
    });
    expect(snap.findings.map((f) => f.id)).toEqual(["y"]);
  });
});
