import { describe, expect, it } from "vitest";
import { isSuspicious } from "../src/classify.js";
import type { ChangeKind } from "../src/diff.js";

const diff = (id: string, a: string | null, b: string | null, kind: ChangeKind) => ({
  id,
  label: id,
  a,
  b,
  kind,
});

describe("isSuspicious", () => {
  it("flags a major version gap", () => {
    expect(isSuspicious(diff("node", "18.0.0", "22.0.0", "changed"))).toBe(true);
  });

  it("clears a minor version gap", () => {
    expect(isSuspicious(diff("git", "2.47.0", "2.52.0", "changed"))).toBe(false);
  });

  it("flags a tool only they have", () => {
    expect(isSuspicious(diff("docker", null, "27.0.0", "only-b"))).toBe(true);
  });

  it("clears a tool only you have", () => {
    expect(isSuspicious(diff("docker", "27.0.0", null, "only-a"))).toBe(false);
  });

  it("flags any difference in a sensitive setting", () => {
    expect(isSuspicious(diff("eol", "CRLF", "LF", "changed"))).toBe(true);
    expect(isSuspicious(diff("timezone", "UTC", "Asia/Colombo", "changed"))).toBe(true);
  });

  it("flags a sensitive setting present on only one side", () => {
    expect(isSuspicious(diff("proxy", "configured", null, "only-a"))).toBe(true);
  });

  it("clears values that are not versions", () => {
    expect(isSuspicious(diff("shell", "bash", "zsh", "changed"))).toBe(false);
  });
});
