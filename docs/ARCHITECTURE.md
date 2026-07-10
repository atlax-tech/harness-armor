# Architecture

## Runtime model

```text
explicit or implicit skill selection
  -> host agent loads SKILL.md
  -> deterministic scanner builds machine-readable evidence
  -> host agent reads relevant code and documents
  -> host agent classifies facts and plans changes
  -> authorization gate (when writes are proposed)
  -> host agent edits repository files
  -> deterministic validators + project verification
  -> evidence-first result and manual acceptance steps
```

## Ownership

- `skills/`: seven public workflows. Each skill owns its trigger boundary,
  workflow, references, templates, and thin script entry points.
- `shared/spec/`: the sole normative Harness Engineering contract.
- `shared/scripts/`: standard-library Python implementation for deterministic,
  read-only scanning, hashing, validation, drift detection, and health scoring.
- `shared/schemas/`: versioned JSON contracts used by scripts and generated
  Harness state.
- `shared/templates/`: neutral, fact-safe output templates.
- `installer/`: distribution-only Node.js implementation and target adapters.
- `tests/`: executable structural, script, fixture, workflow, trigger, and
  installation checks.

## Relocated installation layout

Source and plugin installs retain `skills/` and `shared/`. Direct client
installs place each public skill at the client skill root and the canonical
runtime at a reserved `.harness-armor/` sibling. Skill wrappers resolve either
layout without symlinks. The installer manifest owns only paths it created.

## Data model

Managed repositories store `.harness/manifest.json`, `source-index.json`, and
`unresolved.json`. The manifest records specification version, managed files,
source fingerprints, and ownership. Drift compares current hashes with that
record; it does not infer business meaning.

