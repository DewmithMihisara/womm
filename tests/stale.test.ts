import { describe, expect, it } from "vitest";
import { staleWarning } from "../src/stale.js";

const now = new Date("2026-11-06T00:00:00Z");

describe("staleWarning", () => {
  it("is quiet for a recent snapshot", () => {
    expect(staleWarning("2026-11-01T00:00:00Z", now)).toBeNull();
  });

  it("warns at 30 days", () => {
    expect(staleWarning("2026-10-07T00:00:00Z", now)).toContain("30 days old");
  });

  it("ignores an unreadable date", () => {
    expect(staleWarning("banana", now)).toBeNull();
  });
});
