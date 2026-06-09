import { renderRulesDoc } from "../report/rulesdoc.js";
import { loadRules } from "../rules/load.js";

export async function rulesDocsCommand(): Promise<number> {
  const { rules } = await loadRules();
  process.stdout.write(renderRulesDoc(rules));
  return 0;
}

export async function rulesListCommand(): Promise<number> {
  const { rules } = await loadRules();
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
