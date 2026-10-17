import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const dir = mkdtempSync(join(tmpdir(), "womm-certify-"));
const cli = resolve("dist/cli.js");
const womm = (...args: string[]) =>
  spawnSync(process.execPath, [cli, ...args], { encoding: "utf8", cwd: dir });

const project = (name: string, files: Record<string, string>) => {
  const path = join(dir, name);
  mkdirSync(path);
  for (const [file, text] of Object.entries(files)) {
    writeFileSync(join(path, file), text);
  }
  return name;
};

afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe("womm certify", () => {
  it("issues a certificate when requirements are met", () => {
    const name = project("good", {
      "package.json": JSON.stringify({ name: "good", engines: { node: ">=1" } }),
    });
    const result = womm("certify", "--project", name, "-o", "cert.svg");
    expect(result.status).toBe(0);
    expect(existsSync(join(dir, "cert.svg"))).toBe(true);
    expect(readFileSync(join(dir, "cert.svg"), "utf8")).toContain("<svg");
  });

  it("saves a badge on request, containing fixed text only", () => {
    const name = project("badged", {
      "package.json": JSON.stringify({ engines: { node: ">=1" } }),
    });
    const result = womm(
      "certify",
      "--project",
      name,
      "-o",
      "badged.svg",
      "--badge",
      "badge.svg",
    );
    expect(result.status).toBe(0);
    const badge = readFileSync(join(dir, "badge.svg"), "utf8");
    expect(badge).toContain("my machine");
    expect(badge).not.toContain("badged");
  });

  it("denies a certificate and explains why", () => {
    const name = project("old", {
      "package.json": JSON.stringify({ engines: { node: "<1" } }),
    });
    const result = womm("certify", "--project", name, "-o", "denied.svg");
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("Certificate denied");
    expect(result.stdout).toContain("node: unmet");
    expect(existsSync(join(dir, "denied.svg"))).toBe(false);
  });

  it("denies a project with no requirements", () => {
    const result = womm("certify", "--project", project("empty", {}));
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("No version requirements");
  });
});
