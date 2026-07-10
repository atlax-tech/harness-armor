# Acceptance

Harness Armor is acceptable only when:

- all seven skills validate and are independently discoverable;
- router fixtures map every repository state to the documented specialist;
- helper scripts execute with stable JSON and exit-code behavior;
- write workflows preserve existing files without authorization;
- managed state records sources and detects drift;
- prompt generation separates execute, test, and review roles;
- the distribution CLI exposes only install, update, uninstall, doctor, and
  version behavior;
- direct and plugin layouts retain every skill resource;
- fixtures, trigger evals, workflow evals, installation tests, and reference
  checks pass;
- README commands match executable behavior;
- unrun client/platform checks are explicitly reported as unverified.

## Manual acceptance

Follow `docs/manual-acceptance.md` on a clean temporary home directory and on a
throwaway repository for each state. Inspect proposed diffs before authorizing
writes and confirm uninstall leaves user-modified files untouched.

