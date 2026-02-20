import { describe, expect, it } from "vitest";
import { windowsShimCall } from "../src/detectors/run.js";
import { toolDetector, tools } from "../src/detectors/tools.js";

/** [tool id, real output of its version command, expected version] */
const samples: [string, string, string][] = [
  ["node", "v22.11.0", "22.11.0"],
  ["npm", "10.9.0", "10.9.0"],
  ["git", "git version 2.52.0.windows.1", "2.52.0"],
  ["python", "Python 3.12.1", "3.12.1"],
  ["pip", "pip 24.0 from /usr/lib/python3/dist-packages/pip (python 3.12)", "24.0"],
  ["poetry", "Poetry (version 1.8.4)", "1.8.4"],
  ["uv", "uv 0.4.30", "0.4.30"],
  ["java", "openjdk version \"21.0.2\" 2024-01-16", "21.0.2"],
  // New samples go above this line.
];

describe("tools", () => {
  it("has a sample for every tool", () => {
    expect(samples.map(([id]) => id).sort()).toEqual(
      tools.map((tool) => tool.id).sort(),
    );
  });

  it("has unique ids", () => {
    const ids = tools.map((tool) => tool.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(samples)("parses %s", async (id, output, expected) => {
    const spec = tools.find((tool) => tool.id === id)!;
    const [finding] = await toolDetector(spec)({ run: async () => output });
    expect(finding?.value).toBe(expected);
  });

  it.each(tools.map((tool) => [tool.id, tool] as const))(
    "%s can run safely through the Windows fallback",
    (_id, tool) => {
      expect(windowsShimCall(tool.command, tool.args ?? ["--version"])).not.toBeNull();
    },
  );

  it("reports null when the tool is missing", async () => {
    const [finding] = await toolDetector(tools[0]!)({ run: async () => null });
    expect(finding?.value).toBeNull();
  });

  it("tries the fallback command when the main one is missing", async () => {
    const detect = toolDetector({
      id: "py",
      label: "Py",
      command: "python3",
      fallback: "python",
    });
    const [finding] = await detect({
      run: async (command) => (command === "python" ? "Python 3.9.1" : null),
    });
    expect(finding?.value).toBe("3.9.1");
  });
});
