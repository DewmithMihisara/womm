import { describe, expect, it } from "vitest";
import { parseConfig, readConfig } from "../src/config.js";

describe("parseConfig", () => {
  it("reads ignore and rules", () => {
    expect(parseConfig("ignore: [timezone]\nrules: team-rules\n")).toEqual({
      ignore: ["timezone"],
      rules: "team-rules",
    });
  });

  it("treats an empty file as no settings", () => {
    expect(parseConfig("")).toEqual({ ignore: [] });
  });

  it.each([
    ["invalid YAML", "a: [", "not valid YAML"],
    ["a non-mapping", "5", "must be a mapping"],
    ["an unknown key", "ignored: []", "unknown key"],
    ["a bad ignore", "ignore: yes", "list of ids"],
    ["a bad rules value", "rules: [a]", "folder path"],
  ])("rejects %s", (_name, text, message) => {
    expect(() => parseConfig(text)).toThrow(message);
  });
});

describe("readConfig", () => {
  it("returns defaults when the file does not exist", async () => {
    expect(await readConfig("womm-no-such-folder")).toEqual({ ignore: [] });
  });
});
