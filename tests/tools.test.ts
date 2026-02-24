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
  ["maven", "Apache Maven 3.9.9 (8e8579a9e76f7d015ee5ec7bfcdc97d260186937)", "3.9.9"],
  ["gradle", "\n------\nGradle 8.10.2\n------", "8.10.2"],
  ["go", "go version go1.22.3 linux/amd64", "1.22.3"],
  ["rust", "rustc 1.82.0 (f6e511eec 2024-10-15)", "1.82.0"],
  ["cargo", "cargo 1.82.0 (8f40fc59f 2024-08-21)", "1.82.0"],
  ["docker", "Docker version 27.3.1, build ce12230", "27.3.1"],
  ["docker.compose", "Docker Compose version v2.29.7", "2.29.7"],
  ["kubectl", "Client Version: v1.31.2", "1.31.2"],
  ["helm", "v3.16.2+g13654a5", "3.16.2+g13654a5"],
  ["terraform", "Terraform v1.9.8", "1.9.8"],
  ["openssl", "OpenSSL 3.4.0 22 Oct 2024", "3.4.0"],
  ["curl", "curl 8.5.0 (x86_64-pc-linux-gnu) libcurl/8.5.0", "8.5.0"],
  ["gcc", "13.2.0", "13.2.0"],
  ["clang", "Apple clang version 15.0.0 (clang-1500.3.9.4)", "15.0.0"],
  ["make", "GNU Make 4.3", "4.3"],
  ["cmake", "cmake version 3.28.3", "3.28.3"],
  ["bash", "GNU bash, version 5.2.21(1)-release (x86_64-pc-linux-gnu)", "5.2.21"],
  ["zsh", "zsh 5.9 (x86_64-apple-darwin23.0)", "5.9"],
  ["pwsh", "PowerShell 7.4.6", "7.4.6"],
  ["yarn", "1.22.22", "1.22.22"],
  ["pnpm", "9.12.3", "9.12.3"],
  ["bun", "1.1.34", "1.1.34"],
  ["deno", "deno 2.0.6 (stable, release, x86_64-pc-windows-msvc)", "2.0.6"],
  ["node-gyp", "v10.2.0", "10.2.0"],
  ["ruby", "ruby 3.3.5 (2024-09-03 revision ef084cc8f4) +YJIT [x86_64-linux]", "3.3.5"],
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
