import { describe, expect, it } from "vitest";
import { parseSnapshot, UserError } from "../src/io.js";

const valid = { womm: 1, createdAt: "2026-01-01", findings: [] };
const parse = (value: unknown) => parseSnapshot(JSON.stringify(value), "f.json");

describe("control characters", () => {
  it("are removed from labels and values", () => {
    const findings = [{ id: "n\u001b", label: "a\u001b[2Kb", value: "1\u0007.0\r\n" }];
    const [finding] = parse({ ...valid, findings }).findings;
    expect(finding).toEqual({ id: "n", label: "a[2Kb", value: "1.0" });
  });

  it("are removed from the date", () => {
    expect(parse({ ...valid, createdAt: "x\u001b[0m" }).createdAt).toBe("x[0m");
  });

  it("drop unexpected extra fields", () => {
    expect(parse({ ...valid, extra: "x" })).toEqual(valid);
  });
});

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
