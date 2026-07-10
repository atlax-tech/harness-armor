# Client compatibility evidence

Evidence checked: 2026-07-11 (v0.1.2, v0.1.1), 2026-07-10 (v0.1.0).

## v0.1.2 real-repository workflow evidence

- `send-page-to-gpt`: the managed docs-first repository remained
  `MANAGED_HARNESS`; structure validation passed, drift was empty, and 35 local
  references were checked with no broken explicit link.
- `craeer_echo-fkboss-finder`: a role-equivalent custom Harness with project-
  specific filenames now routes to `CUSTOM_HARNESS -> harness-check`; 237
  existing inline repository paths were counted with an explicit inline-only
  coverage warning. Its project `npm run lint` and 43/43 tests passed.
- Both checks were read-only. The second repository's pre-existing diff hash
  stayed `03fbed12c8def3713a385d9c6282bb10811399f32f43b63a63ab2a05f64fbc14`.
- This is source-workflow evidence from the current Codex-hosted development
  session, not an installed Codex client discovery/invocation smoke test.

## v0.1.1 verified evidence

### Claude Code (real client)

- Client: `claude` 2.1.168 on macOS, authenticated.
- User-level install: 77 payload files, 7 Skills at `~/.claude/skills/`,
  `doctor` healthy.
- Project-level install: 77 payload files at `.claude/skills/`, `doctor`
  healthy.
- Real invocation: `claude -p "/harness"` discovered the router Skill, read
  the repository, detected the EMPTY state, and requested write authorization
  before creating Harness files. Both user-level and project-level discovery
  succeeded.
- Conflict protection: modifying an installed `SKILL.md` and running `update`
  reported 1 conflict without overwriting the user edit.
- Safe uninstall: the user-modified file was preserved; 76 owned files removed.
- Executable smoke script: `tests/scripts/claude-smoke.sh`.

### Codex (blocking evidence)

- `command -v codex` => not found on this checkout.
- Executable smoke script `tests/scripts/codex-smoke.sh` exits with code 2 and
  prints the blocking evidence when Codex is unavailable or unauthenticated.
- The script covers codex-user/codex-project install, doctor, real `$harness`
  invocation, idempotent reinstall, conflict protection, and safe uninstall
  once a real client is available.

## Open Agent Skills

The public structure follows the [Agent Skills specification](https://agentskills.io/specification):
each Skill has a matching lowercase directory/name, YAML frontmatter,
`SKILL.md`, and shallow `scripts/`, `references/`, and `assets/` resources.

## OpenAI Codex

Current official Codex guidance documents explicit `$skill-name` invocation,
implicit description matching, repository `.agents/skills`, user
`~/.agents/skills`, and optional `agents/openai.yaml`. Harness Armor tests both
direct layouts and relocated script execution. A real authenticated Codex
invocation has not run in this checkout; run `tests/scripts/codex-smoke.sh`
when a client is available.

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
