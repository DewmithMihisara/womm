import { writeSnapshot } from "../io.js";
import { renderFindings } from "../report/text.js";
import { takeSnapshot } from "../snapshot.js";

/**
 * With an output path, saves the file and prints it for review. Without one,
 * JSON goes to stdout so it can be piped, and the review goes to stderr.
 */
export async function snapshotCommand(
  output?: string,
  quiet = false,
): Promise<number> {
  const snapshot = await takeSnapshot();
  const review = `Recorded:\n${renderFindings(snapshot.findings)}\n`;
  if (output) {
    await writeSnapshot(output, snapshot);
    if (!quiet) {
      console.log(`${review}\nSaved to ${output}. Review it before sharing.`);
    }
  } else {
    if (!quiet) console.error(review);
    console.log(JSON.stringify(snapshot, null, 2));
  }
  return 0;
}
