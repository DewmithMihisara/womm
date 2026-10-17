# Architecture

```text
detectors -> snapshot (redacted JSON) ----+
                                          v
project files -> requirements, env keys -> trial -> charges -> reports
rules/*.yaml -> rule engine --------------^
```

| Path | Job |
| --- | --- |
| `src/detectors/` | Gathers facts about the machine |
| `src/redact.ts` | Removes usernames and home paths |
| `src/io.ts` | Reads snapshots, treating them as untrusted |
| `src/project/` | Reads what a project requires |
| `src/rules/` | Loads, validates and evaluates rules |
| `src/classify.ts` | Decides how much a plain difference matters |
| `src/trial.ts` | Turns everything into charges |
| `src/report/` | Renders charges as text, Markdown or HTML |
| `src/certificate/` | Renders the certificate and badge |

## Untrusted input

These can come from someone else, so they're never trusted:

- **Snapshots:** size-limited, validated and stripped of control characters.
- **Rules:** data only, validated against a strict schema.
- **Project files:** parsed, never executed.
- **The current folder:** on Windows, commands don't run from it, so a repository can't replace a tool.

Every report format escapes what it prints.
