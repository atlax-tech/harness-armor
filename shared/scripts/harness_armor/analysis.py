"""Repository state, references, drift, and health analysis."""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any, Iterable, Optional
from urllib.parse import unquote

from .common import (
    CODE_SUFFIXES,
    DOCUMENT_SUFFIXES,
    HarnessError,
    ScanLimits,
    read_json,
    safe_relative_path,
    scan_repository,
    sha256_file,
    text_excerpt,
)
from .manifest import validate_manifest_file


BASIC_FILES = {
    ".gitignore", ".gitattributes", ".editorconfig", ".gitkeep", "license", "license.md",
    "readme", "readme.md", "readme.txt", "notice", "notice.md",
}
DOC_SIGNAL_NAMES = {
    "prd.md", "product.md", "requirements.md", "architecture.md", "design.md",
    "roadmap.md", "spec.md", "specification.md", "user-stories.md",
}
CUSTOM_HARNESS_NAMES = {"agents.md", "claude.md", "copilot-instructions.md"}
CONFLICT_MARKERS = ("<<<<<<<", "=======", ">>>>>>>")


def detect_state(root: Path, *, limits: Optional[ScanLimits] = None) -> dict[str, Any]:
    scan = scan_repository(root, limits=limits)
    paths = {item["path"] for item in scan.files}
    lower_paths = {path.lower() for path in paths}
    code_paths = sorted(
        path for path in paths
        if Path(path).suffix.lower() in CODE_SUFFIXES and not _is_tooling_path(path)
    )
    doc_paths = sorted(
        path for path in paths
        if Path(path).suffix.lower() in DOCUMENT_SUFFIXES
    )
    evidence: list[dict[str, Any]] = []
    uncertainties: list[str] = []

    manifest_path = root / ".harness" / "manifest.json"
    if manifest_path.is_file() and not manifest_path.is_symlink():
        validation = validate_manifest_file(manifest_path, root=root)
        if validation["valid"]:
            state = "MANAGED_HARNESS"
            confidence = 0.99
            evidence.append({"kind": "managed-manifest", "path": ".harness/manifest.json"})
        else:
            state = "MIXED_OR_CONFLICTED"
            confidence = 0.95
            evidence.append({"kind": "invalid-managed-manifest", "path": ".harness/manifest.json", "errors": validation["errors"]})
        return _state_result(root, state, confidence, evidence, uncertainties, scan)

    conflict_docs = []
    for rel in doc_paths:
        content = text_excerpt(root / rel)
        if all(marker in content for marker in CONFLICT_MARKERS):
            conflict_docs.append(rel)
    if conflict_docs:
        evidence.append({"kind": "unresolved-merge-markers", "paths": conflict_docs})
        return _state_result(root, "MIXED_OR_CONFLICTED", 0.98, evidence, uncertainties, scan)

    substantive = sorted(path for path in paths if path.lower() not in BASIC_FILES)
    if not substantive:
        evidence.append({"kind": "no-substantive-files", "basic_files": sorted(paths)})
        return _state_result(root, "EMPTY", 0.98, evidence, uncertainties, scan)

    has_doc_signal = any(
        path.lower().startswith("docs/")
        or Path(path).name.lower() in DOC_SIGNAL_NAMES
        or Path(path).name.lower().startswith(("prd", "requirements", "spec"))
        for path in doc_paths
    )
    has_custom = any(
        Path(path).name.lower() in CUSTOM_HARNESS_NAMES for path in paths
    ) or _has_harness_doc_set(lower_paths)

    if code_paths:
        evidence.append({"kind": "business-code", "sample": code_paths[:20], "count": len(code_paths)})
        if has_custom and _has_harness_doc_set(lower_paths):
            evidence.append({"kind": "custom-harness-signals", "paths": _custom_harness_paths(paths)})
            return _state_result(root, "CUSTOM_HARNESS", 0.86, evidence, uncertainties, scan)
        if has_custom:
            uncertainties.append("Custom agent instructions exist but a complete Harness structure was not established.")
        return _state_result(root, "LEGACY_CODE", 0.93, evidence, uncertainties, scan)

    if has_doc_signal:
        evidence.append({"kind": "product-documentation", "paths": doc_paths[:30]})
        return _state_result(root, "DOCS_ONLY", 0.94, evidence, uncertainties, scan)

    if has_custom:
        evidence.append({"kind": "custom-harness-signals", "paths": _custom_harness_paths(paths)})
        return _state_result(root, "CUSTOM_HARNESS", 0.82, evidence, uncertainties, scan)

    uncertainties.append("Files exist, but deterministic evidence cannot establish product documentation or business code.")
    evidence.append({"kind": "unclassified-files", "sample": substantive[:30]})
    return _state_result(root, "MIXED_OR_CONFLICTED", 0.62, evidence, uncertainties, scan)


def _state_result(root: Path, state: str, confidence: float, evidence: list[dict[str, Any]], uncertainties: list[str], scan: Any) -> dict[str, Any]:
    routes = {
        "EMPTY": "harness-init",
        "DOCS_ONLY": "harness-build",
        "LEGACY_CODE": "harness-promotion",
        "MANAGED_HARNESS": "harness-check",
        "CUSTOM_HARNESS": "harness-check",
        "MIXED_OR_CONFLICTED": "harness-check",
    }
    return {
        "schema_version": "1.0.0",
        "root": str(root),
        "state": state,
        "confidence": confidence,
        "evidence": evidence,
        "uncertainties": uncertainties,
        "recommended_skill": routes[state],
        "read_only": True,
        "scan_truncated": scan.truncated,
    }


def _is_tooling_path(path: str) -> bool:
    parts = Path(path).parts
    return bool(parts and parts[0] in {"scripts", "tools", ".github"})


def _has_harness_doc_set(paths: set[str]) -> bool:
    required = {"docs/product.md", "docs/architecture.md", "docs/testing.md"}
    return "agents.md" in paths and len(required & paths) >= 2


def _custom_harness_paths(paths: Iterable[str]) -> list[str]:
    return sorted(
        path for path in paths
        if Path(path).name.lower() in CUSTOM_HARNESS_NAMES or path.lower().startswith(("docs/", ".cursor/", ".claude/", ".agents/"))
    )[:30]


MARKDOWN_LINK_RE = re.compile(r"!?\[[^\]]*\]\(([^)]+)\)")
HTML_LINK_RE = re.compile(r"(?:href|src)=[\"']([^\"']+)[\"']")
RESOURCE_PATH_RE = re.compile(r"(?<![\w.-])((?:scripts|references|assets)/[A-Za-z0-9_./-]+)")
HEADING_CLEAN_RE = re.compile(r"[^a-z0-9\s-]")


def check_references(root: Path) -> dict[str, Any]:
    scan = scan_repository(root)
    broken: list[dict[str, str]] = []
    checked = 0
    heading_cache: dict[Path, set[str]] = {}
    for item in scan.files:
        rel = item["path"]
        if Path(rel).suffix.lower() not in {".md", ".mdx"} or item["binary"]:
            continue
        source = root / rel
        text = text_excerpt(source, max_bytes=2 * 1024 * 1024)
        targets = [match.group(1).strip().split()[0].strip("<>\"'") for match in MARKDOWN_LINK_RE.finditer(text)]
        targets.extend(match.group(1).strip() for match in HTML_LINK_RE.finditer(text))
        if source.name == "SKILL.md":
            targets.extend(match.group(1).rstrip(".,:;)") for match in RESOURCE_PATH_RE.finditer(text))
        for raw_target in sorted(set(targets)):
            target = unquote(raw_target)
            if not target or "{{" in target or "}}" in target or target.startswith(("http://", "https://", "mailto:", "data:", "#")):
                continue
            checked += 1
            path_part, _, anchor = target.partition("#")
            resolved = (source.parent / path_part).resolve()
            try:
                resolved.relative_to(root)
            except ValueError:
                broken.append({"source": rel, "target": raw_target, "reason": "escapes-root"})
                continue
            if not resolved.exists():
                broken.append({"source": rel, "target": raw_target, "reason": "missing"})
                continue
            if anchor and resolved.is_file() and resolved.suffix.lower() in {".md", ".mdx"}:
                headings = heading_cache.setdefault(resolved, _headings(resolved))
                if anchor.lower() not in headings:
                    broken.append({"source": rel, "target": raw_target, "reason": "missing-anchor"})
    return {
        "schema_version": "1.0.0",
        "root": str(root),
        "valid": not broken,
        "checked_references": checked,
        "broken_references": broken,
        "warnings": scan.warnings,
        "scan_truncated": scan.truncated,
    }


def _headings(path: Path) -> set[str]:
    anchors: set[str] = set()
    counts: dict[str, int] = {}
    for line in text_excerpt(path, max_bytes=2 * 1024 * 1024).splitlines():
        if not line.startswith("#"):
            continue
        title = line.lstrip("#").strip().lower()
        slug = HEADING_CLEAN_RE.sub("", title).strip().replace(" ", "-")
        suffix = counts.get(slug, 0)
        counts[slug] = suffix + 1
        anchors.add(slug if suffix == 0 else f"{slug}-{suffix}")
    return anchors


def detect_drift(root: Path, manifest_path: Optional[Path] = None) -> dict[str, Any]:
    manifest_path = manifest_path or root / ".harness" / "manifest.json"
    validation = validate_manifest_file(manifest_path, root=root)
    if not validation["valid"]:
        return {
            "schema_version": "1.0.0",
            "root": str(root),
            "valid_manifest": False,
            "drift": [{"category": "manifest-invalid", "path": str(manifest_path), "evidence": validation["errors"]}],
            "has_drift": True,
            "read_only": True,
        }
    manifest = read_json(manifest_path)
    events: list[dict[str, Any]] = []
    for item in manifest.get("managed_files", []):
        _compare_recorded(root, item, "managed-content", events)
    source_path = root / Path(*manifest["source_index"].split("/"))
    try:
        source_data = read_json(source_path)
        for item in source_data.get("sources", []):
            _compare_recorded(root, item, "source", events)
    except HarnessError as exc:
        events.append({"category": "source-index-invalid", "path": manifest["source_index"], "reason": str(exc)})
    events.sort(key=lambda item: (item.get("category", ""), item.get("path", "")))
    return {
        "schema_version": "1.0.0",
        "root": str(root),
        "valid_manifest": True,
        "has_drift": bool(events),
        "drift": events,
        "read_only": True,
    }


def _compare_recorded(root: Path, item: dict[str, Any], category: str, events: list[dict[str, Any]]) -> None:
    rel = item.get("path")
    if not isinstance(rel, str) or not safe_relative_path(rel):
        events.append({"category": f"{category}-invalid-path", "path": str(rel)})
        return
    path = root / Path(*rel.split("/"))
    recorded = item.get("sha256")
    if not path.is_file() or path.is_symlink():
        events.append({"category": f"{category}-missing", "path": rel})
        return
    if not recorded:
        events.append({"category": f"{category}-baseline-missing", "path": rel, "current_sha256": sha256_file(path)})
        return
    current = sha256_file(path)
    if current != recorded:
        events.append({"category": f"{category}-modified", "path": rel, "recorded_sha256": recorded, "current_sha256": current})


def validate_structure(root: Path) -> dict[str, Any]:
    required = [
        "AGENTS.md", ".harness/manifest.json", ".harness/source-index.json",
        ".harness/unresolved.json", "docs/PRODUCT.md", "docs/ARCHITECTURE.md",
        "docs/DEVELOPMENT.md", "docs/TESTING.md", "docs/ACCEPTANCE.md",
    ]
    missing = [rel for rel in required if not (root / Path(*rel.split("/"))).is_file()]
    manifest_result: Optional[dict[str, Any]] = None
    if not missing or ".harness/manifest.json" not in missing:
        manifest_result = validate_manifest_file(root / ".harness" / "manifest.json", root=root)
    refs = check_references(root)
    issues: list[dict[str, Any]] = [{"kind": "missing-required-file", "path": rel} for rel in missing]
    if manifest_result and not manifest_result["valid"]:
        issues.append({"kind": "manifest-invalid", "evidence": manifest_result["errors"]})
    issues.extend({"kind": "broken-reference", **item} for item in refs["broken_references"])
    return {
        "schema_version": "1.0.0",
        "root": str(root),
        "valid": not issues,
        "issues": issues,
        "manifest": manifest_result,
        "reference_check": {"checked": refs["checked_references"], "broken": len(refs["broken_references"])},
        "read_only": True,
    }


HEALTH_WEIGHTS = {
    "understandability": 10,
    "agents-entry": 6,
    "product-architecture-implementation-consistency": 10,
    "instruction-conflicts": 7,
    "documentation-drift": 8,
    "command-veracity": 8,
    "change-boundaries": 7,
    "verification-loop": 8,
    "source-traceability": 7,
    "state-continuity": 5,
    "file-ownership": 6,
    "context-efficiency": 5,
    "cross-agent-compatibility": 4,
    "updateability": 5,
    "safety": 2,
    "nonfiction": 2,
}


def score_health(root: Path) -> dict[str, Any]:
    dimensions: list[dict[str, Any]] = []
    observed = {path: (root / path).is_file() for path in [
        "AGENTS.md", "docs/PRODUCT.md", "docs/ARCHITECTURE.md", "docs/DEVELOPMENT.md",
        "docs/TESTING.md", "docs/ACCEPTANCE.md", ".harness/manifest.json",
        ".harness/source-index.json", ".harness/unresolved.json",
    ]}
    agents_text = text_excerpt(root / "AGENTS.md") if observed["AGENTS.md"] else ""
    agents_lines = len(agents_text.splitlines())
    drift = None
    if observed[".harness/manifest.json"]:
        try:
            drift = detect_drift(root)
        except HarnessError as exc:
            drift = {"has_drift": True, "drift": [{"category": "analysis-error", "reason": str(exc)}]}

    checks: dict[str, tuple[float, list[dict[str, Any]], str]] = {
        "understandability": (
            _ratio(observed, ["AGENTS.md", "docs/PRODUCT.md", "docs/ARCHITECTURE.md"]),
            _missing_evidence(observed, ["AGENTS.md", "docs/PRODUCT.md", "docs/ARCHITECTURE.md"]),
            "structural evidence only",
        ),
        "agents-entry": (
            1.0 if observed["AGENTS.md"] and 0 < agents_lines <= 120 else (0.5 if observed["AGENTS.md"] else 0.0),
            [] if observed["AGENTS.md"] and 0 < agents_lines <= 120 else [{"path": "AGENTS.md", "finding": "missing, empty, or longer than 120 lines", "lines": agents_lines}],
            "measured",
        ),
        "product-architecture-implementation-consistency": (
            0.5 if observed["docs/PRODUCT.md"] and observed["docs/ARCHITECTURE.md"] else 0.0,
            _missing_evidence(observed, ["docs/PRODUCT.md", "docs/ARCHITECTURE.md"]),
            "semantic consistency requires host-agent review; score capped at 50%",
        ),
        "instruction-conflicts": (
            0.0 if any(marker in agents_text for marker in CONFLICT_MARKERS) else (1.0 if observed["AGENTS.md"] else 0.0),
            [{"path": "AGENTS.md", "finding": "merge conflict markers"}] if any(marker in agents_text for marker in CONFLICT_MARKERS) else [],
            "marker-based evidence",
        ),
        "documentation-drift": (
            1.0 if drift is not None and not drift["has_drift"] else (0.0 if drift is not None else 0.25),
            drift.get("drift", []) if drift else [{"path": ".harness/manifest.json", "finding": "no managed baseline"}],
            "fingerprint evidence",
        ),
        "command-veracity": (
            0.5 if observed["docs/DEVELOPMENT.md"] else 0.0,
            _missing_evidence(observed, ["docs/DEVELOPMENT.md"]),
            "command existence can be checked; successful execution requires host evidence",
        ),
        "change-boundaries": (
            1.0 if "Preserve" in agents_text or "preserve" in agents_text else 0.0,
            [] if "preserve" in agents_text.lower() else [{"path": "AGENTS.md", "finding": "no explicit preservation boundary"}],
            "textual evidence",
        ),
        "verification-loop": (
            _ratio(observed, ["docs/TESTING.md", "docs/ACCEPTANCE.md"]),
            _missing_evidence(observed, ["docs/TESTING.md", "docs/ACCEPTANCE.md"]),
            "structural evidence only",
        ),
        "source-traceability": (
            1.0 if observed[".harness/source-index.json"] else 0.0,
            _missing_evidence(observed, [".harness/source-index.json"]),
            "state-file evidence",
        ),
        "state-continuity": (
            _ratio(observed, [".harness/manifest.json", ".harness/unresolved.json"]),
            _missing_evidence(observed, [".harness/manifest.json", ".harness/unresolved.json"]),
            "state-file evidence",
        ),
        "file-ownership": (
            1.0 if observed[".harness/manifest.json"] else 0.0,
            _missing_evidence(observed, [".harness/manifest.json"]),
            "manifest evidence",
        ),
        "context-efficiency": (
            1.0 if observed["AGENTS.md"] and agents_lines <= 120 else 0.0,
            [] if observed["AGENTS.md"] and agents_lines <= 120 else [{"path": "AGENTS.md", "finding": "entry point is not concise", "lines": agents_lines}],
            "line-count evidence; document count adds no points",
        ),
        "cross-agent-compatibility": (
            0.5 if observed["AGENTS.md"] else 0.0,
            _missing_evidence(observed, ["AGENTS.md"]),
            "client-specific compatibility requires live verification",
        ),
        "updateability": (
            1.0 if observed[".harness/manifest.json"] and observed[".harness/source-index.json"] else 0.0,
            _missing_evidence(observed, [".harness/manifest.json", ".harness/source-index.json"]),
            "managed-state evidence",
        ),
        "safety": (
            0.5 if observed["AGENTS.md"] else 0.0,
            _missing_evidence(observed, ["AGENTS.md"]),
            "secret handling and safe-change boundaries require host evidence; score capped at 50%",
        ),
        "nonfiction": (
            0.5 if observed["docs/ACCEPTANCE.md"] else 0.0,
            _missing_evidence(observed, ["docs/ACCEPTANCE.md"]),
            "semantic non-fiction review requires host evidence; score capped at 50%",
        ),
    }

    total = 0.0
    for identifier, weight in HEALTH_WEIGHTS.items():
        ratio, evidence, assessment = checks[identifier]
        points = round(weight * ratio, 2)
        total += points
        dimensions.append({
            "id": identifier,
            "score": points,
            "max_score": weight,
            "assessment": assessment,
            "evidence": evidence,
        })
    score = round(total, 2)
    return {
        "schema_version": "1.0.0",
        "root": str(root),
        "score": score,
        "max_score": 100,
        "grade": "A" if score >= 90 else "B" if score >= 80 else "C" if score >= 70 else "D" if score >= 60 else "F",
        "dimensions": dimensions,
        "rule": "File count never adds points; semantic dimensions remain capped without host-agent evidence.",
        "read_only": True,
    }


def _ratio(observed: dict[str, bool], keys: list[str]) -> float:
    return sum(1 for key in keys if observed[key]) / len(keys)


def _missing_evidence(observed: dict[str, bool], keys: list[str]) -> list[dict[str, str]]:
    return [{"path": key, "finding": "missing"} for key in keys if not observed[key]]
