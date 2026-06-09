# Adding tools

Most tools take two lines.

1. Add a row to `src/detectors/tools.ts`:

   ```ts
   { id: "ruby", label: "Ruby", command: "ruby" },
   ```

   If the version flag isn't `--version`, add `args`. If the command has another common name, add `fallback`.

2. Add a sample to `tests/tools.test.ts`, using the tool's real output:

   ```ts
   ["ruby", "ruby 3.3.5 (2024-09-03 revision ef084cc8f4) +YJIT [x86_64-linux]", "3.3.5"],
   ```

A test fails if a tool has no sample.

Rules refer to the `id`, so don't rename one after release.

## Safety

Detectors run fixed commands without a shell. Arguments must be plain words, and a test checks this for every tool.

## Other detectors

For facts that aren't a tool version, see `src/detectors/system.ts`. Please read [Privacy](privacy.md) first.
