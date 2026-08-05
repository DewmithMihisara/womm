import { describe, expect, it } from "vitest";
import { isFailOn, shouldFail } from "../src/failon.js";
import type { Charge, Verdict } from "../src/trial.js";

const charges = (verdict: Verdict): Charge[] => [
  { id: "a", verdict, subject: "A", evidence: "" },
];

describe("shouldFail", () => {
  it("fails on guilty by default", () => {
    expect(shouldFail(charges("guilty"))).toBe(true);
    expect(shouldFail(charges("suspicious"))).toBe(false);
  });

  it("can also fail on suspicious", () => {
    expect(shouldFail(charges("suspicious"), "suspicious")).toBe(true);
    expect(shouldFail(charges("acquitted"), "suspicious")).toBe(false);
  });

  it("can never fail", () => {
    expect(shouldFail(charges("guilty"), "never")).toBe(false);
  });
});

describe("isFailOn", () => {
  it("accepts known values only", () => {
    expect(isFailOn("never")).toBe(true);
    expect(isFailOn("constructor")).toBe(false);
  });
});
