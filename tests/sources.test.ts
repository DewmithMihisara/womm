import { describe, expect, it } from "vitest";
import { pep440ToRange, sources } from "../src/project/sources.js";

/** [file name, file content, expected [tool, range] pairs] */
const samples: [string, string, [string, string][]][] = [
  [".nvmrc", "v22.11.0\n", [["node","22.11.0"]]],
  [".node-version", "20.10\n", [["node","20.10"]]],
  [".python-version", "3.12.1\n", [["python","3.12.1"]]],
  [".ruby-version", "ruby-3.3.0\n", [["ruby","3.3.0"]]],
  [".java-version", "21\n", [["java","21"]]],
  [".terraform-version", "1.9.8\n", [["terraform","1.9.8"]]],
  [".go-version", "1.22.3\n", [["go","1.22.3"]]],
  ["rust-toolchain", "1.82.0\n", [["rust","1.82.0"]]],
  ["rust-toolchain.toml", "[toolchain]\nchannel = \"1.82.0\"\n", [["rust","1.82.0"]]],
  // New source samples go above this line.
];

describe("requirement sources", () => {
  it.each(samples)("reads %s", (file, content, expected) => {
    const source = sources.find((s) => s.file === file)!;
    expect(source.parse(content).map((w) => [w.tool, w.range])).toEqual(expected);
  });

  it("has a sample for every source", () => {
    expect(samples.map(([file]) => file)).toEqual(sources.map((s) => s.file));
  });

  it.each(sources.map((s) => [s.file, s] as const))(
    "%s ignores empty content without failing",
    (_file, source) => {
      expect(source.parse("")).toEqual([]);
    },
  );

  it("ignores names a version file can hold that are not versions", () => {
    const nvmrc = sources.find((s) => s.file === ".nvmrc")!;
    expect(nvmrc.parse("lts/iron\n")).toEqual([]);
    expect(nvmrc.parse("node\n")).toEqual([]);
  });
});

describe("pep440ToRange", () => {
  it.each([
    [">=3.10", ">=3.10"],
    [">=3.10,<3.13", ">=3.10 <3.13"],
    ["~=3.10", "^3.10"],
    ["==3.11.*", "3.11.x"],
    [">=3.9,!=3.9.1", ">=3.9"],
  ])("converts %s", (input, expected) => {
    expect(pep440ToRange(input)).toBe(expected);
  });
});
