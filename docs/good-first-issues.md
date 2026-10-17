# Good first issues

Pick anything here, or suggest your own.

## Add a known cause

Have you lost an afternoon to a version difference? Turn it into a rule. Official release notes make the best sources. See [Writing rules](writing-rules.md).

## Add a tool

Is your favourite tool missing from `src/detectors/tools.ts`? It takes two lines. See [Adding tools](adding-tools.md).

## Check a tool's sample output

Samples in `tests/tools.test.ts` should match real output. If yours differs, please send a fix, especially for less common tools or platforms.

## Read another requirement file

Is there a version file womm doesn't know about? Add it to `src/project/sources.ts`.

## Larger ideas

- Requirements for transitive dependencies from lockfiles
- Dependency conditions for Python, Ruby and other ecosystems, since rules only understand `package.json` today
- More funny, harmless certificate designs
