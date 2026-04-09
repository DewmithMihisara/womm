import { readSnapshot } from "../io.js";
import { readDependencies } from "../project/dependencies.js";
import { missingEnvKeys } from "../project/envkeys.js";
import { lockfileConflicts } from "../project/lockfiles.js";
import { readRequirements } from "../project/read.js";
import { renderTrial } from "../report/court.js";
import { loadRules } from "../rules/load.js";
import { takeSnapshot } from "../snapshot.js";
import { holdTrial, type CaseFile } from "../trial.js";

export interface TrialOptions {
  against: string;
  mine?: string;
  project: string;
  json?: boolean;
}

async function buildCaseFile(project: string): Promise<CaseFile> {
  const [requirements, dependencies, loaded, missing, conflicts] = await Promise.all([
    readRequirements(project),
    readDependencies(project),
    loadRules(),
    missingEnvKeys(project),
    lockfileConflicts(project),
  ]);
  return {
    requirements,
    dependencies,
    rules: loaded.rules,
    missingEnvKeys: missing,
    lockfileConflicts: conflicts,
  };
}

/** Exits 1 when something is found guilty, so scripts and CI can react. */
export async function trialCommand(options: TrialOptions): Promise<number> {
  const theirs = await readSnapshot(options.against);
  const mine = options.mine ? await readSnapshot(options.mine) : await takeSnapshot();
  const charges = holdTrial(mine, theirs, await buildCaseFile(options.project));
  console.log(options.json ? JSON.stringify(charges, null, 2) : renderTrial(charges));
  return charges.some((c) => c.verdict === "guilty") ? 1 : 0;
}
