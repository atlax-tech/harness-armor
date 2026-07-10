import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { EXIT, INSTALL_SCHEMA_VERSION, SKILLS, SPEC_VERSION, VERSION } from "./constants.js";
import { buildPayload, copyPayloadToStage, hashFile } from "./payload.js";

const RUNTIME = ".harness-armor";
const MANIFEST = path.posix.join(RUNTIME, "install-manifest.json");
const LOCK = ".harness-armor.lock";

function native(root, posixPath) {
  return path.join(root, ...posixPath.split("/"));
}

async function lstatOrNull(value) {
  try { return await fs.lstat(value); } catch (error) { if (error.code === "ENOENT") return null; throw error; }
}

async function assertSafeDestination(destination) {
  let probe = path.resolve(destination);
  const missing = [];
  while (!(await lstatOrNull(probe))) {
    missing.push(probe);
    const parent = path.dirname(probe);
    if (parent === probe) break;
    probe = parent;
  }
  const stat = await lstatOrNull(probe);
  if (stat?.isSymbolicLink()) throw Object.assign(new Error(`destination ancestor is a symlink: ${probe}`), { kind: "conflict" });
  if (stat && !stat.isDirectory()) throw Object.assign(new Error(`destination ancestor is not a directory: ${probe}`), { kind: "conflict" });
  return missing;
}

async function readManifest(destination) {
  const file = native(destination, MANIFEST);
  try {
    const data = JSON.parse(await fs.readFile(file, "utf8"));
    if (data.schemaVersion !== INSTALL_SCHEMA_VERSION || !Array.isArray(data.files)) {
      throw new Error("unsupported install manifest schema");
    }
    return data;
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw Object.assign(new Error(`invalid installation manifest: ${error.message}`), { kind: "conflict" });
  }
}

async function listFilesUnder(root, prefix = "") {
  const result = [];
  const stat = await lstatOrNull(root);
  if (!stat) return result;
  if (stat.isSymbolicLink()) return [{ path: prefix, kind: "symlink" }];
  if (!stat.isDirectory()) return [{ path: prefix, kind: stat.isFile() ? "file" : "non-regular" }];
  const entries = await fs.readdir(root, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    if (entry.name === "__pycache__" || entry.name === ".DS_Store" || entry.name.endsWith(".pyc")) continue;
    if (prefix === RUNTIME && ["install-manifest.json"].includes(entry.name)) continue;
    const rel = prefix ? path.posix.join(prefix, entry.name) : entry.name;
    const full = path.join(root, entry.name);
    const childStat = await fs.lstat(full);
    if (childStat.isSymbolicLink()) result.push({ path: rel, kind: "symlink" });
    else if (childStat.isDirectory()) result.push(...await listFilesUnder(full, rel));
    else if (childStat.isFile()) result.push({ path: rel, kind: "file" });
    else result.push({ path: rel, kind: "non-regular" });
  }
  return result;
}

async function preflight(destination, payload, previous, { requireExisting = false } = {}) {
  const conflicts = [];
  if (requireExisting && !previous) conflicts.push({ path: MANIFEST, reason: "not-installed" });
  const desired = new Map(payload.files.map((item) => [item.installPath, item]));
  const recorded = new Map((previous?.files || []).map((item) => [item.path, item]));

  if (!previous) {
    for (const top of [...SKILLS, RUNTIME]) {
      const stat = await lstatOrNull(path.join(destination, top));
      if (stat) conflicts.push({ path: top, reason: stat.isSymbolicLink() ? "symlink-collision" : "unmanaged-collision" });
    }
    return conflicts;
  }

  for (const [rel, item] of recorded) {
    const file = native(destination, rel);
    const stat = await lstatOrNull(file);
    if (!stat) conflicts.push({ path: rel, reason: "owned-file-missing" });
    else if (stat.isSymbolicLink() || !stat.isFile()) conflicts.push({ path: rel, reason: "owned-path-not-regular" });
    else if (await hashFile(file) !== item.sha256) conflicts.push({ path: rel, reason: "user-modified", expectedSha256: item.sha256 });
  }

  for (const top of [...SKILLS, RUNTIME]) {
    for (const entry of await listFilesUnder(path.join(destination, top), top)) {
      if (entry.kind !== "file") conflicts.push({ path: entry.path, reason: entry.kind });
      else if (!recorded.has(entry.path)) conflicts.push({ path: entry.path, reason: "untracked-in-owned-directory" });
    }
  }
  return conflicts;
}

function makeManifest(adapter, payload) {
  const now = new Date().toISOString();
  return {
    schemaVersion: INSTALL_SCHEMA_VERSION,
    installerVersion: VERSION,
    skillsVersion: VERSION,
    specVersion: SPEC_VERSION,
    target: adapter.id,
    client: adapter.client,
    installedAt: now,
    updatedAt: now,
    inventoryHash: payload.inventoryHash,
    files: payload.files.map((item) => ({ path: item.installPath, sha256: item.sha256, size: item.size })),
  };
}

async function acquireLock(destination) {
  const lock = path.join(destination, LOCK);
  try {
    await fs.mkdir(lock);
    await fs.writeFile(path.join(lock, "owner.json"), JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() }));
    return lock;
  } catch (error) {
    if (error.code === "EEXIST") throw Object.assign(new Error(`another installer or stale lock exists: ${lock}`), { kind: "recovery" });
    throw error;
  }
}

async function releaseLock(lock) {
  if (lock) await fs.rm(lock, { recursive: true, force: true });
}

async function applyTransaction(destination, payload, manifest) {
  const id = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const txn = path.join(destination, `.harness-armor-txn-${id}`);
  const stage = path.join(txn, "stage");
  const backup = path.join(txn, "backup");
  await fs.mkdir(stage, { recursive: true });
  await fs.mkdir(backup, { recursive: true });
  await copyPayloadToStage(payload, stage);
  await fs.mkdir(path.join(stage, RUNTIME), { recursive: true });
  await fs.writeFile(path.join(stage, RUNTIME, "install-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  await fs.writeFile(path.join(txn, "journal.json"), `${JSON.stringify({ id, state: "staged", top: [...SKILLS, RUNTIME] }, null, 2)}\n`);

  const movedOld = [];
  const movedNew = [];
  try {
    for (const top of [...SKILLS, RUNTIME]) {
      const current = path.join(destination, top);
      if (await lstatOrNull(current)) {
        await fs.rename(current, path.join(backup, top));
        movedOld.push(top);
      }
    }
    await fs.writeFile(path.join(txn, "journal.json"), `${JSON.stringify({ id, state: "old-backed-up", movedOld }, null, 2)}\n`);
    for (const top of [...SKILLS, RUNTIME]) {
      await fs.rename(path.join(stage, top), path.join(destination, top));
      movedNew.push(top);
    }
    await fs.writeFile(path.join(txn, "journal.json"), `${JSON.stringify({ id, state: "installed", movedOld, movedNew }, null, 2)}\n`);
    await fs.rm(txn, { recursive: true, force: true });
  } catch (error) {
    for (const top of movedNew.reverse()) await fs.rm(path.join(destination, top), { recursive: true, force: true });
    for (const top of movedOld.reverse()) await fs.rename(path.join(backup, top), path.join(destination, top)).catch(() => {});
    throw Object.assign(new Error(`installation transaction failed and rollback was attempted: ${error.message}`), { kind: "recovery" });
  }
}

export async function installOrUpdate(adapter, options, mode = "install") {
  const destination = adapter.destination;
  await assertSafeDestination(destination);
  const payload = await buildPayload();
  const previous = await readManifest(destination);
  const conflicts = await preflight(destination, payload, previous, { requireExisting: mode === "update" });
  const plan = {
    command: mode,
    target: adapter.id,
    client: adapter.client,
    destination,
    dryRun: options.dryRun,
    files: payload.files.length,
    skills: SKILLS,
    inventoryHash: payload.inventoryHash,
    conflicts,
    caveat: adapter.caveat || null,
  };
  if (conflicts.length) return { code: EXIT.FINDINGS, result: { ...plan, status: "conflict", changed: false } };
  const alreadyCurrent = Boolean(previous && previous.inventoryHash === payload.inventoryHash && previous.skillsVersion === VERSION);
  if (alreadyCurrent) return { code: EXIT.OK, result: { ...plan, status: "current", changed: false } };
  if (options.dryRun) return { code: EXIT.OK, result: { ...plan, status: "dry-run", changed: false } };

  await fs.mkdir(destination, { recursive: true });
  const lock = await acquireLock(destination);
  try {
    const manifest = makeManifest(adapter, payload);
    if (previous?.installedAt) manifest.installedAt = previous.installedAt;
    await applyTransaction(destination, payload, manifest);
  } finally {
    await releaseLock(lock);
  }
  return { code: EXIT.OK, result: { ...plan, status: previous ? "updated" : "installed", changed: true } };
}

export async function uninstall(adapter, options) {
  const destination = adapter.destination;
  await assertSafeDestination(destination);
  const manifest = await readManifest(destination);
  if (!manifest) return { code: EXIT.FINDINGS, result: { command: "uninstall", destination, status: "not-installed", changed: false } };
  const preserved = [];
  const removable = [];
  for (const item of manifest.files) {
    const file = native(destination, item.path);
    const stat = await lstatOrNull(file);
    if (!stat) continue;
    if (!stat.isFile() || stat.isSymbolicLink()) preserved.push({ path: item.path, reason: "not-regular" });
    else if (await hashFile(file) !== item.sha256) preserved.push({ path: item.path, reason: "user-modified" });
    else removable.push(item.path);
  }
  const recorded = new Set(manifest.files.map((item) => item.path));
  for (const top of [...SKILLS, RUNTIME]) {
    for (const entry of await listFilesUnder(path.join(destination, top), top)) {
      if (entry.path !== MANIFEST && !recorded.has(entry.path)) preserved.push({ path: entry.path, reason: "untracked" });
    }
  }
  const result = { command: "uninstall", target: adapter.id, destination, dryRun: options.dryRun, removable, preserved, changed: false };
  if (options.dryRun) return { code: preserved.length ? EXIT.FINDINGS : EXIT.OK, result: { ...result, status: "dry-run" } };

  const lock = await acquireLock(destination);
  try {
    for (const rel of removable.sort((a, b) => b.length - a.length)) await fs.rm(native(destination, rel), { force: true });
    for (const top of [...SKILLS, RUNTIME]) {
      await removeKnownCaches(path.join(destination, top));
      await removeEmptyDirectories(path.join(destination, top));
    }
    if (preserved.length) {
      const remaining = manifest.files.filter((item) => !removable.includes(item.path));
      manifest.files = remaining;
      manifest.updatedAt = new Date().toISOString();
      await fs.mkdir(path.dirname(native(destination, MANIFEST)), { recursive: true });
      await fs.writeFile(native(destination, MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`);
    } else {
      await fs.rm(native(destination, MANIFEST), { force: true });
      await removeEmptyDirectories(path.join(destination, RUNTIME));
    }
    result.changed = removable.length > 0;
  } finally {
    await releaseLock(lock);
  }
  return { code: preserved.length ? EXIT.FINDINGS : EXIT.OK, result: { ...result, status: preserved.length ? "partial-preserved" : "uninstalled" } };
}

async function removeEmptyDirectories(root) {
  const stat = await lstatOrNull(root);
  if (!stat?.isDirectory() || stat.isSymbolicLink()) return;
  for (const entry of await fs.readdir(root, { withFileTypes: true })) {
    if (entry.isDirectory()) await removeEmptyDirectories(path.join(root, entry.name));
  }
  await fs.rmdir(root).catch((error) => { if (!["ENOTEMPTY", "ENOENT"].includes(error.code)) throw error; });
}

async function removeKnownCaches(root) {
  const stat = await lstatOrNull(root);
  if (!stat?.isDirectory() || stat.isSymbolicLink()) return;
  for (const entry of await fs.readdir(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.name === "__pycache__" || entry.name === ".DS_Store" || entry.name.endsWith(".pyc")) {
      await fs.rm(full, { recursive: true, force: true });
    } else if (entry.isDirectory()) {
      await removeKnownCaches(full);
    }
  }
}

export async function doctor(adapter = null) {
  const payload = await buildPayload();
  const checks = [
    { id: "node-version", ok: Number(process.versions.node.split(".")[0]) >= 18, evidence: process.versions.node },
    { id: "seven-skills", ok: SKILLS.length === 7, evidence: SKILLS },
    { id: "packaged-payload", ok: payload.files.length > 0, evidence: { files: payload.files.length, inventoryHash: payload.inventoryHash } },
  ];
  let installation = null;
  if (adapter) {
    await assertSafeDestination(adapter.destination);
    const manifest = await readManifest(adapter.destination);
    if (!manifest) {
      checks.push({ id: "installation-manifest", ok: false, evidence: "not installed" });
    } else {
      const conflicts = await preflight(adapter.destination, payload, manifest);
      checks.push({ id: "installation-manifest", ok: true, evidence: native(adapter.destination, MANIFEST) });
      checks.push({ id: "installed-integrity", ok: conflicts.length === 0, evidence: conflicts });
      installation = { destination: adapter.destination, target: adapter.id, version: manifest.skillsVersion };
    }
  }
  const healthy = checks.every((check) => check.ok);
  return { code: healthy ? EXIT.OK : EXIT.FINDINGS, result: { command: "doctor", healthy, readOnly: true, checks, installation } };
}
