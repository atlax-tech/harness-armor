# Testing

## Layers

1. Skill specification validation: frontmatter, names, concise descriptions,
   resource references, required workflow sections, and Open Agent Skills rules.
2. Script tests: help, JSON contracts, exit codes, limits, ignore handling,
   symlink escape prevention, hashing, drift, and health scoring.
3. Fixture workflows: repository-state routing and safety behavior across ten
   representative repository shapes.
4. Trigger evals: explicit, natural-language, adjacent-skill, refusal, English,
   and Chinese cases.
5. Installation tests: every target, updates, conflicts, ownership-safe
   uninstall, custom paths, and relocated script execution.
6. Platform CI: Ubuntu, macOS, and Windows.

## Evidence policy

Local runs prove behavior on the current platform. CI workflow definitions and
platform-safe unit tests do not prove remote platforms passed until their jobs
have actually run. Final reporting must keep those claims separate.

