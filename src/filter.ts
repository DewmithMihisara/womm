import type { Charge } from "./trial.js";

export interface ChargeFilter {
  ignore?: string[];
  brief?: boolean;
}

/** `ignore` drops named charges, and `brief` hides acquitted ones. */
export function filterCharges(charges: Charge[], filter: ChargeFilter): Charge[] {
  return charges.filter(
    (charge) =>
      !filter.ignore?.includes(charge.id) &&
      !(filter.brief && charge.verdict === "acquitted"),
  );
}
