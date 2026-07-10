import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { PYTHON, ROOT, fixture, hashTree, runJson } from "../helpers.js";

const oracle = JSON.parse(fs.readFileSync(path.join(ROOT, "tests", "fixture-oracles", "repository-states.json"), "utf8"));

for (const [name, expected] of Object.entries(oracle)) {
  test(`fixture ${name} classifies and routes correctly`, () => {
    const root = fixture(name);
    const before = hashTree(root);
    const result = runJson(PYTHON, [path.join("shared", "scripts", "detect_repository_state.py"), root]);
    assert.equal(result.status, 0, `${result.stderr}\n${result.stdout}`);
    assert.equal(result.json.state, expected.state);
    assert.equal(result.json.recommended_skill, expected.route);
    assert.ok(result.json.evidence.length > 0);
    assert.equal(result.json.read_only, true);
    assert.equal(hashTree(root), before);
  });
}

test("managed routing safely defaults to check while sync intent selects update", () => {
  assert.equal(oracle["managed-harness-repo"].route, "harness-check");
  const routing = fs.readFileSync(path.join(ROOT, "skills", "harness", "references", "routing.md"), "utf8");
  assert.match(routing, /sync.*harness-update/is);
  assert.match(routing, /bare router call defaults.*harness-check/is);
});
