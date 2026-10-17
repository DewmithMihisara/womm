import { closingStatement, tally } from "./court.js";
import type { Charge } from "../trial.js";

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Only https links are made clickable, since sources can come from team rules. */
function sourceLink(source: string | undefined): string {
  if (!source?.startsWith("https://")) return "";
  const url = escapeHtml(source);
  return `<p><a href="${url}" rel="noreferrer">Source</a></p>`;
}

function renderCharge(charge: Charge): string {
  const fix = charge.fix ? `<p><strong>Fix:</strong> ${escapeHtml(charge.fix)}</p>` : "";
  return `<article class="${charge.verdict}">
<h2><span>${charge.verdict}</span> ${escapeHtml(charge.subject)}</h2>
<p>${escapeHtml(charge.evidence)}</p>
${fix}
${sourceLink(charge.source)}
</article>`;
}

export function renderHtml(charges: Charge[]): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>The People v. Your Machine</title>
<style>
body { font-family: Georgia, serif; max-width: 46rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
article { border-left: 6px solid; padding: .25rem 1rem; margin: 1rem 0; }
h2 { font-size: 1.1rem; }
h2 span { text-transform: uppercase; font-size: .8rem; letter-spacing: .05em; }
.guilty { border-color: #c62828; }
.suspicious { border-color: #b7791f; }
.acquitted { border-color: #2e7d32; }
</style>
</head>
<body>
<h1>The People v. Your Machine</h1>
${charges.map(renderCharge).join("\n")}
<p>${charges.length > 0 ? `${tally(charges)} ` : ""}${escapeHtml(closingStatement(charges))}</p>
</body>
</html>
`;
}
