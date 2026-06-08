import type { CheckResult } from "../project/check.js";

const escapeXml = (text: string): string =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/** Project names and versions are untrusted text, so everything is escaped. */
export function renderCertificate(
  project: string,
  results: CheckResult[],
  issuedOn: string,
): string {
  const lines = results
    .filter((result) => result.status === "met")
    .slice(0, 6)
    .map(
      (result, index) =>
        `<text x="400" y="${260 + index * 26}" text-anchor="middle" font-size="16">${escapeXml(
          `${result.tool} ${result.actual ?? ""} (${result.source} asks for ${result.range})`,
        )}</text>`,
    )
    .join("\n  ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" font-family="Georgia, serif" role="img" aria-label="Works On My Machine certificate">
  <rect width="800" height="500" fill="#fdf8e7"/>
  <rect x="16" y="16" width="768" height="468" fill="none" stroke="#7a5c1e" stroke-width="4"/>
  <text x="400" y="90" text-anchor="middle" font-size="34" font-weight="bold">Certificate of Works On My Machine</text>
  <text x="400" y="140" text-anchor="middle" font-size="18">The court certifies that this machine meets the stated requirements of</text>
  <text x="400" y="190" text-anchor="middle" font-size="26" font-weight="bold">${escapeXml(project)}</text>
  <text x="400" y="230" text-anchor="middle" font-size="16" font-style="italic">having examined the following evidence:</text>
  ${lines}
  <text x="400" y="440" text-anchor="middle" font-size="14">Issued ${escapeXml(issuedOn)}. Not valid on any other machine. Not legal advice. Not a guarantee of anything.</text>
</svg>
`;
}
