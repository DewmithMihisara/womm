import { describe, expect, it } from "vitest";
import { certify } from "../src/certify.js";

const findings = [{ id: "node", label: "Node.js", value: "22.0.0" }];
const need = (range: string, tool = "node") => ({ tool, range, source: "x" });

describe("certify", () => {
  it("certifies when every requirement is met", () => {
    expect(certify([need(">=20")], findings, []).certified).toBe(true);
  });

  it("refuses when a requirement is unmet", () => {
    expect(certify([need(">=24")], findings, []).certified).toBe(false);
  });

  it("refuses when an env key is missing", () => {
    expect(certify([need(">=20")], findings, ["KEY"]).certified).toBe(false);
  });

  it("refuses when there is nothing to check", () => {
    expect(certify([], findings, []).certified).toBe(false);
  });

  it("ignores requirements it cannot detect, if others were checked", () => {
    const result = certify([need(">=20"), need(">=1", "cobol")], findings, []);
    expect(result.certified).toBe(true);
  });

  it("refuses when only undetectable requirements exist", () => {
    expect(certify([need(">=1", "cobol")], findings, []).certified).toBe(false);
  });
});
