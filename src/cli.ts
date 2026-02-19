import { parseArgs } from "node:util";
import { diffCommand } from "./commands/diff.js";
import { snapshotCommand } from "./commands/snapshot.js";
import { UserError } from "./io.js";

const USAGE = `womm: a courtroom for "works on my machine" bugs

Usage:
  womm snapshot [-o file]   Record this machine's setup
  womm diff <a> <b>         Compare two snapshot files

Options:
  -o, --output <file>       Where to save the snapshot
  -h, --help                Show this help
`;

export async function main(argv: string[]): Promise<number> {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      output: { type: "string", short: "o" },
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
    return diffCommand(a, b);
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
