import type { Detector } from "./types.js";

/** Versions built into the Node.js running womm, which often differ by install. */
export function runtimeDetector(
  versions: NodeJS.ProcessVersions = process.versions,
): Detector {
  return async () => [
    {
      id: "node.openssl",
      label: "Node.js OpenSSL",
      value: versions.openssl ?? null,
    },
  ];
}
