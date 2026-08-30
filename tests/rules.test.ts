import { describe, expect, it } from "vitest";
import { ruleApplies, type Dependencies } from "../src/rules/engine.js";
import { loadRules } from "../src/rules/load.js";
import type { Finding } from "../src/types.js";

type Facts = Record<string, string>;

/** [rule id, a machine it applies to, a machine it does not, dependencies] */
const samples: [string, Facts, Facts, Dependencies][] = [
  ["node-sass-needs-9-on-node-20", {"node":"20.1.0"}, {"node":"16.0.0"}, {"node-sass":"^7.0.0"}],
  ["node-sass-needs-8-on-node-18", {"node":"18.1.0"}, {"node":"16.0.0"}, {"node-sass":"^6.0.0"}],
  ["webpack-4-on-openssl-3", {"node":"22.0.0"}, {"node":"16.0.0"}, {"webpack":"^4.0.0"}],
  ["node-17-dns-order", {"node":"22.0.0"}, {"node":"16.0.0"}, {}],
  ["node-15-unhandled-rejections", {"node":"22.0.0"}, {"node":"14.0.0"}, {}],
  ["node-18-global-fetch", {"node":"16.0.0"}, {"node":"22.0.0"}, {}],
  ["node-21-global-navigator", {"node":"22.0.0"}, {"node":"20.0.0"}, {}],
  ["node-below-16-apple-silicon", {"node":"14.0.0","os.platform":"darwin","os.arch":"arm64"}, {"node":"14.0.0","os.platform":"darwin","os.arch":"x64"}, {}],
  ["node-gyp-on-python-312", {"python":"3.12.0"}, {"python":"3.11.0"}, {"node-gyp":"^9.0.0"}],
  ["npm-7-peer-dependencies", {"npm":"10.0.0"}, {"npm":"6.14.0"}, {}],
  ["git-safe-directory", {"git":"2.52.0"}, {"git":"2.30.0"}, {}],
  ["go-122-loop-variables", {"go":"1.22.0"}, {"go":"1.21.0"}, {}],
  ["go-116-modules-default", {"go":"1.22.0"}, {"go":"1.15.0"}, {}],
  ["go-118-sha1-certificates", {"go":"1.22.0"}, {"go":"1.17.0"}, {}],
  ["go-121-strict-go-line", {"go":"1.22.0"}, {"go":"1.20.0"}, {}],
  ["python-312-distutils", {"python":"3.12.0"}, {"python":"3.11.0"}, {}],
  ["python-312-imp", {"python":"3.12.0"}, {"python":"3.11.0"}, {}],
  ["python-312-asyncore", {"python":"3.12.0"}, {"python":"3.11.0"}, {}],
  ["python-313-dead-batteries", {"python":"3.13.0"}, {"python":"3.12.0"}, {}],
  ["python-310-collections-abc", {"python":"3.10.0"}, {"python":"3.9.0"}, {}],
  ["python-311-asyncio-coroutine", {"python":"3.11.0"}, {"python":"3.10.0"}, {}],
  ["python-311-getargspec", {"python":"3.11.0"}, {"python":"3.10.0"}, {}],
  ["python-37-async-keyword", {"python":"3.8.0"}, {"python":"3.6.0"}, {}],
  ["java-16-illegal-access", {"java":"16.0.1"}, {"java":"11.0.1"}, {}],
  ["java-17-strong-encapsulation", {"java":"21.0.1"}, {"java":"11.0.1"}, {}],
  ["java-11-removed-jaxb", {"java":"17.0.1"}, {"java":"8.0.301"}, {}],
  ["java-18-default-utf8", {"java":"21.0.1"}, {"java":"17.0.1"}, {}],
  ["java-24-security-manager", {"java":"24.0.1"}, {"java":"21.0.1"}, {}],
  ["gradle-too-old-for-java-17", {"gradle":"7.0.0","java":"17.0.1"}, {"gradle":"7.0.0","java":"11.0.1"}, {}],
  ["gradle-too-old-for-java-21", {"gradle":"8.0.0","java":"21.0.1"}, {"gradle":"8.5.0","java":"21.0.1"}, {}],
  ["maven-381-blocks-http", {"maven":"3.9.9"}, {"maven":"3.6.3"}, {}],
  ["ruby-3-keyword-arguments", {"ruby":"3.3.0"}, {"ruby":"2.7.8"}, {}],
  ["ruby-32-removed-exists", {"ruby":"3.3.0"}, {"ruby":"3.1.0"}, {}],
  ["ruby-34-bundled-gems", {"ruby":"3.4.0"}, {"ruby":"3.3.0"}, {}],
  ["php-8-breaking-changes", {"php":"8.3.0"}, {"php":"7.4.0"}, {}],
  ["php-81-null-to-builtins", {"php":"8.3.0"}, {"php":"8.0.0"}, {}],
  ["autocrlf-shell-scripts", {"git.autocrlf":"true"}, {"git.autocrlf":"false"}, {}],
  ["windows-long-paths", {"os.platform":"win32"}, {"os.platform":"linux"}, {}],
  ["case-sensitive-imports", {"fs.caseSensitive":"yes"}, {"fs.caseSensitive":"no"}, {}],
  ["docker-23-buildkit-default", {"docker":"27.0.0","os.platform":"linux"}, {"docker":"20.10.0","os.platform":"linux"}, {}],
  ["openssl-3-legacy-algorithms", {"openssl":"3.4.0"}, {"openssl":"1.1.1"}, {}],
  ["cargo-lockfile-v4", {"cargo":"1.70.0"}, {"cargo":"1.82.0"}, {}],
  ["cmake-4-removed-old-compat", {"cmake":"4.0.0"}, {"cmake":"3.28.0"}, {}],
  ["gcc-13-missing-headers", {"gcc":"13.2.0"}, {"gcc":"12.3.0"}, {}],
  ["gcc-14-implicit-functions", {"gcc":"14.1.0"}, {"gcc":"13.2.0"}, {}],
  ["clang-16-implicit-functions", {"clang":"18.1.0"}, {"clang":"15.0.0"}, {}],
  ["docker-on-arm64", {"os.arch":"arm64","docker":"27.0.0"}, {"os.arch":"x64","docker":"27.0.0"}, {}],
  ["perl-526-dot-in-inc", {"perl":"5.38.2"}, {"perl":"5.24.0"}, {}],
  ["bsd-sed-in-place", {"os.platform":"darwin"}, {"os.platform":"linux"}, {}],
  ["python-39-base64-encodestring", {"python":"3.9.0"}, {"python":"3.8.0"}, {}],
  ["python-38-time-clock", {"python":"3.8.0"}, {"python":"3.7.0"}, {}],
  ["python-314-deferred-annotations", {"python":"3.14.0"}, {"python":"3.13.0"}, {}],
  ["python-312-venv-no-setuptools", {"python":"3.12.0"}, {"python":"3.11.0"}, {}],
  ["python-313-lib2to3", {"python":"3.13.0"}, {"python":"3.12.0"}, {}],
  ["node-below-14-optional-chaining", {"node":"12.0.0"}, {"node":"14.0.0"}, {}],
  ["compose-version-obsolete", {"docker.compose":"2.29.0"}, {"docker.compose":"1.29.0"}, {}],
  ["rust-below-185-edition-2024", {"rust":"1.80.0"}, {"rust":"1.85.0"}, {}],
  ["go-120-random-seed", {"go":"1.22.0"}, {"go":"1.19.0"}, {}],
  ["java-15-removed-nashorn", {"java":"21.0.1"}, {"java":"11.0.1"}, {}],
  ["java-17-removed-rmi-activation", {"java":"21.0.1"}, {"java":"11.0.1"}, {}],
  ["java-14-removed-pack200", {"java":"21.0.1"}, {"java":"11.0.1"}, {}],
  ["ruby-31-psych-4", {"ruby":"3.3.0"}, {"ruby":"3.0.0"}, {}],
  ["php-82-dynamic-properties", {"php":"8.3.0"}, {"php":"8.1.0"}, {}],
  ["php-84-implicit-nullable", {"php":"8.4.0"}, {"php":"8.3.0"}, {}],
  ["php-7-removed-mysql", {"php":"8.3.0"}, {"php":"5.6.0"}, {}],
  ["gcc-15-c23-default", {"gcc":"15.1.0"}, {"gcc":"14.1.0"}, {}],
  ["gcc-11-cpp17-default", {"gcc":"13.2.0"}, {"gcc":"10.3.0"}, {}],
  ["gcc-10-no-common", {"gcc":"13.2.0"}, {"gcc":"9.4.0"}, {}],
  ["poetry-2-breaking-changes", {"poetry":"2.1.0"}, {"poetry":"1.8.0"}, {}],
  ["pip-241-legacy-versions", {"pip":"25.0"}, {"pip":"23.3"}, {}],
  ["git-symlinks-disabled", {"git.symlinks":"false"}, {"git.symlinks":"true"}, {}],
  ["git-filemode-disabled", {"git.filemode":"false"}, {"git.filemode":"true"}, {}],
  ["git-ignorecase-enabled", {"git.ignorecase":"true"}, {"git.ignorecase":"false"}, {}],
  ["java-14-removed-cms", {"java":"21.0.1"}, {"java":"11.0.1"}, {}],
  ["java-21-dynamic-agent-warning", {"java":"21.0.1"}, {"java":"17.0.1"}, {}],
  ["java-24-unsafe-warning", {"java":"24.0.1"}, {"java":"21.0.1"}, {}],
  ["python-312-unittest-aliases", {"python":"3.12.0"}, {"python":"3.11.0"}, {}],
  ["python-312-safeconfigparser", {"python":"3.12.0"}, {"python":"3.11.0"}, {}],
  // New rule samples go above this line.
];

const findings = (facts: Facts): Finding[] =>
  Object.entries(facts).map(([id, value]) => ({ id, label: id, value }));

describe("shipped rules", () => {
  it("all load without errors", async () => {
    expect((await loadRules()).errors).toEqual([]);
  });

  it("all have a sample", async () => {
    const { rules } = await loadRules();
    expect(samples.map(([id]) => id).sort()).toEqual(rules.map((r) => r.id).sort());
  });

  it.each(samples)("%s applies only to the right machine", async (id, yes, no, deps) => {
    const { rules } = await loadRules();
    const rule = rules.find((r) => r.id === id)!;
    expect(ruleApplies(rule, findings(yes), deps)).toBe(true);
    expect(ruleApplies(rule, findings(no), deps)).toBe(false);
  });
});
