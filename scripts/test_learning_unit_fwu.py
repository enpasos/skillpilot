#!/usr/bin/env python3
"""Cross-language tests for the runtime-1.2 learning-unit fields and their structural RDF.

The fixture is emitted by the TypeScript semantic compiler. Python reconstructs
its actual RDF without importing the forward compiler or trusting source fields,
then proves that ownership, the unit hierarchy and coverage reviews are real
relationships: deleting, retargeting or adding any of them fails closed even
when every registered JSON literal is intact.
"""
from __future__ import annotations

import copy
import io
import json
import sys
import tempfile
from pathlib import Path

from reconstruct_json_curriculum_package_from_fwu_owl import (
    Artifact, ArtifactReconstructor, Registry, ReverseCompilerError, TripleStore, js_uri_component,
    logical_schema_id,
)
from curriculum_fwu_learning_unit_semantics import (
    LEARNING_UNIT_CLASSES, LEARNING_UNIT_DATA_PROPERTIES, LEARNING_UNIT_OBJECT_PROPERTIES, LEARNING_UNIT_REVIEW_ROLE,
    SP, validate_learning_unit_assertions,
)
import curriculum_learning_units as learning_units

RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"


def expect_failure(action, message: str) -> None:
    try:
        action()
    except (ValueError, ReverseCompilerError):
        return
    raise AssertionError(message)


def main() -> None:
    fixture = json.loads(Path(sys.argv[1]).read_bytes())
    root = Path(__file__).resolve().parents[1]
    registry = Registry((root / "contracts/curriculum-package/v1.2/profiles/skillpilot-fwu-field-semantics-learning-units-v1.registry.json").read_bytes())
    assert logical_schema_id("canonical-landscape", "1.2").endswith("/v1.2/compiled-landscape.schema.json")
    assert logical_schema_id("canonical-landscape", "1.0").endswith("/v1/compiled-landscape.schema.json")
    assert logical_schema_id(LEARNING_UNIT_REVIEW_ROLE, "1.2").endswith("/v1.2/learning-unit-coverage-review.schema.json")
    base = "https://skillpilot.de/id/curriculum-package/" + js_uri_component(fixture["releaseId"])
    checks = 0
    with tempfile.TemporaryDirectory(prefix="learning-unit-rdf-tests-") as directory:
        stores = iter(range(1_000_000))

        def fresh_store() -> TripleStore:
            # The store runs without a rollback journal, so every mutation starts from a fresh copy.
            store = TripleStore(Path(directory) / f"rdf-{next(stores)}.sqlite")
            for segment in fixture["segments"].values():
                store.ingest(io.BytesIO(segment.encode()))
            store.finish()
            return store

        store = fresh_store()
        try:
            reconstructed = []
            for source in fixture["artifacts"]:
                role, logical_id = source["role"], source["logicalId"]
                if role not in ("canonical-landscape", LEARNING_UNIT_REVIEW_ROLE):
                    continue
                iri = (base + "/landscape/" + js_uri_component(logical_id) if role == "canonical-landscape"
                       else base + "/artifact/" + js_uri_component(role) + "/" + js_uri_component(logical_id))
                artifact = Artifact(logical_id, role, role, source["normalizedBytes"], source["normalizedSha256"], "0" * 64, iri)
                document = ArtifactReconstructor(store, registry, base).reconstruct(artifact)
                assert document == source["document"], f"Registered field reconstruction changed {role}"
                reconstructed.append((role, iri, document))
            landscape = next(doc for role, _, doc in reconstructed if role == "canonical-landscape")
            assert [unit["id"] for unit in landscape["programUnits"] if unit["kind"] == "learningUnit"] == ["fixture-parent", "fixture-unit"]
            assert landscape["learningUnitCoverage"] == "partial"
            unit = next(u for u in landscape["programUnits"] if u["id"] == "fixture-unit")
            assert unit["coverageReviews"][0]["assessmentGoalId"] == "assessment"
            assert "coverageReview" not in landscape["goals"][-1]["examData"]
            validate_learning_unit_assertions(store, reconstructed, base)
            checks += 1
            # The reconstructed landscape passes the same structural unit rules; only the synthetic
            # review hashes are reported as stale evidence.
            findings = learning_units.validate_learning_units([landscape])
            assert [f.code for f in findings] == ["LU-R2-EVIDENCE"], [f.as_dict() for f in findings]
            checks += 1
        finally:
            store.close()

        def mutate(sql: str, parameters: tuple, message: str) -> None:
            nonlocal checks
            mutated = fresh_store()
            try:
                changed = mutated.connection.execute(sql, parameters).rowcount
                assert changed > 0, f"Fixture does not exercise: {message}"
                expect_failure(lambda: validate_learning_unit_assertions(mutated, reconstructed, base), message)
            finally:
                mutated.close()
            checks += 1

        for class_name in LEARNING_UNIT_CLASSES:
            mutate("DELETE FROM triples WHERE p=? AND o=?", (RDF_TYPE, SP + class_name),
                   f"Deletion of {class_name} membership was accepted")
        for predicate in (*LEARNING_UNIT_OBJECT_PROPERTIES, *LEARNING_UNIT_DATA_PROPERTIES):
            mutate("DELETE FROM triples WHERE p=?", (SP + predicate,), f"Deletion of {predicate} was accepted")
        mutate("UPDATE triples SET o=? WHERE p=?", (base + "/goal/missing", SP + "ownsGoal"),
               "A retargeted ownership was accepted")
        mutate("UPDATE triples SET o=? WHERE p=?", (base + "/goal/atom-parented", SP + "coverageReviewedGoal"),
               "A retargeted reviewed goal was accepted")
        mutate("UPDATE triples SET o=? WHERE p=?", (base + "/goal/atom-parented", SP + "coverageReviewedAssessment"),
               "A retargeted reviewed assessment was accepted")
        mutate("INSERT INTO triples VALUES(?,?,?,?,?,?)",
               (base + "/landscape/x/program-unit/extra", SP + "ownsGoal", 1, base + "/goal/atom-parented", "", ""),
               "An additional ownership relation was accepted")
        mutate("INSERT INTO triples VALUES(?,?,?,?,?,?)",
               (base + "/unexpected", RDF_TYPE, 1, SP + "LearningUnit", "", ""),
               "An additional learning-unit membership was accepted")

        store = fresh_store()
        try:
            # The registered JSON must agree with the graph, too.
            for change, message in (
                (lambda doc: doc["goalPlacements"].pop(), "A removed own placement was accepted"),
                (lambda doc: next(u for u in doc["programUnits"] if u["id"] == "fixture-unit").pop("parentUnitId"),
                 "A removed unit parent was accepted"),
                (lambda doc: next(u for u in doc["programUnits"] if u["id"] == "fixture-unit")["coverageReviews"][0]["goalIds"]
                 .append("atom-parented"), "A widened coverage review was accepted"),
                (lambda doc: next(u for u in doc["programUnits"] if u["id"] == "fixture-unit").pop("coverageReviews"),
                 "A removed coverage review was accepted"),
            ):
                changed = copy.deepcopy(reconstructed)
                change(next(doc for role, _, doc in changed if role == "canonical-landscape"))
                expect_failure(lambda: validate_learning_unit_assertions(store, changed, base), message)
                checks += 1
            orphan = [entry for entry in reconstructed if entry[0] != LEARNING_UNIT_REVIEW_ROLE]
            expect_failure(lambda: validate_learning_unit_assertions(store, orphan, base), "A missing review record was accepted")
            checks += 1

            # The registered review fields are independently required.
            entry = next(e for e in registry.by_role["canonical-landscape"] if e.pattern[-1:] == ("taskRevision",))
            predicate = registry.iri(entry.data["rdfMapping"]["construction"]["predicate"])
            store.connection.execute("DELETE FROM triples WHERE p=?", (predicate,))
            source = next(a for a in fixture["artifacts"] if a["role"] == "canonical-landscape")
            artifact = Artifact(source["logicalId"], "canonical-landscape", "canonical-landscape", source["normalizedBytes"],
                                source["normalizedSha256"], "0" * 64, base + "/landscape/" + js_uri_component(source["logicalId"]))
            expect_failure(lambda: ArtifactReconstructor(store, registry, base).reconstruct(artifact),
                           "A missing registered coverage-review revision was accepted")
            checks += 1
        finally:
            store.close()
    print(f"Learning-unit JSON<->RDF roundtrip and mutation tests passed ({checks} checks).")


if __name__ == "__main__":
    main()
