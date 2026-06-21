import type { CommandRunner } from "./types.js";

/** Wraps a runner so that at most `max` commands are in progress. */
export function limitRunner(run: CommandRunner, max: number): CommandRunner {
  let active = 0;
  const waiting: (() => void)[] = [];
  return async (command, args) => {
    if (active >= max) {
      await new Promise<void>((resolve) => waiting.push(resolve));
    }
    active += 1;
    try {
      return await run(command, args);
    } finally {
      active -= 1;
      waiting.shift()?.();
    }
  };
}
