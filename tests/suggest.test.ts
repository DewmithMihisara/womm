import { describe, expect, it } from "vitest";
import { editDistance, suggest } from "../src/suggest.js";

describe("editDistance", () => {
  it.each([
    ["trial", "trial", 0],
    ["trail", "trial", 2],
    ["diff", "dif", 1],
    ["", "abc", 3],
  ])("between %s and %s is %i", (a, b, expected) => {
    expect(editDistance(a, b)).toBe(expected);
  });
});

describe("suggest", () => {
  const options = ["snapshot", "diff", "trial"];

  it("finds a close match", () => {
    expect(suggest("trail", options)).toBe("trial");
    expect(suggest("snapshoot", options)).toBe("snapshot");
  });

  it("gives nothing for an unrelated word", () => {
    expect(suggest("banana", options)).toBeUndefined();
  });
});
