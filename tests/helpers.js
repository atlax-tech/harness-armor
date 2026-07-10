import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const PYTHON = process.env.PYTHON || (process.platform === "win32" ? "python" : "python3");

export function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: options.cwd || ROOT,
    encoding: "utf8",
    env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1", ...options.env },
    timeout: options.timeout || 30_000,
  });
}

export function runJson(command, args, options = {}) {
  const result = run(command, args, options);
  let json = null;
  try { json = JSON.parse(result.stdout); } catch {}
  return { ...result, json };
}

export function temporaryDirectory(prefix = "harness-armor-test-") {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

export function fixture(name) {
  return path.join(ROOT, "tests", "fixtures", name);
}

export function copyFixture(name) {
  const destination = temporaryDirectory(`${name}-`);
  fs.cpSync(fixture(name), destination, { recursive: true });
  return destination;
}

export function hashTree(root) {
  const digest = crypto.createHash("sha256");
  function walk(current, relative = "") {
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if ([".git", "__pycache__"].includes(entry.name) || entry.name.endsWith(".pyc")) continue;
      const full = path.join(current, entry.name);
      const rel = relative ? path.posix.join(relative, entry.name) : entry.name;
      const stat = fs.lstatSync(full);
      digest.update(`${rel}\0${stat.mode}\0`);
      if (stat.isSymbolicLink()) digest.update(`link:${fs.readlinkSync(full)}\n`);
      else if (stat.isDirectory()) walk(full, rel);
      else if (stat.isFile()) digest.update(fs.readFileSync(full));
    }
  }
  walk(root);
  return digest.digest("hex");
}

export function removeTree(root) {
  fs.rmSync(root, { recursive: true, force: true });
}
