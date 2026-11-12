"""Closed selection among the software-pinned curriculum-package contract versions.

Runtime 1.0 is the published V1 directory. Runtime 1.1 (assessment completion)
and runtime 1.2 (learning units) are sibling extensions of 1.0; each lives in
its own directory and is recognised only by its own release-profile file.
"""

from __future__ import annotations

from pathlib import Path
from types import ModuleType

try:
    from . import curriculum_package_completion_contracts as completion_contracts
    from . import curriculum_package_learning_unit_contracts as learning_unit_contracts
except ImportError:  # Direct CLI execution from scripts/.
    import curriculum_package_completion_contracts as completion_contracts
    import curriculum_package_learning_unit_contracts as learning_unit_contracts

BASE_PROFILE_ID = "full-standalone-v1"
EXTENSIONS: tuple[ModuleType, ...] = (completion_contracts, learning_unit_contracts)
RUNTIME_CONTRACT_VERSIONS = {
    BASE_PROFILE_ID: "1.0",
    completion_contracts.PROFILE_ID: "1.1",
    learning_unit_contracts.PROFILE_ID: learning_unit_contracts.RUNTIME_CONTRACT_VERSION,
}


def extension(directory: Path) -> ModuleType | None:
    for module in EXTENSIONS:
        if module.extended_directory(directory):
            return module
    return None


def extension_for_profile_id(profile_id: object) -> ModuleType | None:
    return next((module for module in EXTENSIONS if module.PROFILE_ID == profile_id), None)


def extended_directory(directory: Path) -> bool:
    return extension(directory) is not None


def base_directory(directory: Path) -> Path:
    return directory.parent / "v1" if extended_directory(directory) else directory


def profile_path(directory: Path) -> Path:
    module = extension(directory)
    return module.profile_path(directory) if module else directory / "profiles" / f"{BASE_PROFILE_ID}.profile.json"


def profile_id(directory: Path) -> str:
    module = extension(directory)
    return module.PROFILE_ID if module else BASE_PROFILE_ID


def extra_schemas(directory: Path) -> tuple[tuple[str, Path], ...]:
    module = extension(directory)
    return module.extra_schemas(directory) if module else ()


def runtime_catalog_schema_id(module: ModuleType | None) -> str | None:
    """The catalog schema that replaces the V1 bootstrap catalog binding, if any."""
    return module.CATALOG_SCHEMA_ID if module else None


def runtime_contract_version(profile: object) -> str | None:
    return RUNTIME_CONTRACT_VERSIONS.get(profile)  # type: ignore[arg-type]
