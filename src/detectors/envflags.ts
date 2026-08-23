import type { Detector } from "./types.js";

/** Their values can hold paths or secrets, so only presence is recorded. */
const FLAGS: [variable: string, why: string][] = [
  ["NODE_OPTIONS", "changes how every Node.js process starts"],
  ["NODE_EXTRA_CA_CERTS", "adds trusted certificates for Node.js"],
  ["JAVA_HOME", "chooses which Java build tools use"],
  ["PYTHONPATH", "adds folders to Python's import path"],
  ["VIRTUAL_ENV", "shows a Python virtual environment is active"],
  ["CONDA_PREFIX", "shows a Conda environment is active"],
  ["GOPATH", "changes where Go looks for code"],
  ["GOFLAGS", "changes the default flags for Go commands"],
  ["RUSTFLAGS", "changes how Rust code is compiled"],
  ["DOCKER_HOST", "points Docker at another daemon"],
  ["KUBECONFIG", "chooses which clusters kubectl talks to"],
  ["SSL_CERT_FILE", "changes which certificates are trusted"],
  ["REQUESTS_CA_BUNDLE", "changes which certificates Python requests trusts"],
  ["LD_LIBRARY_PATH", "changes which shared libraries load on Linux"],
  ["DYLD_LIBRARY_PATH", "changes which shared libraries load on macOS"],
  ["CFLAGS", "changes how C code is compiled"],
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
