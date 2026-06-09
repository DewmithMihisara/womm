# Writing rules

A rule describes one known cause of "works on my machine". Rules are data, so they can't run code on anyone's machine.

Create `rules/<id>.yaml`. The file name must match the id.

```yaml
id: webpack-4-on-openssl-3
title: webpack 4 hashing fails on Node.js 17+
why: Node.js 17 moved to OpenSSL 3, and webpack builds using MD4 hashing can fail with ERR_OSSL_EVP_UNSUPPORTED.
fix: Upgrade webpack. As a stopgap, set NODE_OPTIONS=--openssl-legacy-provider.
source: https://github.com/webpack/webpack/issues/14532
when:
  - finding: node
    range: ">=17"
  - dependency: webpack
    range: "<5"
```

## Fields

| Field | Meaning |
| --- | --- |
| `id` | Lowercase words joined by hyphens |
| `title` | One short line |
| `why` | What happens and why |
| `fix` | What to do |
| `source` | An https link that supports the claim |
| `when` | Conditions that must all hold |

## Conditions

At least one condition must be about the machine.

| Condition | Holds when |
| --- | --- |
| `finding: node` with `range: ">=17"` | The version is in the range |
| `finding: os.platform` with `equals: [darwin]` | The value is listed |
| `finding: git.longpaths` with `missing: true` | Nothing was found |
| `dependency: webpack`, with optional `range` | `package.json` lists an overlapping version |

Finding ids are the `id` values in a snapshot file.

## How rules become verdicts

A rule only counts if it applies to your machine and not to the machine where the project works. A problem on both machines can't explain the difference.

A rule with a `dependency` condition can give **guilty**, because your project uses the package. A rule about the machine alone gives **suspicious**, because it may not affect your project.

## Testing

Add a row to `tests/rules.test.ts` with one machine the rule applies to, and one it doesn't. Then run:

```sh
npm test
node dist/cli.js rules check
node dist/cli.js rules docs > docs/rules.md
```
