# Harness Armor agent guide

Harness Armor is a skills-first Harness Engineering toolkit. Keep the seven
`skills/*/SKILL.md` workflows independent; the npm CLI may only distribute and
diagnose them, never perform repository Harness work.

Read before changing behavior:

- Product and boundaries: `docs/PRODUCT.md`
- Architecture and ownership: `docs/ARCHITECTURE.md`
- Development and release rules: `docs/DEVELOPMENT.md`
- Test matrix: `docs/TESTING.md`
- Acceptance contract: `docs/ACCEPTANCE.md`
- Canonical Harness contract: `shared/spec/harness-engineering-v1.md`

Validate with `npm test`. Use Conventional Commits. Add a Chinese development
log entry with manual acceptance steps for each completed phase. Never claim an
unrun test or an unverified client integration passed.

