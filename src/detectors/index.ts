import { gitDetector } from "./git.js";
import { nodeDetector } from "./node.js";
import { npmDetector } from "./npm.js";
import { osDetector } from "./os.js";
import type { Detector } from "./types.js";

/** Every detector that runs during a snapshot. Add new tools here. */
export const detectors: Detector[] = [
  osDetector,
  nodeDetector,
  npmDetector,
  gitDetector,
];
