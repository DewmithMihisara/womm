import { writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { renderCertificate } from "../certificate/svg.js";
import { certify } from "../certify.js";
import { missingEnvKeys } from "../project/envkeys.js";
import { readRequirements } from "../project/read.js";
import { takeSnapshot } from "../snapshot.js";

export interface CertifyOptions {
  project: string;
  output?: string;
}

/** Exits 1 when uncertified, so it can guard a setup script. */
export async function certifyCommand(options: CertifyOptions): Promise<number> {
  const [requirements, snapshot, missing] = await Promise.all([
    readRequirements(options.project),
    takeSnapshot(),
    missingEnvKeys(options.project),
  ]);
  const result = certify(requirements, snapshot.findings, missing);
  if (!result.certified) {
    console.log("Certificate denied.");
    if (result.results.length === 0) {
      console.log("  No version requirements found in this project.");
    }
    for (const check of result.results.filter((r) => r.status !== "met")) {
      console.log(
        `  ${check.tool}: ${check.status}, ${check.source} asks for ${check.range}, found ${check.actual ?? "nothing"}`,
      );
    }
    for (const key of missing) console.log(`  Missing environment variable: ${key}`);
    return 1;
  }
  const output = options.output ?? "womm-certificate.svg";
  const name = basename(resolve(options.project));
  const today = new Date().toISOString().slice(0, 10);
  await writeFile(output, renderCertificate(name, result.results, today));
  console.log(`Certified. It works on your machine. Certificate saved to ${output}.`);
  return 0;
}
