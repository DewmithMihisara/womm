import semver from "semver";

/** A version a project asks for. `range` uses semver range syntax. */
export interface Requirement {
  tool: string;
  range: string;
  source: string;
}

type Wanted = Pick<Requirement, "tool" | "range">;
type Parser = (text: string) => Wanted[];

export interface Source {
  file: string;
  parse: Parser;
}

/** Keeps only ranges we understand, so `lts/*` or `stable` aren't misjudged. */
function wanted(tool: string, range: string | undefined): Wanted[] {
  return range && semver.validRange(range) ? [{ tool, range }] : [];
}

/** A file holding one version, with common prefixes such as v or ruby-. */
const versionFile =
  (tool: string): Parser =>
  (text) =>
    wanted(tool, text.trim().split(/\s+/)[0]?.replace(/^(?:v|ruby-)/, ""));

/** The first capture of a pattern, optionally converted to a range. */
const matching =
  (tool: string, pattern: RegExp, toRange = (v: string) => v): Parser =>
  (text) => {
    const found = pattern.exec(text)?.[1];
    return found ? wanted(tool, toRange(found)) : [];
  };

function parseJson(text: string): Record<string, unknown> {
  try {
    const data: unknown = JSON.parse(text);
    return typeof data === "object" && data !== null
      ? (data as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

/** Converts Python version specifiers to semver range syntax. */
export function pep440ToRange(spec: string): string {
  return spec
    .split(",")
    .map((part) => part.trim())
    .filter((part) => !part.startsWith("!="))
    .map((part) => part.replace(/^~=/, "^").replace(/^==/, "").replace(/\.\*$/, ".x"))
    .join(" ");
}

const pyproject: Parser = (text) => {
  const pattern = /^\s*(?:requires-python|python)\s*=\s*["']([^"']+)["']/m;
  const spec = pattern.exec(text)?.[1];
  return spec ? wanted("python", pep440ToRange(spec)) : [];
};

/** Tool names that differ between version managers and womm. */
const ALIASES: Record<string, string> = {
  nodejs: "node",
  golang: "go",
};

const toolVersions: Parser = (text) =>
  text.split(/\r?\n/).flatMap((line) => {
    const [name, version] = line.split("#")[0]!.trim().split(/\s+/);
    return name && version ? wanted(ALIASES[name] ?? name, version) : [];
  });

const sdkman: Parser = (text) =>
  text.split(/\r?\n/).flatMap((line) => {
    const [name, value] = line.split("#")[0]!.trim().split("=");
    // SDKMAN versions can carry a vendor suffix, as in 21.0.2-tem.
    return name && value ? wanted(name, value.replace(/-[a-z]+$/, "")) : [];
  });

const globalJson: Parser = (text) => {
  const sdk = parseJson(text).sdk as { version?: unknown } | undefined;
  // By default .NET rolls forward within the same feature band.
  return typeof sdk?.version === "string" ? wanted("dotnet", `~${sdk.version}`) : [];
};

const composer: Parser = (text) => {
  const require = parseJson(text).require as { php?: unknown } | undefined;
  return typeof require?.php === "string" ? wanted("php", require.php) : [];
};

const packageJson: Parser = (text) => {
  const data = parseJson(text);
  const engines = (data.engines ?? {}) as Record<string, unknown>;
  const fromEngines = Object.entries(engines).flatMap(([tool, range]) =>
    typeof range === "string" ? wanted(tool, range) : [],
  );
  const manager = /^([a-z]+)@(\d[^+]*)/.exec(String(data.packageManager ?? ""));
  return manager ? [...fromEngines, ...wanted(manager[1]!, manager[2])] : fromEngines;
};

/** Every file womm reads requirements from. */
export const sources: Source[] = [
  { file: ".nvmrc", parse: versionFile("node") },
  { file: ".node-version", parse: versionFile("node") },
  { file: ".python-version", parse: versionFile("python") },
  { file: ".ruby-version", parse: versionFile("ruby") },
  { file: ".java-version", parse: versionFile("java") },
  { file: ".terraform-version", parse: versionFile("terraform") },
  { file: ".go-version", parse: versionFile("go") },
  { file: "rust-toolchain", parse: versionFile("rust") },
  { file: "rust-toolchain.toml", parse: matching("rust", /^\s*channel\s*=\s*"([^"]+)"/m) },
  { file: "go.mod", parse: matching("go", /^go\s+(\d+\.\d+(?:\.\d+)?)\s*$/m, (v) => `>=${v}`) },
  { file: "runtime.txt", parse: matching("python", /^python-(\d[\d.]*)/m) },
  { file: "Gemfile", parse: matching("ruby", /^\s*ruby\s+["']([^"']+)["']/m) },
  { file: "pyproject.toml", parse: pyproject },
  { file: ".sdkmanrc", parse: sdkman },
  { file: ".tool-versions", parse: toolVersions },
  { file: "pom.xml", parse: matching("java", /<(?:java\.version|maven\.compiler\.release)>(\d+)</, (v) => `>=${v}`) },
  { file: "global.json", parse: globalJson },
  { file: "composer.json", parse: composer },
  { file: "package.json", parse: packageJson },
  { file: ".php-version", parse: versionFile("php") },
  // New sources go above this line.
];
