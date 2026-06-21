import type { Detector } from "./types.js";

/**
 * GNU and BSD tools take different flags, a classic cause of scripts that work
 * on Linux and fail on macOS. Non-GNU versions often reject --version, so a
 * missing value means "GNU not found", not necessarily that the tool is absent.
 */
const TOOLS = [
  "sed",
  "grep",
  "awk",
  "tar",
  // New GNU tools go above this line.
];

export const flavourDetector: Detector = async ({ run }) =>
  Promise.all(
    TOOLS.map(async (tool) => {
      const output = await run(tool, ["--version"]);
      return {
        id: `gnu.${tool}`,
        label: `GNU ${tool}`,
        value: output?.includes("GNU") ? "yes" : null,
      };
    }),
  );
