#!/usr/bin/env bash
# Codex real-client smoke test for Harness Armor.
#
# Prerequisites:
#   - codex CLI installed and authenticated (run `codex --version` first)
#   - npm tarball built via `npm pack` at the repository root
#
# Usage:
#   bash tests/scripts/codex-smoke.sh [path/to/harness-armor-x.y.z.tgz]
#
# This script verifies:
#   1. codex-user installation to an isolated HOME
#   2. codex-project installation to a temporary repository
#   3. doctor reports healthy for both scopes
#   4. Codex discovers the installed skills via $harness
#   5. Idempotent reinstall, conflict protection, and safe uninstall
#
# Blocking condition: if `codex` is not on PATH or not authenticated,
# the script exits with code 2 and prints the blocking evidence.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TGZ="${1:-$REPO_ROOT/harness-armor-0.1.1.tgz}"

if ! command -v codex >/dev/null 2>&1; then
  echo "BLOCKED: codex CLI is not installed or not on PATH."
  echo "command -v codex => not found"
  echo "Install Codex CLI and authenticate before running this smoke test."
  exit 2
fi

if ! codex --version >/dev/null 2>&1; then
  echo "BLOCKED: codex CLI is installed but not authenticated or not functional."
  codex --version 2>&1 || true
  echo "Authenticate Codex before running this smoke test."
  exit 2
fi

if [ ! -f "$TGZ" ]; then
  echo "BLOCKED: tarball not found at $TGZ"
  echo "Run \`npm pack\` in the repository root first."
  exit 2
fi

WORK="$(mktemp -d /tmp/ha-codex-smoke-XXXXXX)"
ISO_HOME="$WORK/home"
mkdir -p "$ISO_HOME"
PROJ="$WORK/proj"
mkdir -p "$PROJ"
trap 'rm -rf "$WORK"' EXIT

cd "$WORK"
echo '{"name":"codex-smoke","private":true}' > package.json
npm install "$TGZ" 2>&1 | tail -1
HABIN="$WORK/node_modules/harness-armor/bin/harness-armor.js"

echo "===== codex version ====="
codex --version

echo "===== 1. codex-user install ====="
node "$HABIN" install --target codex-user --home "$ISO_HOME" --json \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print('status:',d['status'],'files:',d['files'])"

echo "===== 2. codex-user doctor ====="
node "$HABIN" doctor --target codex-user --home "$ISO_HOME" --json \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print('healthy:',d['healthy'])"

echo "===== 3. verify skills in ~/.agents/skills ====="
ls "$ISO_HOME/.agents/skills/" | grep "^harness" | sort

echo "===== 4. codex-project install ====="
cd "$PROJ" && git init -q
node "$HABIN" install --target codex-project --project-root "$PROJ" --home "$ISO_HOME" --json \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print('status:',d['status'],'files:',d['files'])"

echo "===== 5. real codex invocation: \$harness ====="
cd "$PROJ"
echo "# empty repo" > README.md
codex exec "\$harness" 2>&1 | head -30 || echo "(codex invocation returned non-zero; inspect manually)"

echo "===== 6. idempotent reinstall ====="
node "$HABIN" install --target codex-user --home "$ISO_HOME" --json \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print('status:',d['status'],'changed:',d['changed'])"

echo "===== 7. conflict protection ====="
echo "# user edit" >> "$ISO_HOME/.agents/skills/harness/SKILL.md"
node "$HABIN" update --target codex-user --home "$ISO_HOME" --json \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print('status:',d['status'],'conflicts:',len(d['conflicts']))"

echo "===== 8. safe uninstall ====="
node "$HABIN" uninstall --target codex-user --home "$ISO_HOME" --json \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print('status:',d['status'],'preserved:',len(d['preserved']))"

echo "===== 9. codex-project uninstall ====="
node "$HABIN" uninstall --target codex-project --project-root "$PROJ" --home "$ISO_HOME" --json \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print('status:',d['status'])"

echo "===== CODEX SMOKE TEST COMPLETE ====="
