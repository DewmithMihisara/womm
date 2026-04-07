import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { missingEnvKeys, parseEnvKeys } from "../src/project/envkeys.js";

describe("parseEnvKeys", () => {
  it("returns key names and drops values", () => {
    const keys = parseEnvKeys("A=1\nexport B=secret\n# C=2\n\nD =3\nbad line\n");
    expect(keys).toEqual(["A", "B", "D"]);
    expect(keys.join()).not.toContain("secret");
  });

  it("handles Windows line endings and repeats", () => {
    expect(parseEnvKeys("A=1\r\nA=2\r\n")).toEqual(["A"]);
  });
});

describe("missingEnvKeys", () => {
  it("finds declared keys set nowhere, without exposing values", async () => {
    const dir = mkdtempSync(join(tmpdir(), "womm-env-"));
    writeFileSync(join(dir, ".env.example"), "A=\nB=\nC=\n");
    writeFileSync(join(dir, ".env"), "A=fake-secret-value\n");
    const missing = await missingEnvKeys(dir, { B: "from-shell" });
    expect(missing).toEqual(["C"]);
    expect(JSON.stringify(missing)).not.toContain("fake-secret-value");
    rmSync(dir, { recursive: true, force: true });
  });

  it("returns nothing when the project has no .env.example", async () => {
    expect(await missingEnvKeys(join(tmpdir(), "womm-none"), {})).toEqual([]);
  });
});
