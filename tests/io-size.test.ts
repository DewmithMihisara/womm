import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readSnapshot } from "../src/io.js";

describe("readSnapshot", () => {
  it("refuses a file that is too large", async () => {
    const dir = mkdtempSync(join(tmpdir(), "womm-size-"));
    const path = join(dir, "big.json");
    writeFileSync(path, "x".repeat(6 * 1024 * 1024));
    await expect(readSnapshot(path)).rejects.toThrow(/too large/);
    rmSync(dir, { recursive: true, force: true });
  });

  it("explains a file that can't be read", async () => {
    await expect(readSnapshot("womm-no-such-file")).rejects.toThrow(/Could not read/);
  });
});
