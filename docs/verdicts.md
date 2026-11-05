# How verdicts are reached

`womm trial` looks at your machine, the machine where the project works, and your project.

| Finding | Verdict |
| --- | --- |
| Your version doesn't meet something the project states | Guilty |
| A known issue applies to you and not them, and your project uses the package | Guilty |
| A known issue about your machine applies to you and not them | Suspicious |
| Requirement files contradict each other | Suspicious |
| A variable in `.env.example` isn't set | Suspicious |
| More than one lockfile | Suspicious |
| A major version gap, or a tool only they have | Suspicious |
| A sensitive setting differs, such as line endings or case sensitivity | Suspicious |
| Anything else that differs | Acquitted |

## What this can't tell you

- `womm` compares setups. It doesn't run your code, so it can't prove which difference caused a failure.
- It only sees what it has detectors and rules for. An empty report means nothing known was found, not that your machines are identical.
- Requirements with a tool `womm` can't detect are skipped.
- On Windows, version managers that choose a version per folder may report their global version.

## Exit codes

| Code | Meaning |
| --- | --- |
| 0 | Finished, with nothing at the `--fail-on` level |
| 1 | Something reached the `--fail-on` level, or a certificate was denied |
| 2 | Couldn't run, such as a bad option or an unreadable file |
