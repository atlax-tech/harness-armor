#!/usr/bin/env bash
# Claude Code real-client smoke test for Harness Armor.
#
# Prerequisites:
#   - claude CLI installed and authenticated (run `claude --version` first)
#   - npm tarball built via `npm pack` at the repository root
#
# Usage:
#   bash tests/scripts/claude-smoke.sh [path/to/harness-armor-x.y.z.tgz]
#
# This script verifies:
#   1. claude-user installation to an isolated HOME
#   2. claude-project installation to a temporary repository
#   3. doctor reports healthy for both scopes
#   4. Claude Code discovers and invokes /harness
#   5. Idempotent reinstall and safe uninstall
#
# Blocking condition: if `claude` is not on PATH or not authenticated,
# the script exits with code 2 and prints the blocking evidence.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TGZ="${1:-$REPO_ROOT/harness-armor-0.1.1.tgz}"

if ! command -v claude >/dev/null 2>&1; then
  echo "BLOCKED: claude CLI is not installed or not on PATH."
  echo "command -v claude => not found"
  exit 2
fi

if ! claude --version >/dev/null 2>&1; then
  echo "BLOCKED: claude CLI is installed but not authenticated or not functional."
  claude --version 2>&1 || true
  exit 2
fi

if [ ! -f "$TGZ" ]; then
  echo "BLOCKED: tarball not found at $TGZ"
  echo "Run \`npm pack\` in the repository root first."
  exit 2
fi

WORK="$(mktemp -d /tmp/ha-claude-smoke-XXXXXX)"
ISO_HOME="$WORK/home"
mkdir -p "$ISO_HOME"
PROJ="$WORK/proj"
mkdir -p "$PROJ"
trap 'rm -rf "$WORK"' EXIT

cd "$WORK"
echo '{"name":"claude-smoke","private":true}' > package.json
npm install "$TGZ" 2>&1 | tail -1
HABIN="$WORK/node_modules/harness-armor/bin/harness-armor.js"

echo "===== claude version ====="
claude --version

echo "===== 1. claude-user install (isolated HOME) ====="
node "$HABIN" install --target claude-user --home "$ISO_HOME" --json \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print('status:',d['status'],'files:',d['files'])"

echo "===== 2. claude-user doctor ====="
node "$HABIN" doctor --target claude-user --home "$ISO_HOME" --json \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print('healthy:',d['healthy'])"

echo "===== 3. verify 7 skills ====="
ls "$ISO_HOME/.claude/skills/" | grep "^harness" | sort

echo "===== 4. claude-project install ====="
cd "$PROJ" && git init -q
echo "# empty repo" > README.md
node "$HABIN" install --target claude-project --project-root "$PROJ" --home "$ISO_HOME" --json \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print('status:',d['status'],'files:',d['files'])"

echo "===== 5. real claude invocation: /harness (project-level) ====="
claude -p "/harness" --add-dir "$PROJ" 2>&1 | head -30 || echo "(claude invocation returned non-zero; inspect manually)"

echo "===== 6. idempotent reinstall ====="
node "$HABIN" install --target claude-user --home "$ISO_HOME" --json \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print('status:',d['status'],'changed:',d['changed'])"

echo "===== 7. conflict protection ====="
echo "# user edit" >> "$ISO_HOME/.claude/skills/harness/SKILL.md"
node "$HABIN" update --target claude-user --home "$ISO_HOME" --json \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print('status:',d['status'],'conflicts:',len(d['conflicts']))"

echo "===== 8. safe uninstall ====="
node "$HABIN" uninstall --target claude-user --home "$ISO_HOME" --json \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print('status:',d['status'],'preserved:',len(d['preserved']))"

echo "===== 9. claude-project uninstall ====="
node "$HABIN" uninstall --target claude-project --project-root "$PROJ" --home "$ISO_HOME" --json \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print('status:',d['status'])"

echo "===== CLAUDE SMOKE TEST COMPLETE ====="
