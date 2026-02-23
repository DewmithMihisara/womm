import type { Detector } from "./types.js";
import { parseVersion } from "./version.js";

export interface ToolSpec {
  /** Stable id used by rules, e.g. "node". Never rename one once released. */
  id: string;
  label: string;
  command: string;
  /** Defaults to --version. */
  args?: string[];
  /** Tried when the main command is missing, e.g. python for python3. */
  fallback?: string;
}

/** To support a new tool, add a row here and a sample in tests/tools.test.ts. */
export const tools: ToolSpec[] = [
  { id: "node", label: "Node.js", command: "node" },
  { id: "npm", label: "npm", command: "npm" },
  { id: "git", label: "Git", command: "git" },
  { id: "python", label: "Python", command: "python3", fallback: "python" },
  { id: "pip", label: "pip", command: "pip3", fallback: "pip" },
  { id: "poetry", label: "Poetry", command: "poetry" },
  { id: "uv", label: "uv", command: "uv" },
  { id: "java", label: "Java", command: "java", args: ["-version"] },
  { id: "maven", label: "Maven", command: "mvn" },
  { id: "gradle", label: "Gradle", command: "gradle" },
  { id: "go", label: "Go", command: "go", args: ["version"] },
  { id: "rust", label: "Rust", command: "rustc" },
  { id: "cargo", label: "Cargo", command: "cargo" },
  { id: "docker", label: "Docker", command: "docker" },
  { id: "docker.compose", label: "Docker Compose", command: "docker", args: ["compose","version"] },
  { id: "kubectl", label: "kubectl", command: "kubectl", args: ["version","--client"] },
  { id: "helm", label: "Helm", command: "helm", args: ["version","--short"] },
  { id: "terraform", label: "Terraform", command: "terraform", args: ["version"] },
  { id: "openssl", label: "OpenSSL", command: "openssl", args: ["version"] },
  { id: "curl", label: "curl", command: "curl" },
  { id: "gcc", label: "GCC", command: "gcc", args: ["-dumpfullversion"] },
  { id: "clang", label: "Clang", command: "clang" },
  { id: "make", label: "Make", command: "make" },
  { id: "cmake", label: "CMake", command: "cmake" },
  // New tools go above this line.
];

export function toolDetector(spec: ToolSpec): Detector {
  const args = spec.args ?? ["--version"];
  return async ({ run }) => {
    let output = await run(spec.command, args);
    if (output === null && spec.fallback) {
      output = await run(spec.fallback, args);
    }
    return [{ id: spec.id, label: spec.label, value: parseVersion(output) }];
  };
}
