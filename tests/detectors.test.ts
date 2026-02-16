import { describe, expect, it } from "vitest";
import { gitDetector } from "../src/detectors/git.js";
import { nodeDetector } from "../src/detectors/node.js";
import { osDetector } from "../src/detectors/os.js";
import type { CommandRunner } from "../src/detectors/types.js";

const returning = (output: string | null): { run: CommandRunner } => ({
  run: async () => output,
});

describe("version detectors", () => {
  it("reports the Node.js version", async () => {
    const [finding] = await nodeDetector(returning("v22.11.0"));
    expect(finding).toEqual({ id: "node", label: "Node.js", value: "22.11.0" });
  });

  it("reports the Git version", async () => {
    const [finding] = await gitDetector(returning("git version 2.47.1"));
    expect(finding?.value).toBe("2.47.1");
  });

  it("reports null when the tool is missing", async () => {
    const [finding] = await gitDetector(returning(null));
    expect(finding?.value).toBeNull();
  });
});

describe("osDetector", () => {
  it("reports only platform, release and architecture", async () => {
    const findings = await osDetector(returning(null));
    expect(findings.map((f) => f.id)).toEqual([
      "os.platform",
      "os.release",
      "os.arch",
    ]);
  });
});
