"""Additive pointer-only candidates; never write active files or sealed history."""
import copy
import hashlib
import json
from pathlib import Path
from datetime import datetime, timezone
import subprocess

ROOT = Path(__file__).resolve().parents[8]
OUT = Path(__file__).resolve().parent
BASE = OUT.parent
Q = "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/"
LIVE_CAN = "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json"
LIVE_SEM = Q + "wirtschaft-common343-qualified-M6-integration-preparation-root-v1/semantic689.live-canonical-pointer.activation-ready.json"
REG = "curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json"
OLD_BOOK = "app/scripts/config/goal-books/de-gym-economics-current-canonical.json"
SEAL = BASE / "actual-native-P343-Book343-44configs-after-main-a866-all-exact.SEALED.receipt.json"
START = datetime.now(timezone.utc).isoformat()
inputs = {}


def relative(path):
    return str(Path(path).relative_to(ROOT))


def observe(path):
    path = Path(path)
    if not path.is_absolute():
        path = ROOT / path
    raw = path.read_bytes()
    item = {"path": relative(path), "sha256": "sha256:" + hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}
    inputs.setdefault(item["path"], item)
    return raw


def read(path):
    return json.loads(observe(path))


def write(name, value):
    path = OUT / name
    assert path.resolve().is_relative_to(OUT)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("x", encoding="utf8") as stream:
        stream.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    json.loads(path.read_bytes())
    return relative(path)


def changed_keys(before, after):
    return [key for key in before.keys() | after.keys() if before.get(key) != after.get(key)]


seal = read(SEAL)
assert inputs[relative(SEAL)]["sha256"] == "sha256:3407427e61ae748cc6a9b071a6b1e5b1cacaf8b9dcb97a02da3571127dd8a786"
for artifact in seal["artifacts"]:
    observe(artifact["path"])
    assert inputs[artifact["path"]] == artifact, "Previous sealed artifact changed: " + artifact["path"]
observe(SEAL.parent / "materialize-qualified-P343-and-book-pointers.INERT.ts")
source = read(BASE / "actual-P343-native-binding-body-reuse-and-book343.READONLY.receipt.json")
bound_sem = read(source["semanticKindLedgerPath"])
live_sem = read(LIVE_SEM)
assert inputs[LIVE_SEM]["sha256"] == "sha256:db4ebc56fa6b4a947e835da0a8f7137d2928d21e0d9a40026360f9d68a6d38f5"
assert changed_keys(bound_sem, live_sem) == ["sourceLandscapePath"]
expected = copy.deepcopy(bound_sem)
expected["sourceLandscapePath"] = LIVE_CAN
assert live_sem == expected, "Whole SEM change must be sourceLandscapePath only"
candidate_core = read(source["corePath"])
assert len(candidate_core["goals"]) == 689
assert inputs[source["corePath"]]["sha256"] == seal["coreBinding"]["sha256"]
live_core = read(LIVE_CAN)
reg = read(REG)
subject = next(s for s in reg["subjects"] if s["subject"] == "wirtschaftswissenschaften")
old_paths = subject["positiveEvidenceConfigPaths"]
assert len(old_paths) == 43
assert len(source["configPaths"]) == 44
old_book = read(OLD_BOOK)
observe("app/scripts/config/curriculum-maturity-floor-policy.json")
ordinary = [d["goalId"] for d in live_sem["decisions"] if d["decisionStatus"] == "authoritative" and d["semanticKind"] == "curricularAtomic"]
assert len(ordinary) == len(set(ordinary)) == 343
market_new = ["a2fa1186-df35-5954-a9a9-e311a55e218f", "df17fd21-e9b7-598f-970e-8f541d059694"]
eu_new = ["5aaf5abf-5e70-57c6-b030-1d08a35d17b8"]
bb_new = ["ec1e8644-bd6d-53ef-a154-9a6efb69e1c7", "8820a8d9-605a-565b-bc13-1961a4df60ed", "646c5663-bf14-5b4a-893e-be01df701d54", "2dea7d3c-cbac-5246-b0b1-6463c8e6dad6"]
new_ids = market_new + eu_new + bb_new
entries, scope_checks, all_ids, old_ids = [], [], [], []
for index, config_path in enumerate(source["configPaths"], start=1):
    before = read(config_path)
    ready = copy.deepcopy(before)
    ready["landscapePath"] = LIVE_CAN
    ready["semanticKindLedgerPath"] = LIVE_SEM
    assert sorted(changed_keys(before, ready)) == ["landscapePath", "semanticKindLedgerPath"]
    assert ready["reviewPath"] == before["reviewPath"]
    observe(ready["reviewCriteriaPath"])
    raw = observe(ready["reviewPath"])
    records = [json.loads(line) for line in raw.splitlines() if line.strip()]
    ids = ready["scope"]["goalIds"]
    assert [r["goalId"] for r in records] == ids
    assert all(r["status"] == "needs_human_review" and r["reviewAuthority"] == "ai_candidate" and r["evidenceLevel"] == "E1" and r["maximumClaimScope"] == "G1" for r in records)
    all_ids.extend(ids)
    if index <= 43:
        old = read(old_paths[index - 1])
        old_ids.extend(old["scope"]["goalIds"])
        appended = market_new if index == source["newMarketProfilesAppendedToConfig"] else eu_new if index == source["newEUProfileAppendedToConfig"] else []
        assert ids == old["scope"]["goalIds"] + appended
        invariant_keys = ["reviewId", "goalFingerprintRuleVersion", "profileRuleVersion", "landscapeId", "reviewCriteriaPath", "reviewedResourceTypes", "requireApproved"]
        assert all(ready[key] == old[key] for key in invariant_keys)
        scope_checks.append({"index": index, "originalConfigPath": old_paths[index - 1], "originalGoalIds": old["scope"]["goalIds"], "allOriginalGoalIdsInExactOrderRetained": True, "explicitAppendedGoalIds": appended, "reviewIdCriteriaResourceTypesAndRuleVersionsExact": True})
    else:
        assert ids == bb_new and ready["reviewedResourceTypes"] == []
    ready_path = write("configs/" + str(index).zfill(2) + ".positive-live689-sem689-P343.activation-ready.INERT.config.json", ready)
    entries.append({"index": index, "sourceConfigPath": config_path, "activationReadyConfigPath": ready_path, "reviewId": ready["reviewId"], "reviewPathExact": ready["reviewPath"], "reviewPathBytesBinding": inputs[ready["reviewPath"]], "goalCount": len(ids), "changedFieldsOnly": ["landscapePath", "semanticKindLedgerPath"]})
assert len(old_ids) == len(set(old_ids)) == 336
assert len(all_ids) == len(set(all_ids)) == 343
assert set(all_ids) == set(ordinary)
assert set(all_ids) - set(old_ids) == set(new_ids)
book_source = BASE / "whole-book.common689-sem689-P343.review-only.INERT.config.json"
book_before = read(book_source)
book_ready = copy.deepcopy(book_before)
book_ready.update(landscapePath=LIVE_CAN, semanticKindLedgerPath=LIVE_SEM, outputPath=old_book["outputPath"])
assert sorted(changed_keys(book_before, book_ready)) == ["landscapePath", "outputPath", "semanticKindLedgerPath"]
assert book_ready["evidenceReviewPaths"] == book_before["evidenceReviewPaths"]
for path in book_ready["evidenceReviewPaths"]:
    observe(path)
    rows = [json.loads(line) for line in observe(path).splitlines() if line.strip()]
    assert len(rows) == 343 and {r["goalId"] for r in rows} == set(ordinary)
observe(book_ready["goalVisualizationQaPath"])
observe(book_ready["compositionViewPath"])
book_path = write("whole-book.live689-sem689-P343.activation-ready.INERT.config.json", book_ready)
comparison_path = write("actual-readonly-whole-SEM-pointer-only-43-old-scopes-and7new-envelope.READONLY.json", {
    "startedAt": START, "checkedAt": datetime.now(timezone.utc).isoformat(),
    "wholeCandidateSEM": inputs[source["semanticKindLedgerPath"]], "wholeLivePointerSEM": inputs[LIVE_SEM],
    "onlySEMChangedField": "sourceLandscapePath", "all689WholeDecisionsAndOtherFieldsExact": True,
    "wholeCandidateCore": inputs[source["corePath"]], "currentLiveCore": inputs[LIVE_CAN],
    "liveCoreGoalCountAtRead": len(live_core["goals"]), "candidateCoreGoalCount": 689,
    "original43ConfigScopeChecks": scope_checks, "original336GoalIdsExact": True,
    "new7GoalIds": new_ids, "exact343NativeAuthoritativeOrdinaryEnvelope": True,
    "everyGoalExactlyOnce": True, "all343ProfileBodiesAndFingerprintsByteExactToPreviouslySealedQualifiedJSONL": True,
    "wholeBookChangedFieldsOnly": ["landscapePath", "semanticKindLedgerPath", "outputPath"],
    "wholeBookOutputRestoredFromActualRegularBookConfig": old_book["outputPath"],
    "historicalQaReusedWithoutNewImageOrDescriptionApproval": True,
    "nativeLiveConfigChecksRun": False, "nativeFingerprintsRecomputed": False,
    "reasonNativeChecksDeferred": "Root must first guarded-copy the exact qualified689 core to the active canonical path; this additive pointer-only step does not claim native PASS against the current live679 core.",
    "activeWrites": 0, "sourceCoreSEMorAMWrites": 0, "newScientificReviews": 0,
    "humanApprovalOrLearnerTrial": False,
})
manifest_path = write("44-P-configs-and-whole-Book-pointer.activation-ready.manifest.json", {
    "createdAt": datetime.now(timezone.utc).isoformat(), "role": "ADDITIVE_POINTER_ONLY_ACTIVATION_CANDIDATES_NOT_ACTIVATED",
    "originalQualifiedSeal": relative(SEAL), "originalQualifiedSealBinding": inputs[relative(SEAL)],
    "liveCanonicalPath": LIVE_CAN, "expectedQualifiedCoreBinding": inputs[source["corePath"]],
    "livePointerSemanticLedgerPath": LIVE_SEM, "livePointerSemanticBinding": inputs[LIVE_SEM],
    "PConfigCount": 44, "ordinaryPRecords": 343, "configs": entries,
    "Book": {"sourceConfigPath": relative(book_source), "activationReadyConfigPath": book_path, "changedFieldsOnly": ["landscapePath", "semanticKindLedgerPath", "outputPath"], "outputPath": book_ready["outputPath"], "publicationMode": book_ready["publicationMode"], "evidenceReviewPaths": book_ready["evidenceReviewPaths"]},
    "exactWholeSEMAndScopeEnvelopeReceipt": comparison_path,
    "profileBodiesFingerprintsCriteriaAnd43OriginalScopesUnchanged": True,
    "activationNativeChecksPendingRootGuardedCoreCopy": True,
    "previousCandidateBoundNativePASSReusedAsHistoryOnly": True,
    "historicalQaNotNewlyReviewed": True, "AIStatus": "E1/G1/ai_candidate/needs_human_review",
    "noHumanApprovalNoLearnerTrialNoBlindDClaim": True, "activeWrites": 0,
})
observe(Path(__file__))
endguards = []
for path, before in list(inputs.items()):
    raw = (ROOT / path).read_bytes()
    after = {"path": path, "sha256": "sha256:" + hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}
    assert after == before, "Endguard changed: " + path
    endguards.append({"before": before, "after": after, "exact": True})
guard_path = write("actual-pointer-only-inputs-and-original-seal-exact.endguards.READONLY.json", {"startedAt": START, "completedAt": datetime.now(timezone.utc).isoformat(), "allExact": True, "artifacts": endguards})
artifacts = []
for path in sorted(OUT.rglob("*")):
    if path.is_file():
        raw = path.read_bytes()
        artifacts.append({"path": relative(path), "sha256": "sha256:" + hashlib.sha256(raw).hexdigest(), "bytes": len(raw)})
sealed = write("actual-additive44-P-configs-Book-live-pointer-only-exact.SEALED.receipt.json", {
    "sealedAt": datetime.now(timezone.utc).isoformat(), "HEAD": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip(),
    "role": "SEALED_ADDITIVE_ACTIVATION_POINTER_CANDIDATES_ONLY",
    "reviewer": "/root/economics_final56_current_round_a", "provider": "OpenAI", "modelFamily": "GPT-6", "runtime": "Codex", "exactModelRevision": "not_exposed", "samplingParameters": "not_exposed",
    "manifestPath": manifest_path, "comparisonPath": comparison_path, "endguardsPath": guard_path,
    "44PConfigsAndBookOnlyAuthoredPointerChanges": True, "all43OldScopesAndNew7Exact": True,
    "SEM689WholeComparisonSourceLandscapePathOnly": True, "nativeLivePASSClaimed": False,
    "previousSealedHistoryAndAllProfileBytesUnchanged": True,
    "allInputEndguardsExact": True, "inputGuardCount": len(endguards),
    "nativeFingerprintsRecomputed": 0, "activeWrites": 0, "coreSEMorAMSourceWrites": 0,
    "newScientificReviews": 0, "humanApprovalOrLearnerTrial": False,
    "RootGuarded689CoreCopyAndOfficialNativeChecksRemainRequired": True, "artifacts": artifacts,
})
print(json.dumps({"sealedReceipt": sealed, "sha256": hashlib.sha256((ROOT / sealed).read_bytes()).hexdigest(), "configs": 44, "profileRecords": 343, "endguards": len(endguards), "nativeLivePASSClaimed": False}))
