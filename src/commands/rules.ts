import { UserError } from "../io.js";
import { renderRulesDoc } from "../report/rulesdoc.js";
import { loadRules } from "../rules/load.js";
import { suggest } from "../suggest.js";

export async function explainCommand(id: string): Promise<number> {
  const { rules } = await loadRules();
  const rule = rules.find((candidate) => candidate.id === id);
  if (!rule) {
    const close = suggest(id, rules.map((candidate) => candidate.id));
    const hint = close ? ` Did you mean ${close}?` : " Run womm rules list.";
    throw new UserError(`No rule named ${id}.${hint}`);
  }
  console.log(
    `${rule.title}\n\nWhy: ${rule.why}\nFix: ${rule.fix}\nSource: ${rule.source}`,
  );
  return 0;
}

export async function rulesDocsCommand(): Promise<number> {
  const { rules } = await loadRules();
  process.stdout.write(renderRulesDoc(rules));
  return 0;
}

export async function rulesListCommand(json = false): Promise<number> {
  const { rules } = await loadRules();
  if (json) {
    console.log(JSON.stringify(rules, null, 2));
    return 0;
  }
  for (const rule of rules) console.log(`${rule.id}  ${rule.title}`);
  console.log(`\n${rules.length} rules.`);
  return 0;
}

/** Lets contributors check rule files before opening a pull request. */
export async function rulesCheckCommand(directory?: string): Promise<number> {
  const { rules, errors } = await loadRules(directory);
  if (errors.length > 0) {
    console.error(errors.join("\n"));
    return 1;
  }
  console.log(`${rules.length} rules are valid.`);
  return 0;
}
