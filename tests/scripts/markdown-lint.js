import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
const errors = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if ([".git", "node_modules", "__pycache__"].includes(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(md|mdx)$/.test(entry.name)) {
      const data = fs.readFileSync(full);
      const rel = path.relative(root, full);
      if (data.includes(0)) errors.push(`${rel}: contains NUL byte`);
      if (data.length && data[data.length - 1] !== 10) errors.push(`${rel}: missing final newline`);
      const text = data.toString("utf8");
      if (text.includes("\r")) errors.push(`${rel}: CRLF is not canonical in source files`);
    }
  }
}

walk(root);
const refs = spawnSync(process.platform === "win32" ? "python" : "python3", [path.join(root, "shared", "scripts", "check_references.py"), root, "--compact"], { encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
if (refs.status !== 0) errors.push(`broken-reference check failed: ${refs.stdout || refs.stderr}`);

if (errors.length) {
  process.stderr.write(`${errors.join("\n")}\n`);
  process.exit(1);
}
process.stdout.write("Markdown and local-reference checks passed.\n");

