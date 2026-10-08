import { parseArgs } from "node:util";
import { certifyCommand } from "./commands/certify.js";
import { diffCommand } from "./commands/diff.js";
import {
  explainCommand,
  rulesCheckCommand,
  rulesDocsCommand,
  rulesListCommand,
} from "./commands/rules.js";
import { snapshotCommand } from "./commands/snapshot.js";
import { trialCommand } from "./commands/trial.js";
import { isFailOn } from "./failon.js";
import { UserError } from "./io.js";
import { suggest } from "./suggest.js";
import { packageVersion } from "./version.js";

const COMMANDS = ["snapshot", "diff", "trial", "certify", "rules", "explain"];

const USAGE = `womm: a courtroom for "works on my machine" bugs

Usage:
  womm snapshot [-o file]   Record this machine's setup
  womm diff <a> <b>         Compare two snapshot files
  womm trial --against <f>  Put your machine on trial against a working one
  womm certify              Check project requirements and issue a certificate
  womm explain <rule>       Explain one known cause
  womm rules list           List known causes
  womm rules check [dir]    Validate rule files
  womm rules docs           Print the rule catalogue as Markdown

Options:
  -o, --output <file>       Where to save the snapshot
  -q, --quiet               Don't print what the snapshot recorded
  --all                     In diff, include values that match
  --exit-code               In diff, exit 1 if anything differs
  --against <file>          Snapshot from the machine where it works
  --mine <file>             Use a saved snapshot instead of this machine
  --project <dir>           Project folder to read (default: current folder)
  --json                    Print results as JSON
  --markdown                Print results as Markdown
  --ignore <ids>            Comma-separated charges to leave out of a trial
  --brief                   Hide acquitted charges
  --fail-on <level>         Exit 1 on guilty (default), suspicious or never
  --rules <dir>             Also use rules from this folder
  -h, --help                Show this help
  -v, --version             Show the version
`;

export async function main(argv: string[]): Promise<number> {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      output: { type: "string", short: "o" },
      against: { type: "string" },
      mine: { type: "string" },
      project: { type: "string", default: "." },
      quiet: { type: "boolean", short: "q" },
      all: { type: "boolean" },
      "exit-code": { type: "boolean" },
      json: { type: "boolean" },
      markdown: { type: "boolean" },
      ignore: { type: "string" },
      brief: { type: "boolean" },
      "fail-on": { type: "string" },
      rules: { type: "string" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
  });
  if (values.version) {
    console.log(packageVersion());
    return 0;
  }
  const [command, ...rest] = positionals;
  if (values.help || !command) {
    console.log(USAGE);
    return values.help ? 0 : 2;
  }
  if (command === "snapshot") return snapshotCommand(values.output, values.quiet);
  if (command === "diff") {
    const [a, b] = rest;
    if (!a || !b) throw new UserError("womm diff needs two snapshot files.");
    return diffCommand(a, b, values.json, values.all, values["exit-code"]);
  }
  if (command === "explain") {
    const [id] = rest;
    if (!id) throw new UserError("womm explain needs a rule id.");
    return explainCommand(id);
  }
  if (command === "certify") {
    return certifyCommand({ project: values.project ?? ".", output: values.output });
  }
  if (command === "rules") {
    const [action, directory] = rest;
    if (action === "list") return rulesListCommand();
    if (action === "check") return rulesCheckCommand(directory);
    if (action === "docs") return rulesDocsCommand();
    throw new UserError("Use womm rules list, check [dir] or docs.");
  }
  if (command === "trial") {
    if (!values.against) {
      throw new UserError("womm trial needs --against <snapshot file>.");
    }
    const failOn = values["fail-on"] ?? "guilty";
    if (!isFailOn(failOn)) {
      throw new UserError("--fail-on must be guilty, suspicious or never.");
    }
    return trialCommand({
      failOn,
      rules: values.rules,
      against: values.against,
      mine: values.mine,
      project: values.project ?? ".",
      json: values.json,
      markdown: values.markdown,
      ignore: values.ignore?.split(","),
      brief: values.brief,
    });
  }
  const close = suggest(command, COMMANDS);
  const hint = close ? `Did you mean ${close}?` : "Run womm --help.";
  throw new UserError(`Unknown command: ${command}. ${hint}`);
}

try {
  process.exitCode = await main(process.argv.slice(2));
} catch (error) {
  if (!(error instanceof UserError) && !isArgumentError(error)) throw error;
  console.error((error as Error).message);
  process.exitCode = 2;
}

function isArgumentError(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code ?? "";
  return code.startsWith("ERR_PARSE_ARGS");
}
