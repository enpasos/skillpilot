"""Closed runtime-1.2 learning-unit extension of the unchanged V1 trust files.

Runtime 1.2 extends runtime 1.0 with the ``learningUnitsV1`` capability. It is
not a superset of runtime 1.1: the superseded ``assessmentCompletionV1``
artifacts stay a separate, exactly selected 1.1 profile.
"""

from __future__ import annotations

from pathlib import Path

PROFILE_ID = "full-standalone-learning-units-v1"
FWU_PROFILE_ID = "fwu-owl-learning-units-v1"
REGISTRY_ID = "skillpilot-fwu-field-semantics-learning-units-v1"
REGISTRY_VERSION = "1.2.0"
CAPABILITY = "learningUnitsV1"
RUNTIME_CONTRACT_VERSION = "1.2"
CONTRACT_DIRECTORY_NAME = "v1.2"
SCHEMA_PREFIX = "https://skillpilot.com/schemas/curriculum-package/v1.2/"
CATALOG_SCHEMA_ID = SCHEMA_PREFIX + "runtime-catalog.schema.json"
LANDSCAPE_SCHEMA_ID = SCHEMA_PREFIX + "compiled-landscape.schema.json"
REVIEW_SCHEMA_ID = SCHEMA_PREFIX + "learning-unit-coverage-review.schema.json"
BUILD_PROFILE_SCHEMA_ID = SCHEMA_PREFIX + "release-model-build-profile.schema.json"
LANDSCAPE_FORMAT_VERSION = "1.2"
REVIEW_ROLE = "learning-unit-coverage-review"
REVIEW_OUTPUT_DIRECTORY = "data/learning-units/reviews"
ROLES = {"review": REVIEW_ROLE}
V1_LANDSCAPE_SCHEMA_ID = "https://skillpilot.com/schemas/curriculum-package/v1/compiled-landscape.schema.json"


def extended_directory(directory: Path) -> bool:
    return (directory / "profiles" / f"{PROFILE_ID}.profile.json").is_file()


def base_directory(directory: Path) -> Path:
    return directory.parent / "v1" if extended_directory(directory) else directory


def profile_path(directory: Path) -> Path:
    name = PROFILE_ID if extended_directory(directory) else "full-standalone-v1"
    return directory / "profiles" / f"{name}.profile.json"


def extra_schemas(directory: Path) -> tuple[tuple[str, Path], ...]:
    return (
        (LANDSCAPE_SCHEMA_ID, directory / "compiled-landscape.schema.json"),
        (CATALOG_SCHEMA_ID, directory / "runtime-catalog.schema.json"),
        (REVIEW_SCHEMA_ID, directory / "learning-unit-coverage-review.schema.json"),
    )


def schema_package_path(schema_id: str) -> str:
    name = schema_id.rsplit("/", 1)[-1]
    if schema_id.startswith(SCHEMA_PREFIX):
        return f"schemas/v1.2/{name}"
    return f"schemas/{name}"


# FWU-OWL carrier: explicit graph assertions that supplement the registered
# lossless fields. Ownership, the unit hierarchy and every coverage review are
# real RDF relationships, verified again on reverse compilation.
RDF_CLASSES = ("LearningUnit", "LearningUnitCoverageReview", "LearningUnitCoverageReviewRecord")
RDF_OBJECT_PROPERTIES = ("coverageReviewedAssessment", "coverageReviewedGoal", "hasCoverageReview",
                         "hasCoverageReviewRecord", "hasParentLearningUnit", "ownsGoal")
# Task and rubric revisions are registered typed literals of each review record.
RDF_DATATYPE_PROPERTIES = ("coverageReviewContentSha256",)
FWU_PROFILE_VERSION = "1.2.0"
FWU_ONTOLOGY_IRI = "https://skillpilot.com/ontology/curriculum-package/v1.2/skillpilot-fwu-profile-learning-units.owl"
FWU_ONTOLOGY_VERSION_IRI = "https://skillpilot.com/ontology/curriculum-package/v1.2/skillpilot-fwu-profile-learning-units-1.2.0.owl"
FWU_ONTOLOGY_FILE = "skillpilot-fwu-profile-learning-units-1.2.0.ttl"
FWU_SCHEMA_NAMES = ("fwu-owl-package-manifest.schema.json", "fwu-owl-package-profile.schema.json",
                    "fwu-owl-package-validation-report.schema.json")
