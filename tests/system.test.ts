import { describe, expect, it } from "vitest";
import { systemDetectors, type SystemFacts } from "../src/detectors/system.js";

const facts = (overrides: Partial<SystemFacts> = {}): SystemFacts => ({
  env: {},
  eol: "\n",
  timeZone: "UTC",
  locale: "en-US",
  ...overrides,
});

const detect = async (overrides: Partial<SystemFacts> = {}) => {
  const context = { run: async () => null };
  const results = await Promise.all(
    systemDetectors(facts(overrides)).map((detector) => detector(context)),
  );
  return new Map(results.flat().map((f) => [f.id, f.value]));
};

describe("system detectors", () => {
  it("reports the timezone", async () => {
    const found = await detect({ timeZone: "Asia/Colombo" });
    expect(found.get("timezone")).toBe("Asia/Colombo");
  });

  it("reports the locale", async () => {
    const found = await detect({ locale: "de-DE" });
    expect(found.get("locale")).toBe("de-DE");
  });

  it.each([
    ["\r\n", "CRLF"],
    ["\n", "LF"],
  ])("reports line ending %j as %s", async (eol, expected) => {
    expect((await detect({ eol })).get("eol")).toBe(expected);
  });

  it("reports the shell without its directory", async () => {
    const unix = await detect({ env: { SHELL: "/home/sam/bin/zsh" } });
    expect(unix.get("shell")).toBe("zsh");
    const win = await detect({ env: { ComSpec: "C:\\Windows\\cmd.exe" } });
    expect(win.get("shell")).toBe("cmd.exe");
  });

  it("reports no shell when none is set", async () => {
    expect((await detect()).get("shell")).toBeNull();
  });

  it("reports known NODE_ENV values", async () => {
    const found = await detect({ env: { NODE_ENV: "production" } });
    expect(found.get("env.NODE_ENV")).toBe("production");
  });

  it("hides unexpected NODE_ENV values", async () => {
    const found = await detect({ env: { NODE_ENV: "my-private-value" } });
    expect(found.get("env.NODE_ENV")).toBe("other");
  });

  // New system tests go above this line.
  it("never reads an environment variable it was not asked for", async () => {
    const found = await detect({ env: { MY_SECRET: "hunter2" } });
    expect([...found.values()]).not.toContain("hunter2");
  });
});
