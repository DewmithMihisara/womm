import { detectors as builtIn } from "./detectors/index.js";
import { limitRunner } from "./detectors/limit.js";
import { runCommand } from "./detectors/run.js";
import type { Detector, DetectorContext } from "./detectors/types.js";
import { currentIdentity, redactFindings, type Identity } from "./redact.js";
import { SNAPSHOT_VERSION, type Snapshot } from "./types.js";

const MAX_CONCURRENT_COMMANDS = 16;

export interface SnapshotOptions {
  detectors?: Detector[];
  context?: DetectorContext;
  identity?: Identity;
  now?: Date;
}

/** Runs every detector. One failing detector never loses the others. */
export async function takeSnapshot(
  options: SnapshotOptions = {},
): Promise<Snapshot> {
  const context = options.context ?? {
    run: limitRunner(runCommand, MAX_CONCURRENT_COMMANDS),
  };
  const results = await Promise.allSettled(
    (options.detectors ?? builtIn).map((detect) => detect(context)),
  );
  const findings = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );
  return {
    womm: SNAPSHOT_VERSION,
    createdAt: (options.now ?? new Date()).toISOString(),
    findings: redactFindings(findings, options.identity ?? currentIdentity()),
  };
}
