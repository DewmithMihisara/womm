import type { Detector } from "./types.js";

/** Their values can hold paths or secrets, so only presence is recorded. */
const FLAGS: [variable: string, why: string][] = [
  ["NODE_OPTIONS", "changes how every Node.js process starts"],
  // New environment variables go above this line.
];

export const ENV_FLAG_NAMES = FLAGS.map(([variable]) => variable);

export function envFlagDetector(
  env: Record<string, string | undefined> = process.env,
): Detector {
  return async () =>
    FLAGS.map(([variable]) => ({
      id: `set.${variable}`,
      label: `${variable} is set`,
      value: env[variable] ? "yes" : null,
    }));
}
