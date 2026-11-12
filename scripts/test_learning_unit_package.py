#!/usr/bin/env python3
"""Curriculum-package runtime 1.2 (``learningUnitsV1``): contracts, projection and fail-closed rules.

The shared conformance fixtures in contracts/curriculum-package/v1.2/fixtures/
learning-units/cases.json are evaluated by the Python package validator with
the same accept/reject outcome, findings, unit summaries and ledgers as the
TypeScript reference. No case reads learner state.
"""
from __future__ import annotations

import copy
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker

import curriculum_learning_units as lu
import curriculum_package_contract_selection as selection
import curriculum_package_learning_unit_contracts as contracts
import generate_curriculum_package_learning_unit_contracts as generator
import provision_curriculum_package as provisioner
import validate_curriculum_runtime_catalog_contract as catalog_contract
import validate_full_standalone_curriculum_package as package_validator

REPO = Path(__file__).resolve().parents[1]
V1 = REPO / "contracts/curriculum-package/v1"
V1_2 = REPO / "contracts/curriculum-package/v1.2"
FIXTURES = V1_2 / "fixtures/learning-units/cases.json"

# The TypeScript reference and this validator share their finding identifiers.
# The finished-package validator reports them as closed report codes.
PACKAGE_CODES = {code: "LEARNING_UNIT_" + code.removeprefix("LU-").replace("-", "_") for code in lu.FINDING_CODES}


def matches(finding: lu.Finding, pattern: dict[str, Any]) -> bool:
    """An expected entry pins only the fields it names (same rule as testLearningUnitContracts.ts)."""
    return (finding.code == pattern["code"]
            and ("unitId" not in pattern or finding.unit_id == pattern["unitId"])
            and ("goalId" not in pattern or finding.goal_id == pattern["goalId"]))


def unit_landscape(**extra: Any) -> dict[str, Any]:
    """One compiled 1.2 landscape with a valid unit: Q requires B requires A."""
    landscape = {
        "$schema": contracts.LANDSCAPE_SCHEMA_ID,
        "landscapeFormatVersion": "1.2",
        "landscapeId": "L",
        "locale": "de-DE",
        "title": "Fixture",
        "description": "Fixture",
        "programUnits": [
            {"id": "y5", "kind": "year", "label": "Jahrgangsstufe 5", "shortLabel": "J5", "order": 5},
            {"id": "u", "kind": "learningUnit", "label": "Einheit", "labelEn": "Unit",
             "promise": "Ich kann das Fixture anwenden.", "promiseEn": "I can apply the fixture.",
             "revision": "2026-11-12-v1"},
        ],
        "goalPlacements": [
            {"goalId": "A", "unitId": "y5", "relation": "primary", "context": {"jurisdiction": "DE-HE"}},
            {"goalId": "Q", "unitId": "u", "relation": "own"},
            {"goalId": "B", "unitId": "u", "relation": "own"},
            {"goalId": "A", "unitId": "u", "relation": "own"},
        ],
        "learningUnitCoverage": "complete",
        "goals": [
            goal("Q", ["B"], semanticKind="practiceAssessment", nodeKind="exam",
                 examData={"coveredGoalIds": ["A", "B"], "taskContent": "Task", "solutionContent": "Solution",
                           "scoring": {"maxPoints": 10, "passingPoints": 6, "steps": []}}),
            goal("B", ["A"]),
            goal("A", []),
        ],
    }
    landscape.update(extra)
    return landscape


def goal(goal_id: str, requires: list[str], **extra: Any) -> dict[str, Any]:
    value = {"id": goal_id, "title": goal_id, "description": f"Die lernende Person kann {goal_id}.", "weight": 1,
             "tags": [], "contains": [], "requires": requires, "dimensionTags": {"framework": "F", "phase": "P"},
             "type": "atomic", "semanticKind": "curricularAtomic"}
    value.update(extra)
    return value


def review_of(landscape: dict[str, Any]) -> dict[str, Any]:
    """The single coverage review on the learning unit of the test landscape."""
    return next(unit for unit in landscape["programUnits"] if unit["kind"] == "learningUnit")["coverageReviews"][0]


def with_review(landscape: dict[str, Any], reference: str = "data/learning-units/reviews/0123456789abcdef.json") -> dict[str, Any]:
    result = copy.deepcopy(landscape)
    exam = result["goals"][0]
    unit = next(unit for unit in result["programUnits"] if unit["kind"] == "learningUnit")
    unit["coverageReviews"] = [{"assessmentGoalId": exam["id"], "goalIds": ["A"], "reference": reference,
                                **lu.assessment_review_revisions(exam)}]
    return result


class FixtureConformanceTest(unittest.TestCase):
    def test_shared_fixture_cases_have_the_reference_outcome(self) -> None:
        fixtures = json.loads(FIXTURES.read_bytes())
        self.assertEqual(len({case["id"] for case in fixtures["cases"]}), len(fixtures["cases"]))
        covered: set[str] = set()
        for case in fixtures["cases"]:
            with self.subTest(case=case["id"]):
                result = lu.evaluate_learning_units(case["landscapes"])
                remaining = list(result.findings)
                for pattern in case["expect"]["findings"]:
                    index = next((i for i, finding in enumerate(remaining) if matches(finding, pattern)), None)
                    self.assertIsNotNone(index, f"missing {pattern}; got {[f.as_dict() for f in result.findings]}")
                    covered.add(remaining.pop(index).code)  # type: ignore[arg-type]
                self.assertEqual([], [f.as_dict() for f in remaining], "unexpected findings")
                self.assertEqual(case["expect"]["valid"], not result.findings)
                expected_units = case["expect"].get("units")
                if expected_units == {}:
                    self.assertEqual([], result.units)
                for unit_id, expected in (expected_units or {}).items():
                    summary = next(item for item in result.units if item.unit_id == unit_id)
                    if "valid" in expected:
                        self.assertEqual(expected["valid"], summary.structurally_valid, unit_id)
                    if "totalScope" in expected:
                        self.assertEqual(expected["totalScope"], summary.total_scope, unit_id)
                    if "goalsWithoutReviewedCoverage" in expected:
                        self.assertEqual(expected["goalsWithoutReviewedCoverage"], summary.goals_without_reviewed_coverage)
                # A unit is valid exactly when no finding names it.
                for summary in result.units:
                    named = any(f.landscape_id == summary.landscape_id and f.unit_id == summary.unit_id for f in result.findings)
                    self.assertEqual(not named, summary.structurally_valid, summary.unit_id)
                if "ledgers" in case["expect"]:
                    self.assertEqual(
                        {key: (value["atomicGoals"], value["ownedGoals"]) for key, value in case["expect"]["ledgers"].items()},
                        {ledger.landscape_id: (ledger.atomic_goals, ledger.owned_goals) for ledger in result.ledgers})
        # Every finding code the package validator can report is exercised by the shared corpus.
        self.assertEqual(set(lu.FINDING_CODES), covered)

    def test_package_report_codes_are_closed_identifiers(self) -> None:
        for code in PACKAGE_CODES.values():
            self.assertRegex(code, r"^[A-Z][A-Z0-9_]*$")


class SchemaTest(unittest.TestCase):
    validators = lu.schema_validators(REPO)
    landscape = validators[contracts.LANDSCAPE_SCHEMA_ID]

    def errors(self, value: dict[str, Any]) -> list[str]:
        return [error.message for error in self.landscape.iter_errors(value)]

    def test_valid_units_and_reviews_are_accepted(self) -> None:
        self.assertEqual([], self.errors(unit_landscape()))
        self.assertEqual([], self.errors(with_review(unit_landscape())))
        self.assertEqual([], self.errors(unit_landscape(learningUnitCoverage="partial")))

    def test_kind_specific_requirements_are_closed(self) -> None:
        mutations = {
            "unit-without-promise": lambda d: d["programUnits"][1].pop("promise"),
            "unit-without-promise-en": lambda d: d["programUnits"][1].pop("promiseEn"),
            "unit-without-revision": lambda d: d["programUnits"][1].pop("revision"),
            "undated-revision": lambda d: d["programUnits"][1].update(revision="latest"),
            "unit-with-short-label": lambda d: d["programUnits"][1].update(shortLabel="U"),
            "unit-with-upper-case-id": lambda d: d["programUnits"][1].update(id="Unit_A"),
            "unit-with-waiver": lambda d: d["programUnits"][1].update(waivableGoalIds=["A"]),
            "promise-on-year": lambda d: d["programUnits"][0].update(promise="Kein Lernversprechen."),
            "label-en-on-year": lambda d: d["programUnits"][0].update(labelEn="Year 5"),
            "reviews-on-year": lambda d: d["programUnits"][0].update(coverageReviews=[]),
            "own-with-context": lambda d: d["goalPlacements"][1].update(context={"jurisdiction": "DE-HE"}),
            "unknown-relation": lambda d: d["goalPlacements"][1].update(relation="owns"),
            "draft-coverage-claim": lambda d: d.update(learningUnitCoverage="draft"),
        }
        for name, mutate in mutations.items():
            with self.subTest(mutation=name):
                changed = unit_landscape()
                mutate(changed)
                self.assertTrue(self.errors(changed), name)

    def test_coverage_review_shape_is_closed(self) -> None:
        mutations = {
            "extra-field": lambda r: r.update(approvedBy="someone"),
            "empty-goals": lambda r: r.update(goalIds=[]),
            "duplicate-goals": lambda r: r.update(goalIds=["A", "A"]),
            "escaping-reference": lambda r: r.update(reference="../review.md"),
            "unprefixed-revision": lambda r: r.update(taskRevision="0" * 64),
            "missing-rubric": lambda r: r.pop("rubricRevision"),
            "missing-assessment": lambda r: r.pop("assessmentGoalId"),
        }
        for name, mutate in mutations.items():
            with self.subTest(mutation=name):
                changed = with_review(unit_landscape())
                mutate(review_of(changed))
                self.assertTrue(self.errors(changed), name)

    def test_published_v1_schema_rejects_every_learning_unit_field(self) -> None:
        v1 = json.loads((V1 / "compiled-landscape.schema.json").read_bytes())
        validator = Draft202012Validator(v1, format_checker=FormatChecker())
        projected = lu.project_out_learning_units(unit_landscape())
        projected.update({"$schema": v1["$id"], "landscapeFormatVersion": "1.0"})
        self.assertEqual([], list(validator.iter_errors(projected)))
        for field_value in (unit_landscape(), with_review(unit_landscape())):
            legacy = copy.deepcopy(field_value)
            legacy.update({"$schema": v1["$id"], "landscapeFormatVersion": "1.0"})
            self.assertTrue(list(validator.iter_errors(legacy)))

    def test_v12_landscape_schema_is_v1_plus_exactly_the_documented_additions(self) -> None:
        v1 = json.loads((V1 / "compiled-landscape.schema.json").read_bytes())
        v12 = json.loads((V1_2 / "compiled-landscape.schema.json").read_bytes())
        reverted = copy.deepcopy(v12)
        for key in ("$id", "title", "description"):
            reverted[key] = v1[key]
        reverted["properties"]["$schema"] = v1["properties"]["$schema"]
        reverted["properties"]["landscapeFormatVersion"] = v1["properties"]["landscapeFormatVersion"]
        del reverted["properties"]["learningUnitCoverage"]
        for name in ("learningUnitId", "learningUnitRevision", "reviewRevision", "coverageReview"):
            del reverted["$defs"][name]
        unit = reverted["$defs"]["programUnit"]
        unit["properties"]["kind"]["enum"].remove("learningUnit")
        for name in ("labelEn", "promise", "promiseEn", "revision", "coverageReviews"):
            del unit["properties"][name]
        del unit["allOf"]
        placement = reverted["$defs"]["goalPlacement"]
        placement["properties"]["relation"]["enum"].remove("own")
        del placement["allOf"]
        self.assertEqual(v1, reverted)

    def test_generated_contracts_are_current_and_published_files_unchanged(self) -> None:
        self.assertEqual(0, generator.main(["--check"]))
        self.assertTrue(selection.extended_directory(V1_2))
        self.assertEqual(V1, selection.base_directory(V1_2).resolve())
        self.assertEqual(contracts.PROFILE_ID, selection.profile_id(V1_2))
        self.assertIsNone(selection.extension(V1))
        profile = json.loads((V1_2 / f"profiles/{contracts.PROFILE_ID}.profile.json").read_bytes())
        base = json.loads((V1 / "profiles/full-standalone-v1.profile.json").read_bytes())
        self.assertEqual(base["trustedContractSchemas"], profile["trustedContractSchemas"][:22])
        self.assertEqual("1.2", profile["compatibility"]["runtimeContractVersion"])
        roles = {role["role"]: role for role in profile["roles"]}
        self.assertNotIn("completion-profile", roles)
        self.assertEqual(0, roles[contracts.REVIEW_ROLE]["minimum"])

    def test_reverse_compiler_pins_the_current_registry(self) -> None:
        import reconstruct_json_curriculum_package_from_fwu_owl as reverse
        raw = (V1_2 / f"profiles/{contracts.REGISTRY_ID}.registry.json").read_bytes()
        self.assertEqual((contracts.REGISTRY_ID, contracts.REGISTRY_VERSION, 475),
                         reverse.SUPPORTED_REGISTRIES[hashlib.sha256(raw).hexdigest()])

    def test_registry_is_v1_plus_learning_unit_entries(self) -> None:
        v1 = json.loads((V1 / "profiles/skillpilot-fwu-field-semantics-v1.registry.json").read_bytes())
        v12 = json.loads((V1_2 / f"profiles/{contracts.REGISTRY_ID}.registry.json").read_bytes())
        self.assertEqual(v1["entries"], v12["entries"][:len(v1["entries"])], "published V1 entries are unchanged")
        self.assertEqual(v1["compatibility"], v12["compatibility"])
        registry_schema = json.loads((V1 / "field-semantics-registry.schema.json").read_bytes())
        self.assertEqual([], [error.message for error in Draft202012Validator(registry_schema).iter_errors(v12)])
        added = {entry["entryId"] for entry in v12["entries"][len(v1["entries"]):]}
        self.assertIn("program-unit.coverage-reviews", added)
        self.assertNotIn("goal.exam-coverage-review", added)
        self.assertIn("landscape.learning-unit-coverage", added)
        import validate_curriculum_release_model as release_validator
        registry = release_validator.FieldRegistry(v12)
        normalizer = release_validator.Normalizer(registry)
        normalized = normalizer.normalize("canonical-landscape", with_review(unit_landscape()))
        self.assertEqual("partial", normalizer.normalize("canonical-landscape", unit_landscape(learningUnitCoverage="partial"))["learningUnitCoverage"])
        self.assertEqual(review_of(with_review(unit_landscape())), review_of(normalized))
        self.assertNotIn("coverageReview", normalized["goals"][0]["examData"])
        schemas = {
            "compiled-landscape": json.loads((V1_2 / "compiled-landscape.schema.json").read_bytes()),
            "runtime-catalog": json.loads((V1_2 / "runtime-catalog.schema.json").read_bytes()),
            "learning-unit-review": json.loads((V1_2 / "learning-unit-coverage-review.schema.json").read_bytes()),
        }
        for name, path in release_validator.SCHEMA_FILES.items():
            schemas.setdefault(name, json.loads(path.read_bytes()))
        publication = json.loads((V1 / "profiles/de-gymnasium-mathematik-publication-evidence-v1.profile.json").read_bytes())
        release_validator.validate_schema_registry_coverage(registry, schemas, publication)


class ProjectionTest(unittest.TestCase):
    def test_projection_removes_exactly_the_learning_unit_layer(self) -> None:
        original = with_review(unit_landscape())
        projected = lu.project_out_learning_units(original)
        self.assertFalse(lu.has_learning_unit_content(projected))
        self.assertEqual([{"id": "y5", "kind": "year", "label": "Jahrgangsstufe 5", "shortLabel": "J5", "order": 5}],
                         projected["programUnits"])
        self.assertEqual([original["goalPlacements"][0]], projected["goalPlacements"])
        self.assertEqual(original["goals"], projected["goals"], "goal objects are never touched")
        self.assertNotIn("learningUnitCoverage", projected)
        self.assertEqual(projected, lu.project_out_learning_units(projected))
        self.assertIn("coverageReviews", original["programUnits"][1], "projection must not mutate its input")
        # Lists that existed only for learning units disappear, as before the first unit was authored.
        only_units = unit_landscape()
        only_units["programUnits"] = only_units["programUnits"][1:]
        only_units["goalPlacements"] = only_units["goalPlacements"][1:]
        bare = lu.project_out_learning_units(only_units)
        self.assertNotIn("programUnits", bare)
        self.assertNotIn("goalPlacements", bare)
        empty = {"landscapeId": "E", "goals": [], "programUnits": [], "goalPlacements": []}
        self.assertEqual(empty, lu.project_out_learning_units(empty))

    def test_calendar_unit_below_a_learning_unit_cannot_be_projected(self) -> None:
        changed = unit_landscape()
        changed["programUnits"][0]["parentUnitId"] = "u"
        with self.assertRaises(lu.LearningUnitError):
            lu.project_out_learning_units(changed)

    def test_counts_cover_only_the_learning_unit_layer(self) -> None:
        self.assertEqual({"learningUnits": 1, "ownPlacements": 3, "coverageReviews": 1},
                         lu.learning_unit_counts(with_review(unit_landscape())))


class ReviewArtifactTest(unittest.TestCase):
    def repository(self, root: Path, text: str = "# Coverage review\n\nReviewed by the fixture.\n") -> str:
        reference = "curricula/quality/learning-units/review.md"
        (root / reference).parent.mkdir(parents=True)
        (root / reference).write_text(text, encoding="utf-8")
        return reference

    def test_build_verifies_bindings_and_rewrites_the_reference(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            reference = self.repository(root)
            source = with_review(unit_landscape(), reference)
            compiled, documents, inputs = lu.compile_coverage_reviews(root, source)
            path = lu.review_artifact_path(reference)
            self.assertEqual(path, review_of(compiled)["reference"])
            self.assertEqual(reference, review_of(source)["reference"])
            self.assertEqual(source["goals"], compiled["goals"], "shipping a review never changes goal objects")
            self.assertEqual([(contracts.REVIEW_ROLE, path, path)], [item[:3] for item in documents])
            wrapper = documents[0][3]
            lu.schema_validators(REPO)[contracts.REVIEW_SCHEMA_ID].validate(wrapper)
            self.assertEqual((root / reference).read_text(encoding="utf-8"), wrapper["definition"]["content"])
            self.assertEqual(hashlib.sha256((root / reference).read_bytes()).hexdigest(), inputs[0]["sourceSha256"])
            self.assertEqual([], lu.validate_package_learning_units([compiled], documents))

    def test_build_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            reference = self.repository(root)
            stale = with_review(unit_landscape(), reference)
            stale["goals"][0]["examData"]["taskContent"] = "Changed task"
            invalid = unit_landscape()
            invalid["goals"][0]["requires"] = []
            for name, landscape in {
                "stale": stale,
                "missing-record": with_review(unit_landscape(), "curricula/quality/missing.md"),
                "outside-curricula": with_review(unit_landscape(), "docs/review.md"),
                "r1-violation": invalid,
                "review-of-foreign-assessment": (lambda d: (review_of(d).update(assessmentGoalId="B"), d)[1])(
                    with_review(unit_landscape(), reference)),
            }.items():
                with self.subTest(case=name), self.assertRaises(lu.LearningUnitError):
                    lu.compile_coverage_reviews(root, landscape)

    def test_package_rejects_tampered_missing_or_orphaned_reviews(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            compiled, documents, _inputs = lu.compile_coverage_reviews(root, with_review(unit_landscape(), self.repository(root)))
        tampered = copy.deepcopy(documents)
        tampered[0][3]["definition"]["content"] += " changed"
        with self.assertRaises(lu.LearningUnitError):
            lu.validate_package_learning_units([compiled], tampered)
        missing = lu.validate_package_learning_units([compiled], [])
        self.assertEqual(["LU-R2-EVIDENCE"], [finding.code for finding in missing])
        orphan = lu.validate_package_learning_units([lu.project_out_learning_units(compiled) | {"landscapeId": "L"}], documents)
        self.assertEqual(["LU-R2-EVIDENCE"], [finding.code for finding in orphan])


class PackageGateTest(unittest.TestCase):
    def gate(self, runtime: str, landscape: dict[str, Any], reviews: list[tuple[str, dict[str, Any]]]) -> set[str]:
        files = [{"role": "canonical-landscape", "path": "data/canonical/l.json"}]
        values: dict[str, Any] = {"data/canonical/l.json": landscape}
        for path, wrapper in reviews:
            files.append({"role": contracts.REVIEW_ROLE, "path": path,
                          "semanticBinding": {"kind": "logical-artifact", "logicalId": path}})
            values[path] = wrapper
        collector = package_validator.DiagnosticCollector()
        package_validator.validate_learning_unit_contracts(
            {"runtimeContractVersion": runtime, "files": files}, package_validator.PackageDocuments(values=values), collector)
        return set(collector.codes_by_gate["hardReferenceClosure"])

    def test_runtime_12_gate_reports_rule_findings(self) -> None:
        self.assertEqual(set(), self.gate("1.2", unit_landscape(), []))
        broken = unit_landscape()
        broken["goals"][0]["requires"] = []
        self.assertEqual({PACKAGE_CODES["LU-R1"], PACKAGE_CODES["LU-R3"]}, self.gate("1.2", broken, []))
        self.assertEqual({PACKAGE_CODES["LU-R2-EVIDENCE"]}, self.gate("1.2", with_review(unit_landscape()), []))

    def test_older_runtimes_cannot_carry_learning_units(self) -> None:
        for runtime in ("1.0", "1.1"):
            self.assertEqual({"LEARNING_UNIT_RUNTIME_MISMATCH"}, self.gate(runtime, unit_landscape(), []))
            self.assertEqual(set(), self.gate(runtime, lu.project_out_learning_units(unit_landscape()), []))


class CatalogAndProvisioningTest(unittest.TestCase):
    def catalog(self, reviews: list[str]) -> dict[str, Any]:
        base = json.loads((V1 / "fixtures/runtime-catalog/valid/minimal-mathematik.catalog.json").read_bytes())
        base.update({"$schema": contracts.CATALOG_SCHEMA_ID, "catalogVersion": "1.2", "runtimeContractVersion": "1.2"})
        base["capabilities"].append(contracts.CAPABILITY)
        base["learningUnitReviews"] = [{"id": path, "artifactPath": path} for path in reviews]
        return base

    def test_catalog_schema_capability_and_manifest_binding(self) -> None:
        validator = lu.schema_validators(REPO)[contracts.CATALOG_SCHEMA_ID]
        path = "data/learning-units/reviews/0123456789abcdef.json"
        for reviews in ([], [path]):
            catalog = self.catalog(reviews)
            validator.validate(catalog)
            self.assertEqual([], [d for d in catalog_contract.validate_catalog(catalog, validator)
                                  if d.code != "EXAM_NODES_UNVERIFIED"])
        catalog = self.catalog([path])
        manifest = {"runtimeContractVersion": "1.2", **catalog["releaseBinding"], "files": []}
        self.assertIn("/files/learning-unit-coverage-review",
                      {d.location for d in catalog_contract.validate_catalog_against_manifest(catalog, manifest)})
        manifest["files"] = [{"role": contracts.REVIEW_ROLE, "path": path}]
        self.assertFalse(any(d.location.startswith("/files/learning-unit")
                             for d in catalog_contract.validate_catalog_against_manifest(catalog, manifest)))
        without = self.catalog([])
        without["capabilities"].remove(contracts.CAPABILITY)
        self.assertTrue(list(validator.iter_errors(without)))
        mismatch = self.catalog([path])
        mismatch["learningUnitReviews"][0]["id"] = "data/learning-units/reviews/fedcba9876543210.json"
        self.assertIn("LEARNING_UNIT_REVIEW_ID_PATH_MISMATCH",
                      {d.code for d in catalog_contract.validate_catalog(mismatch, validator)})

    def test_provisioner_selects_the_pinned_12_contract_explicitly(self) -> None:
        self.assertEqual("full-standalone-v1", provisioner.load_profile()["profileId"])
        self.assertEqual(contracts.PROFILE_ID, provisioner.load_profile(V1_2)["profileId"])
        self.assertEqual("1.2", selection.runtime_contract_version(contracts.PROFILE_ID))

    def test_fwu_carrier_trust_roots_are_consistent(self) -> None:
        import validate_curriculum_fwu_owl_package_contracts as fwu
        try:
            fwu.select_profile(contracts.FWU_PROFILE_ID)
            self.assertEqual([], fwu.validate_static_trust_roots())
            schemas = {name: fwu.load_json(path) for name, path in fwu.SCHEMAS.items()}
            self.assertEqual([], fwu.schema_diagnostics("profile", schemas["profile"], fwu.load_json(fwu.PROFILE_PATH)))
            ontology = (V1_2 / "ontology" / contracts.FWU_ONTOLOGY_FILE).read_text(encoding="utf-8")
            for name in (*contracts.RDF_CLASSES, *contracts.RDF_OBJECT_PROPERTIES, *contracts.RDF_DATATYPE_PROPERTIES):
                self.assertIn(f"sp:{name} a owl:", ontology)
        finally:
            fwu.select_profile("fwu-owl-v1")

    def test_package_validator_trusts_the_12_contract_set(self) -> None:
        trusted = package_validator.load_trusted_context(V1_2)
        self.assertEqual(contracts.PROFILE_ID, trusted.profile["profileId"])
        for schema_id, _path in contracts.extra_schemas(V1_2):
            self.assertIn(schema_id, trusted.trusted_schema_documents)
        self.assertEqual(contracts.CATALOG_SCHEMA_ID, trusted.trusted_schema_metadata["runtimeCatalogSchema"][0])


if __name__ == "__main__":
    unittest.main()
