import { osDetector } from "./os.js";
import { envFlagDetector } from "./envflags.js";
import { filesystemDetector } from "./filesystem.js";
import { flavourDetector } from "./flavour.js";
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
  filesystemDetector(),
  envFlagDetector(),
  flavourDetector,
  ...systemDetectors(),
  ...tools.map(toolDetector),
];
