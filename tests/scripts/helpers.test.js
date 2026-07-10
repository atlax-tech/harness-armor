import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { PYTHON, ROOT, copyFixture, fixture, hashTree, removeTree, run, runJson, temporaryDirectory } from "../helpers.js";

const scripts = [
  "detect_repository_state.py",
  "scan_repository.py",
  "fingerprint_sources.py",
  "validate_manifest.py",
  "validate_harness_structure.py",
  "check_references.py",
  "detect_drift.py",
  "score_harness_health.py",
];

test("all deterministic helpers expose --help", () => {
  for (const script of scripts) {
    const result = run(PYTHON, [path.join("shared", "scripts", script), "--help"]);
    assert.equal(result.status, 0, `${script}: ${result.stderr}`);
    assert.match(result.stdout, /usage:/i);
  }
});

test("scanner is read-only, ignores secrets/dependencies, and rejects escaping symlinks", () => {
  const root = temporaryDirectory();
  const outside = temporaryDirectory("harness-armor-outside-");
  try {
    fs.writeFileSync(path.join(root, "visible.py"), "print('ok')\n");
    fs.writeFileSync(path.join(root, ".env"), "TOKEN=secret-canary\n");
    fs.mkdirSync(path.join(root, "node_modules"));
    fs.writeFileSync(path.join(root, "node_modules", "leak.js"), "secret-canary\n");
    fs.writeFileSync(path.join(outside, "outside.txt"), "outside-canary\n");
    const link = path.join(root, "outside-link");
    fs.symlinkSync(outside, link, process.platform === "win32" ? "junction" : "dir");
    const before = hashTree(root);
    const result = runJson(PYTHON, [path.join(ROOT, "shared", "scripts", "scan_repository.py"), root]);
    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.json);
    assert.deepEqual(result.json.files.map((item) => item.path), ["visible.py"]);
    assert.ok(result.json.skipped.some((item) => item.reason === "sensitive-name"));
    assert.ok(result.json.skipped.some((item) => item.reason === "excluded-directory"));
    assert.ok(result.json.skipped.some((item) => item.reason === "symlink-directory"));
    assert.doesNotMatch(result.stdout, /secret-canary|outside-canary/);
    assert.equal(hashTree(root), before);
  } finally {
    removeTree(root);
    removeTree(outside);
  }
});

test("scanner returns exit 4 and explicit truncation at safety limit", () => {
  const root = temporaryDirectory();
  try {
    fs.writeFileSync(path.join(root, "a.txt"), "a\n");
    fs.writeFileSync(path.join(root, "b.txt"), "b\n");
    const result = runJson(PYTHON, [path.join(ROOT, "shared", "scripts", "scan_repository.py"), root, "--max-files", "1"]);
    assert.equal(result.status, 4);
    assert.equal(result.json.summary.truncated, true);
    assert.equal(result.json.summary.truncation_reason, "max-files");
  } finally { removeTree(root); }
});

test("manifest validator rejects traversal paths", () => {
  const root = temporaryDirectory();
  try {
    fs.mkdirSync(path.join(root, ".harness"));
    fs.writeFileSync(path.join(root, ".harness", "source-index.json"), "{}\n");
    fs.writeFileSync(path.join(root, ".harness", "unresolved.json"), "{}\n");
    fs.writeFileSync(path.join(root, ".harness", "manifest.json"), JSON.stringify({
      schema_version: "1.0.0",
      spec_version: "1.0.0",
      generator: { name: "harness-armor", version: "0.1.0" },
      repository_state: "MANAGED_HARNESS",
      managed_files: [{ path: "../escape.md", owner: "harness-armor", mode: "managed" }],
      source_index: ".harness/source-index.json",
      unresolved_index: ".harness/unresolved.json",
      last_updated: "2026-07-10T00:00:00Z",
    }));
    const result = runJson(PYTHON, [path.join(ROOT, "shared", "scripts", "validate_manifest.py"), root]);
    assert.equal(result.status, 1);
    assert.equal(result.json.valid, false);
    assert.ok(result.json.errors.some((item) => item.path.includes("managed_files")));
  } finally { removeTree(root); }
});

test("drift detector reports the seeded source modification read-only", () => {
  const root = fixture("drifted-harness-repo");
  const before = hashTree(root);
  const result = runJson(PYTHON, [path.join("shared", "scripts", "detect_drift.py"), root]);
  assert.equal(result.status, 1);
  assert.equal(result.json.has_drift, true);
  assert.ok(result.json.drift.some((item) => item.category === "source-modified" && item.path === "docs/PRODUCT.md"));
  assert.equal(hashTree(root), before);
});

test("duplicate documents do not improve machine health score", () => {
  const root = copyFixture("custom-harness-repo");
  try {
    const before = runJson(PYTHON, [path.join(ROOT, "shared", "scripts", "score_harness_health.py"), root]);
    fs.writeFileSync(path.join(root, "docs", "DUPLICATE-ONE.md"), fs.readFileSync(path.join(root, "docs", "PRODUCT.md")));
    fs.writeFileSync(path.join(root, "docs", "DUPLICATE-TWO.md"), fs.readFileSync(path.join(root, "docs", "PRODUCT.md")));
    const after = runJson(PYTHON, [path.join(ROOT, "shared", "scripts", "score_harness_health.py"), root]);
    assert.equal(after.json.score, before.json.score);
  } finally { removeTree(root); }
});

