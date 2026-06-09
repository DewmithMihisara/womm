# Contributing to womm

Thanks for helping. Most useful contributions are small.

## Good first contributions

- **Add a known cause:** one YAML file in `rules/`. See [Writing rules](docs/writing-rules.md).
- **Add a tool:** one row and one sample. See [Adding tools](docs/adding-tools.md).
- **Read a new requirement file:** one row in `src/project/sources.ts`, plus a sample in `tests/sources.test.ts`.

## Setup

```sh
npm ci
npm test
npm run typecheck
```

## Before opening a pull request

1. Add or update tests. `npm test` builds first, because some tests run the real CLI.
2. Run `npm run typecheck`.
3. If you changed a rule, run `node dist/cli.js rules check` and regenerate the catalogue:

   ```sh
   node dist/cli.js rules docs > docs/rules.md
   ```

## Ground rules

- **Privacy comes first.** A detector must never record names, addresses, secrets or full paths. See [Privacy](docs/privacy.md).
- **Rules need evidence.** Every rule links to a source that supports its claim, ideally official release notes.
- **Verdicts don't overclaim.** Say what's known. "Can fail" is fine when "will fail" isn't proven.
- **Jokes target machines, not people.**

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md).
