# Client compatibility evidence

Evidence checked: 2026-07-10.

## Open Agent Skills

The public structure follows the [Agent Skills specification](https://agentskills.io/specification):
each Skill has a matching lowercase directory/name, YAML frontmatter,
`SKILL.md`, and shallow `scripts/`, `references/`, and `assets/` resources.

## OpenAI Codex

Current official Codex guidance documents explicit `$skill-name` invocation,
implicit description matching, repository `.agents/skills`, user
`~/.agents/skills`, and optional `agents/openai.yaml`. Harness Armor tests both
direct layouts and relocated script execution. A real authenticated Codex
invocation has not run in this checkout.

- [Codex: Build skills](https://developers.openai.com/codex/skills)

## Claude Code

Standalone Skill installation supports the exact unnamespaced `/harness-*`
commands requested by this project. Current plugin documentation namespaces
plugin Skills, so Marketplace calls use `/harness-armor:harness-*`. The
repository validates marketplace JSON and referenced Skill paths; a real
Marketplace installation has not run in this checkout.

- [Claude Code plugins](https://code.claude.com/docs/en/plugins)
- [Claude Code skills/slash commands](https://code.claude.com/docs/en/slash-commands)

## Cursor

The installer implements documented user `~/.cursor/skills` and project
`.cursor/skills` targets and validates their copied contents. Native client
discovery/invocation remains an unrun release smoke test.

- [Cursor Skills](https://cursor.com/docs/skills)

## TRAE

The project adapter installs to `.agents/skills`, an open Agent Skills layout
documented for TRAE projects. No global TRAE path is invented. Native client
discovery/invocation remains an unrun release smoke test.

- [TRAE Skills guide](https://www.trae.ai/blog/trae_tutorial_0115)

## Claim policy

Directory/resource tests prove packaging, not an external client's UI or
trigger behavior. README support rows therefore separate adapter tests from
real-client invocation. Only an actual authenticated client smoke test can move
the latter to verified.
