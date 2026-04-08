import semver from "semver";
import type { Condition, Rule } from "./types.js";

const RULE_KEYS = ["id", "title", "why", "fix", "source", "when"];
const FINDING_KEYS = ["finding", "range", "equals", "missing"];
const DEPENDENCY_KEYS = ["dependency", "range"];
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function unknownKeys(data: object, allowed: string[]): string[] {
  return Object.keys(data).filter((key) => !allowed.includes(key));
}

function conditionErrors(condition: unknown, where: string): string[] {
  if (typeof condition !== "object" || condition === null) {
    return [`${where} must be an object`];
  }
  const item = condition as Record<string, unknown>;
  const errors: string[] = [];
  if (item.range !== undefined) {
    if (typeof item.range !== "string" || !semver.validRange(item.range)) {
      errors.push(`${where}.range is not a valid version range`);
    }
  }
  if (typeof item.dependency === "string") {
    const extra = unknownKeys(item, DEPENDENCY_KEYS);
    return [...errors, ...extra.map((key) => `${where} has unknown key "${key}"`)];
  }
  if (typeof item.finding !== "string") {
    return [...errors, `${where} needs "finding" or "dependency"`];
  }
  const extra = unknownKeys(item, FINDING_KEYS);
  errors.push(...extra.map((key) => `${where} has unknown key "${key}"`));
  const tests = ["range", "equals", "missing"].filter((key) => item[key] !== undefined);
  if (tests.length !== 1) {
    errors.push(`${where} needs exactly one of range, equals or missing`);
  }
  if (
    item.equals !== undefined &&
    !(Array.isArray(item.equals) && item.equals.every((v) => typeof v === "string"))
  ) {
    errors.push(`${where}.equals must be a list of strings`);
  }
  if (item.missing !== undefined && item.missing !== true) {
    errors.push(`${where}.missing can only be true`);
  }
  return errors;
}

/** Returns every problem found, so a contributor can fix them all at once. */
export function ruleErrors(data: unknown): string[] {
  if (typeof data !== "object" || data === null) return ["rule must be an object"];
  const rule = data as Record<string, unknown>;
  const errors = unknownKeys(rule, RULE_KEYS).map((key) => `unknown key "${key}"`);
  for (const key of ["id", "title", "why", "fix", "source"]) {
    if (typeof rule[key] !== "string" || !rule[key]) {
      errors.push(`"${key}" must be a non-empty string`);
    }
  }
  if (typeof rule.id === "string" && rule.id && !ID.test(rule.id)) {
    errors.push(`"id" must be lowercase words joined by hyphens`);
  }
  if (typeof rule.source === "string" && rule.source && !isHttpsUrl(rule.source)) {
    errors.push(`"source" must be an https URL`);
  }
  if (!Array.isArray(rule.when) || rule.when.length === 0) {
    errors.push(`"when" must be a non-empty list`);
  } else {
    rule.when.forEach((condition: Condition, index) => {
      errors.push(...conditionErrors(condition, `when[${index}]`));
    });
    if (!rule.when.some((c: Record<string, unknown>) => c?.finding !== undefined)) {
      errors.push(`"when" needs a machine fact, not only dependencies`);
    }
  }
  return errors;
}

function isHttpsUrl(text: string): boolean {
  try {
    return new URL(text).protocol === "https:";
  } catch {
    return false;
  }
}

export function isRule(data: unknown): data is Rule {
  return ruleErrors(data).length === 0;
}
