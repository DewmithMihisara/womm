# womm

**A courtroom for "works on my machine" bugs.**

It works on your teammate's laptop and not on yours. `womm` compares the two machines, checks what your project says it needs, and puts the likely causes on trial.

```text
THE PEOPLE v. YOUR MACHINE

GUILTY     node 16.20.0
           .nvmrc requires node 22.11.0
           Fix: Install a node version matching 22.11.0.

SUSPICIOUS Python 3.12 removed distutils
           Code or packages importing distutils fail on Python 3.12.
           Fix: Install setuptools, or update the package that imports distutils.
           Source: https://docs.python.org/3.12/whatsnew/3.12.html

ACQUITTED  Git 2.47.0
           Theirs: 2.52.0

The court recommends dealing with the guilty parties first.
```

## Install

`womm` isn't on npm yet. To run it from source:

```sh
npm ci
npm run build
node dist/cli.js --help
```

## Usage

On the machine where it works:

```sh
womm snapshot -o works.womm.json
```

Review the file and send it to your teammate. Then, on the machine where it fails, from the project folder:

```sh
womm trial --against works.womm.json
```

| Command | What it does |
| --- | --- |
| `womm snapshot [-o file]` | Records this machine's setup |
| `womm diff <a> <b>` | Compares two snapshots |
| `womm trial --against <file>` | Compares, checks the project, and gives verdicts |
| `womm certify` | Issues a joke certificate if project requirements are met |
| `womm rules list` | Lists known causes |
| `womm rules check [dir]` | Validates rule files |

Add `--json` or `--markdown` to `womm trial` for other formats.

## How verdicts work

| Verdict | Meaning |
| --- | --- |
| **Guilty** | Breaks a requirement your project states, or matches a known issue with a package your project uses |
| **Suspicious** | A meaningful difference or a known issue that may affect you, such as a major version gap or a missing environment variable |
| **Acquitted** | Differs, but is unlikely to matter |

These are informed guesses with the evidence shown, not proof. `womm trial` exits with 1 if anything is guilty.

## Privacy

Snapshots are meant to be shared, so they record as little as possible. See [docs/privacy.md](docs/privacy.md).

- No hostnames, and usernames and home paths are replaced with placeholders.
- Environment variables aren't copied. A few well-known settings are summarised.
- Values in `.env` files are never read into results, only key names.

Always review a snapshot before sharing it.

## Contributing

The easiest first contribution is one [rule](docs/writing-rules.md) or one [tool](docs/adding-tools.md). See [CONTRIBUTING.md](CONTRIBUTING.md).

All rules are listed in [docs/rules.md](docs/rules.md).

## License

MIT
