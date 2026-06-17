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
  { id: "bash", label: "Bash", command: "bash" },
  { id: "zsh", label: "Zsh", command: "zsh" },
  { id: "pwsh", label: "PowerShell", command: "pwsh" },
  { id: "yarn", label: "Yarn", command: "yarn" },
  { id: "pnpm", label: "pnpm", command: "pnpm" },
  { id: "bun", label: "Bun", command: "bun" },
  { id: "deno", label: "Deno", command: "deno" },
  { id: "node-gyp", label: "node-gyp", command: "node-gyp" },
  { id: "ruby", label: "Ruby", command: "ruby" },
  { id: "php", label: "PHP", command: "php" },
  { id: "composer", label: "Composer", command: "composer" },
  { id: "dotnet", label: ".NET SDK", command: "dotnet" },
  { id: "perl", label: "Perl", command: "perl" },
  { id: "swift", label: "Swift", command: "swift" },
  { id: "lua", label: "Lua", command: "lua", args: ["-v"] },
  { id: "psql", label: "PostgreSQL client", command: "psql" },
  { id: "sqlite", label: "SQLite", command: "sqlite3" },
  { id: "redis", label: "Redis client", command: "redis-cli" },
  { id: "aws", label: "AWS CLI", command: "aws" },
  { id: "ffmpeg", label: "FFmpeg", command: "ffmpeg", args: ["-version"] },
  { id: "kotlin", label: "Kotlin", command: "kotlin", args: ["-version"] },
  { id: "scala", label: "Scala", command: "scalac", args: ["-version"] },
  { id: "dart", label: "Dart", command: "dart" },
  { id: "flutter", label: "Flutter", command: "flutter" },
  { id: "r", label: "R", command: "R" },
  { id: "julia", label: "Julia", command: "julia" },
  { id: "zig", label: "Zig", command: "zig", args: ["version"] },
  { id: "nim", label: "Nim", command: "nim" },
  { id: "ghc", label: "GHC", command: "ghc" },
  { id: "cabal", label: "Cabal", command: "cabal" },
  { id: "ocaml", label: "OCaml", command: "ocaml", args: ["-version"] },
  { id: "gem", label: "RubyGems", command: "gem" },
  { id: "bundler", label: "Bundler", command: "bundle" },
  { id: "rbenv", label: "rbenv", command: "rbenv" },
  { id: "pyenv", label: "pyenv", command: "pyenv" },
  { id: "conda", label: "Conda", command: "conda" },
  { id: "pipenv", label: "Pipenv", command: "pipenv" },
  { id: "volta", label: "Volta", command: "volta" },
  { id: "fnm", label: "fnm", command: "fnm" },
  { id: "corepack", label: "Corepack", command: "corepack" },
  { id: "tsc", label: "TypeScript compiler", command: "tsc" },
  { id: "ninja", label: "Ninja", command: "ninja" },
  { id: "meson", label: "Meson", command: "meson" },
  { id: "bazel", label: "Bazel", command: "bazel" },
  { id: "ant", label: "Apache Ant", command: "ant", args: ["-version"] },
  { id: "pkg-config", label: "pkg-config", command: "pkg-config" },
  { id: "autoconf", label: "Autoconf", command: "autoconf" },
  { id: "automake", label: "Automake", command: "automake" },
  { id: "nasm", label: "NASM", command: "nasm", args: ["-v"] },
  { id: "wget", label: "Wget", command: "wget" },
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
