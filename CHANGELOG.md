# Changelog

All notable changes to Harness Armor are documented here. The project follows
Semantic Versioning and Conventional Commits.

## [0.1.2] - 2026-07-11

### Fixed

- Recognize coherent custom Harnesses through role-equivalent product,
  architecture, verification, continuity, and agent-entry evidence instead of
  requiring Harness Armor's canonical filenames.
- Score custom Harness layouts without zeroing structural dimensions solely
  because `.harness` state or canonical document names are absent.
- Count existing repository paths written as inline code while preserving
  strict checks for explicit Markdown/HTML links; zero coverage and inline-only
  coverage are now reported explicitly without API/package/future-path noise.
- Recognize English and Chinese user-change preservation boundaries.
- Enforce one release version across package, installer, plugins, Python
  runtime, Harness manifest, and all seven Skill metadata blocks.

### Added

- Three real-scenario fixtures covering docs-only guidance, partial legacy
  guidance, and a role-equivalent custom Harness.
- Regression coverage for explicit broken links, zero-reference coverage,
  inline-path ambiguity, and release version consistency.
- Read-only validation evidence from two real repositories.

### Changed

- Bumped the release version to 0.1.2 and synchronized paired English and
  Simplified Chinese release documentation.

## [0.1.1] - 2026-07-11

### Fixed

- Corrected `.harness/unresolved.json` status from the invalid `INFERRED` value
  to `UNRESOLVED`, restoring manifest validation and drift detection on the
  managed repository.
- Synced the stale `docs/PRODUCT.md` fingerprint recorded in the manifest and
  source-index so `detect_drift` reports no drift after the last content edit.

### Added

- Real Claude Code user-level and project-level installation, discovery, and
  invocation smoke test evidence on macOS.
- Executable Codex smoke test script with explicit blocking evidence for the
  unauthenticated/unavailable client.
- License assessment ADR recording the CC BY-NC 4.0 impact on distribution and
  commercial adoption plus alternative licensing options.
- Phase 2 strategy document under version control.
- Expanded package keywords for repository discoverability.

### Changed

- Bumped version to 0.1.1 across package metadata, installer constants, Claude
  marketplace, Codex plugin, and Harness manifest.
- Updated compatibility matrix to separate verified Claude Code results from
  unverified Codex/Cursor/TRAE client invocations.

## [0.1.0] - 2026-07-10

### Added

- Seven independent open Agent Skills: router, init, build, promotion, update,
  check, and prompt generation.
- Versioned Harness Engineering v1 specification, schemas, templates, and
  evidence-state model.
- Eight standard-library Python helpers for scanning, fingerprints, validation,
  references, drift, and health.
- Distribution-only npm installer with Claude, Codex, Cursor, TRAE, and generic
  adapters; staged updates and user-change conflict protection.
- Claude Marketplace and Codex plugin metadata.
- Ten repository fixtures, bilingual trigger corpus, workflow eval contracts,
  45 local tests, and Windows/macOS/Linux CI definitions.
- English and Simplified Chinese documentation plus a branded README visual.
