import { shouldFail, type FailOn } from "../failon.js";
import { filterCharges } from "../filter.js";
import { readSnapshot } from "../io.js";
import { readDependencies } from "../project/dependencies.js";
import { missingEnvKeys } from "../project/envkeys.js";
import { lockfileConflicts } from "../project/lockfiles.js";
import { readRequirements } from "../project/read.js";
import { renderTrial } from "../report/court.js";
import { renderMarkdown } from "../report/markdown.js";
import { loadRules } from "../rules/load.js";
import { takeSnapshot } from "../snapshot.js";
import { staleWarning } from "../stale.js";
import { holdTrial, type CaseFile, type Charge } from "../trial.js";

export interface TrialOptions {
  against: string;
  mine?: string;
  project: string;
  json?: boolean;
  markdown?: boolean;
  ignore?: string[];
  brief?: boolean;
  failOn?: FailOn;
}

function render(charges: Charge[], options: TrialOptions): string {
  if (options.json) return JSON.stringify(charges, null, 2);
  return options.markdown ? renderMarkdown(charges) : renderTrial(charges);
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

/** Exits 1 according to --fail-on, so scripts and CI can react. */
export async function trialCommand(options: TrialOptions): Promise<number> {
  const theirs = await readSnapshot(options.against);
  const mine = options.mine ? await readSnapshot(options.mine) : await takeSnapshot();
  const warning = staleWarning(theirs.createdAt);
  if (warning) console.error(warning);
  const charges = filterCharges(
    holdTrial(mine, theirs, await buildCaseFile(options.project)),
    options,
  );
  console.log(render(charges, options));
  return shouldFail(charges, options.failOn) ? 1 : 0;
}
