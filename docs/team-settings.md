# Team settings

Add a `.womm.yaml` file to your project to share settings with your team.

```yaml
# Charges your team has decided aren't relevant.
ignore:
  - timezone
  - python-37-async-keyword

# Your own rules, relative to the project.
rules: .womm/rules
```

Charge ids appear in `womm trial --json`.

## Team rules

Team rules use the [same format](writing-rules.md) as shipped rules, and are useful for knowledge specific to your project. If a team rule has the same id as a shipped rule, the team rule wins.

You can also pass a folder directly:

```sh
womm trial --against works.womm.json --rules ./my-rules
```

Rule files are data and can't run code, so a project's rules can only change what a report says. If you're trying `womm` on a repository you don't trust, keep in mind that its rules and settings could hide or invent findings.
