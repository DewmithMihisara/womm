import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const manifest = JSON.parse(readFileSync("package.json", "utf8"));

describe("package.json", () => {
  it("publishes the build and the rules", () => {
    expect(manifest.files).toEqual(expect.arrayContaining(["dist", "rules"]));
  });

  it("provides the womm command", () => {
    expect(manifest.bin.womm).toBe("dist/cli.js");
  });

  it("declares a Node.js version", () => {
    expect(manifest.engines.node).toBeTruthy();
  });
});
