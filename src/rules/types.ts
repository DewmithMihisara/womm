/** A fact about the machine. Exactly one of range, equals or missing applies. */
export interface FindingCondition {
  finding: string;
  range?: string;
  equals?: string[];
  missing?: boolean;
}

/** A package the project depends on. */
export interface DependencyCondition {
  dependency: string;
  range?: string;
}

export type Condition = FindingCondition | DependencyCondition;

/** A known cause of "works on my machine". Rules are data and never run code. */
export interface Rule {
  id: string;
  title: string;
  why: string;
  fix: string;
  source: string;
  when: Condition[];
}
