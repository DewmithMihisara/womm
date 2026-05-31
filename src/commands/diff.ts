import { diffSnapshots, onlyDifferences } from "../diff.js";
import { readSnapshot } from "../io.js";
import { renderDifferences } from "../report/text.js";

export async function diffCommand(
  pathA: string,
  pathB: string,
  json = false,
): Promise<number> {
  const [a, b] = await Promise.all([readSnapshot(pathA), readSnapshot(pathB)]);
  const differences = onlyDifferences(diffSnapshots(a, b));
  console.log(
    json ? JSON.stringify(differences, null, 2) : renderDifferences(differences),
  );
  return 0;
}
