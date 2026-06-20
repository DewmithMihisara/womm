import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { windowsSafeOptions } from "../src/detectors/run.js";

const cli = resolve("dist/cli.js");
let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "womm-hostile-"));
});
afterEach(() => rmSync(dir, { recursive: true, force: true, maxRetries: 5 }));

describe("running inside a hostile repository", () => {
  it.runIf(process.platform === "win32")("does not execute a fake npm.cmd", () => {
    writeFileSync(
      join(dir, "npm.cmd"),
      '@echo off\r\necho ran> "%~dp0marker.txt"\r\necho 1.2.3\r\n',
    );
    // Remove the protective setting, as in a normal terminal. Otherwise this
    // test could pass even with the bug present.
    const env = { ...process.env };
    for (const key of Object.keys(env)) {
      if (key.toLowerCase() === "nodefaultcurrentdirectoryinexepath") delete env[key];
    }
    const result = spawnSync(process.execPath, [cli, "snapshot"], {
      cwd: dir,
      env,
      encoding: "utf8",
    });
    expect(result.status).toBe(0);
    expect(existsSync(join(dir, "marker.txt"))).toBe(false);
    const npm = JSON.parse(result.stdout).findings.find(
      (finding: { id: string }) => finding.id === "npm",
    );
    expect(npm.value).not.toBe("1.2.3");
  });
});

describe("windowsSafeOptions", () => {
  it("uses a neutral folder and disables current-folder lookup", () => {
    const options = windowsSafeOptions({ PATH: "x" });
    expect(options.cwd).toBe(tmpdir());
    expect(options.env.NoDefaultCurrentDirectoryInExePath).toBe("1");
    expect(options.env.PATH).toBe("x");
  });
});
