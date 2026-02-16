import { arch, platform, release } from "node:os";
import type { Detector } from "./types.js";

/** Reads OS facts directly. Hostname and username are deliberately excluded. */
export const osDetector: Detector = async () => [
  { id: "os.platform", label: "Operating system", value: platform() },
  { id: "os.release", label: "OS release", value: release() },
  { id: "os.arch", label: "CPU architecture", value: arch() },
];
