import { describe, expect, it } from "vitest";
import { runCommand } from "../src/detectors/run.js";

describe("runCommand", () => {
  it("returns trimmed stdout", async () => {
    const out = await runCommand(process.execPath, ["-e", "console.log(' hi ')"]);
    expect(out).toBe("hi");
  });

  it("falls back to stderr when stdout is empty", async () => {
    const out = await runCommand(process.execPath, ["-e", "console.error('err')"]);
    expect(out).toBe("err");
  });

  it("returns null for a missing tool", async () => {
    expect(await runCommand("womm-no-such-tool", [])).toBeNull();
  });

  it("returns null for a non-zero exit", async () => {
    expect(await runCommand(process.execPath, ["-e", "process.exit(3)"])).toBeNull();
  });

  it("does not interpret shell syntax in arguments", async () => {
    const out = await runCommand(process.execPath, [
      "-e",
      "console.log(process.argv[1])",
      "$(echo hacked)",
    ]);
    expect(out).toBe("$(echo hacked)");
  });
});
