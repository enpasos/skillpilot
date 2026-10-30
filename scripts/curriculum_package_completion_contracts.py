"""Closed runtime-1.1 extension; the original V1 trust files stay unchanged."""

from __future__ import annotations

from pathlib import Path

PROFILE_ID = "full-standalone-completion-v1"
CAPABILITY = "assessmentCompletionV1"
CATALOG_SCHEMA_ID = "https://skillpilot.com/schemas/curriculum-package/v1.1/runtime-catalog.schema.json"
ARTIFACT_SCHEMA_ID = "https://skillpilot.com/schemas/curriculum-package/v1.1/completion-artifact.schema.json"
PROFILE_SCHEMA_ID = "https://skillpilot.com/schemas/assessment-completion/v1/profile.schema.json"
SCOPE_SCHEMA_ID = "https://skillpilot.com/schemas/assessment-completion/v1/scope.schema.json"
ROLES = {"profile": "completion-profile", "scope": "completion-scope", "review": "completion-rule-review"}


def extended_directory(directory: Path) -> bool:
    return (directory / "profiles" / f"{PROFILE_ID}.profile.json").is_file()


def base_directory(directory: Path) -> Path:
    return directory.parent / "v1" if extended_directory(directory) else directory


def profile_path(directory: Path) -> Path:
    name = PROFILE_ID if extended_directory(directory) else "full-standalone-v1"
    return directory / "profiles" / f"{name}.profile.json"


def extra_schemas(directory: Path) -> tuple[tuple[str, Path], ...]:
    core = directory.parent.parent / "assessment-completion" / "v1"
    return (
        (CATALOG_SCHEMA_ID, directory / "runtime-catalog.schema.json"),
        (ARTIFACT_SCHEMA_ID, directory / "completion-artifact.schema.json"),
        (PROFILE_SCHEMA_ID, core / "profile.schema.json"),
        (SCOPE_SCHEMA_ID, core / "scope.schema.json"),
    )


def schema_package_path(schema_id: str) -> str:
    name = schema_id.rsplit("/", 1)[-1]
    if "/curriculum-package/v1.1/" in schema_id:
        return f"schemas/v1.1/{name}"
    if "/assessment-completion/" in schema_id:
        return f"schemas/assessment-completion/{name}"
    return f"schemas/{name}"
