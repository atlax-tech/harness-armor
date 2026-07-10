<p align="center">
  <img src="assets/harness-armor-hero.png" alt="A software repository fitted with modular documentation, architecture, test, and verification armor" width="100%">
</p>

<h1 align="center">Harness Armor</h1>

<p align="center"><strong>Give every coding agent the same map, guardrails, and definition of done.</strong></p>

<p align="center">
  <a href="https://github.com/atlax-tech/harness-armor/actions/workflows/quality.yml"><img alt="Quality" src="https://github.com/atlax-tech/harness-armor/actions/workflows/quality.yml/badge.svg?branch=main"></a>
  <a href="https://github.com/atlax-tech/harness-armor/actions/workflows/cross-platform.yml"><img alt="Cross-platform" src="https://github.com/atlax-tech/harness-armor/actions/workflows/cross-platform.yml/badge.svg?branch=main"></a>
  <a href="https://agentskills.io/specification"><img alt="Agent Skills open standard" src="https://img.shields.io/badge/Agent%20Skills-open%20standard-F97316"></a>
  <a href="CHANGELOG.md"><img alt="Version 0.1.2" src="https://img.shields.io/badge/version-0.1.2-1D4ED8"></a>
  <a href="LICENSE"><img alt="License CC BY-NC 4.0" src="https://img.shields.io/badge/license-CC%20BY--NC%204.0-111827"></a>
</p>

<p align="center"><a href="README.md">English</a> · <a href="README.zh-CN.md">简体中文</a></p>

Harness Armor is a suite of seven Agent Skills that turns repository knowledge
into a maintainable engineering harness for Claude Code, OpenAI Codex, Cursor,
TRAE, and compatible coding agents.

It helps an agent answer three questions before it changes your code:

- **What is true?** Product intent, architecture, commands, tests, and known
  gaps are traced back to repository evidence.
- **What is allowed?** Every workflow has an explicit file perimeter and
  authorization boundary.
- **What proves completion?** Tests, acceptance checks, and unresolved risks
  stay visible instead of becoming confident guesses.

> The agent handles meaning. Small deterministic tools inventory, fingerprint,
> and validate the evidence.

## Quick start

The npm package is not published yet. Install from the checked-out GitHub source
so the command you run is explicit and reproducible:

```bash
git clone --depth 1 https://github.com/atlax-tech/harness-armor.git
cd harness-armor
node ./bin/harness-armor.js install --target claude-user
```

Open Claude Code in any repository and run:

```text
/harness
```

For OpenAI Codex, install the same Skills to its user directory:

```bash
node ./bin/harness-armor.js install --target codex-user
```

Then mention the router explicitly:

```text
$harness
```

The first run is read-only. Harness Armor inspects the repository, shows its
evidence and uncertainties, then routes you to the right specialist workflow.
Role-equivalent custom Harnesses may keep project-specific filenames; the
detector does not require them to adopt Harness Armor's managed layout.

## From an unfamiliar repository to an evidence-backed plan

```text
repository
   │
   ▼
read-only evidence scan
   │
   ├── empty or basic only ─────────► initialize a Harness
   ├── product docs, no code ───────► build from documented intent
   ├── legacy code ─────────────────► recover the current system safely
   └── existing Harness ────────────► check health or plan an update
                                          │
                                          ▼
                              execute · test · review prompts
```

Harness Armor does not replace your coding agent. It gives that agent a durable,
repository-owned operating system for understanding and changing the project.

## Seven focused Skills

| Skill | When to use it | Outcome |
| --- | --- | --- |
| `harness` | You do not know where to start | Repository state, evidence, and one recommended route |
| `harness-init` | The repository is empty or basic-only | A fact-safe Harness foundation |
| `harness-build` | Product documents exist before implementation | A source-linked engineering Harness |
| `harness-promotion` | Real code exists without reliable agent guidance | Current architecture, verified commands, risks, and boundaries |
| `harness-check` | A managed or custom Harness needs an audit | Read-only health findings with evidence |
| `harness-update` | Product, architecture, code, or tests changed | Drift report and an approval-gated update plan |
| `harness-prompt` | A real implementation plan is ready | Separate execute, test, and review prompts |

Invoke specialists directly when you already know the job:

```text
Claude Code: /harness-check      /harness-update      /harness-prompt
Codex:       $harness-check      $harness-update      $harness-prompt
```

## Why teams use it

| Common failure mode | Harness Armor's answer |
| --- | --- |
| Every agent rediscovers the repository | Durable product, architecture, development, and acceptance knowledge |
| An outdated `AGENTS.md` becomes false confidence | Short guidance that points to focused sources of truth |
| Legacy behavior is guessed from filenames | Evidence classification with explicit unknowns and conflicts |
| “Update the docs” silently overwrites human work | Ownership records, fingerprints, scoped diffs, and approval gates |
| The same agent implements and self-approves | Independent execute, test, and review roles |
| A configured workflow is reported as a passing test | Only commands and clients that actually ran are marked verified |

## Safety is part of the product

Harness Armor is conservative where coding agents are usually overconfident:

1. Repository conclusions are labeled `CONFIRMED`, `INFERRED`, `UNRESOLVED`,
   or `CONFLICTED`.
2. Scans and audits are read-only by default.
3. Proposed writes stay inside a declared file-level perimeter.
4. Managed updates require separate approval before any file changes.
5. User edits and ownership conflicts stop replacement instead of being hidden.
6. Unrun tests, platforms, and clients remain unverified.
7. Harness workflows never refactor or modify business code.

## Install where you work

Use the distribution command from the repository checkout:

| Client | User install | Project install |
| --- | --- | --- |
| Claude Code | `node ./bin/harness-armor.js install --target claude-user` | `node ./bin/harness-armor.js install --target claude-project --project-root /path/to/repo` |
| OpenAI Codex | `node ./bin/harness-armor.js install --target codex-user` | `node ./bin/harness-armor.js install --target codex-project --project-root /path/to/repo` |
| Cursor | `node ./bin/harness-armor.js install --target cursor-user` | `node ./bin/harness-armor.js install --target cursor-project --project-root /path/to/repo` |
| TRAE | — | `node ./bin/harness-armor.js install --target trae-project --project-root /path/to/repo` |
| Generic Agent Skills client | — | `node ./bin/harness-armor.js install --target generic --dest /absolute/path/to/skills` |

The installer only distributes and diagnoses Skills. It exposes `install`,
`update`, `uninstall`, `doctor`, and `version`; repository Harness work stays in
the agent workflows.

Claude Code plugin metadata is also included:

```bash
claude plugin marketplace add atlax-tech/harness-armor
claude plugin install harness-armor@harness-armor
```

Plugin Skills use namespaced commands such as
`/harness-armor:harness`. Use the standalone installer for exact `/harness`
commands. The marketplace metadata is validated in tests; a real marketplace
installation is not yet part of the verified release evidence.

## Verified for v0.1.2

- **55/55 local tests pass** on macOS, including role-equivalent custom Harness,
  partial-guidance, reference-coverage, version-consistency, installation, and
  workflow regressions.
- Two real repositories were exercised read-only after the fix: a managed
  docs-first repository remained valid and drift-free, while a project-specific
  custom Harness now routes to `harness-check` instead of `harness-promotion`.
- The v0.1.2 release-candidate GitHub Actions matrix must pass before tagging;
  no pending job is presented as successful evidence.
- **Claude Code 2.1.168 on macOS remains verified from v0.1.1** for user/project installation,
  discovery, real `/harness` invocation, conflict protection, and safe uninstall.
- **Codex, Cursor, TRAE, and Claude Marketplace real-client invocation remains
  unverified.** Their layouts and packaged resources are covered by automated
  tests, but those tests are not presented as client proof.
- The package payload contains no runtime npm dependencies and the Python
  runtime uses only the standard library.

See [client compatibility evidence](docs/compatibility.md) and the
[v0.1.2 release-candidate log](docs/development-log/2026-07-11-v0.1.2-release-candidate.md)
for the exact claim boundary.

## Explore the project

- [Product definition](docs/PRODUCT.md)
- [Harness Engineering specification](shared/spec/harness-engineering-v1.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Testing strategy](docs/TESTING.md)
- [Acceptance contract](docs/ACCEPTANCE.md)
- [Changelog](CHANGELOG.md)

Contributions are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md) and
keep changes small, evidence-backed, and independently verifiable.

## Current boundaries

- Harness Armor builds the engineering Harness around a repository; it does not
  implement the repository's product features.
- Deterministic tools can inventory and validate evidence, but the host agent
  must still interpret product meaning.
- The npm publishing identity is unresolved, so no npm registry package is
  claimed or published for v0.1.2.
- This source is available under **CC BY-NC 4.0**, which restricts commercial
  use. Review [the license](LICENSE) before adoption.
