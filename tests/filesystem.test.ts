import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { filesystemDetector, isCaseSensitive } from "../src/detectors/filesystem.js";

const context = { run: async () => null };

describe("filesystem detector", () => {
  it("gives a boolean answer in a writable folder", async () => {
    expect(typeof (await isCaseSensitive(tmpdir()))).toBe("boolean");
  });

  it("reports null rather than failing on an unusable folder", async () => {
    const detect = filesystemDetector(join(tmpdir(), "womm-does-not-exist"));
    const [finding] = await detect(context);
    expect(finding?.value).toBeNull();
  });
});
