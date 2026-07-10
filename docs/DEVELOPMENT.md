# Development

## Requirements

- Python 3.9 or newer, standard library only for runtime scripts.
- Node.js 18 or newer for the installer and test runner.
- Git for contributor workflow.

## Commands

```bash
npm test
npm run test:scripts
npm run test:skills
npm run test:fixtures
npm run test:installation
npm run lint:markdown
```

## Change rules

- Keep public workflows in `SKILL.md`; do not add Harness business commands to
  the npm CLI.
- Update `shared/spec/` first when changing a normative rule, then update tests
  and only the affected skill references.
- Keep deterministic scripts read-only unless a script's sole, documented role
  is distribution or test-fixture setup.
- Use Conventional Commits and small reviewable phases.
- Add `docs/development-log/YYYY-MM-DD-<phase>.md` in Chinese. Include executed
  checks, results, limitations, and manual acceptance steps.

## Release discipline

Never publish from tests. Verify the package tarball, a clean install, update,
conflict handling, uninstall ownership, plugin metadata, and documentation
commands before tagging a release.

