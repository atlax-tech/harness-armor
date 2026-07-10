# Contributing to Harness Armor

Thank you for improving safer AI-agent engineering.

1. Read `AGENTS.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, and the canonical
   shared specification.
2. Create a focused branch and keep Skills-first product boundaries intact.
3. Add or update a fixture, trigger near-miss, or deterministic assertion for
   behavior changes.
4. Run `npm test`, `npm run lint:markdown`, and `npm pack --dry-run --json`.
5. Add a Chinese development log with actual results and manual acceptance.
6. Use a Conventional Commit and open a pull request with evidence.

Do not add a Harness business CLI command, an external LLM dependency to helper
scripts, an unverified native client claim, or a silent overwrite path.

