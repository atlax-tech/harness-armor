import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { PYTHON, ROOT, run, runJson } from "../helpers.js";

const expected = ["harness", "harness-build", "harness-check", "harness-init", "harness-promotion", "harness-prompt", "harness-update"];

function frontmatter(text) {
  const lines = text.split(/\r?\n/);
  assert.equal(lines[0], "---");
  const end = lines.indexOf("---", 1);
  assert.ok(end > 1);
  const values = {};
  for (const line of lines.slice(1, end)) {
    const match = line.match(/^([a-z-]+):\s*(.*)$/);
    if (match && !line.startsWith(" ")) values[match[1]] = match[2].replace(/^['\"]|['\"]$/g, "");
  }
  return values;
}

test("exactly seven public Skills exist", () => {
  const actual = fs.readdirSync(path.join(ROOT, "skills"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  assert.deepEqual(actual, expected);
});

test("all release version surfaces match package.json", () => {
  const version = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8")).version;
  assert.equal(fs.readFileSync(path.join(ROOT, "VERSION"), "utf8").trim(), version);
  assert.match(fs.readFileSync(path.join(ROOT, "installer", "constants.js"), "utf8"), new RegExp(`VERSION = ["']${version.replaceAll(".", "\\.")}["']`));
  assert.equal(JSON.parse(fs.readFileSync(path.join(ROOT, ".codex-plugin", "plugin.json"), "utf8")).version, version);
  const marketplace = JSON.parse(fs.readFileSync(path.join(ROOT, ".claude-plugin", "marketplace.json"), "utf8"));
  assert.equal(marketplace.metadata.version, version);
  assert.equal(marketplace.plugins[0].version, version);
  assert.equal(JSON.parse(fs.readFileSync(path.join(ROOT, ".harness", "manifest.json"), "utf8")).generator.version, version);
  assert.match(fs.readFileSync(path.join(ROOT, "shared", "scripts", "harness_armor", "__init__.py"), "utf8"), new RegExp(`__version__ = ["']${version.replaceAll(".", "\\.")}["']`));
  for (const readme of ["README.md", "README.zh-CN.md"]) {
    const text = fs.readFileSync(path.join(ROOT, readme), "utf8");
    assert.match(text, new RegExp(`version-${version.replaceAll(".", "\\.")}`), `${readme} version badge`);
  }
  assert.match(fs.readFileSync(path.join(ROOT, "CHANGELOG.md"), "utf8"), new RegExp(`## \\[${version.replaceAll(".", "\\.")}\\]`));
  for (const name of expected) {
    const text = fs.readFileSync(path.join(ROOT, "skills", name, "SKILL.md"), "utf8");
    assert.match(text, new RegExp(`metadata:\\s+[\\s\\S]*?version: ["']${version.replaceAll(".", "\\.")}["']`), `${name} metadata version`);
  }
});

for (const name of expected) {
  test(`${name} satisfies the open Skill structure and workflow contract`, () => {
    const root = path.join(ROOT, "skills", name);
    const file = path.join(root, "SKILL.md");
    const text = fs.readFileSync(file, "utf8");
    const meta = frontmatter(text);
    assert.equal(meta.name, name);
    assert.match(meta.name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(meta.description.length > 40 && meta.description.length <= 1024);
    assert.match(meta.description, /Use when|Use for/);
    assert.match(meta.description, /Do not use/);
    assert.equal(meta.license, "CC-BY-NC-4.0");
    assert.ok(text.split(/\r?\n/).length <= 500);
    for (const directory of ["references", "assets", "scripts"]) {
      assert.ok(fs.statSync(path.join(root, directory)).isDirectory(), `${name}/${directory}`);
      assert.ok(fs.readdirSync(path.join(root, directory)).length > 0, `${name}/${directory} empty`);
    }
    assert.ok(fs.existsSync(path.join(root, "agents", "openai.yaml")));
    for (const phrase of ["## Inputs", "Authorization", "Forbidden", "Validation", "Failure", "Result format"]) {
      assert.match(text.toLowerCase(), new RegExp(phrase.toLowerCase()), `${name}: ${phrase}`);
    }
    assert.match(text, /harness-engineering-v1\.md/);
  });
}

test("all local references resolve", () => {
  const result = runJson(PYTHON, [path.join("shared", "scripts", "check_references.py"), ROOT]);
  assert.equal(result.status, 0, result.stdout);
  assert.deepEqual(result.json.broken_references, []);
});

test("all bundled Skill scripts compile and expose help", () => {
  for (const skill of expected) {
    const scripts = fs.readdirSync(path.join(ROOT, "skills", skill, "scripts")).filter((name) => name.endsWith(".py"));
    for (const script of scripts) {
      const result = run(PYTHON, [path.join("skills", skill, "scripts", script), "--help"]);
      assert.equal(result.status, 0, `${skill}/${script}: ${result.stderr}`);
    }
  }
});

test("installer exposes no Harness business subcommands", () => {
  for (const command of ["init", "build", "promotion", "check", "prompt"]) {
    const result = run(process.execPath, [path.join("bin", "harness-armor.js"), command, "--json"]);
    assert.equal(result.status, 2, command);
  }
});

test("router contains no specialist write workflow", () => {
  const text = fs.readFileSync(path.join(ROOT, "skills", "harness", "SKILL.md"), "utf8");
  assert.match(text, /always read-only/i);
  assert.doesNotMatch(text, /## Write workflow/i);
});

test("public core does not depend on external model APIs", () => {
  for (const directory of [path.join(ROOT, "shared", "scripts"), path.join(ROOT, "skills")]) {
    const result = run(process.execPath, ["-e", `const fs=require('fs'),p=require('path');function w(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=p.join(d,e.name);if(e.isDirectory())w(f);else if(/\\.(py|js)$/.test(e.name)){const t=fs.readFileSync(f,'utf8');if(/api\\.(openai|anthropic)\\.com/.test(t))throw new Error(f)}}}w(${JSON.stringify(directory)})`]);
    assert.equal(result.status, 0, result.stderr);
  }
});
