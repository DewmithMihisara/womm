import { closingStatement } from "./court.js";
import type { Charge } from "../trial.js";

/** Stops table cells breaking when text contains a pipe or a line break. */
function cell(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function details(charge: Charge): string {
  const parts = [charge.evidence];
  if (charge.fix) parts.push(`**Fix:** ${charge.fix}`);
  if (charge.source) parts.push(`[Source](${charge.source})`);
  return cell(parts.join("<br>"));
}

export function renderMarkdown(charges: Charge[]): string {
  const lines = ["## The People v. Your Machine", ""];
  if (charges.length > 0) {
    lines.push("| Verdict | Subject | Evidence |", "| --- | --- | --- |");
    for (const charge of charges) {
      lines.push(`| ${charge.verdict} | ${cell(charge.subject)} | ${details(charge)} |`);
    }
    lines.push("");
  }
  lines.push(closingStatement(charges));
  return lines.join("\n");
}
