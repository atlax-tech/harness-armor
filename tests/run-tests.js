import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const testsRoot = path.dirname(fileURLToPath(import.meta.url));
const category = process.argv[2] || null;

function collect(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory() && path.resolve(directory) === path.join(testsRoot, "fixtures")) continue;
    if (entry.isDirectory()) files.push(...collect(full));
    else if (entry.name.endsWith(".test.js")) files.push(full);
  }
  return files;
}

const root = category ? path.join(testsRoot, category) : testsRoot;
if (!fs.existsSync(root)) {
  process.stderr.write(`Unknown test category: ${category}\n`);
  process.exit(2);
}
const files = collect(root);
if (!files.length) {
  process.stderr.write(`No tests found under ${root}\n`);
  process.exit(2);
}
const result = spawnSync(process.execPath, ["--test", ...files], { stdio: "inherit" });
process.exit(result.status ?? 1);
