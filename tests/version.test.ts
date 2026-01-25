import { describe, expect, it } from "vitest";
import { parseVersion } from "../src/detectors/version.js";

describe("parseVersion", () => {
  it.each([
    ["v24.18.1", "24.18.1"],
    ["git version 2.52.0.windows.1", "2.52.0"],
    ["Python 3.12.1", "3.12.1"],
    ["go version go1.22.3 linux/amd64", "1.22.3"],
    ["1.2.3-beta.1", "1.2.3-beta.1"],
  ])("parses %s", (input, expected) => {
    expect(parseVersion(input)).toBe(expected);
  });

  it("returns null without a version", () => {
    expect(parseVersion("no digits here")).toBeNull();
    expect(parseVersion(null)).toBeNull();
  });
});
