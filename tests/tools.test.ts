import { describe, expect, it } from "vitest";
import { windowsShimCall } from "../src/detectors/run.js";
import { toolDetector, tools } from "../src/detectors/tools.js";

/** [tool id, real output of its version command, expected version] */
const samples: [string, string, string][] = [
  ["node", "v22.11.0", "22.11.0"],
  ["npm", "10.9.0", "10.9.0"],
  ["git", "git version 2.52.0.windows.1", "2.52.0"],
  ["python", "Python 3.12.1", "3.12.1"],
  ["pip", "pip 24.0 from /usr/lib/python3/dist-packages/pip (python 3.12)", "24.0"],
  ["poetry", "Poetry (version 1.8.4)", "1.8.4"],
  ["uv", "uv 0.4.30", "0.4.30"],
  ["java", "openjdk version \"21.0.2\" 2024-01-16", "21.0.2"],
  ["maven", "Apache Maven 3.9.9 (8e8579a9e76f7d015ee5ec7bfcdc97d260186937)", "3.9.9"],
  ["gradle", "\n------\nGradle 8.10.2\n------", "8.10.2"],
  ["go", "go version go1.22.3 linux/amd64", "1.22.3"],
  ["rust", "rustc 1.82.0 (f6e511eec 2024-10-15)", "1.82.0"],
  ["cargo", "cargo 1.82.0 (8f40fc59f 2024-08-21)", "1.82.0"],
  ["docker", "Docker version 27.3.1, build ce12230", "27.3.1"],
  ["docker.compose", "Docker Compose version v2.29.7", "2.29.7"],
  ["kubectl", "Client Version: v1.31.2", "1.31.2"],
  ["helm", "v3.16.2+g13654a5", "3.16.2+g13654a5"],
  ["terraform", "Terraform v1.9.8", "1.9.8"],
  ["openssl", "OpenSSL 3.4.0 22 Oct 2024", "3.4.0"],
  ["curl", "curl 8.5.0 (x86_64-pc-linux-gnu) libcurl/8.5.0", "8.5.0"],
  ["gcc", "13.2.0", "13.2.0"],
  ["clang", "Apple clang version 15.0.0 (clang-1500.3.9.4)", "15.0.0"],
  ["make", "GNU Make 4.3", "4.3"],
  ["cmake", "cmake version 3.28.3", "3.28.3"],
  ["bash", "GNU bash, version 5.2.21(1)-release (x86_64-pc-linux-gnu)", "5.2.21"],
  ["zsh", "zsh 5.9 (x86_64-apple-darwin23.0)", "5.9"],
  ["pwsh", "PowerShell 7.4.6", "7.4.6"],
  ["yarn", "1.22.22", "1.22.22"],
  ["pnpm", "9.12.3", "9.12.3"],
  ["bun", "1.1.34", "1.1.34"],
  ["deno", "deno 2.0.6 (stable, release, x86_64-pc-windows-msvc)", "2.0.6"],
  ["node-gyp", "v10.2.0", "10.2.0"],
  ["ruby", "ruby 3.3.5 (2024-09-03 revision ef084cc8f4) +YJIT [x86_64-linux]", "3.3.5"],
  ["php", "PHP 8.3.6 (cli) (built: Apr 15 2024 19:21:47) (NTS)", "8.3.6"],
  ["composer", "Composer version 2.7.1 2024-02-09 15:26:28", "2.7.1"],
  ["dotnet", "8.0.404", "8.0.404"],
  ["perl", "This is perl 5, version 38, subversion 2 (v5.38.2) built for x86_64-linux", "5.38.2"],
  ["swift", "Swift version 5.10 (swift-5.10-RELEASE)", "5.10"],
  ["lua", "Lua 5.4.6  Copyright (C) 1994-2023 Lua.org, PUC-Rio", "5.4.6"],
  ["psql", "psql (PostgreSQL) 16.4", "16.4"],
  ["sqlite", "3.45.1 2024-01-15 17:01:13 e876e51a0ed5c5b3", "3.45.1"],
  ["redis", "redis-cli 7.2.4", "7.2.4"],
  ["aws", "aws-cli/2.18.0 Python/3.12.6 Linux/6.8.0 exe/x86_64", "2.18.0"],
  ["ffmpeg", "ffmpeg version 7.1 Copyright (c) 2000-2024 the FFmpeg developers", "7.1"],
  ["kotlin", "Kotlin version 2.0.21-release-482 (JRE 21.0.2+13)", "2.0.21-release-482"],
  ["scala", "Scala compiler version 3.5.2 -- Copyright 2002-2024, LAMP/EPFL", "3.5.2"],
  ["dart", "Dart SDK version: 3.5.4 (stable) on \"linux_x64\"", "3.5.4"],
  ["flutter", "Flutter 3.24.4 • channel stable • https://github.com/flutter/flutter.git", "3.24.4"],
  ["r", "R version 4.4.2 (2024-10-31) -- \"Pile of Leaves\"", "4.4.2"],
  ["julia", "julia version 1.11.1", "1.11.1"],
  ["zig", "0.13.0", "0.13.0"],
  ["nim", "Nim Compiler Version 2.2.0 [Linux: amd64]", "2.2.0"],
  ["ghc", "The Glorious Glasgow Haskell Compilation System, version 9.4.8", "9.4.8"],
  ["cabal", "cabal-install version 3.10.3.0", "3.10.3.0"],
  ["ocaml", "The OCaml toplevel, version 5.2.0", "5.2.0"],
  ["gem", "3.5.22", "3.5.22"],
  ["bundler", "Bundler version 2.5.22", "2.5.22"],
  ["rbenv", "rbenv 1.3.0", "1.3.0"],
  ["pyenv", "pyenv 2.4.17", "2.4.17"],
  ["conda", "conda 24.9.2", "24.9.2"],
  ["pipenv", "pipenv, version 2024.2.0", "2024.2.0"],
  ["volta", "2.0.1", "2.0.1"],
  ["fnm", "fnm 1.37.2", "1.37.2"],
  ["corepack", "0.29.4", "0.29.4"],
  ["tsc", "Version 5.6.3", "5.6.3"],
  ["ninja", "1.11.1", "1.11.1"],
  ["meson", "1.6.0", "1.6.0"],
  ["bazel", "bazel 7.4.0", "7.4.0"],
  ["ant", "Apache Ant(TM) version 1.10.14 compiled on August 16 2023", "1.10.14"],
  ["pkg-config", "2.1.1", "2.1.1"],
  ["autoconf", "autoconf (GNU Autoconf) 2.71", "2.71"],
  ["automake", "automake (GNU automake) 1.16.5", "1.16.5"],
  ["nasm", "NASM version 2.16.03 compiled on Apr 17 2024", "2.16.03"],
  ["wget", "GNU Wget 1.24.5 built on linux-gnu.", "1.24.5"],
  ["jq", "jq-1.7.1", "1.7.1"],
  ["gh", "gh version 2.60.1 (2024-11-01)", "2.60.1"],
  ["hg", "Mercurial Distributed SCM (version 6.8.2)", "6.8.2"],
  ["svn", "1.14.3", "1.14.3"],
  ["git-lfs", "git-lfs/3.5.1 (GitHub; linux amd64; go 1.22.2)", "3.5.1"],
  ["podman", "podman version 5.2.5", "5.2.5"],
  ["minikube", "minikube version: v1.34.0", "1.34.0"],
  ["kind", "kind v0.24.0 go1.22.6 linux/amd64", "0.24.0"],
  ["ansible", "ansible [core 2.17.5]", "2.17.5"],
  ["vagrant", "Vagrant 2.4.2", "2.4.2"],
  ["packer", "Packer v1.11.2", "1.11.2"],
  ["vault", "Vault v1.18.1 (f479e5c85462477c9334564bc8f69531cdb03b65)", "1.18.1"],
  ["gcloud", "Google Cloud SDK 499.0.0", "499.0.0"],
  ["mysql", "mysql  Ver 8.0.40 for Linux on x86_64", "8.0.40"],
  ["mongosh", "2.3.3", "2.3.3"],
  ["nginx", "nginx version: nginx/1.26.2", "1.26.2"],
  ["ssh", "OpenSSH_9.6p1 Ubuntu-3ubuntu13.5, OpenSSL 3.0.13 30 Jan 2024", "9.6"],
  ["gpg", "gpg (GnuPG) 2.4.5", "2.4.5"],
  ["rsync", "rsync  version 3.3.0  protocol version 31", "3.3.0"],
  ["ripgrep", "ripgrep 14.1.1", "14.1.1"],
  ["fd", "fd 10.2.0", "10.2.0"],
  ["bat", "bat 0.24.0 (fc95468)", "0.24.0"],
  ["tmux", "tmux 3.4", "3.4"],
  ["vim", "VIM - Vi IMproved 9.1 (2024 Jan 02, compiled Oct 01 2024)", "9.1"],
  ["nano", "GNU nano, version 7.2", "7.2"],
  ["ruff", "ruff 0.7.3", "0.7.3"],
  ["black", "black, 24.10.0 (compiled: yes)", "24.10.0"],
  ["mypy", "mypy 1.13.0 (compiled: yes)", "1.13.0"],
  ["pytest", "pytest 8.3.3", "8.3.3"],
  ["eslint", "v9.14.0", "9.14.0"],
  // New samples go above this line.
];

describe("tools", () => {
  it("has a sample for every tool", () => {
    expect(samples.map(([id]) => id).sort()).toEqual(
      tools.map((tool) => tool.id).sort(),
    );
  });

  it("has unique ids", () => {
    const ids = tools.map((tool) => tool.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(samples)("parses %s", async (id, output, expected) => {
    const spec = tools.find((tool) => tool.id === id)!;
    const [finding] = await toolDetector(spec)({ run: async () => output });
    expect(finding?.value).toBe(expected);
  });

  it.each(tools.map((tool) => [tool.id, tool] as const))(
    "%s can run safely through the Windows fallback",
    (_id, tool) => {
      expect(windowsShimCall(tool.command, tool.args ?? ["--version"])).not.toBeNull();
    },
  );

  it("reports null when the tool is missing", async () => {
    const [finding] = await toolDetector(tools[0]!)({ run: async () => null });
    expect(finding?.value).toBeNull();
  });

  it("tries the fallback command when the main one is missing", async () => {
    const detect = toolDetector({
      id: "py",
      label: "Py",
      command: "python3",
      fallback: "python",
    });
    const [finding] = await detect({
      run: async (command) => (command === "python" ? "Python 3.9.1" : null),
    });
    expect(finding?.value).toBe("3.9.1");
  });
});
