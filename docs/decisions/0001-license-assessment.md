# ADR 0001: License assessment for v0.1.1

Date: 2026-07-11

## Context

Harness Armor is currently licensed under Creative Commons Attribution-
NonCommercial 4.0 International (CC BY-NC 4.0). The repository README and
PRODUCT.md already disclose that this is not an OSI-approved open-source
license because of the NonCommercial restriction.

The phase 2 strategy document (`docs/product/phase2.md`) flagged the license
as a growth and adoption risk. This ADR records the impact and alternatives
without modifying the current LICENSE file.

## Impact of CC BY-NC 4.0

The NonCommercial clause restricts:

- Company internal use beyond personal, learning, or research scope.
- Commercial projects that bundle or redistribute the Skills.
- Developer-tool integrations that ship Harness Armor as a paid feature.
- Community forks intended for commercial deployment.
- Awesome-list and enterprise-curated collections that require OSI licenses.
- Enterprise contributions whose legal teams block non-OSI licenses.

## Alternatives considered

| Option | Code/scripts | Docs/assets | Brand | Trade-off |
| --- | --- | --- | --- | --- |
| Keep CC BY-NC 4.0 | CC BY-NC 4.0 | CC BY-NC 4.0 | Reserved | Maximizes control; limits adoption and commercial use. |
| Split license | Apache-2.0 or MIT | CC BY 4.0 | Reserved | OSI-approved for code; permissive docs; brand still protected. Recommended for broadest adoption. |
| Apache-2.0 all | Apache-2.0 | Apache-2.0 | Reserved | OSI-approved; explicit patent grant; simple to understand. |
| MIT all | MIT | MIT | Reserved | Minimal and permissive; no patent grant. |

## Decision

No license change is made in v0.1.1. The current CC BY-NC 4.0 license remains
in effect. This ADR records the assessment so the maintainer can choose a
split or permissive license in a future release without retroactive ambiguity.

## Compliance note

Until the license changes, the README, README.zh-CN.md, and package metadata
must continue to disclose that CC BY-NC 4.0 is not OSI-approved and that
commercial use requires separate permission.
