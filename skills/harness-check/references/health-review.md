# Health review rubric

## Scoring

Use the weights from the shared health dimensions file. A dimension earns
points only for observed evidence. Deduct with a path/locator and reasoning.
Mark an unassessed semantic dimension explicitly; do not replace it with a
file-count heuristic.

## Severity

- `BLOCKING`: permits unsafe writes, contradicts requirements, exposes secrets,
  claims false verification, or prevents reliable project understanding.
- `HIGH`: meaningful drift, broken traceability, misleading architecture,
  invalid commands, or missing ownership that can cause bad changes.
- `IMPROVEMENT`: clarity, context efficiency, or portability issue with a safe
  current path.

## Metamorphic checks

Adding duplicated documents must not increase health. Rewording without adding
evidence must not erase a deduction. A custom filename may receive full credit
when its authority and links are clear.

## Overall score

Sum dimension points out of 100. Keep machine score and semantic review visible
when their coverage differs. The overall score never overrides a blocking issue.

