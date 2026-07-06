import { diffSnapshots, onlyDifferences } from "../diff.js";
import { readSnapshot } from "../io.js";
import { renderDifferences } from "../report/text.js";

export async function diffCommand(
  pathA: string,
  pathB: string,
  json = false,
  all = false,
  exitCode = false,
): Promise<number> {
  const [a, b] = await Promise.all([readSnapshot(pathA), readSnapshot(pathB)]);
  const compared = diffSnapshots(a, b);
  const differences = all ? compared : onlyDifferences(compared);
  console.log(
    json ? JSON.stringify(differences, null, 2) : renderDifferences(differences),
  );
  return exitCode && onlyDifferences(compared).length > 0 ? 1 : 0;
}
