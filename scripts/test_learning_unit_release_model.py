#!/usr/bin/env python3
"""End-to-end proof of the runtime-1.2 learning-unit lane on the real Mathematics release model.

The test never writes into ``curricula/``. It reads the canonical Mathematics
landscape once, projects out the learning units it already carries, injects one
test unit in memory and serves that copy to the release compiler and the
independent release-model validator in place of the canonical file. The
prerequisite-reduction proof is still verified by the real Node verifier against
the unchanged canonical file, after checking that the injected copy differs from
it only in learning-unit fields (the proof fingerprints documents without that layer).

The Mathematics release uses package 1.3 to transport the 1.2 landscape
and the partial orders of its format-1.2 views. We compare complete builds
with and without the injected unit, then repeat with its coverage review.
Older package profiles must reject the current views. Other subjects have
older views, but there is no trusted legacy standalone build profile for
any of them. A full older-profile build cannot test layer removal today.

Usage: python3 -B scripts/test_learning_unit_release_model.py [--work-dir DIR] [--keep]
The work directory must be outside the repository or below repository tmp/.
"""
from __future__ import annotations

import argparse
import contextlib
import copy
import filecmp
import json
import shutil
import sys
import tempfile
import time
from pathlib import Path
from typing import Any, Callable, Iterator

sys.dont_write_bytecode = True

import compile_curriculum_release_model as compiler  # noqa: E402
import curriculum_learning_units as lu  # noqa: E402
import curriculum_package_learning_unit_contracts as contracts  # noqa: E402
import prerequisite_reduction_semantic_kind as reduction  # noqa: E402
import validate_curriculum_release_model as validator  # noqa: E402

REPO = Path(__file__).resolve().parents[1]
CANONICAL = REPO / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json"
PROFILES = {
    "1.3": REPO / "contracts/curriculum-package/v1.3/profiles/de-gymnasium-mathematik-release-model-v1.3.profile.json",
    "1.0": REPO / "contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-release-model-v1.profile.json",
    "1.1": REPO / "contracts/curriculum-package/v1.1/profiles/de-gymnasium-mathematik-completion-release-model-v1.profile.json",
    "1.2": REPO / "contracts/curriculum-package/v1.2/profiles/de-gymnasium-mathematik-learning-units-release-model-v1.profile.json",
}
UNIT_ID = "math-dot-product-projection"
OWN_GOALS = ("3016ec37-1c2e-47db-83f5-e767923bc97e", "e98672c6-871a-5d0b-889c-5afc51040f0d")
UNIT = {
    "id": UNIT_ID,
    "kind": "learningUnit",
    "label": "Skalarprodukt und orthogonale Projektion",
    "labelEn": "Dot product and orthogonal projection",
    "promise": "Ich kann das Skalarprodukt über eine orthogonale Projektion selbstständig erklären und anwenden.",
    "promiseEn": "I can independently explain and apply the dot product through an orthogonal projection.",
    "revision": "2026-11-12-v1",
}
# Files whose bytes legitimately differ when the learning-unit layer changes on otherwise identical input.
RUNTIME_GENERATED = {
    "data/canonical/mathematik.landscape.json",
    "data/runtime/catalog.json",
    "data/runtime/dependency-closure.json",
    "data/runtime/migration-aliases.json",
    "metadata/semantic-content-index.json",
    "metadata/build-inputs.json",
    "metadata/field-coverage.json",
    "metadata/release-model-conformance.json",
}


# The 1.1 build profile pins the previous edition of the publication metadata.
# Its retained bytes are already in the repository. The compiler checks the
# profile's original SHA-256 before it gets to the current source views.
RETAINED_11_PUBLICATION_PROFILE = (
    "qa-artifacts/native-review-inputs/2026-10-07/schema-artifact-layout-preservation-technical-20261007-v1/"
    "native-contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-publication-evidence-v1.profile.json"
)

REVIEW_RECORD = REPO / "curricula/DE/Gymnasium/quality/learning-units/math-dot-product-projection-2026-11-12.md"


def inject_reviewed(document: dict[str, Any]) -> dict[str, Any]:
    """The injected unit plus a coverage review on the unit, bound to the current task and rubric."""
    result = inject(document)
    exam = next(goal for goal in result["goals"] if goal["id"] == OWN_GOALS[1])
    unit = next(unit for unit in result["programUnits"] if unit.get("id") == UNIT_ID)
    unit["coverageReviews"] = [{"assessmentGoalId": OWN_GOALS[1], "goalIds": [OWN_GOALS[0]],
                                "reference": str(REVIEW_RECORD.relative_to(REPO)), **lu.assessment_review_revisions(exam)}]
    return result


def inject(document: dict[str, Any]) -> dict[str, Any]:
    result = copy.deepcopy(document)
    result.setdefault("programUnits", []).append(copy.deepcopy(UNIT))
    result.setdefault("goalPlacements", []).extend(
        {"goalId": goal_id, "unitId": UNIT_ID, "relation": "own"} for goal_id in OWN_GOALS)
    return result


class Inputs:
    """In-memory source substitution for one compile/validate run; no repository file is written."""

    def __init__(self, source: dict[str, Any], canonical: dict[str, Any]) -> None:
        self.source = source
        self.canonical = canonical
        self.landscape = canonical
        self.profile_overrides: dict[Path, dict[str, Any]] = {}
        self._receipt: Any = None
        self._real_binding = reduction.load_verified_semantic_kind_bindings

    def load_json(self, original: Callable[[Path], Any]) -> Callable[[Path], Any]:
        def load(path: Path) -> Any:
            resolved = Path(path).resolve()
            if resolved == CANONICAL.resolve():
                return copy.deepcopy(self.landscape)
            if resolved in self.profile_overrides:
                return copy.deepcopy(self.profile_overrides[resolved])
            return original(path)
        return load

    def binding(self, repository_root: Path, source_path: Path, document: Any, fingerprints: Any) -> Any:
        if Path(source_path).resolve() != CANONICAL.resolve():
            raise AssertionError(f"Unexpected canonical source {source_path}")
        if lu.project_out_learning_units(document) != self.canonical:
            raise AssertionError("The injected landscape differs from the canonical file outside learning-unit fields")
        if self._receipt is None:
            started = time.monotonic()
            self._receipt = self._real_binding(repository_root, CANONICAL, self.source, fingerprints)
            print(f"  prerequisite-reduction proof verified once against the unchanged canonical file "
                  f"({time.monotonic() - started:.0f} s)", flush=True)
        return self._receipt

    @contextlib.contextmanager
    def active(self, landscape: dict[str, Any]) -> Iterator[None]:
        self.landscape = landscape
        saved = (compiler.load_json, validator.load_json,
                 compiler.load_verified_semantic_kind_bindings, validator.load_verified_semantic_kind_bindings)
        compiler.load_json = self.load_json(saved[0])
        validator.load_json = self.load_json(saved[1])
        compiler.load_verified_semantic_kind_bindings = self.binding
        validator.load_verified_semantic_kind_bindings = self.binding
        try:
            yield
        finally:
            (compiler.load_json, validator.load_json,
             compiler.load_verified_semantic_kind_bindings, validator.load_verified_semantic_kind_bindings) = saved


def compile_into(inputs: Inputs, version: str, landscape: dict[str, Any], output: Path) -> dict[str, Any]:
    started = time.monotonic()
    with inputs.active(landscape):
        summary = compiler.compile_model(PROFILES[version], output)
    print(f"  compiled {version} ({'injected' if landscape is not inputs.canonical else 'canonical'}) "
          f"in {time.monotonic() - started:.0f} s", flush=True)
    return summary


def validate(inputs: Inputs, version: str, landscape: dict[str, Any], output: Path, *, adversarial: bool = False) -> None:
    started = time.monotonic()
    with inputs.active(landscape):
        context = validator.load_trusted_context(PROFILES[version])
        model = validator.build_expected_model(context, output)
        validator.complete_expected_model(context, model)
        documents = validator.validate_output_files(context, model)
        validator.validate_cross_document_integrity(context, model, documents)
        cases = validator.run_adversarial_self_tests(context, model, documents) if adversarial else []
    print(f"  independently validated {version} in {time.monotonic() - started:.0f} s"
          + (f" with {len(cases)} adversarial cases" if adversarial else ""), flush=True)


def tree(root: Path) -> dict[str, Path]:
    return {str(path.relative_to(root)): path for path in sorted(root.rglob("*")) if path.is_file()}


def require_refused_downgrade(inputs: Inputs, version: str, landscape: dict[str, Any], output: Path) -> None:
    try:
        compile_into(inputs, version, landscape, output)
    except compiler.CompilationError as error:
        if "unsupported composition view format for the selected DPK profile; refusing downgrade to 1.0" not in str(error):
            raise
        print(f"  package {version} refused the current view format", flush=True)
        return
    raise AssertionError(f"Package {version} accepted a view that it cannot represent")


def run(work: Path) -> None:
    source = json.loads(CANONICAL.read_bytes())
    # The baseline is the canonical landscape without its own learning units, so the
    # test unit is the only one and the proof keeps the file's real binding.
    canonical = lu.project_out_learning_units(source)
    if canonical["goals"] != source["goals"]:
        raise AssertionError("The learning-unit projection changed a goal object")
    injected = inject(canonical)
    inputs = Inputs(source, canonical)
    legacy_profile = json.loads(PROFILES["1.1"].read_bytes())
    legacy_profile["contracts"]["publicationEvidenceProfilePath"] = RETAINED_11_PUBLICATION_PROFILE
    inputs.profile_overrides[PROFILES["1.1"].resolve()] = legacy_profile
    for legacy_version in ("1.0", "1.1"):
        require_refused_downgrade(inputs, legacy_version, source, work / f"{legacy_version}-original")
        require_refused_downgrade(inputs, legacy_version, injected, work / f"{legacy_version}-injected")

    version = "1.3"
    package_profile = json.loads(PROFILES[version].read_bytes())
    inputs.profile_overrides[PROFILES[version].resolve()] = package_profile
    counts = package_profile["learningUnits"]["expectedCounts"]
    outputs = {name: work / name for name in ("baseline", "injected", "reviewed")}
    counts.update(learningUnits=0, ownPlacements=0, coverageReviews=0)
    compile_into(inputs, version, canonical, outputs["baseline"])
    validate(inputs, version, canonical, outputs["baseline"])

    counts.update(learningUnits=1, ownPlacements=2, coverageReviews=0)
    summary = compile_into(inputs, version, injected, outputs["injected"])
    validate(inputs, version, injected, outputs["injected"], adversarial=True)
    if summary["learningUnitCounts"] != {"learningUnits": 1, "ownPlacements": 2, "coverageReviews": 0}:
        raise AssertionError(f"Unexpected learning-unit counts {summary['learningUnitCounts']}")

    baseline, with_unit = tree(outputs["baseline"]), tree(outputs["injected"])
    if set(baseline) != set(with_unit):
        raise AssertionError(f"1.2 file set differs: {sorted(set(baseline) ^ set(with_unit))}")
    unexpected = [name for name in baseline if name not in RUNTIME_GENERATED
                  and not filecmp.cmp(baseline[name], with_unit[name], shallow=False)]
    if unexpected:
        raise AssertionError(f"1.2 build changed content outside the learning-unit layer: {unexpected[:10]}")
    base_landscape = json.loads(baseline["data/canonical/mathematik.landscape.json"].read_bytes())
    landscape_12 = json.loads(with_unit["data/canonical/mathematik.landscape.json"].read_bytes())
    if landscape_12["$schema"] != contracts.LANDSCAPE_SCHEMA_ID or landscape_12["landscapeFormatVersion"] != "1.2":
        raise AssertionError("1.2 landscape does not declare the 1.2 landscape schema")
    projected = lu.project_out_learning_units(landscape_12)
    if projected != base_landscape:
        raise AssertionError("1.2 landscape differs from the baseline landscape outside the learning-unit fields")
    if [unit for unit in landscape_12["programUnits"] if lu.is_learning_unit(unit)] != [UNIT]:
        raise AssertionError("1.2 landscape lost or changed the learning unit")
    if lu.has_learning_unit_content(base_landscape):
        raise AssertionError("baseline landscape carries learning-unit fields")
    catalog_12 = json.loads(with_unit["data/runtime/catalog.json"].read_bytes())
    base_catalog = json.loads(baseline["data/runtime/catalog.json"].read_bytes())
    if (catalog_12["runtimeContractVersion"], catalog_12["catalogVersion"], catalog_12["learningUnitReviews"]) != (
        version, version, []
    ) or catalog_12["capabilities"] != base_catalog["capabilities"] or contracts.CAPABILITY not in catalog_12["capabilities"]:
        raise AssertionError("The current package must carry the 1.2 learning-unit capability")
    findings = lu.validate_package_learning_units([landscape_12], [])
    if findings:
        raise AssertionError(f"Injected unit is not a valid learning unit: {[f.as_dict() for f in findings]}")
    print("  1.2 build: one learning unit, two own placements, no coverage review; "
          "independent validation and package rules pass", flush=True)

    # A coverage review belongs to the unit. Its record travels unchanged.
    if not REVIEW_RECORD.is_file():
        print(f"  reviewed variant skipped: {REVIEW_RECORD.relative_to(REPO)} is absent", flush=True)
        return
    reviewed = inject_reviewed(canonical)
    if reviewed["goals"] != canonical["goals"]:
        raise AssertionError("Adding a unit-level coverage review changed a goal object")
    counts.update(coverageReviews=1)
    summary = compile_into(inputs, version, reviewed, outputs["reviewed"])
    validate(inputs, version, reviewed, outputs["reviewed"])
    reviewed_tree = tree(outputs["reviewed"])
    landscape = json.loads(reviewed_tree["data/canonical/mathematik.landscape.json"].read_bytes())
    if landscape["goals"] != landscape_12["goals"]:
        raise AssertionError("A unit-level coverage review changed exported goal objects")
    review = next(unit for unit in landscape["programUnits"] if unit.get("id") == UNIT_ID)["coverageReviews"][0]
    artifact = json.loads(reviewed_tree[review["reference"]].read_bytes())
    catalog = json.loads(reviewed_tree["data/runtime/catalog.json"].read_bytes())
    if (artifact["definition"]["content"].encode("utf-8") != REVIEW_RECORD.read_bytes()
            or catalog["learningUnitReviews"] != [{"id": review["reference"], "artifactPath": review["reference"]}]
            or summary["learningUnitCounts"]["coverageReviews"] != 1):
        raise AssertionError("1.2 build did not ship exactly the unchanged review record")
    print("  reviewed 1.2 build: review record shipped unchanged, goal objects identical; validation passes", flush=True)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--work-dir", type=Path, help="empty work directory (default: a new temporary directory)")
    parser.add_argument("--keep", action="store_true", help="keep unpacked release models and rejected-build diagnostics")
    args = parser.parse_args(argv)
    work = args.work_dir.resolve() if args.work_dir else Path(tempfile.mkdtemp(prefix="learning-unit-release-model-"))
    if work.is_relative_to(REPO) and not work.is_relative_to(REPO / "tmp"):
        raise SystemExit("The work directory must be outside the repository or below repository tmp/")
    work.mkdir(parents=True, exist_ok=True)
    if any(work.iterdir()):
        raise SystemExit(f"The work directory is not empty: {work}")
    try:
        run(work)
    finally:
        if not args.keep:
            shutil.rmtree(work, ignore_errors=True)
    print("Learning-unit release-model end-to-end proof passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
