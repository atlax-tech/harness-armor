# Product

## Definition

Harness Armor is an open-source Agent Skills suite that equips a repository
with a maintainable Harness Engineering system.

> Suit up any repository with a maintainable Harness Engineering system.

## Users

- Teams using AI coding agents in new, documented, legacy, or already-managed
  repositories.
- Maintainers who need product, architecture, implementation, tests, and
  acceptance evidence to remain traceable.
- Claude Code, OpenAI Codex, and open Agent Skills compatible clients.

## Product surface

The product is seven explicit skills: `harness`, `harness-init`,
`harness-build`, `harness-promotion`, `harness-update`, `harness-check`, and
`harness-prompt`. The host agent reads the repository, applies the selected
workflow, requests authorization at the documented gate, edits only the
allowed files, and verifies the result.

The npm package and Claude/Codex/client adapters only install, update,
uninstall, or diagnose the skills. They do not implement Harness workflows as
traditional CLI subcommands.

## Safety contract

- Distinguish confirmed facts, inferences, unresolved gaps, and conflicts.
- Never invent product behavior, silently lower requirements, or treat a
  placeholder as complete.
- Default scans and checks to read-only.
- Require an explicit user authorization gate for proposed updates and any
  overwrite of existing user-owned content.
- Preserve source evidence and report tests as passed only when they ran.

## Known unresolved release inputs

The public GitHub owner and final npm publishing scope are intentionally
unresolved. Documentation uses `<owner>` until a release owner is supplied.

