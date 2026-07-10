import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { ROOT } from "../helpers.js";

const skills = ["harness", "harness-init", "harness-build", "harness-promotion", "harness-update", "harness-check", "harness-prompt"];
const triggers = JSON.parse(fs.readFileSync(path.join(ROOT, "shared", "evals", "trigger-evals.json"), "utf8"));
const workflows = JSON.parse(fs.readFileSync(path.join(ROOT, "shared", "evals", "workflow-evals.json"), "utf8"));
const creatorEvals = JSON.parse(fs.readFileSync(path.join(ROOT, "shared", "evals", "evals.json"), "utf8"));

test("trigger corpus covers explicit and natural EN/ZH cases for every Skill", () => {
  assert.equal(triggers.schema_version, "1.0.0");
  const ids = new Set();
  for (const item of triggers.cases) {
    assert.ok(item.id && !ids.has(item.id)); ids.add(item.id);
    assert.ok(["explicit", "natural", "near-miss", "wrong-skill"].includes(item.kind));
    assert.ok(["en", "zh-CN"].includes(item.language));
    assert.ok(typeof item.prompt === "string" && item.prompt.length > 8);
  }
  for (const skill of skills) {
    for (const kind of ["explicit", "natural"]) {
      for (const language of ["en", "zh-CN"]) {
        assert.ok(triggers.cases.some((item) => item.expected_skill === skill && item.kind === kind && item.language === language), `${skill}/${kind}/${language}`);
      }
    }
  }
});

test("explicit corpus covers both Claude Code slash and Codex dollar invocation for every Skill", () => {
  for (const skill of skills) {
    for (const language of ["en", "zh-CN"]) {
      const matches = triggers.cases.filter((item) => item.expected_skill === skill && item.kind === "explicit" && item.language === language);
      assert.ok(matches.some((item) => item.prompt.startsWith("/")), `${skill} ${language} missing Claude Code slash invocation`);
      assert.ok(matches.some((item) => item.prompt.startsWith("$")), `${skill} ${language} missing Codex dollar invocation`);
    }
  }
});

test("near-miss corpus covers adjacent non-Harness meanings in both languages", () => {
  const negatives = triggers.cases.filter((item) => item.kind === "near-miss");
  assert.ok(negatives.length >= 14);
  assert.ok(negatives.every((item) => item.expected_skill === null));
  assert.deepEqual(new Set(negatives.map((item) => item.language)), new Set(["en", "zh-CN"]));
});

test("wrong-Skill corpus requires applicability refusal and a safe route in both languages", () => {
  const wrong = triggers.cases.filter((item) => item.kind === "wrong-skill");
  assert.ok(wrong.length >= 4);
  assert.deepEqual(new Set(wrong.map((item) => item.language)), new Set(["en", "zh-CN"]));
  assert.ok(wrong.every((item) => /^refuse-and-route:harness-/.test(item.expected_outcome)));
});

test("workflow evals cover every fixture class and safety assertions", () => {
  assert.ok(workflows.cases.length >= 10);
  const fixtures = new Set(workflows.cases.map((item) => item.fixture));
  for (const name of ["empty-repo", "docs-only-repo", "legacy-node-repo", "legacy-python-repo", "legacy-java-repo", "managed-harness-repo", "drifted-harness-repo", "custom-harness-repo", "conflicted-docs-repo", "mixed-repo"]) {
    assert.ok(fixtures.has(name), name);
  }
  assert.ok(workflows.cases.some((item) => item.assertions.some((value) => /without approval|no write|read-only/i.test(value))));
  assert.ok(workflows.cases.some((item) => item.skill === "harness-prompt" && item.assertions.some((value) => /execute\/test\/review/.test(value))));
});

test("skill-creator eval schema has realistic prompts, files, outputs, and assertions", () => {
  assert.equal(creatorEvals.skill_name, "harness-armor");
  assert.equal(creatorEvals.evals.length, 3);
  for (const item of creatorEvals.evals) {
    assert.ok(Number.isInteger(item.id));
    assert.ok(item.prompt.length > 50);
    assert.ok(item.expected_output.length > 50);
    assert.ok(Array.isArray(item.files) && item.files.length);
    assert.ok(Array.isArray(item.assertions) && item.assertions.length >= 4);
  }
});
