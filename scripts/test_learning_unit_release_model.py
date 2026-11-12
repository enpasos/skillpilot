#!/usr/bin/env python3
"""End-to-end proof of the runtime-1.2 learning-unit lane on the real Mathematics release model.

The test never writes into ``curricula/``. It reads the canonical Mathematics
landscape once, injects one learning unit in memory and serves that copy to
the release compiler and the independent release-model validator in place of
the canonical file. The prerequisite-reduction proof is still verified by the
real Node verifier against the unchanged canonical file, after checking that
the injected copy differs from it only in learning-unit fields.

Proofs:
* 1.0 and 1.1 builds of the injected input are byte-identical to the builds of
  the unchanged canonical input (the learning-unit layer is projected out);
* the 1.2 build carries the unit and its own placements, passes the
  independent validator, and differs from the 1.0 build only in the 1.2
  landscape fields and the generated runtime/digest metadata.

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
# Files whose bytes legitimately differ between the 1.0 and the 1.2 build of the same input.
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

    def __init__(self, canonical: dict[str, Any]) -> None:
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
            self._receipt = self._real_binding(repository_root, CANONICAL, self.canonical, fingerprints)
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


def assert_identical(left: Path, right: Path, label: str) -> None:
    left_files, right_files = tree(left), tree(right)
    if set(left_files) != set(right_files):
        raise AssertionError(f"{label}: file sets differ: {sorted(set(left_files) ^ set(right_files))[:10]}")
    different = [name for name in left_files if not filecmp.cmp(left_files[name], right_files[name], shallow=False)]
    if different:
        raise AssertionError(f"{label}: files differ: {different[:10]}")
    print(f"  {label}: {len(left_files)} files byte-identical", flush=True)


def run(work: Path) -> None:
    canonical_bytes = CANONICAL.read_bytes()
    canonical = json.loads(canonical_bytes)
    if lu.has_learning_unit_content(canonical):
        raise AssertionError("This test injects the first learning unit; the canonical file already has learning units")
    injected = inject(canonical)
    inputs = Inputs(canonical)
    profile_12 = json.loads(PROFILES["1.2"].read_bytes())
    profile_12["learningUnits"]["expectedCounts"] = {"learningUnits": 1, "ownPlacements": 2, "coverageReviews": 0}
    inputs.profile_overrides[PROFILES["1.2"].resolve()] = profile_12

    outputs = {name: work / name for name in ("1.0-canonical", "1.0-injected", "1.1-canonical", "1.1-injected", "1.2-injected",
                                              "1.0-reviewed", "1.2-reviewed")}
    for version in ("1.0", "1.1"):
        compile_into(inputs, version, canonical, outputs[f"{version}-canonical"])
        compile_into(inputs, version, injected, outputs[f"{version}-injected"])
        assert_identical(outputs[f"{version}-canonical"], outputs[f"{version}-injected"],
                         f"{version} build is unaffected by the learning-unit layer")
    validate(inputs, "1.1", injected, outputs["1.1-injected"])
    validate(inputs, "1.0", injected, outputs["1.0-injected"])

    summary = compile_into(inputs, "1.2", injected, outputs["1.2-injected"])
    validate(inputs, "1.2", injected, outputs["1.2-injected"], adversarial=True)
    if summary["learningUnitCounts"] != {"learningUnits": 1, "ownPlacements": 2, "coverageReviews": 0}:
        raise AssertionError(f"Unexpected learning-unit counts {summary['learningUnitCounts']}")

    v10, v12 = tree(outputs["1.0-injected"]), tree(outputs["1.2-injected"])
    if set(v10) != set(v12):
        raise AssertionError(f"1.2 file set differs: {sorted(set(v10) ^ set(v12))}")
    unexpected = [name for name in v10 if name not in RUNTIME_GENERATED
                  and not filecmp.cmp(v10[name], v12[name], shallow=False)]
    if unexpected:
        raise AssertionError(f"1.2 build changed content outside the learning-unit layer: {unexpected[:10]}")
    landscape_10 = json.loads(v10["data/canonical/mathematik.landscape.json"].read_bytes())
    landscape_12 = json.loads(v12["data/canonical/mathematik.landscape.json"].read_bytes())
    if landscape_12["$schema"] != contracts.LANDSCAPE_SCHEMA_ID or landscape_12["landscapeFormatVersion"] != "1.2":
        raise AssertionError("1.2 landscape does not declare the 1.2 landscape schema")
    projected = lu.project_out_learning_units(landscape_12)
    projected.update({"$schema": landscape_10["$schema"], "landscapeFormatVersion": landscape_10["landscapeFormatVersion"]})
    if projected != landscape_10:
        raise AssertionError("1.2 landscape differs from the 1.0 landscape outside the learning-unit fields")
    if [unit for unit in landscape_12["programUnits"] if lu.is_learning_unit(unit)] != [UNIT]:
        raise AssertionError("1.2 landscape lost or changed the learning unit")
    if lu.has_learning_unit_content(landscape_10):
        raise AssertionError("1.0 landscape carries learning-unit fields")
    catalog_12 = json.loads(v12["data/runtime/catalog.json"].read_bytes())
    catalog_10 = json.loads(v10["data/runtime/catalog.json"].read_bytes())
    if (catalog_12["runtimeContractVersion"], catalog_12["catalogVersion"], catalog_12["learningUnitReviews"]) != ("1.2", "1.2", []) \
            or catalog_12["capabilities"] != [*catalog_10["capabilities"], contracts.CAPABILITY]:
        raise AssertionError("1.2 runtime catalog does not declare exactly the learning-unit capability")
    findings = lu.validate_package_learning_units([landscape_12], [])
    if findings:
        raise AssertionError(f"Injected unit is not a valid learning unit: {[f.as_dict() for f in findings]}")
    print("  1.2 build: one learning unit, two own placements, no coverage review; "
          "independent validation and package rules pass", flush=True)

    # A coverage review sits on the unit and never touches goal objects: the 1.0 build stays byte-identical,
    # and the 1.2 build ships the unchanged review record with its SHA-256.
    if not REVIEW_RECORD.is_file():
        print(f"  reviewed variant skipped: {REVIEW_RECORD.relative_to(REPO)} is absent", flush=True)
        return
    reviewed = inject_reviewed(canonical)
    if reviewed["goals"] != canonical["goals"]:
        raise AssertionError("Adding a unit-level coverage review changed a goal object")
    compile_into(inputs, "1.0", reviewed, outputs["1.0-reviewed"])
    assert_identical(outputs["1.0-canonical"], outputs["1.0-reviewed"], "1.0 build is unaffected by a unit-level coverage review")
    profile_12["learningUnits"]["expectedCounts"] = {"learningUnits": 1, "ownPlacements": 2, "coverageReviews": 1}
    summary = compile_into(inputs, "1.2", reviewed, outputs["1.2-reviewed"])
    validate(inputs, "1.2", reviewed, outputs["1.2-reviewed"])
    reviewed_tree = tree(outputs["1.2-reviewed"])
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
    parser.add_argument("--keep", action="store_true", help="keep the five unpacked release models")
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
