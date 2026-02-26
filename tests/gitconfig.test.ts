import { describe, expect, it } from "vitest";
import { gitConfigDetector } from "../src/detectors/gitconfig.js";

describe("gitConfigDetector", () => {
  it("reads core.autocrlf", async () => {
    const findings = await gitConfigDetector({
      run: async (_command, args) =>
        args.includes("core.autocrlf") ? "true" : null,
    });
    const found = findings.find((f) => f.id === "git.autocrlf");
    expect(found?.value).toBe("true");
  });

  it("reports unset settings as null", async () => {
    const findings = await gitConfigDetector({ run: async () => null });
    expect(findings.every((f) => f.value === null)).toBe(true);
  });

  it("never asks for name or email", async () => {
    const asked: string[] = [];
    await gitConfigDetector({
      run: async (_command, args) => {
        asked.push(args.join(" "));
        return null;
      },
    });
    expect(asked.join()).not.toMatch(/user\.|email/);
  });
});
