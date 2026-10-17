// Checks every rule's source link. Run with: node scripts/check-rule-sources.mjs
import { readdirSync, readFileSync } from "node:fs";
import { parse } from "yaml";

const urls = new Map();
for (const name of readdirSync("rules").filter((file) => file.endsWith(".yaml"))) {
  const { id, source } = parse(readFileSync(`rules/${name}`, "utf8"));
  urls.set(source, [...(urls.get(source) ?? []), id]);
}

let failures = 0;
for (const [url, ids] of urls) {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "womm-source-check" },
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) {
      failures += 1;
      console.error(`${response.status} ${url} (${ids.join(", ")})`);
    }
  } catch (error) {
    failures += 1;
    console.error(`${error.name} ${url} (${ids.join(", ")})`);
  }
}
console.log(`Checked ${urls.size} links, ${failures} failed.`);
process.exitCode = failures > 0 ? 1 : 0;
