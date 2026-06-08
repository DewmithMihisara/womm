import { parseArgs } from "node:util";
import { certifyCommand } from "./commands/certify.js";
import { diffCommand } from "./commands/diff.js";
import {
  rulesCheckCommand,
  rulesDocsCommand,
  rulesListCommand,
} from "./commands/rules.js";
import { snapshotCommand } from "./commands/snapshot.js";
import { trialCommand } from "./commands/trial.js";
import { UserError } from "./io.js";

const USAGE = `womm: a courtroom for "works on my machine" bugs

Usage:
  womm snapshot [-o file]   Record this machine's setup
  womm diff <a> <b>         Compare two snapshot files
  womm trial --against <f>  Put your machine on trial against a working one
  womm certify              Check project requirements and issue a certificate
  womm rules list           List known causes
  womm rules check [dir]    Validate rule files
  womm rules docs           Print the rule catalogue as Markdown

Options:
  -o, --output <file>       Where to save the snapshot
  --against <file>          Snapshot from the machine where it works
  --mine <file>             Use a saved snapshot instead of this machine
  --project <dir>           Project folder to read (default: current folder)
  --json                    Print results as JSON
  --markdown                Print results as Markdown
  -h, --help                Show this help
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
      json: { type: "boolean" },
      markdown: { type: "boolean" },
      help: { type: "boolean", short: "h" },
    },
  });
  const [command, ...rest] = positionals;
  if (values.help || !command) {
    console.log(USAGE);
    return values.help ? 0 : 2;
  }
  if (command === "snapshot") return snapshotCommand(values.output);
  if (command === "diff") {
    const [a, b] = rest;
    if (!a || !b) throw new UserError("womm diff needs two snapshot files.");
    return diffCommand(a, b, values.json);
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
    return trialCommand({
      against: values.against,
      mine: values.mine,
      project: values.project ?? ".",
      json: values.json,
      markdown: values.markdown,
    });
  }
  throw new UserError(`Unknown command: ${command}. Run womm --help.`);
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
