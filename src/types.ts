/** Bumped whenever the snapshot format changes in an incompatible way. */
export const SNAPSHOT_VERSION = 1;

/** The result for one detected item, such as "node". */
export interface Finding {
  /** Stable identifier, e.g. "node" or "os.platform". */
  id: string;
  /** Human-readable name shown in reports. */
  label: string;
  /** Detected value, or null when the tool is not installed. */
  value: string | null;
}

export interface Snapshot {
  womm: number;
  createdAt: string;
  findings: Finding[];
}
