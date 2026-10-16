"""Exercise the unchanged native source lane on temporary exact held data.

This is a negative publication test. It does not publish, accept source coverage,
or change any compiler, schema, source inventory, original mapping or runtime.
"""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[7]
HERE = Path(__file__).resolve().parent
sys.dont_write_bytecode = True


def pin(path):
    raw = path.read_bytes()
    return {"path": path.relative_to(ROOT).as_posix(), "sha256": "sha256:" + hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}


def main():
    recipe = json.loads((HERE / "PROPOSAL.one-false-edge-withdrawal-held-source.recipe.json").read_text())
    exact_before = []
    outputs = []
    for row in recipe["wholeMappingSparseRecipes"]:
        path = ROOT / row["originalFile"]["path"]
        assert pin(path) == row["originalFile"]
        exact_before.append(pin(path))
        body = json.loads(path.read_text())
        for op in row["operations"]:
            parts = op["jsonPointer"].strip("/").split("/")
            parent = body
            for part in parts[:-1]:
                parent = parent[int(part)] if isinstance(parent, list) else parent[part]
            key = int(parts[-1]) if isinstance(parent, list) else parts[-1]
            assert parent[key] == op["before"]
            if op["operation"] == "removeWholeArrayRow":
                parent.pop(key)
            else:
                parent[key] = copy.deepcopy(op["after"])
        digest = "sha256:" + hashlib.sha256(json.dumps(body, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode()).hexdigest()
        assert digest == row["outputCanonicalJsonSha256"]
        outputs.append(body)

    script = ROOT / "scripts/compile_curriculum_release_model.py"
    spec = importlib.util.spec_from_file_location("unchanged_native_compiler", script)
    compiler = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = compiler
    spec.loader.exec_module(compiler)
    profile_path = ROOT / "contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-publication-evidence-v1.profile.json"
    profile = compiler.load_json(profile_path)
    classifier = compiler.PublicationInputClassifier(profile)
    extraction_path = outputs[1]["sourceExtractionPath"]
    extraction = compiler.load_json(ROOT / extraction_path)
    canonical_path = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-kp-one-mobile-standard-state-image-correction-author-root-20261015-v1/candidate-v1/canonical560.current422.one-Kp-PNG.image-only-author.json"
    canonical = compiler.load_json(canonical_path)
    stage = ROOT / "tmp/chemie-m7-resumed-20261015"
    with tempfile.TemporaryDirectory(prefix="rp-held-negative-lane-", dir=stage) as tmp:
        directory = Path(tmp)
        paths = []
        for name, value in zip(["legacy.json", "review.json"], outputs):
            path = directory / name
            path.write_text(json.dumps(value, ensure_ascii=False) + "\n")
            paths.append(path)
        binding = {
            "reviewPath": paths[1].relative_to(ROOT).as_posix(),
            "legacyMappingPath": paths[0].relative_to(ROOT).as_posix(),
            "sourceExtractionPath": extraction_path,
            "mappingCollectionId": outputs[1]["reviewId"],
        }
        try:
            compiler.compile_mapping_source_lane(
                binding, canonical["landscapeId"], {g["id"] for g in canonical["goals"]},
                {extraction["sourceLandscapeId"]: {g["id"] for g in extraction["sourceGoals"]}},
                classifier, profile["sourceDocumentSemantics"]["roles"],
            )
        except compiler.CompilationError as exc:
            message = str(exc)
            expected = "Unsupported mapping decision in " in message
            if not expected:
                raise RuntimeError(f"Unexpected earlier native failure; do not claim held-decision guard: {message}") from exc
        else:
            raise AssertionError("The held source lane must not compile to a native publication")

    for before in exact_before:
        assert pin(ROOT / before["path"]) == before
    result = {
        "schemaVersion": 1, "role": "Actual expected-negative call to unchanged compile_mapping_source_lane, not a whole publication build",
        "recipe": pin(HERE / "PROPOSAL.one-false-edge-withdrawal-held-source.recipe.json"),
        "compiler": pin(script), "unchangedTrustedClassifierProfile": pin(profile_path),
        "classifierBoundary": "Only this profile's unchanged generic source-field classifier and source-document role table are used; no Mathematics landscape is compiled or modified.",
        "sourceExtraction": pin(ROOT / extraction_path), "canonical": pin(canonical_path),
        "sourceGoalCount": len(extraction["sourceGoals"]), "heldSourceGoalId": recipe["sourceGoalId"],
        "sourceInventoryUnchanged": True, "originalMappingBytesUnchanged": exact_before,
        "nativeRejectedAsExpected": True, "actualFailure": message,
        "tempInputsDeletedAfterCall": True, "newPublication": False, "newM3Approval": False,
        "newStrict": 0, "humanApproval": False, "humanTrial": False,
    }
    target = HERE / "CHECK.unchanged-native-source-lane-rejects-held-decision.actual.json"
    target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"nativeRejectedAsExpected": True, "failureKind": "Unsupported mapping decision", "sourceGoalCount": len(extraction["sourceGoals"]), "originalMappingBytesUnchanged": True}))


if __name__ == "__main__":
    main()
