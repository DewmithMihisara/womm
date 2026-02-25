import { osDetector } from "./os.js";
import { toolDetector, tools } from "./tools.js";
import type { Detector } from "./types.js";

/** Every detector that runs during a snapshot. Add new kinds here. */
export const detectors: Detector[] = [osDetector, ...tools.map(toolDetector)];
