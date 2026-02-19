import { describe, expect, it } from "vitest";
import { parseSnapshot, UserError } from "../src/io.js";

const valid = { womm: 1, createdAt: "2026-01-01", findings: [] };
const parse = (value: unknown) => parseSnapshot(JSON.stringify(value), "f.json");

describe("parseSnapshot", () => {
  it("accepts a valid snapshot", () => {
    expect(parse(valid)).toEqual(valid);
  });

  it("rejects invalid JSON", () => {
    expect(() => parseSnapshot("{", "f.json")).toThrow(/not valid JSON/);
  });

  it.each([[null], [[]], [{ hello: 1 }], ["text"]])("rejects %j", (value) => {
    expect(() => parse(value)).toThrow(UserError);
  });

  it("rejects a newer format and suggests upgrading", () => {
    expect(() => parse({ ...valid, womm: 99 })).toThrow(/upgrading/);
  });

  it("rejects a non-numeric format", () => {
    expect(() => parse({ ...valid, womm: "1" })).toThrow(UserError);
  });

  it("rejects damaged findings", () => {
    const findings = [{ id: "x", label: "X", value: 5 }];
    expect(() => parse({ ...valid, findings })).toThrow(/damaged/);
  });

  it("rejects a missing findings list", () => {
    expect(() => parse({ womm: 1, createdAt: "x" })).toThrow(/damaged/);
  });
});
