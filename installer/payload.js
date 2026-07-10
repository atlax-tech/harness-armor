import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SKILLS } from "./constants.js";

const INSTALLER_DIR = path.dirname(fileURLToPath(import.meta.url));
export const PACKAGE_ROOT = path.dirname(INSTALLER_DIR);

const SKIP_NAMES = new Set(["__pycache__", ".DS_Store"]);

export async function hashFile(file) {
  const data = await fs.readFile(file);
  return crypto.createHash("sha256").update(data).digest("hex");
}

async function walkRegularFiles(root, prefix = "") {
  const output = [];
  const entries = await fs.readdir(root, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    if (SKIP_NAMES.has(entry.name) || entry.name.endsWith(".pyc")) continue;
    const source = path.join(root, entry.name);
    const relative = prefix ? path.posix.join(prefix, entry.name) : entry.name;
    const stat = await fs.lstat(source);
    if (stat.isSymbolicLink()) {
      throw Object.assign(new Error(`packaged payload contains a symlink: ${relative}`), { kind: "payload" });
    }
    if (stat.isDirectory()) {
      output.push(...await walkRegularFiles(source, relative));
    } else if (stat.isFile()) {
      output.push({ relative, source, size: stat.size, sha256: await hashFile(source) });
    } else {
      throw Object.assign(new Error(`packaged payload contains a non-regular file: ${relative}`), { kind: "payload" });
    }
  }
  return output;
}

export async function buildPayload() {
  const files = [];
  for (const skill of SKILLS) {
    const skillRoot = path.join(PACKAGE_ROOT, "skills", skill);
    const stat = await fs.lstat(skillRoot).catch(() => null);
    if (!stat?.isDirectory() || stat.isSymbolicLink()) {
      throw Object.assign(new Error(`missing packaged skill: ${skill}`), { kind: "payload" });
    }
    const skillFiles = await walkRegularFiles(skillRoot);
    if (!skillFiles.some((item) => item.relative === "SKILL.md")) {
      throw Object.assign(new Error(`skill ${skill} has no SKILL.md`), { kind: "payload" });
    }
    for (const item of skillFiles) {
      files.push({ ...item, installPath: path.posix.join(skill, item.relative) });
    }
  }
  const sharedRoot = path.join(PACKAGE_ROOT, "shared");
  for (const item of await walkRegularFiles(sharedRoot)) {
    files.push({ ...item, installPath: path.posix.join(".harness-armor", item.relative) });
  }
  files.sort((a, b) => a.installPath.localeCompare(b.installPath));
  const aggregate = crypto.createHash("sha256");
  for (const item of files) aggregate.update(`${item.installPath}\0${item.sha256}\0${item.size}\n`);
  return { files, inventoryHash: aggregate.digest("hex") };
}

export async function copyPayloadToStage(payload, stageRoot) {
  for (const item of payload.files) {
    const destination = path.join(stageRoot, ...item.installPath.split("/"));
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.copyFile(item.source, destination);
    const copiedHash = await hashFile(destination);
    if (copiedHash !== item.sha256) {
      throw Object.assign(new Error(`staged payload hash mismatch: ${item.installPath}`), { kind: "payload" });
    }
  }
}

