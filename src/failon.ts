import type { Charge, Verdict } from "./trial.js";

export type FailOn = "guilty" | "suspicious" | "never";

const FAILING: Record<FailOn, Verdict[]> = {
  guilty: ["guilty"],
  suspicious: ["guilty", "suspicious"],
  never: [],
};

export function isFailOn(value: string): value is FailOn {
  return Object.hasOwn(FAILING, value);
}

export function shouldFail(charges: Charge[], failOn: FailOn = "guilty"): boolean {
  return charges.some((charge) => FAILING[failOn].includes(charge.verdict));
}
