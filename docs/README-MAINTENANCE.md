# README Maintenance Strategy

`README.md` and `README.zh-CN.md` are the product landing pages for Harness
Armor. They are paired release artifacts, not implementation reference manuals.
Every release must review both files against the final release candidate before
the version is tagged.

## Goals

- Explain the product value before implementation details.
- Let a new user reach a verified first invocation quickly.
- Keep English and Simplified Chinese claims equivalent.
- Present only evidence that exists on the release candidate.
- Move deep architecture, internals, and test design to focused documents.

## Paired-language contract

Both README files are mandatory parts of every release review.

- Maintain the same product promise, supported Skills, installation paths,
  safety guarantees, compatibility status, limitations, and license boundary.
- Mirror every release-facing factual change in both languages in the same pull
  request. Translation may be idiomatic; meaning and evidence must not diverge.
- Keep commands, versions, filenames, links, client names, and verification
  counts identical unless a language-specific destination is intentional.
- If the review produces no text change in one language, record that no-op
  review and its reason in the release development log. A silent omission does
  not count as maintenance.
- Block tagging when either README is stale, contradictory, or missing evidence.

## Product-page structure

Keep the landing page concise and use progressive disclosure. The normal order
is:

1. Hero, product name, one-line value proposition, and meaningful badges.
2. A short explanation of the user problem and Harness Armor's outcome.
3. Quick start with commands that work from the documented distribution source.
4. The repository-to-Harness workflow and the seven public Skills.
5. Safety and evidence boundaries.
6. Supported installation targets and verified compatibility status.
7. Links to product, specification, architecture, testing, acceptance, changelog,
   and contribution documents.
8. Current limitations and the CC BY-NC 4.0 commercial-use boundary.

Avoid long inventories of helper scripts, schemas, internal directories, or test
fixtures on the landing page. Link to the authoritative document instead.

## Source-of-truth audit

Before editing either README, read the final release candidate and reconcile at
least these sources:

| README claim | Authority or evidence |
| --- | --- |
| Product promise and boundaries | `docs/PRODUCT.md`, `docs/ACCEPTANCE.md` |
| Public workflows and behavior | `skills/*/SKILL.md`, `shared/spec/harness-engineering-v1.md` |
| Version | `package.json`, `VERSION`, installer/plugin metadata, `.harness/manifest.json` |
| Install and lifecycle commands | `installer/cli.js`, `installer/adapters.js`, installation tests |
| Changes in this release | `CHANGELOG.md`, commits since the previous tag |
| Local verification | Commands executed on the release candidate |
| Cross-platform verification | GitHub Actions Check Runs for the release-candidate SHA |
| Real-client compatibility | `docs/compatibility.md` and dated smoke-test evidence |
| Distribution availability | Actual npm/GitHub/Marketplace state, not future intent |
| License | `LICENSE`, relevant decisions under `docs/decisions/` |

Do not infer availability from package metadata, infer platform success from a
workflow definition, or infer client support from an installation layout.

## Required release workflow

1. Start from a clean checkout synchronized with the final remote `main` release
   candidate.
2. Read the previous release README files, the new CHANGELOG entry, and the diff
   since the previous tag.
3. Build a release-facing fact list: version, capabilities, commands,
   distribution channels, verified platforms/clients, limitations, and license.
4. Update `README.md` and `README.zh-CN.md` together. Preserve equivalent claims
   while using natural language in each version.
5. Check every command and local link. Remove or qualify commands for a package,
   marketplace, client, or platform that is not actually available.
6. Run the local release checks:

   ```bash
   npm test
   npm run lint:markdown
   npm pack --dry-run --json
   ```

7. Open a pull request and require the quality workflow plus every cross-platform
   matrix job to pass on the final commit. Run the path-filtered Evals workflow
   manually when it did not run for that SHA.
8. Render both README files on GitHub and inspect the hero, badges, tables, code
   blocks, language switch, links, and mobile-width readability.
9. Add a Chinese development log entry containing the evidence, limitations,
   paired-language review result, and manual acceptance steps.
10. Re-read both README files from the final `main` SHA. Only then may the release
    tag and GitHub Release be created.

## Release-blocking failures

Do not release when any of the following is true:

- Only one language was reviewed after release-facing facts changed.
- A version, command, file path, installation target, or link is inconsistent.
- A README claims an npm package or marketplace entry that is not available.
- A configured workflow is described as passed without a successful run on the
  release candidate.
- A structural adapter test is presented as a real-client invocation.
- Local or remote release checks failed, remain pending, or were not run.
- README claims conflict with CHANGELOG, compatibility evidence, product
  boundaries, acceptance criteria, or the license.

## Manual acceptance checklist

- [ ] English and Simplified Chinese were both reviewed in the release PR.
- [ ] Release-facing facts are equivalent across both files.
- [ ] Quick-start commands were checked against the actual distribution state.
- [ ] Versions, badges, links, support claims, and limitations are current.
- [ ] Local tests, Markdown checks, and dry-run package inspection passed.
- [ ] Required GitHub Actions passed on the final release-candidate SHA.
- [ ] Unverified clients and platforms are explicitly labeled unverified.
- [ ] Both rendered pages are readable on desktop and narrow/mobile widths.
- [ ] The Chinese development log records evidence and manual acceptance steps.
