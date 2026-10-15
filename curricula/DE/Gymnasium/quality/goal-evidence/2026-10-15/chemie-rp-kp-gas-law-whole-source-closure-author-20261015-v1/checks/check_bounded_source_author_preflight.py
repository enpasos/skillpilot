"""Bounded author-only source-lane preflight; no release build or acceptance."""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent.parent
ROOT = next(p for p in HERE.parents if (p / "scripts/compile_curriculum_release_model.py").is_file())
SOURCE_ID = "rp-chem-sekii-rp-ch-sekii-2022-baustein-7-5-010-d11b3fc1"
KP_ID = "a8ddb351-3501-5b6d-a908-c82a5d2f14d4"
NEW_ID = "5db51274-dc1e-5e5a-80ad-4df26add7d42"


def load(path):
    return json.loads(path.read_text())


def pin(path):
    raw = path.read_bytes()
    return {"path": path.relative_to(ROOT).as_posix(), "sha256": "sha256:" + hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}


def apply(body, operation):
    op = operation["operation"]
    after = load(ROOT / operation["afterFile"]["path"]) if "afterFile" in operation else operation.get("after")
    if op in {"replaceWholeObjectById", "appendWholeObject", "appendDistinctScalar"}:
        values = body[operation["array"]]
        if op == "replaceWholeObjectById":
            matches = [i for i, x in enumerate(values) if x["id"] == operation["id"]]
            assert len(matches) == 1 and values[matches[0]] == operation["before"]
            values[matches[0]] = copy.deepcopy(after)
        elif op == "appendWholeObject":
            assert after["id"] not in {x["id"] for x in values}
            values.append(copy.deepcopy(after))
        else:
            assert operation["value"] not in values
            values.append(operation["value"])
        return
    parts = operation["jsonPointer"].strip("/").split("/")
    parent = body
    for part in parts[:-1]:
        parent = parent[int(part)] if isinstance(parent, list) else parent[part]
    key = int(parts[-1]) if isinstance(parent, list) else parts[-1]
    assert parent[key] == operation["before"]
    if op == "replaceWholeArrayRowWithRows":
        parent[key:key+1] = copy.deepcopy(operation["afterRows"])
    elif op == "removeWholeArrayRow":
        parent.pop(key)
    else:
        parent[key] = copy.deepcopy(after)


def goal_entries(value):
    if isinstance(value, dict):
        if value.get("kind") in {"goalEntry", "canonicalSubtree"}:
            yield value
        for child in value.values():
            yield from goal_entries(child)
    elif isinstance(value, list):
        for child in value:
            yield from goal_entries(child)


def main():
    inputs = load(HERE / "inputs/finite-original-source-and-contract-selection.json")
    protected = [inputs[k] for k in ["baseSelector", "inactiveCanonical", "centralConfig", "sourceExtraction", "heldPredecessor", "portableWholePrimaryPages"]]
    protected += inputs["mappingCopies"] + inputs["defaultRPViews"] + inputs["contracts"] + inputs["independentFIRSTOriginals"]
    for row in inputs["selectedA8PositiveProfile"]:
        protected += list(row.values())
    for row in protected:
        assert pin(ROOT / row["path"]) == row
    old_canonical = load(ROOT / inputs["inactiveCanonical"]["path"])
    canonical_ids = {g["id"] for g in old_canonical["goals"]}
    new_goal = load(HERE / "candidate/one-new-whole-ideal-gas-model-goal.unreviewed-author.json")
    assert NEW_ID not in canonical_ids
    assert new_goal["id"] == NEW_ID and new_goal["contains"] == []
    assert set(new_goal["requires"]) <= canonical_ids
    canonical_ids.add(NEW_ID)
    original_extraction = load(ROOT / inputs["sourceExtraction"]["path"])
    extraction = copy.deepcopy(original_extraction)
    extraction_recipe = load(HERE / "recipes/sparse-extraction-data-only-successor.author.json")
    for op in extraction_recipe["operations"]:
        apply(extraction, op)
    assert len(extraction["sourceGoals"]) == 325
    assert [g["id"] for g in extraction["sourceGoals"]] == [g["id"] for g in original_extraction["sourceGoals"]]
    for before, after in zip(original_extraction["sourceGoals"], extraction["sourceGoals"]):
        if before["id"] != SOURCE_ID:
            assert before == after
    assert all(d["official"] and d["role"] == "binding-core" for d in extraction["sourceDocuments"])
    mapped = []
    mapping_recipe = load(HERE / "recipes/sparse-both-mapping-copies.two-partial-contributors.author.json")
    for row in mapping_recipe["wholeMappingRecipes"]:
        before = load(ROOT / row["base"]["path"])
        after = copy.deepcopy(before)
        for op in row["operations"]:
            apply(after, op)
        assert len(after["mappings"]) == len(before["mappings"]) + 1
        assert [x for x in after["mappings"] if x["legacyGoalId"] != SOURCE_ID] == [x for x in before["mappings"] if x["legacyGoalId"] != SOURCE_ID]
        assert {(x["canonicalGoalId"], x["matchType"]) for x in after["mappings"] if x["legacyGoalId"] == SOURCE_ID} == {(NEW_ID, "partial"), (KP_ID, "partial")}
        if "decisions" in before:
            assert [x for x in before["decisions"] if x["sourceGoalId"] != SOURCE_ID] == [x for x in after["decisions"] if x["sourceGoalId"] != SOURCE_ID]
        mapped.append(after)
    held_recipe = load(ROOT / inputs["heldPredecessor"]["path"])
    held = []
    for row in held_recipe["wholeMappingSparseRecipes"]:
        body = load(ROOT / row["originalFile"]["path"])
        for op in row["operations"]:
            apply(body, op)
        held.append(body)
    spec = importlib.util.spec_from_file_location("unaltered_chemistry_native_source_lane", ROOT / "scripts/compile_curriculum_release_model.py")
    compiler = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = compiler
    spec.loader.exec_module(compiler)
    profile_path = ROOT / "contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-publication-evidence-v1.profile.json"
    profile = load(profile_path)
    outcomes = []
    temp_parent = ROOT / "tmp/chemie-rp-kp-source-author-preflight"
    temp_parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="one-cell-native-lane-", dir=temp_parent) as tmp:
        directory = Path(tmp)
        for name, maps, src, expected in [
            ("held-original-roleless", held, original_extraction, "Incomplete official source document"),
            ("held-with-document-role-only", held, dict(original_extraction, sourceDocument=extraction["sourceDocument"], sourceDocuments=extraction["sourceDocuments"]), "Unsupported mapping decision"),
            ("unreviewed-whole-source-author-draft", mapped, extraction, None),
        ]:
            paths = []
            relocated_review = copy.deepcopy(maps[1])
            relocated_review["sourceExtractionPath"] = (directory / (name + "-extraction.json")).relative_to(ROOT).as_posix()
            for fn, body in [("legacy.json", maps[0]), ("review.json", relocated_review), ("extraction.json", src)]:
                path = directory / (name + "-" + fn)
                path.write_text(json.dumps(body, ensure_ascii=False) + "\n")
                paths.append(path)
            binding = {"legacyMappingPath": paths[0].relative_to(ROOT).as_posix(), "reviewPath": paths[1].relative_to(ROOT).as_posix(), "sourceExtractionPath": paths[2].relative_to(ROOT).as_posix(), "mappingCollectionId": maps[1]["reviewId"]}
            result = {"case": name, "role": "structural preflight only, no source-science or optional-view acceptance", "expectedFailure": expected}
            try:
                output = compiler.compile_mapping_source_lane(binding, old_canonical["landscapeId"], canonical_ids, {src["sourceLandscapeId"]: {g["id"] for g in src["sourceGoals"]}}, compiler.PublicationInputClassifier(profile), profile["sourceDocumentSemantics"]["roles"])
            except compiler.CompilationError as exc:
                result.update({"succeeded": False, "actualFailure": str(exc), "expectedFailureObserved": expected is not None and expected in str(exc)})
                if expected is not None:
                    assert expected in str(exc), result
            else:
                result.update({"succeeded": True, "returnedComponents": len(output)})
                assert expected is None
                result["outputComponentSummaries"] = [{"type": type(v).__name__, "keys": list(v)[:12] if isinstance(v, dict) else None} for v in output]
            outcomes.append(result)
    # The optional candidates remain outside the consumed directory and default views.
    view_schema = load(ROOT / "contracts/curriculum-package/v1/composition-view.schema.json")
    import jsonschema
    optional_views = []
    for level in ["gk", "lk"]:
        path = HERE / ("candidate/unregistered-optional-" + level + ".view.author.json")
        view = load(path)
        jsonschema.Draft202012Validator(view_schema).validate(view)
        entries = list(goal_entries(view))
        targets = [x["goalId"] for x in entries if x.get("projectionRole", "target") == "target"]
        assert targets == [NEW_ID, KP_ID]
        assert set(x["goalId"] for x in entries) <= canonical_ids
        optional_views.append({"file": pin(path), "targetIds": targets, "nativeViewSchemaPass": True, "registered": False})
    for row in inputs["defaultRPViews"]:
        default = load(ROOT / row["path"])
        assert not ({KP_ID, NEW_ID} & {x["goalId"] for x in goal_entries(default)})
    pdf = ROOT / inputs["actualCachedPDFDiagnostic"]["path"]
    assert pin(pdf)["sha256"] == inputs["actualCachedPDFDiagnostic"]["sha256"]
    portable = (ROOT / inputs["portableWholePrimaryPages"]["path"]).read_text()
    pages = []
    for number in [19,20,50,51,52]:
        actual = subprocess.check_output(["pdftotext", "-f", str(number), "-l", str(number), "-layout", str(pdf), "-"], text=True)
        match = re.search(r"PHYSICAL PAGE " + str(number) + r"\n(.*?)(?=\nPHYSICAL PAGE |\Z)", portable, re.S)
        assert match is not None
        norm = lambda text: " ".join(text.split())
        same = norm(actual) == norm(match.group(1))
        assert same, number
        pages.append({"physicalAndPrintedPage": number, "actualWholePDFPageRead": True, "normalizedEqualsPortableWholePage": same, "actualTextSha256": "sha256:" + hashlib.sha256(actual.encode()).hexdigest()})
    numerics = {"a_p1_Pa": .08*8.314*293.15/.002, "a_p2_Pa": .08*8.314*323.15/.002, "a_T_for_1_20bar_K": 120000*.002/(.08*8.314), "a_volume_transfer_p_Pa": .08*8.314*323.15/.004}
    nb = 1.20*1.50/(.08314*300.15)
    numerics.update({"b_n_mol": nb, "b_V2_L": nb*.08314*320.15/.90, "b_T3_K": 1.00*2.00/(nb*.08314), "b_dense_pV_J": 4e6*.0005, "b_dense_nRT_J": 8.314*300, "b_dense_ratio": 4e6*.0005/(8.314*300), "b_transfer_pabs_bar": 1.20*1.50/1.00, "b_transfer_pgauge_bar": 1.20*1.50/1.00-1.00})
    for row in protected:
        assert pin(ROOT / row["path"]) == row
    report = {"schemaVersion": 1, "role": "Actual bounded unchanged-native source-lane and author-integrity preflight; not M3 or D/P/A/M/V approval", "compiler": pin(ROOT / "scripts/compile_curriculum_release_model.py"), "unchangedTrustedClassifierAndRoleTable": pin(profile_path), "profileUseBoundary": "Use only the unchanged generic source-field classifier and source-role table; no Mathematics compilation, source binding, expected-count changes or other profile edits.", "nativeOutcomes": outcomes, "sourceGoalInventory": 325, "allOther324WholeSourceGoalRowsAndDecisionsUnchanged": True, "bothMappingCopiesWithdraw580bAndProposeTwoPartialContributors": True, "old1264RowsToDraft1265Rows": True, "defaultViewsUnchangedAndNeitherTargetPresent": True, "unregisteredOptionalViews": optional_views, "optionalRuntimeSelectionProven": False, "actualWholePrimaryPages": pages, "freshOfficialPDFDownloadClaimed": False, "numericResults": numerics, "allPinnedOriginalsUnchanged": True, "tempMaterializationsDeleted": True, "wholeBuilds": 0, "centralRuns": 0, "normalDPAMVVotes": 0, "M3Acceptance": False, "newStrict": 0, "humanApproval": False, "humanTrial": False}
    target = HERE / "checks/ACTUAL.bounded-native-source-lane-and-own-integrity.author.json"
    target.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"nativeOutcomes": outcomes, "wholeSourceInventory":325, "other324Unchanged":True, "defaultViewsUnchanged":True, "optionalViewsSchemaPass":True, "newSourceAcceptance":False}))


if __name__ == "__main__":
    main()
