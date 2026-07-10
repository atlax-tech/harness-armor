# Distribution-only installer

This directory installs the seven Agent Skills and their canonical shared
runtime. It intentionally has no repository Harness workflow commands.

## Commands and exit codes

Commands: `install`, `update`, `uninstall`, `doctor`, and `version`.

- `0`: success or healthy/current installation;
- `1`: conflict, preserved user change, unhealthy doctor, or not installed;
- `2`: invalid command, option, or target;
- `3`: filesystem or permission failure;
- `4`: corrupt packaged payload;
- `5`: interrupted transaction or lock requiring recovery.

All mutations support `--dry-run`. JSON mode emits one JSON value on stdout.
Update compares the previous manifest hashes with local files and refuses to
overwrite modified or unmanaged content. Uninstall removes only recorded files
whose hashes still match, preserving user changes and neighboring skills.

## Targets

| Target | Destination |
| --- | --- |
| `claude-user` | `~/.claude/skills` |
| `claude-project` | `<project>/.claude/skills` |
| `codex-user` | `~/.agents/skills` |
| `codex-project` | `<project>/.agents/skills` |
| `cursor-user` | `~/.cursor/skills` |
| `cursor-project` | `<project>/.cursor/skills` |
| `trae-project` | `<project>/.agents/skills` |
| `custom` / `generic` | absolute `--dest` |

TRAE and other client claims remain bounded by the compatibility notes in the
README and require real-client release smoke tests.

## Installed layout

Each public Skill is a direct child of the destination. Canonical shared
scripts, schemas, templates, and the install receipt live in the reserved
`.harness-armor/` sibling. Thin Skill wrappers support both this relocated
layout and the repository/plugin source layout without symlinks.
