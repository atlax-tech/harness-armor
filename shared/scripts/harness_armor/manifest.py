"""Manifest validation without third-party schema dependencies."""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any, Optional

from .common import HarnessError, read_json, safe_relative_path


HASH_RE = re.compile(r"^[a-f0-9]{64}$")
SEMVER_RE = re.compile(r"^[0-9]+\.[0-9]+\.[0-9]+$")
STATES = {
    "EMPTY", "DOCS_ONLY", "LEGACY_CODE", "MANAGED_HARNESS",
    "CUSTOM_HARNESS", "MIXED_OR_CONFLICTED",
}
MODES = {"managed", "managed-section", "observed", "user"}


def validate_manifest_data(data: Any, *, root: Optional[Path] = None) -> dict[str, Any]:
    errors: list[dict[str, str]] = []
    warnings: list[dict[str, str]] = []

    def error(path: str, message: str) -> None:
        errors.append({"path": path, "message": message})

    def warning(path: str, message: str) -> None:
        warnings.append({"path": path, "message": message})

    if not isinstance(data, dict):
        return {"valid": False, "errors": [{"path": "$", "message": "manifest must be an object"}], "warnings": []}

    required = {
        "schema_version", "spec_version", "generator", "repository_state",
        "managed_files", "source_index", "unresolved_index", "last_updated",
    }
    for key in sorted(required - set(data)):
        error(f"$.{key}", "required property is missing")

    if data.get("schema_version") != "1.0.0":
        error("$.schema_version", "must equal 1.0.0")
    spec_version = data.get("spec_version")
    if not isinstance(spec_version, str) or not SEMVER_RE.fullmatch(spec_version):
        error("$.spec_version", "must be a semantic version")
    generator = data.get("generator")
    if not isinstance(generator, dict):
        error("$.generator", "must be an object")
    else:
        if generator.get("name") != "harness-armor":
            error("$.generator.name", "must equal harness-armor")
        if not isinstance(generator.get("version"), str) or not generator.get("version"):
            error("$.generator.version", "must be a non-empty string")
    if data.get("repository_state") not in STATES:
        error("$.repository_state", "unknown repository state")

    managed = data.get("managed_files")
    seen: set[str] = set()
    if not isinstance(managed, list):
        error("$.managed_files", "must be an array")
    else:
        for index, item in enumerate(managed):
            base = f"$.managed_files[{index}]"
            if not isinstance(item, dict):
                error(base, "must be an object")
                continue
            rel = item.get("path")
            if not isinstance(rel, str) or not safe_relative_path(rel):
                error(f"{base}.path", "must be a safe relative POSIX path")
            elif rel in seen:
                error(f"{base}.path", "duplicate managed path")
            else:
                seen.add(rel)
                if root is not None and not (root / PurePathCompat(rel)).exists():
                    warning(f"{base}.path", "managed path does not currently exist")
            if not isinstance(item.get("owner"), str) or not item.get("owner"):
                error(f"{base}.owner", "must be a non-empty string")
            if item.get("mode") not in MODES:
                error(f"{base}.mode", "unknown ownership mode")
            digest = item.get("sha256")
            if digest is not None and (not isinstance(digest, str) or not HASH_RE.fullmatch(digest)):
                error(f"{base}.sha256", "must be null or a lowercase SHA-256 digest")

    for key in ("source_index", "unresolved_index"):
        value = data.get(key)
        if not isinstance(value, str) or not safe_relative_path(value):
            error(f"$.{key}", "must be a safe relative POSIX path")
        elif root is not None and not (root / PurePathCompat(value)).is_file():
            error(f"$.{key}", "referenced state file does not exist")

    if not isinstance(data.get("last_updated"), str) or "T" not in data.get("last_updated", ""):
        error("$.last_updated", "must be an ISO-8601 date-time string")

    return {"valid": not errors, "errors": errors, "warnings": warnings}


def PurePathCompat(value: str) -> Path:
    return Path(*value.split("/"))


def validate_manifest_file(path: Path, *, root: Optional[Path] = None) -> dict[str, Any]:
    data = read_json(path)
    result = validate_manifest_data(data, root=root)
    result["manifest"] = str(path)
    result["schema_version"] = "1.0.0"
    return result
