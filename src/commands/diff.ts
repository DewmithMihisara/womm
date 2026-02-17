import { diffSnapshots, onlyDifferences } from "../diff.js";
import { readSnapshot } from "../io.js";
import { renderDifferences } from "../report/text.js";

export async function diffCommand(pathA: string, pathB: string): Promise<number> {
  const [a, b] = await Promise.all([readSnapshot(pathA), readSnapshot(pathB)]);
  console.log(renderDifferences(onlyDifferences(diffSnapshots(a, b))));
  return 0;
}
