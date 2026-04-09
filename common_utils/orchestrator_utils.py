"""
common_utils/orchestrator_utils.py

Shared utilities for all Doctor AI subsystems (audio, face, gait).
Place this at: smart-exam-room/common_utils/orchestrator_utils.py

The face subsystem imports it as:
    from common_utils.orchestrator_utils import update_manifest_status
"""

import json
from pathlib import Path


def update_manifest_status(visit_dir: Path, subsystem: str, status: str) -> bool:
    """
    Update a subsystem's status field in manifest.json.

    Args:
        visit_dir:  Path to the visit folder  e.g. runs/visit_abc123/
        subsystem:  "audio" | "face" | "gait"
        status:     "pending" | "running" | "done" | "error"

    Returns:
        True on success, False if manifest not found or write failed.
    """
    manifest_path = visit_dir / "manifest.json"
    if not manifest_path.exists():
        print(f"[orchestrator_utils] WARN: no manifest at {manifest_path} — skipping status update")
        return False
    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
        manifest.setdefault("status", {})[subsystem] = status
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2)
        print(f"[orchestrator_utils] manifest updated: {subsystem} → {status}")
        return True
    except Exception as e:
        print(f"[orchestrator_utils] ERROR: {e}")
        return False


def read_manifest(visit_dir: Path) -> dict:
    """Read manifest.json, return {} if missing."""
    p = visit_dir / "manifest.json"
    if not p.exists():
        return {}
    try:
        with open(p, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}
