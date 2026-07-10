import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { SKILLS } from "../../installer/constants.js";
import { resolveTarget } from "../../installer/adapters.js";
import { PYTHON, ROOT, removeTree, run, runJson, temporaryDirectory } from "../helpers.js";

const bin = path.join(ROOT, "bin", "harness-armor.js");

test("all adapters resolve inside the supplied fake home or project", () => {
  const home = temporaryDirectory("harness-armor-home-");
  const projectRoot = temporaryDirectory("harness-armor-project-");
  try {
    const expected = {
      "claude-user": path.join(home, ".claude", "skills"),
      "codex-user": path.join(home, ".agents", "skills"),
      "cursor-user": path.join(home, ".cursor", "skills"),
      "claude-project": path.join(projectRoot, ".claude", "skills"),
      "codex-project": path.join(projectRoot, ".agents", "skills"),
      "cursor-project": path.join(projectRoot, ".cursor", "skills"),
      "trae-project": path.join(projectRoot, ".agents", "skills"),
    };
    for (const [target, destination] of Object.entries(expected)) {
      assert.equal(resolveTarget({ target, home, projectRoot }).destination, destination);
    }
  } finally { removeTree(home); removeTree(projectRoot); }
});

test("claude-user and codex-user install, doctor, and uninstall into an isolated home", () => {
  for (const target of ["claude-user", "codex-user"]) {
    const home = temporaryDirectory(`harness-armor-${target}-`);
    try {
      const installed = runJson(process.execPath, [bin, "install", "--target", target, "--home", home, "--json"]);
      assert.equal(installed.status, 0, installed.stderr);
      assert.equal(installed.json.status, "installed");
      const suffix = target === "claude-user" ? [".claude", "skills"] : [".agents", "skills"];
      const destination = path.join(home, ...suffix);
      assert.deepEqual(fs.readdirSync(destination).filter((name) => name !== ".harness-armor").sort(), [...SKILLS].sort());
      const wrapper = run(PYTHON, [path.join(destination, "harness", "scripts", "detect_repository_state.py"), "--help"]);
      assert.equal(wrapper.status, 0, wrapper.stderr);
      const doctor = runJson(process.execPath, [bin, "doctor", "--target", target, "--home", home, "--json"]);
      assert.equal(doctor.status, 0, doctor.stdout);
      assert.equal(doctor.json.healthy, true);
      const uninstall = runJson(process.execPath, [bin, "uninstall", "--target", target, "--home", home, "--json"]);
      assert.equal(uninstall.status, 0, uninstall.stdout);
      assert.equal(uninstall.json.status, "uninstalled");
      for (const skill of SKILLS) assert.equal(fs.existsSync(path.join(destination, skill)), false);
    } finally { removeTree(home); }
  }
});

test("dry-run does not create a custom destination", () => {
  const parent = temporaryDirectory();
  const destination = path.join(parent, "not-created");
  try {
    const result = runJson(process.execPath, [bin, "install", "--target", "custom", "--dest", destination, "--dry-run", "--json"]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.json.changed, false);
    assert.equal(fs.existsSync(destination), false);
  } finally { removeTree(parent); }
});

test("install, relocated execution, doctor, and idempotent reinstall succeed", () => {
  const destination = temporaryDirectory();
  try {
    const installed = runJson(process.execPath, [bin, "install", "--target", "custom", "--dest", destination, "--json"]);
    assert.equal(installed.status, 0, installed.stderr);
    assert.equal(installed.json.status, "installed");
    assert.deepEqual(fs.readdirSync(destination).filter((name) => name !== ".harness-armor").sort(), [...SKILLS].sort());
    const wrapper = run(PYTHON, [path.join(destination, "harness", "scripts", "detect_repository_state.py"), "--help"]);
    assert.equal(wrapper.status, 0, wrapper.stderr);
    const doctor = runJson(process.execPath, [bin, "doctor", "--target", "custom", "--dest", destination, "--json"]);
    assert.equal(doctor.status, 0, doctor.stdout);
    assert.equal(doctor.json.healthy, true);
    const current = runJson(process.execPath, [bin, "install", "--target", "custom", "--dest", destination, "--json"]);
    assert.equal(current.status, 0, current.stdout);
    assert.equal(current.json.status, "current");
    assert.equal(current.json.changed, false);
  } finally { removeTree(destination); }
});

test("update refuses to overwrite a user-modified Skill", () => {
  const destination = temporaryDirectory();
  try {
    assert.equal(run(process.execPath, [bin, "install", "--target", "custom", "--dest", destination, "--json"]).status, 0);
    const skill = path.join(destination, "harness", "SKILL.md");
    fs.appendFileSync(skill, "\nUser note that must survive.\n");
    const before = fs.readFileSync(skill, "utf8");
    const update = runJson(process.execPath, [bin, "update", "--target", "custom", "--dest", destination, "--json"]);
    assert.equal(update.status, 1);
    assert.equal(update.json.status, "conflict");
    assert.ok(update.json.conflicts.some((item) => item.path === "harness/SKILL.md" && item.reason === "user-modified"));
    assert.equal(fs.readFileSync(skill, "utf8"), before);
  } finally { removeTree(destination); }
});

test("update refuses an untracked local file even when the incoming payload owns that path", () => {
  const destination = temporaryDirectory();
  try {
    assert.equal(run(process.execPath, [bin, "install", "--target", "custom", "--dest", destination, "--json"]).status, 0);
    const manifestPath = path.join(destination, ".harness-armor", "install-manifest.json");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    manifest.files = manifest.files.filter((item) => item.path !== "harness/assets/state-report.md");
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    const local = path.join(destination, "harness", "assets", "state-report.md");
    const before = fs.readFileSync(local, "utf8");
    const update = runJson(process.execPath, [bin, "update", "--target", "custom", "--dest", destination, "--json"]);
    assert.equal(update.status, 1);
    assert.ok(update.json.conflicts.some((item) => item.path === "harness/assets/state-report.md" && item.reason === "untracked-in-owned-directory"));
    assert.equal(fs.readFileSync(local, "utf8"), before);
  } finally { removeTree(destination); }
});

test("uninstall removes pristine owned files but preserves user modifications", () => {
  const destination = temporaryDirectory();
  try {
    assert.equal(run(process.execPath, [bin, "install", "--target", "custom", "--dest", destination, "--json"]).status, 0);
    const skill = path.join(destination, "harness", "SKILL.md");
    fs.appendFileSync(skill, "\nUser-owned change.\n");
    const uninstall = runJson(process.execPath, [bin, "uninstall", "--target", "custom", "--dest", destination, "--json"]);
    assert.equal(uninstall.status, 1);
    assert.equal(uninstall.json.status, "partial-preserved");
    assert.equal(fs.existsSync(skill), true);
    assert.equal(fs.existsSync(path.join(destination, "harness-build")), false);
    assert.equal(fs.existsSync(path.join(destination, ".harness-armor", "install-manifest.json")), true);
  } finally { removeTree(destination); }
});

test("pristine uninstall removes the installed suite", () => {
  const destination = temporaryDirectory();
  try {
    assert.equal(run(process.execPath, [bin, "install", "--target", "custom", "--dest", destination, "--json"]).status, 0);
    const uninstall = runJson(process.execPath, [bin, "uninstall", "--target", "custom", "--dest", destination, "--json"]);
    assert.equal(uninstall.status, 0, uninstall.stdout);
    assert.equal(uninstall.json.status, "uninstalled");
    for (const skill of SKILLS) assert.equal(fs.existsSync(path.join(destination, skill)), false);
    assert.equal(fs.existsSync(path.join(destination, ".harness-armor")), false);
  } finally { removeTree(destination); }
});

test("symlink destinations are rejected", () => {
  const parent = temporaryDirectory();
  const actual = path.join(parent, "actual");
  const link = path.join(parent, "link");
  fs.mkdirSync(actual);
  try {
    fs.symlinkSync(actual, link, process.platform === "win32" ? "junction" : "dir");
    const result = run(process.execPath, [bin, "install", "--target", "custom", "--dest", link, "--json"]);
    assert.equal(result.status, 1);
  } finally { removeTree(parent); }
});

test("only distribution commands are accepted", () => {
  for (const command of ["init", "build", "promotion", "check", "prompt", "harmor"]) {
    const result = run(process.execPath, [bin, command, "--json"]);
    assert.equal(result.status, 2, command);
  }
});
