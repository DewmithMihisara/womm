import { availableParallelism, totalmem } from "node:os";
import type { Detector } from "./types.js";

const GIB = 1024 ** 3;

/** Rough figures only. These matter for builds that run out of memory or time. */
export function hardwareDetector(
  cores: number = availableParallelism(),
  memoryBytes: number = totalmem(),
): Detector {
  return async () => [
    { id: "hw.cores", label: "CPU cores", value: String(cores) },
    { id: "hw.memory", label: "Memory (GB)", value: String(Math.round(memoryBytes / GIB)) },
    // New hardware facts go above this line.
  ];
}
