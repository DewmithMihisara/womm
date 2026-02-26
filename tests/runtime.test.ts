import { describe, expect, it } from "vitest";
import { runtimeDetector } from "../src/detectors/runtime.js";

const context = { run: async () => null };
const versions = {
  openssl: "3.0.13",
  v8: "12.4.254.21-node.21",
  modules: "127",
  icu: "75.1",
} as unknown as NodeJS.ProcessVersions;

const findings = async () => {
  const list = await runtimeDetector(versions)(context);
  return new Map(list.map((f) => [f.id, f.value]));
};

describe("runtimeDetector", () => {
  it("reports the bundled OpenSSL", async () => {
    expect((await findings()).get("node.openssl")).toBe("3.0.13");
  });
  it("reports the native module ABI", async () => {
    expect((await findings()).get("node.abi")).toBe("127");
  });
  it("reports V8", async () => {
    expect((await findings()).get("node.v8")).toContain("12.4");
  });
  // New runtime tests go above this line.
});
