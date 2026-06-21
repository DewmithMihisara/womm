import { describe, expect, it } from "vitest";
import { limitRunner } from "../src/detectors/limit.js";

describe("limitRunner", () => {
  it("never exceeds the limit and runs everything", async () => {
    let active = 0;
    let peak = 0;
    const run = limitRunner(async (command) => {
      active += 1;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active -= 1;
      return command;
    }, 3);
    const names = Array.from({ length: 20 }, (_, index) => `tool${index}`);
    const results = await Promise.all(names.map((name) => run(name, [])));
    expect(peak).toBeLessThanOrEqual(3);
    expect(results).toEqual(names);
  });

  it("releases its slot when a command fails", async () => {
    const run = limitRunner(async (command) => {
      if (command === "bad") throw new Error("boom");
      return command;
    }, 1);
    await expect(run("bad", [])).rejects.toThrow("boom");
    await expect(run("good", [])).resolves.toBe("good");
  });
});
