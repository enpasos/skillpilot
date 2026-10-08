# SPDX-License-Identifier: Apache-2.0
"""Inactive exact rebase of the genuine reviewed one-goal pair; never writes active files."""
import copy
import datetime
import hashlib
import json
import pathlib
import subprocess

ROOT = pathlib.Path.cwd()
OWN = pathlib.Path(__file__).parent
BASE = OWN.parent
AUTHOR = BASE / "biologie-he9-genetic-method19-current-raster-native-author-root-v3"
A = BASE / "biologie-he9-genetic-method19-current-raster-native-independent-a-20261008-v1"
B = BASE / "biologie-he9-genetic-method19-current-raster-native-independent-b-20261008-v3"
GOAL = "1b7f08a1-33df-5779-af66-430c91d699b7"
DECLARED = {}


def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def rel(p):
    return str(p.relative_to(ROOT))


def bind(p):
    p = ROOT / p if not p.is_absolute() else p
    data = {"path": rel(p), "sha256": sha(p), "bytes": p.stat().st_size}
    DECLARED[data["path"]] = data
    return data


def load(p):
    bind(p)
    return json.loads(p.read_text())


def put(name, o):
    p = OWN / name
    p.parent.mkdir(parents=True, exist_ok=True)
    data = o if isinstance(o, bytes) else (o if isinstance(o, str) else json.dumps(o, ensure_ascii=False, indent=2) + "\n").encode()
    if p.exists():
        assert p.read_bytes() == data, p
    else:
        p.write_bytes(data)
    return p


seal_specs = {
    "author": (AUTHOR / "one-current-raster-native-author-input.first.freeze.json", "3365fb5f1c055fad402d6d7ac4cd775c1a289a9135935e66a2b9ed9a618c2dbc"),
    "A": (A / "completed-current-D1-P1-V1-source-class-AM.independent-a.final.freeze.json", "c0098ed0e9dde8ae4ad9a10d02ef3b2960355f08b5bca1177e6f0649642d0aa9"),
    "B": (B / "completed-one-current-native-D1-P1-V1.independent-b.final.freeze.json", "db2edbdf3a47afb988a8302b410dd907bcee7b45ac8b5cde44c1a055e0873510"),
}
seals = {}
for label, (p, expected) in seal_specs.items():
    assert sha(p) == expected, p
    seal = load(p)
    rows = seal.get("frozenFiles", seal.get("ownFiles", []))
    for item in rows:
        q = ROOT / item["path"]
        assert q.is_file() and sha(q) == item["sha256"].removeprefix("sha256:"), q
        if "bytes" in item:
            assert q.stat().st_size == item["bytes"], q
        bind(q)
    seals[label] = {"seal": bind(p), "actualExactFiles": len(rows)}

paths = {
    "canonical": "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json",
    "kinds": "curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json",
    "qa": "curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json",
    "atomicity": "curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.review.jsonl",
    "memory": "curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.review.jsonl",
    "registry": "curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json",
    "ledger": "curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json",
    "floors": "app/scripts/config/curriculum-maturity-floor-policy.json",
}
before = {}
for key, source in paths.items():
    p = ROOT / source
    before[key] = bind(p)
    put("before/" + key + (".jsonl" if key in ["atomicity", "memory"] else ".json"), p.read_bytes())
central_path = BASE / "biologie-he9-seventeen-reviewed-active-integration-root-v1/active-after-he17-central.actual.json"
central = load(central_path)
exit_receipt = load(central_path.parent / "active-after-he17-central.exit.actual.json")
delta = load(central_path.parent / "exact-current-strict-plus17-delta.actual.json")
assert exit_receipt["exitCode"] == 0 and delta["currentBiologyStrict"] == 191 and delta["currentBiologyDenominator"] == 391
assert central["blockingIssueCount"] == 0
put("before/current191-central.actual.json", central_path.read_bytes())

canon = load(ROOT / paths["canonical"])
goals = {g["id"]: g for g in canon["goals"]}
author = load(AUTHOR / "candidate/canonical.current474-one-new-raster-author.json")
new_goal = next(g for g in author["goals"] if g["id"] == GOAL)
old_goal = copy.deepcopy(goals[GOAL])
changes = [key for key in set(old_goal) | set(new_goal) if old_goal.get(key) != new_goal.get(key)]
assert set(changes) == {"titleEn", "descriptionEn", "resourceLinks"}, changes
assert new_goal["titleEn"] == "Basic Concepts of Gene Technology"
assert new_goal["descriptionEn"] == "The learner can outline basic methods and applications of gene technology."
for key in changes:
    goals[GOAL][key] = copy.deepcopy(new_goal[key])
assert all(g == goals[g["id"]] for g in load(ROOT / paths["canonical"])["goals"] if g["id"] != GOAL)
assert len(canon["goals"]) == 474
candidate = put("candidate/canonical.one-current191-future-active.json", canon)

adoption = load(AUTHOR / "actual-source-class-AM-current-native-bindings.adoption.json")
assert adoption["genuineClassification"] == "curricularAtomic" and adoption["genuineAtomicity"] == "atomic" and adoption["genuineMemory"] == "no_memory_needed"
for s in adoption["genuineIndependentScienceSeals"]:
    p = ROOT / s["path"]
    assert sha(p) == s["sha256"]
    bind(p)
kinds = load(ROOT / paths["kinds"])
reviewed_kinds = load(AUTHOR / "candidate/semantic-kinds.current-reviewed-full.future-active.json")
replacement = next(d for d in reviewed_kinds["decisions"] if d["goalId"] == GOAL)
assert replacement["semanticKind"] == "curricularAtomic" and replacement["decisionStatus"] == "authoritative"
kinds["decisions"] = [replacement if d["goalId"] == GOAL else d for d in kinds["decisions"]]
put("candidate/semantic-kinds.future-active.json", kinds)
inert_kinds = copy.deepcopy(kinds)
inert_kinds["sourceLandscapePath"] = rel(candidate)
put("candidate/semantic-kinds.inactive-native.json", inert_kinds)
for key, name in [("atomicity", "semantic-atomicity"), ("memory", "memory-card-review")]:
    raw = (ROOT / paths[key]).read_text().splitlines(keepends=True)
    replacement_text = (AUTHOR / f"candidate/{name}.current-one-reviewed.jsonl").read_text()
    row = json.loads(replacement_text)
    assert row["goalId"] == GOAL and row["status"] == ("atomic" if key == "atomicity" else "no_memory_needed")
    modified = [replacement_text if json.loads(line)["goalId"] == GOAL else line for line in raw]
    assert sum(line != new for line, new in zip(raw, modified)) == 1
    put(f"candidate/{name}.future-active.jsonl", "".join(modified))
    put(f"candidate/{name}.one.exact-reviewed.jsonl", replacement_text)

a = load(A / "current-one-whole-source-cases-class-AM-D-P-V.independent-a.first.json")
b = load(B / "whole-targeted-D-P-source-class-AM-current-page.independent-b.first.verdict.json")
bv = load(B / "actual-one-PNG-widths-new-native-page-V.independent-b.first.verdict.json")
assert a["DDecision"] == a["visualDecision"] == "KEEP" and b["DDecision"] == "keep"
assert b["wholePScienceVerdict"] == "PASS_SCOPED_E1_G1" and bv["decision"] == "KEEP" and bv["fachlich"] == bv["visual"] == "PASS"
assert a["exactCurrentWholeGoal"] == new_goal
assert a["actualOriginal"]["sha256"] == bv["actualImage"]["sha256"]
assert a["actualCurrentNativePDF"] == bv["actualPDF"] and a["actualWholeNativePage3"] == bv["actualPage"] and a["actualWidths"] == bv["actualWidths"]
image_manifest = load(ROOT / "curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-he9-nineteen-image-author-root-20261008-v1/selected-eighteen-author-images.exact.json")
image = next(x for x in image_manifest["images"] if x["goalId"] == GOAL)
assert image["sha256"] == a["actualOriginal"]["sha256"]
png = pathlib.Path(bv["actualImage"]["path"])
assert sha(ROOT / png) == image["sha256"]
stem = f"biologie/{GOAL}/{GOAL}.png"
copies = []
for destination in [f"curricula/DE/Gymnasium/visualizations/{stem}", f"app/public/assets/goal-visualizations/{stem}", f"backend/src/main/resources/static/assets/goal-visualizations/{stem}"]:
    target = ROOT / destination
    assert not target.exists(), target
    copies.append({"source": bind(ROOT / png), "target": destination, "expectedBefore": "missing"})
for source, name in [(image["promptPath"], "prompt.de.md"), (image["toolProvenancePath"], "generation.actual.provenance.json")]:
    destination = f"curricula/DE/Gymnasium/visualizations/biologie/{GOAL}/{name}"
    assert not (ROOT / destination).exists(), destination
    copies.append({"source": bind(ROOT / source), "target": destination, "expectedBefore": "missing"})
assert len(copies) == 5
qa = load(ROOT / paths["qa"])
q = next(x for x in qa["records"] if x["goalId"] == GOAL)
assert q["visualizationState"] == "missing" and q["humanApproved"] == "no"
human_before = {key: value for key, value in q.items() if key.startswith("human")}
q.update({"visualizationState": "available", "missingReason": "", "imageUrl": new_goal["resourceLinks"][0]["url"], "publicAssetPath": copies[1]["target"], "canonicalAssetPath": copies[0]["target"], "assetSha256": "sha256:" + image["sha256"], "aiApproved": "yes", "aiApprovedAssetSha256": "sha256:" + image["sha256"], "aiReviewedAt": max(a["recordedAt"], bv["recordedAt"]), "aiReviewer": "Genuine sealed independent A/B whole-current native and raster reviews; technical synthesis only", "aiNotes": "A: " + a["visualScientificObservations"] + " B: " + bv["actualReasonDe"] + " Actual native19 final seals: " + rel(seal_specs["A"][0]) + "; " + rel(seal_specs["B"][0]) + ". Main motives and three headers identifiable at360; supplementary small labels are not mandatory phone reading. No actual handset or human approval/trial."})
assert {key: value for key, value in q.items() if key.startswith("human")} == human_before
put("candidate/visualization-qa.future-active.json", qa)
inert_qa = copy.deepcopy(qa)
iq = next(x for x in inert_qa["records"] if x["goalId"] == GOAL)
iq["publicAssetPath"] = iq["canonicalAssetPath"] = str(png)
put("candidate/visualization-qa.inactive-native.json", inert_qa)

guards = []
for subject in ["MATHEMATIK", "PHYSIK", "CHEMIE"]:
    guards.append(bind(ROOT / f"curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_{subject}.de.json"))
for source in ["curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.cards.review.jsonl", "app/public/data/de_gymnasium_biology_flashcards_core.de.json", "app/public/data/de_gymnasium_biology_flashcards_core.en.json"]:
    guards.append(bind(ROOT / source))
ledger = load(ROOT / paths["ledger"])
assert len(ledger["activeBatchConfigPaths"]) == 7
for source in ledger["activeBatchConfigPaths"]:
    guards.append(bind(ROOT / source))
put("checks/genuine-one-pair-and-current191-baseline.technical.json", {"seals": seals, "sourceClassAMScienceAdoption": adoption, "beforeBindings": before, "baselineStrictActual": {"biology": 191, "denominator": 391, "centralTerminalExit": 0, "central": bind(central_path)}, "selectedGoalId": GOAL, "wholeOtherGoalBodiesExact": 473, "changedGoalFields": changes, "copies": copies, "otherProtectedFiles": guards, "allSevenChemistryClaimsExact": ledger["activeBatchConfigPaths"], "actualPairedV": {"A": a, "B": bv}, "activeWrites": 0, "strictGainClaimed": 0, "humanApproval": False})
put("checks/initial-declared-inputs.technical.json", {"files": list(DECLARED.values())})
print(json.dumps({"baselineActual": "191/391", "pairedCurrentNative1": "exact and genuinely KEEP", "candidatePrepared": True, "copiedAssetsPlanned": 5, "unrelatedBodiesExact": 473, "activeWrites": 0, "strictGain": 0}))
