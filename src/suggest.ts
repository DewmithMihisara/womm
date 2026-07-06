/** Number of single-character edits between two words. */
export function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1]! + 1, previous[j]! + 1, previous[j - 1]! + cost);
    }
    previous = current;
  }
  return previous[b.length]!;
}

/** The closest option, if it's close enough to be a plausible typo. */
export function suggest(word: string, options: string[]): string | undefined {
  const scored = options
    .map((option) => ({ option, distance: editDistance(word, option) }))
    .sort((a, b) => a.distance - b.distance);
  const best = scored[0];
  return best && best.distance <= 2 ? best.option : undefined;
}
