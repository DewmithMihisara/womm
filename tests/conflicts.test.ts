import { describe, expect, it } from "vitest";
import { findConflicts } from "../src/project/conflicts.js";

const need = (tool: string, range: string, source: string) => ({ tool, range, source });

describe("findConflicts", () => {
  it("finds ranges no version can satisfy", () => {
    const [conflict] = findConflicts([
      need("node", "18.20.0", ".nvmrc"),
      need("node", ">=20", "package.json"),
    ]);
    expect(conflict?.a.source).toBe(".nvmrc");
    expect(conflict?.b.source).toBe("package.json");
  });

  it("accepts overlapping ranges", () => {
    expect(
      findConflicts([need("node", "22.1.0", ".nvmrc"), need("node", ">=20", "package.json")]),
    ).toEqual([]);
  });

  it("ignores different tools", () => {
    expect(findConflicts([need("node", "18", "a"), need("python", "3", "b")])).toEqual([]);
  });

  it("ignores ranges it can't read", () => {
    expect(findConflicts([need("node", "soon", "a"), need("node", "18", "b")])).toEqual([]);
  });
});
