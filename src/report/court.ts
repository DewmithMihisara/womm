import pc from "picocolors";
import type { Charge, Verdict } from "../trial.js";

const LABELS: Record<Verdict, string> = {
  guilty: pc.red("GUILTY    "),
  suspicious: pc.yellow("SUSPICIOUS"),
  acquitted: pc.green("ACQUITTED "),
};

const INDENT = " ".repeat(11);

function renderCharge(charge: Charge): string {
  const lines = [`${LABELS[charge.verdict]} ${charge.subject}`, `${INDENT}${pc.dim(charge.evidence)}`];
  if (charge.fix) lines.push(`${INDENT}Fix: ${charge.fix}`);
  if (charge.source) lines.push(`${INDENT}${pc.dim(`Source: ${charge.source}`)}`);
  return lines.join("\n");
}

/** Sums up the case without claiming more than the evidence supports. */
export function closingStatement(charges: Charge[]): string {
  if (charges.length === 0) {
    return "Case dismissed. The court found no differences, so look elsewhere: your code, your data or your luck.";
  }
  if (charges.some((c) => c.verdict === "guilty")) {
    return "The court recommends dealing with the guilty parties first.";
  }
  if (charges.some((c) => c.verdict === "suspicious")) {
    return "No conviction, but the suspects above are worth questioning.";
  }
  return "All acquitted. These differences are unlikely to be the cause.";
}

export function renderTrial(charges: Charge[]): string {
  const body = charges.map(renderCharge).join("\n\n");
  const heading = pc.bold("THE PEOPLE v. YOUR MACHINE");
  return [heading, body, closingStatement(charges)].filter(Boolean).join("\n\n");
}
