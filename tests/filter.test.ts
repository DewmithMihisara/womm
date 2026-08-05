import { describe, expect, it } from "vitest";
import { filterCharges } from "../src/filter.js";
import type { Charge } from "../src/trial.js";

const charges: Charge[] = [
  { id: "a", verdict: "guilty", subject: "A", evidence: "" },
  { id: "b", verdict: "acquitted", subject: "B", evidence: "" },
];
const ids = (list: Charge[]) => list.map((c) => c.id);

describe("filterCharges", () => {
  it("keeps everything by default", () => {
    expect(ids(filterCharges(charges, {}))).toEqual(["a", "b"]);
  });

  it("drops ignored ids", () => {
    expect(ids(filterCharges(charges, { ignore: ["a"] }))).toEqual(["b"]);
  });

  it("hides acquitted charges when brief", () => {
    expect(ids(filterCharges(charges, { brief: true }))).toEqual(["a"]);
  });
});
