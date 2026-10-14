"""Bind existing whole author inputs to current native pages; no scientific vote."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
E = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14"
S = E / "chemie-acid-base-seven-existing-whole-goals-fourteen-material-cases-author-20261014-v1"
P = E / "chemie-acid-base-seven-positive-profile-author-shapes-technical-20261014-v1"
N = E / "chemie-acid-base-seven-current419-native-preparation-technical-20261014-v2"
O = E / "chemie-NAT9-current419-isolated-integration-technical-20261014-v1"


def read(path):
    return json.loads(path.read_text())


def ref(path):
    data = path.read_bytes()
    return {"path": str(path.relative_to(ROOT)), "sha256": "sha256:" + hashlib.sha256(data).hexdigest(), "bytes": len(data)}


def write(name, data):
    path = OUT / name
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    read(path)


selected = read(S / "inputs/whole-seven-current-goals.exact.json")
ids = selected["goalIds"]
cfg_path = O / "config/chemie-current419-NAT9-D2-D5-all-seven-context-rebindings.final.normal.inactive.config.json"
cfg = read(cfg_path)["subjects"][0]
mapping_path = O / "checks/REBUILD.canonical-compositions-decks-M-QA-normal-alias-to-existing-physical-sources.actual.json"
mapping = {x["normalHostAlias"]: ROOT / x["immutablePhysicalRepositorySource"]["path"] for x in read(mapping_path)["mappedAliases"]}
canon_path = mapping[cfg["landscapePath"]]
whole = read(canon_path)
by_id = {g["id"]: g for g in whole["goals"]}
assert len(whole["goals"]) == 551
assert len(ids) == len(set(ids)) == 7
assert all(by_id[g["id"]] == g for g in selected["goals"])
survey = {}
for key in ["resolutionIndexPaths", "positiveEvidenceConfigPaths", "semanticAtomicityConfigPaths"]:
    matches = []
    for address in cfg[key]:
        data = read(mapping.get(address, ROOT / address))
        if key == "resolutionIndexPaths":
            rows = data.get("resolutions", [])
        else:
            review_path = data["reviewPath"]
            path = mapping.get(review_path, ROOT / review_path)
            rows = [json.loads(line) for line in path.read_text().splitlines() if line.strip()]
        matches.extend({"config": address, "goalId": row["goalId"]} for row in rows if row.get("goalId") in ids)
    survey[key] = matches
    assert not matches, (key, matches)

report_path = O / "receipts/ACTUAL.current419-NAT9-D2-D5-final.central.stock-report.json"
report = read(report_path)["subjects"][0]
assert report["denominator"] == 419 and report["strictComplete"] == 305
assert report["gates"]["currentMemoryReviewDecisions"] == 419
qa_path = mapping[cfg["visualizationQaPath"]]
qa = {x["goalId"]: x for x in read(qa_path)["records"]}
visuals = []
for goal_id in ids:
    record = qa[goal_id]
    assert record["contentApprovedChatGpt"] == "yes"
    source, public = ROOT / record["canonicalAssetPath"], ROOT / record["publicAssetPath"]
    assert ref(source)["sha256"] == ref(public)["sha256"] == record["assetSha256"]
    visuals.append({"goalId": goal_id, "unchangedRecord": record, "source": ref(source), "public": ref(public)})
native = N / "native-seven-current"
manifest = read(native / "batch-manifest.json")
assert manifest["goalIds"] == ids
assert manifest["curriculumAtomicDenominatorAtPreparation"] == 419
assert len(read(native / "bundle/book-model.json")["pages"]) == 7
native_files = [ref(p) for p in sorted(native.rglob("*")) if p.is_file()]
author_files = [ref(p) for folder in [S, P] for p in sorted(folder.rglob("*")) if p.is_file()]
write("NEUTRAL.current419-seven-whole-goals-fourteen-cases-native-pages-and-author-profiles.json", {
    "schemaVersion": 1,
    "createdAtUTC": datetime.now(timezone.utc).isoformat(),
    "role": "Technical frozen input selector for two independent scientific first passes; no author judgment promoted",
    "goalIds": ids,
    "wholeCurrentCanonical": ref(canon_path),
    "wholeSevenGoals": ref(S / "inputs/whole-seven-current-goals.exact.json"),
    "wholeBodiesUnchangedFromAuthorSnapshot": True,
    "materials": ref(S / "materials.fourteen-complete-cases.de-en.author.md"),
    "wholeBoundCases": ref(P / "inputs/fourteen-full-cases.bound.exact.json"),
    "rawAuthorProfiles": ref(P / "author-profiles.seven.raw.json"),
    "originalAuthorInputsAndSeals": author_files,
    "currentNativePreparation": ref(N / "receipts/NATIVE7.prepare.stock.completed-run.actual.json"),
    "nativeBatchManifest": ref(native / "batch-manifest.json"),
    "nativeWholeArtifacts": native_files,
    "rounds": {role: {
        "campaign": ref(native / f"round-{role}/description-review-campaign.json"),
        "input": ref(native / f"round-{role}/description-review-input.json"),
        "criteria": ref(native / f"round-{role}/criteria.md"),
        "prompt": ref(native / f"round-{role}/prompt.md"),
    } for role in ["a", "b"]},
    "baselineCurrentGateSurvey": {
        "centralConfig": ref(cfg_path), "centralReport": ref(report_path),
        "configuredDPARowsForTheseSeven": survey,
        "missingWork": ["Two actual independent current-context D reviews and resolution", "Scientific review of whole bilingual P profiles and all fourteen complete cases", "Current semantic atomicity decisions"],
        "existingMemory": {"config": ref(ROOT / cfg["memoryReviewConfigPath"]), "all419CurrentlyValid": True, "decision": "Reuse current unchanged decisions/cards/scope checks; no new blanket review"},
        "existingVisualization": {"wholeQa": ref(qa_path), "unchangedSeven": visuals, "decision": "KEEP valid existing images/AI judgments unless actual new scientific inspection demonstrates a defect"},
    },
    "reviewRules": [
        "Inspect actual current pages, whole goals/context and complete material/solutions/rubrics; do not infer science from hashes or schema checks",
        "Write and seal FIRST science before reading any peer findings",
        "Disclose prior technical or historical exposure; author cannot independently approve own authored content",
        "Keep E0/G0 author cases separate from any observed learner evidence; no executions or human approval asserted",
        "No forced KEEP; findings remain open until substantively corrected and independently resolved",
        "Preserve all old seals and histories; each role owns a separate new output root",
    ],
    "independentReviewReady": True,
    "scientificApproval": False, "strictGateClosureGranted": False,
    "activeIntegration": False, "humanApproval": False,
    "sourceCourseAcquisitionHoldsRemainOpen": True,
})
write("FILES.finite-own-artifacts.seal.json", {
    "schemaVersion": 1, "role": "Finite technical selector seal; no scientific vote",
    "files": [ref(p) for p in sorted(OUT.rglob("*")) if p.is_file() and p.name != "FILES.finite-own-artifacts.seal.json"],
})
print(json.dumps({"selectedGoals": len(ids), "wholeCurrentGoals": len(whole["goals"]), "caseCount": 14, "nativeFiles": len(native_files), "existingConfiguredDPARows": 0, "existingValidMV": 7, "independentScientificVotes": 0}))
