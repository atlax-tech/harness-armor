# Design

## Principles

1. Skills are the product; installation is plumbing.
2. Evidence precedes conclusions.
3. Progressive disclosure keeps each `SKILL.md` concise.
4. Deterministic scripts collect facts; the host agent interprets semantics.
5. Read-only diagnosis is safe by default; writes are explicit and reviewable.
6. A short `AGENTS.md` is a map, not a duplicated manual.

## Skill experience

Every specialist skill exposes the same predictable shape: applicability,
inputs, workflow, authorization boundary, allowed and forbidden changes,
validation, failure handling, and a fixed result report. Shared rules are
linked rather than copied. The router reports state evidence and routes once;
it does not perform a specialist workflow itself.

## Status vocabulary

- `CONFIRMED`: directly supported by a named source or inspected code.
- `INFERRED`: reasoned conclusion with its evidence and uncertainty shown.
- `UNRESOLVED`: required knowledge not supported by current evidence.
- `CONFLICTED`: two or more sources disagree and no authorized resolution exists.

