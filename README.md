<p align="center">
  <img src="assets/harness-armor-hero.png" alt="A software repository fitted with modular documentation, architecture, test, and verification armor" width="100%">
</p>

<h1 align="center">Harness Armor</h1>

<p align="center"><strong>Suit up any repository with a maintainable Harness Engineering system.</strong></p>

<p align="center">
  <a href="https://agentskills.io/specification"><img alt="Agent Skills: open standard" src="https://img.shields.io/badge/Agent%20Skills-open%20standard-F97316"></a>
  <a href="LICENSE"><img alt="License: CC BY-NC 4.0" src="https://img.shields.io/badge/license-CC%20BY--NC%204.0-111827"></a>
  <img alt="Local tests: 47 passing" src="https://img.shields.io/badge/local%20tests-47%20passing-16A34A">
  <img alt="No runtime dependencies" src="https://img.shields.io/badge/runtime%20dependencies-0-0891B2">
</p>

<p align="center"><a href="README.md">English</a> · <a href="README.zh-CN.md">简体中文</a></p>

Harness Armor is an **Agent Skills** suite for **Harness Engineering** across
**Claude Code**, **OpenAI Codex**, **Cursor**, **TRAE**, and other **AI coding
agents**. It turns `AGENTS.md`, product knowledge, architecture, tests,
acceptance evidence, and safe change boundaries into maintainable **repository
automation**—so **Vibe coding** can grow into evidence-driven engineering.

The product is seven explicit Skills. The host agent reads your real repository,
uses deterministic scanners for facts, proposes scoped work, crosses the right
authorization gate, and verifies the outcome. npm only installs those Skills;
it never substitutes a traditional CLI for the agent workflow.

> **The shortest mental model:** the agent understands meaning; the scripts
> inventory, hash, and validate evidence.

---

## Install in 60 seconds

### Claude Code — exact `/harness` commands

```bash
npx harness-armor install --target claude-user
```

Then open Claude Code in any repository:

```text
/harness
```

Project-only install:

```bash
npx harness-armor install --target claude-project --project-root .
```

### OpenAI Codex — exact `$harness` mentions

```bash
npx harness-armor install --target codex-user
```

Then:

```text
$harness
```

Project-only install:

```bash
npx harness-armor install --target codex-project --project-root .
```

Codex discovers user Skills under `~/.agents/skills` and repository Skills
under `.agents/skills`. Each Skill also ships optional `agents/openai.yaml` UI
metadata; the public workflow does not depend on it.

### Interactive shortcut

In an interactive terminal, bare `npx harness-armor` installs to the Claude Code
user Skill directory. Scripts and CI should always pass an explicit `--target`.

---

## One router, six specialists

```text
                         /harness · $harness
                                  │
                       evidence-backed state scan
                                  │
          ┌───────────────┬───────┴────────┬─────────────────┐
          ▼               ▼                ▼                 ▼
       EMPTY          DOCS_ONLY       LEGACY_CODE       HAS A HARNESS
          │               │                │                 │
    harness-init    harness-build   harness-promotion   check / update
                                                               │
                                  concrete plan ───────► harness-prompt
```

| Skill | Use it when | What it produces | Write model |
| --- | --- | --- | --- |
| `harness` | You do not know where to start | State, evidence, and one route | Always read-only |
| `harness-init` | The repository is empty/basic-only | Fact-safe docs and state skeleton | New non-conflicting Harness files |
| `harness-build` | Product docs exist, code does not | Source-linked product-specific Harness | New/approved Harness files only |
| `harness-promotion` | Real legacy code lacks an agent Harness | Current architecture, commands, risks, boundaries | Docs/state only; no refactor |
| `harness-update` | A managed repository changed | Drift evidence and immutable file-level plan | Writes only after separate approval |
| `harness-check` | A managed/custom/mixed Harness needs an audit | Evidence-backed health score and findings | Always read-only |
| `harness-prompt` | A real implementation plan exists | Execute/test/review prompts per step | New prompt tree; no implementation |

Claude standalone invocation uses `/harness-*`; Codex uses `$harness-*`:

```text
/harness                 $harness
/harness-init            $harness-init
/harness-build           $harness-build
/harness-promotion       $harness-promotion
/harness-update          $harness-update
/harness-check           $harness-check
/harness-prompt          $harness-prompt
```

If the user already names a specialist task, the router does not force them
through onboarding again.

---

## Repository state routing

| State | Evidence shape | Default route |
| --- | --- | --- |
| `EMPTY` | No substantive files, or only README/LICENSE/editor basics | `harness-init` |
| `DOCS_ONLY` | Product/design/requirements sources, no business code | `harness-build` |
| `LEGACY_CODE` | Business code without a complete Harness | `harness-promotion` |
| `MANAGED_HARNESS` | Valid `.harness/manifest.json` | `harness-check`; `harness-update` for sync intent |
| `CUSTOM_HARNESS` | Coherent non-Harness-Armor guidance | `harness-check` |
| `MIXED_OR_CONFLICTED` | Invalid managed state or contradictory evidence | `harness-check`, read-only |

The detector returns a candidate, confidence, evidence, and uncertainties. The
host agent reads the relevant files before finalizing semantic conflicts.

---

## Safety is the workflow

Harness Armor does not confuse speed with permission.

1. **Evidence first** — every project conclusion is `CONFIRMED`, `INFERRED`,
   `UNRESOLVED`, or `CONFLICTED` and points to a source.
2. **Read before write** — the agent loads applicable instructions, product
   context, architecture, tests, and ownership before planning edits.
3. **File-level perimeter** — each Skill declares allowed and forbidden paths.
4. **Separate authorization** — `harness-update` writes nothing—not even a
   timestamp—until the user approves the displayed plan.
5. **No silent overwrite** — user changes and managed-section conflicts stop the
   workflow.
6. **Real evidence** — unrun tests are reported as unrun; placeholders are not
   completion.
7. **Independent roles** — generated execute, test, and review prompts cannot
   collapse into executor self-approval.

Deterministic scanners exclude secrets, dependencies, caches, and build output;
respect `.gitignore`; skip symlinks; impose file/byte limits; and default to
read-only JSON.

---

## Internal helper scripts

The Skills call focused Python 3.9+ standard-library helpers. They do not call an
LLM API and do not edit business code.

| Script | Purpose |
| --- | --- |
| `detect_repository_state.py` | Candidate state, evidence, confidence, route |
| `scan_repository.py` | Bounded inventory with exclusions and file kinds |
| `fingerprint_sources.py` | Stable SHA-256 evidence fingerprints |
| `validate_manifest.py` | Managed-state and ownership validation |
| `validate_harness_structure.py` | Required files, manifest, and local links |
| `check_references.py` | Broken Markdown/resource/asset/script references |
| `detect_drift.py` | Source and managed-content fingerprint changes |
| `score_harness_health.py` | Machine-verifiable dimensions and deduction evidence |

Stable exit codes are `0` success, `1` findings, `2` usage, `3` operational
failure, and `4` safety-limit truncation.

---

## Installation options

### Claude Code Plugin Marketplace

```bash
claude plugin marketplace add <owner>/harness-armor
claude plugin install harness-armor@harness-armor
```

Current Claude Code plugin Skills are namespaced. Marketplace invocation is:

```text
/harness-armor:harness
/harness-armor:harness-init
```

Use the standalone `claude-user` or `claude-project` installer when exact
unnamespaced `/harness` and `/harness-init` calls are required.

### Cursor

```bash
npx harness-armor install --target cursor-user
# or
npx harness-armor install --target cursor-project --project-root .
```

### TRAE

```bash
npx harness-armor install --target trae-project --project-root .
```

TRAE project installation uses the open `.agents/skills` layout. Real-client
discovery/invocation remains a release smoke test in this repository.

### Generic Agent Skills client

```bash
npx harness-armor install --target generic --dest /absolute/path/to/skills
```

Clients without a verified native directory are documented as **Generic Agent
Skills compatible**; Harness Armor does not invent native support claims.

### Update, doctor, and uninstall

```bash
npx harness-armor@latest update --target codex-user
npx harness-armor doctor --target codex-user
npx harness-armor uninstall --target codex-user
npx harness-armor version
```

The installer hashes every owned file. Update refuses local modifications,
stages the complete incoming suite, and rolls back failed replacement. Uninstall
removes only owned files whose hashes still match and preserves user changes.

> The CLI accepts only `install`, `update`, `uninstall`, `doctor`, and `version`.
> `harmor init`, `harmor build`, and similar business commands do not exist.

---

## Compatibility status

| Client / platform | Install adapter | Metadata/structure test | Real-client invocation |
| --- | --- | --- | --- |
| Claude Code standalone | user + project | Local tests pass | Not run in this checkout |
| Claude Code Marketplace | `.claude-plugin/marketplace.json` | JSON/resource tests pass | Not run; namespaced calls documented |
| OpenAI Codex | user + project | Local layout + relocated scripts pass | Not run in this checkout |
| Cursor | user + project | Local adapter tests pass | Not run in this checkout |
| TRAE | project `.agents/skills` | Local adapter tests pass | Not run in this checkout |
| Generic client | absolute destination | End-to-end local smoke passes | Client-specific |
| macOS | local development host | **47/47 tests pass** | Verified locally |
| Linux | GitHub Actions matrix configured | Not yet run | Unverified |
| Windows | GitHub Actions matrix configured | Not yet run | Unverified |

See [the dated compatibility notes](docs/compatibility.md) for the evidence and
claim boundary.

---

## What gets added to a managed repository

The host agent tailors the output to evidence; it does not blindly dump every
possible file.

```text
AGENTS.md                         short entry and knowledge map
docs/
├── PRODUCT.md                    product truth and requirement sources
├── ARCHITECTURE.md               current/proposed architecture, clearly separated
├── DESIGN.md                     user and system design constraints
├── DEVELOPMENT.md                verified commands and change rules
├── TESTING.md                    verification strategy
├── ACCEPTANCE.md                 completion evidence and manual checks
├── ROADMAP.md                    sourced plan
├── decisions/                    durable decisions
└── development-log/              actual changes and acceptance steps
.harness/
├── manifest.json                 versions, ownership, managed paths
├── source-index.json             source locators and SHA-256 fingerprints
└── unresolved.json               gaps and conflicts
```

`AGENTS.md` stays short. Details live in focused documents and are linked, not
copied to manufacture a feeling of completeness.

---

## Repository architecture

```text
skills/                           seven independent public workflows
shared/
├── spec/                         canonical Harness Engineering v1 contract
├── schemas/                      manifest/source/unresolved/scan schemas
├── templates/                    fact-safe neutral templates
├── scripts/                      deterministic Python evidence engine
└── evals/                        health, trigger, and workflow contracts
installer/                        distribution-only Node.js installer
tests/
├── fixtures/                     ten repository shapes
├── scripts/                      safety, limits, drift, health
├── skills/                       open Skill structure and boundaries
├── installation/                 adapters, relocation, conflicts, uninstall
└── evals/                        bilingual trigger/workflow corpus checks
```

Source/plugin layouts keep `skills/` and `shared/` together. Direct installs put
the seven Skills at the client Skill root and the canonical runtime in a
manifest-owned `.harness-armor/` sibling. No symlinks are used.

---

## Verification

```bash
npm test
npm run lint:markdown
npm pack --dry-run --json
```

The local suite covers 47 tests with zero skips. CI defines skill validation,
script tests, all fixture routes, trigger/workflow contracts, broken references,
Markdown checks, package inspection, and Windows/macOS/Linux installation
matrices. A workflow definition is not a passing remote run; check Actions
before making a release claim.

---

## Customize and extend

- Change normative behavior in `shared/spec/` first.
- Keep `SKILL.md` concise and move deep rules to `references/`, output templates
  to `assets/`, and deterministic work to `scripts/`.
- Add trigger near-misses whenever adjacent Skill boundaries change.
- Add a fixture oracle before supporting a new repository state signal.
- Add a native client adapter only after its official directory and invocation
  behavior are documented and smoke-tested.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Limitations

- Deterministic scripts cannot understand product semantics; the host agent must
  read the relevant sources.
- `MIXED_OR_CONFLICTED` is intentionally conservative.
- Real Claude Code, Codex, Cursor, and TRAE invocation tests require those
  clients and authenticated environments; they are not simulated as "passed."
- The public owner and npm publishing identity are unresolved, so Marketplace
  commands retain `<owner>` until release configuration.
- The repository is publicly available under CC BY-NC 4.0. The non-commercial
  restriction means this is not an OSI-approved open-source license.

## License

[Creative Commons Attribution-NonCommercial 4.0 International](LICENSE).
Personal, learning, and research use is welcome; attribution is required for
public derivatives, and commercial use needs separate permission.
