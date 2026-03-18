from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
TOOLING_REGISTRY_PATH_CANDIDATES = (
    ROOT / "curricula/DE/Gymnasium/input/DE-HE/retained-asset-registry.json",
    ROOT / "curricula/DE/Gymnasium/input/HE/retained-asset-registry.json",
)
LEGACY_UPPER_SECONDARY_PATH_PREFIX = "curricula/DE/Gymnasium/input/DE-HE/"
UPPER_SECONDARY_PATH_PREFIX = "curricula/DE/Gymnasium/input/HE/"


@dataclass(frozen=True)
class HessenUpperSecondaryExamPaths:
    source_landscape_id: str
    source_landscape_registry_path: Path
    landscape_path: Path
    slot_matrix_path: Path
    coverage_path: Path
    task_bank_path: Path


def _load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def _normalize_tooling_path(path_value: str) -> str:
    return path_value.replace(
        LEGACY_UPPER_SECONDARY_PATH_PREFIX,
        UPPER_SECONDARY_PATH_PREFIX,
    )


def _tooling_registry_path() -> Path:
    for candidate in TOOLING_REGISTRY_PATH_CANDIDATES:
        if candidate.exists():
            return candidate
    raise FileNotFoundError(
        "Missing Hessen upper-secondary tooling registry: "
        + ", ".join(str(path) for path in TOOLING_REGISTRY_PATH_CANDIDATES)
    )


@lru_cache(maxsize=1)
def _tooling_registry() -> dict:
    return _load_json(_tooling_registry_path())


@lru_cache(maxsize=1)
def _source_registry_entries() -> dict[str, dict]:
    source_registry_path = ROOT / _normalize_tooling_path(
        _tooling_registry()["sourceLandscapeRegistryPath"]
    )
    source_registry = _load_json(source_registry_path)
    return {
        entry["landscapeId"]: {
            **entry,
            "archiveSourcePath": (
                _normalize_tooling_path(entry["archiveSourcePath"])
                if entry.get("archiveSourcePath")
                else None
            ),
            "sourcePath": _normalize_tooling_path(entry["sourcePath"]),
        }
        for entry in source_registry["entries"]
    }


def _subject_registry(subject_key: str) -> dict:
    subject = _tooling_registry()["subjects"].get(subject_key)
    if subject is None:
        raise KeyError(f"Unknown Hessen upper-secondary subject key: {subject_key}")
    return subject


def resolve_hessen_upper_secondary_landscape_path(subject_key: str) -> Path:
    subject = _subject_registry(subject_key)
    landscape_entry = _source_registry_entries().get(subject["landscapeId"])
    if landscape_entry is None:
        raise KeyError(
            f"Missing source-landscape registry entry for Hessen upper-secondary landscapeId "
            f"{subject['landscapeId']}"
        )
    archive_source_path = landscape_entry.get("archiveSourcePath")
    if archive_source_path:
        return ROOT / _normalize_tooling_path(archive_source_path)
    return ROOT / _normalize_tooling_path(landscape_entry["sourcePath"])


def resolve_hessen_upper_secondary_landscape_directory(subject_key: str) -> Path:
    return resolve_hessen_upper_secondary_landscape_path(subject_key).parent


def resolve_hessen_upper_secondary_abi_directory(subject_key: str) -> Path:
    subject = _subject_registry(subject_key)
    return ROOT / _tooling_registry()["abiArchivePath"] / subject["abiDirectory"]


def resolve_hessen_upper_secondary_mapping_path(subject_key: str) -> Path:
    subject = _subject_registry(subject_key)
    mapping_file = subject.get("mappingFile")
    if not mapping_file:
        raise KeyError(f"Missing Hessen upper-secondary mapping file for subject key: {subject_key}")
    return ROOT / _normalize_tooling_path(_tooling_registry()["mappingArchivePath"]) / mapping_file


def resolve_hessen_upper_secondary_exam_paths(subject_key: str) -> HessenUpperSecondaryExamPaths:
    abi_directory = resolve_hessen_upper_secondary_abi_directory(subject_key)
    subject = _subject_registry(subject_key)
    return HessenUpperSecondaryExamPaths(
        source_landscape_id=subject["landscapeId"],
        source_landscape_registry_path=ROOT
        / _normalize_tooling_path(_tooling_registry()["sourceLandscapeRegistryPath"]),
        landscape_path=resolve_hessen_upper_secondary_landscape_path(subject_key),
        slot_matrix_path=abi_directory / "slot_matrix.json",
        coverage_path=abi_directory / "coverage_requirements.json",
        task_bank_path=abi_directory / "task_bank.json",
    )
