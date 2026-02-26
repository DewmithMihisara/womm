import { osDetector } from "./os.js";
import { gitConfigDetector } from "./gitconfig.js";
import { runtimeDetector } from "./runtime.js";
import { systemDetectors } from "./system.js";
import { toolDetector, tools } from "./tools.js";
import type { Detector } from "./types.js";

/** Every detector that runs during a snapshot. Add new kinds here. */
export const detectors: Detector[] = [
  osDetector,
  runtimeDetector(),
  gitConfigDetector,
  ...systemDetectors(),
  ...tools.map(toolDetector),
];
