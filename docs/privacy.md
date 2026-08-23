# Privacy

Snapshots are meant to be shared, so `womm` is built to record as little as it can.

## What a snapshot records

- OS name, release and CPU architecture
- Versions of known tools
- Timezone and locale
- A short list of Git settings related to line endings, file modes and paths
- Whether the filesystem is case sensitive
- The default line ending and the name of your shell
- `NODE_ENV`, if it's one of `development`, `production` or `test`. Any other value shows as `other`
- Whether a proxy is configured, but never its address
- Whether it's running in CI or WSL
- Whether tools such as `sed` and `grep` are the GNU versions
- Whether a short list of variables that change tool behaviour, such as `NODE_OPTIONS`, are set, but never their values

## What it doesn't record

- Your hostname, or your Git name and email
- Other environment variables
- Dependency lists, which are read only during a trial
- File contents

Usernames and home paths in recorded values are replaced with `<user>` and `<home>`.

## .env files

During a trial or certification, `womm` reads `.env.example` and `.env` on your own machine to find which keys are missing. It keeps key names and discards everything after the `=`. Results can show missing key names, but never values, and they aren't written to snapshots.

## Things to keep in mind

- Timezone and locale can hint at where you are.
- Tool versions could help someone identify outdated software on your machine.

Open a snapshot and read it before sharing. It's plain JSON. `womm snapshot` also prints what it recorded.

## Network

`womm` makes no network requests.

## Reporting a problem

If a snapshot records something private, please see [SECURITY.md](../SECURITY.md).
