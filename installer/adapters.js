import os from "node:os";
import path from "node:path";
import fs from "node:fs";

export const TARGETS = Object.freeze({
  "claude-user": { scope: "user", client: "Claude Code", suffix: [".claude", "skills"], verifiedDirectory: true },
  "claude-project": { scope: "project", client: "Claude Code", suffix: [".claude", "skills"], verifiedDirectory: true },
  "codex-user": { scope: "user", client: "OpenAI Codex", suffix: [".agents", "skills"], verifiedDirectory: true },
  "codex-project": { scope: "project", client: "OpenAI Codex", suffix: [".agents", "skills"], verifiedDirectory: true },
  "cursor-user": { scope: "user", client: "Cursor", suffix: [".cursor", "skills"], verifiedDirectory: true },
  "cursor-project": { scope: "project", client: "Cursor", suffix: [".cursor", "skills"], verifiedDirectory: true },
  "trae-project": { scope: "project", client: "TRAE", suffix: [".agents", "skills"], verifiedDirectory: true, caveat: "Real-client invocation remains a release smoke test." },
  custom: { scope: "custom", client: "Generic Agent Skills compatible", verifiedDirectory: false },
  generic: { scope: "custom", client: "Generic Agent Skills compatible", verifiedDirectory: false },
});

export function findProjectRoot(start = process.cwd()) {
  let current = path.resolve(start);
  while (true) {
    const marker = path.join(current, ".git");
    try {
      const stat = fs.lstatSync(marker);
      if (stat.isDirectory() || stat.isFile()) return current;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    const parent = path.dirname(current);
    if (parent === current) return path.resolve(start);
    current = parent;
  }
}

export function resolveTarget(options) {
  const targetName = options.target;
  const adapter = TARGETS[targetName];
  if (!adapter) {
    throw Object.assign(new Error(`unknown target '${targetName}'. Expected one of: ${Object.keys(TARGETS).join(", ")}`), { kind: "usage" });
  }
  let destination;
  let projectRoot = null;
  const home = path.resolve(options.home || process.env.HARNESS_ARMOR_HOME || os.homedir());
  if (adapter.scope === "custom") {
    if (!options.dest) {
      throw Object.assign(new Error(`--target ${targetName} requires --dest <absolute-directory>`), { kind: "usage" });
    }
    if (!path.isAbsolute(options.dest)) {
      throw Object.assign(new Error("--dest must be an absolute path"), { kind: "usage" });
    }
    destination = path.resolve(options.dest);
  } else if (adapter.scope === "user") {
    destination = path.join(home, ...adapter.suffix);
  } else {
    projectRoot = path.resolve(options.projectRoot || findProjectRoot());
    destination = path.join(projectRoot, ...adapter.suffix);
  }
  return { id: targetName, ...adapter, destination, home, projectRoot };
}

