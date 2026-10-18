"""Prepare bounded, portable P442 writer inputs; never write normal content or native records."""
from pathlib import Path
import collections
import copy
import datetime
import hashlib
import json

ROOT = Path(__file__).resolve().parents[8]
N = Path("curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17")
OUT = Path(__file__).resolve().parent
SELECTION = N / "chemie-current442-lower14-paired-C-P-M-source-integration-20261017-v1/P442.input-selection.PENDING-final-native-context.json"
CANONICAL = N / "chemie-current442-C653-SEM653-paired-ten-requires-integration-20261017-v1/C653.Lower14-ten-paired-requires.PENDING-final-scope-context.json.snapshot"
NORMAL_CANONICAL = Path("curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json")
SEMANTIC = N / "chemie-current442-C653-SEM653-paired-ten-requires-integration-20261017-v1/SEM653.Lower14-ten-paired-requires.current-source-bindings.PENDING-native-context.json"
PROVENANCE = N / "chemie-A76-P124-original-config-path-restoration-technical-20261017-v1/PROVENANCE.exact-A76-P124-routing.json"
SN_CONFIG = Path("/mnt/e/skillpilot-chemie-L7-20261017/current439-SN-indicator-P1-native1-root-v2/capsule") / N / "chemie-current439-SN-indicator-P1-native1-root-v2/P1.author.config.json"
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()


def file_pin(path):
    path = Path(path)
    b = path.read_bytes()
    label = str(path.relative_to(ROOT)) if path.is_absolute() and path.is_relative_to(ROOT) else str(path)
    return {"path": label, "sha256": hashlib.sha256(b).hexdigest(), "bytes": len(b)}


def read(path):
    return json.loads(Path(path).read_text())


def object_sha(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def pointer(value, address):
    for part in address.split("/")[1:]:
        part = part.replace("~1", "/").replace("~0", "~")
        value = value[int(part)] if isinstance(value, list) else value[part]
    return value


def write(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def rel(path):
    return str(Path(path).resolve().relative_to(ROOT))


assert ROOT.name == "skillpilot", ROOT
selection = read(ROOT / SELECTION)
assert file_pin(ROOT / CANONICAL)["sha256"] == "cb3c432cc7b6875b55d8ea58acceb0048cdda7a532441dc122abb09a4b51c056"
assert file_pin(ROOT / SEMANTIC)["sha256"] == "72c8e6e8cea951e588050301f25ae88caeb01f1824a331c9f489903f15757dd3"
inputs = {}
for key, ref in selection["inputs"].items():
    actual = file_pin(ROOT / ref["path"])
    assert actual["sha256"] == ref["sha256"].removeprefix("sha256:"), (key, actual, ref)
    assert actual["bytes"] == ref["bytes"], key
    inputs[key] = ref
baseline_ref = inputs[selection["baseline"]["input"]]
baseline = [json.loads(line) for line in (ROOT / baseline_ref["path"]).read_text().splitlines() if line.strip()]
assert len(baseline) == 439 and len({r["goalId"] for r in baseline}) == 439
baseline_by_id = {r["goalId"]: r for r in baseline}

# Retain the exact 124 restored historical configs as the owner lookup. Later
# selected CFC/HB/SN owners are explicit successors, never guessed from a title.
config_sources = []
for entry in read(ROOT / PROVENANCE)["completeConfigurationPaths"]:
    if entry["kind"] == "P":
        config_sources.append({"origin": dict(entry, filePin=file_pin(ROOT / entry["path"])), "config": read(ROOT / entry["path"])})
assert len(config_sources) == 124
for path in [
    N / "chemie-current439-cfc-hfc-paired-material-P1-integration-20261017-v1/P1.review.requires54.config.json",
    N / "chemie-current439-HB-five-paired-P-integration-20261017-v2/P5.review.config.json",
]:
    config_sources.append({"origin": {"kind": "laterCurrentOwner", "path": str(path), "filePin": file_pin(ROOT / path)}, "config": read(ROOT / path)})
sn_retained = OUT / "retained/P.SN-current-owner.exact-original.config.json.snapshot"
sn_retained.parent.mkdir(parents=True, exist_ok=True)
if not sn_retained.exists():
    sn_retained.write_bytes(SN_CONFIG.read_bytes())
if SN_CONFIG.exists():
    assert sn_retained.read_bytes() == SN_CONFIG.read_bytes()
config_sources.append({"origin": {"kind": "laterCurrentOwner", "historicalTransportPath": str(SN_CONFIG), "path": rel(sn_retained), "filePin": file_pin(sn_retained)}, "config": read(sn_retained)})

selected = []
selection_rows = {r["goalId"]: r for r in selection["overrides"] + selection["newProfiles"]}
assert len(selection["overrides"]) == 45 and len(selection["newProfiles"]) == 3 and len(selection_rows) == 48
for index, old in enumerate(baseline):
    matches = [(i, c) for i, c in enumerate(config_sources) if c["config"]["reviewId"] == old["reviewId"] and old["goalId"] in c["config"]["scope"]["goalIds"]]
    assert len(matches) == 1, (old["goalId"], old["reviewId"], len(matches))
    source_index, owner = matches[0]
    assert owner["config"]["goalFingerprintRuleVersion"] == old["goalFingerprintRuleVersion"]
    assert owner["config"]["profileRuleVersion"] == old["profileRuleVersion"]
    criteria = file_pin(ROOT / owner["config"]["reviewCriteriaPath"])
    assert "sha256:" + criteria["sha256"] == old["reviewCriteriaFingerprint"], old["goalId"]
    selected.append({"goalId": old["goalId"], "baselineLineOneBased": index + 1, "baselineRecord": old, "profile": old["profile"], "profileSource": {**baseline_ref, "lineOneBased": index + 1, "jsonPointer": "/profile", "wholeObjectSHA256": object_sha(old["profile"])}, "ownerSourceIndex": source_index, "owner": owner["origin"], "profileChangedBySelection": False, "newGoal": False, "evidenceLevel": old["evidenceLevel"], "maximumClaimScope": old["maximumClaimScope"], "reason": old["reason"], "dissent": old["dissent"], "profileLocatorBase": old.get("profileLocatorBase"), "baselineMaterialBindingPolicy": "Keep unchanged inline material bindings and original owner provenance; do not invent a relative material base from the aggregate P439 transport path"})

for row in selection["overrides"] + selection["newProfiles"]:
    ref = inputs[row["authorRecord"]["input"]]
    profile = pointer(read(ROOT / ref["path"]), row["profilePointer"])
    assert object_sha(profile) == row["profileSHA256"], row["goalId"]
    existing = next((r for r in selected if r["goalId"] == row["goalId"]), None)
    if existing is None:
        assert row in selection["newProfiles"]
        existing = {"goalId": row["goalId"], "baselineRecord": None, "newGoal": True, "ownerSourceIndex": None, "owner": {"kind": "newPairedProfileNamespace"}}
        selected.append(existing)
    existing.update({"profile": profile, "profileSource": {**ref, "jsonPointer": row["profilePointer"], "wholeObjectSHA256": object_sha(profile)}, "profileChangedBySelection": True, "scientificSelection": row, "evidenceLevel": "E1", "maximumClaimScope": "G1", "reason": "Technical serialization of the exact whole profile selected by the already paired scientific evidence in P442.input-selection; no new scientific review, learner performance or human approval by this assembler.", "dissent": ["Inactive AI candidate; final normal integration and all independent D/source/M7/human gates remain separate."], "profileLocatorBase": row["profileLocatorBase"]})
assert len(selected) == 442 and len({r["goalId"] for r in selected}) == 442
atomic_ids = {r["goalId"] for r in read(ROOT / SEMANTIC)["decisions"] if r["semanticKind"] == "curricularAtomic" and r["decisionStatus"] == "authoritative"}
assert atomic_ids == {r["goalId"] for r in selected}
assert sum(r["evidenceLevel"] == "E0" for r in selected) == 56

# Per-owner configs retain their actual ID, exact criteria, rule namespaces,
# resource selection and run manifests. Only selection/context/output routing
# changes. New goals get one explicit new writer namespace; it claims no new review.
groups = collections.defaultdict(list)
for row in selected:
    groups[row["ownerSourceIndex"]].append(row)
namespace_rows = []
for number, (source_index, rows) in enumerate(groups.items(), 1):
    if source_index is None:
        cfg = copy.deepcopy(config_sources[125]["config"])
        cfg["reviewId"] = "chemie-current442-hb-three-new-whole-profiles-paired-ai-20261017-v1"
        cfg["reviewRunManifestPaths"] = []
        origin = {"kind": "newPairedProfileNamespace", "criteriaTemplate": config_sources[125]["origin"]}
    else:
        cfg = copy.deepcopy(config_sources[source_index]["config"])
        origin = config_sources[source_index]["origin"]
    stem = f"P{number:03d}"
    config_path = OUT / f"config/{stem}.current-owner.config.json"
    candidates_path = OUT / f"candidates/{stem}.whole-profile.candidates.json"
    record_path = OUT / f"records/{stem}.current-owner.review.jsonl"
    historical_run_manifests = cfg.get("reviewRunManifestPaths", [])
    cfg.update({"landscapePath": str(NORMAL_CANONICAL), "semanticKindLedgerPath": str(SEMANTIC), "reviewPath": rel(record_path), "reviewRunManifestPaths": [], "requireApproved": False, "scope": {"label": "Exact current P442 whole-profile selection in preserved owner namespace; technical current-input serialization only; no new science or human approval", "goalIds": [r["goalId"] for r in rows]}})
    candidates = {"schemaVersion": 1, "authoringContract": "positive-understanding-evidence-candidates-v1", "reviewId": cfg["reviewId"], "reviewedAt": NOW, "reviewer": "Codex B technical current-input serialization; underlying scientific authors and reviewers remain recorded in the P442 selection/provenance", "goals": [{"goalId": r["goalId"], "reason": r["reason"], "evidenceLevel": r["evidenceLevel"], "maximumClaimScope": r["maximumClaimScope"], "dissent": r["dissent"], "profile": r["profile"]} for r in rows]}
    write(config_path, cfg)
    write(candidates_path, candidates)
    for row in rows:
        row["reviewId"] = cfg["reviewId"]
        row["namespaceOrdinal"] = number
        row["currentConfigPath"] = rel(config_path)
    namespace_rows.append({"ordinal": number, "reviewId": cfg["reviewId"], "goalIds": cfg["scope"]["goalIds"], "ownerOrigin": origin, "config": file_pin(config_path), "candidates": file_pin(candidates_path), "prospectiveRecordPath": rel(record_path), "exactCriteria": file_pin(ROOT / cfg["reviewCriteriaPath"]), "goalFingerprintRuleVersion": cfg["goalFingerprintRuleVersion"], "profileRuleVersion": cfg["profileRuleVersion"], "reviewedResourceTypes": cfg["reviewedResourceTypes"], "reviewRunManifestPaths": [], "historicalRunManifestPathsPreservedAsProvenanceOnly": historical_run_manifests, "currentRunBoundary": "The stock candidate writer emits empty reviewRunIds. Old run manifests remain historical provenance, not asserted current-context independent native runs.", "E0Count": sum(r["evidenceLevel"] == "E0" for r in rows), "E1Count": sum(r["evidenceLevel"] == "E1" for r in rows)})
selected_path = OUT / "P442.actual-selected-whole-profile-writer-input.jsonl"
selected_path.write_text("".join(json.dumps(r, ensure_ascii=False, separators=(",", ":")) + "\n" for r in selected))
plan = {"artifactType": "Executable namespace-preserving P442 stock writer plan; no final writer run", "createdAtUTC": NOW, "canonical": file_pin(ROOT / CANONICAL), "semantic": file_pin(ROOT / SEMANTIC), "selection": file_pin(ROOT / SELECTION), "historical124OwnerRouting": file_pin(ROOT / PROVENANCE), "selectedWriterInput": file_pin(selected_path), "profileCounts": {"baseline": 439, "wholeOverrides": 45, "newWholeProfiles": 3, "selectedOrdinaryAtomicProfiles": 442, "unchangedBaselineWholeProfiles": 394, "retainedE0": 56, "selectedE1": 386}, "namespaces": namespace_rows, "all124HistoricalConfigsRead": True, "oldCurrentOwnerReviewIdsAndCriteriaAndRulesPreserved": True, "newNativeWriterRunPerformed": False, "normalFilesChangedByThisPreparer": False, "assetCopiesPerformed": False, "E0Policy": "The retained56E0 profiles remain E0 regardless of current fingerprint changes. Only the four exact E0 baseline profiles replaced by genuine paired whole-profile selections become E1; any additional existing explicit wholeP acceptance must first be pinned against exact current whole-profile bytes. E0/G0 is allowed by v2 and is not itself a stock P-ready or M7 blocker; do not infer a content HOLD from that label.", "machineClaimBoundary": "AI candidates stay needs_human_review. E1/G1 denotes the selected scientific profile evidence, not learner performance, official source completion, Human Approval or M7.", "materials": {"operativeMaterialFiles": selection["operativeMaterialFiles"], "profileMaterialLocators": selection["profileMaterialLocators"], "profileLocatorBasesRetainedInSelectedWriterInput": True}, "futureExecution": {"condition": "All exact canonical visualization bytes are installed at app/public URLs, and measured fingerprints/assets are reverified. This plan does not execute the stock writer.", "argvTemplate": ["node", "--import", "app/node_modules/tsx/dist/loader.mjs", "app/scripts/materializePositiveGoalEvidenceCandidates.ts", "--config", "<namespace.config.path>", "--candidates", "<namespace.candidates.path>", "--write"], "concatPolicy": "After all namespace outputs pass the unchanged stock reviewer, merge by selectedWriterInput goal order into P442.review.jsonl. Never concatenate duplicate old scopes blindly."}}
plan["writerCanonicalNormalPath"] = str(NORMAL_CANONICAL)
plan["normalCanonicalInstallationGuard"] = {"path": str(NORMAL_CANONICAL), "expectedSHA256": file_pin(ROOT / CANONICAL)["sha256"], "expectedBytes": file_pin(ROOT / CANONICAL)["bytes"], "requiredBeforeFinalStockWriter": True}
plan["centralConfigRoutingRequirement"] = {"landscapePath": str(NORMAL_CANONICAL), "semanticKindLedgerPath": str(SEMANTIC), "positiveEvidenceConfigPaths": [r["config"]["path"] for r in namespace_rows], "reason": "Stock reportDeepUnderstandingRollout requires exact config path equality as well as current fingerprints. All126 scopes are disjoint; the merged P442 ledger is for the normal book/inspection, not a single fictitious replacement reviewId."}
plan["evidenceLevelRuleAnchors"] = [{"path": "docs/concept/skill-graph/learning-goal-book-and-evidence-review-pipeline.md", "lines": [669, 679], "meaning": "E0 is unanchored opinion/hypothesis; E1 is an anchored observation in an identified artifact. A pure fingerprint update creates neither a scientific observation nor a review."}, {"path": "contracts/goal-evidence/v2/goal-evidence-profile.schema.json", "lines": [86, 95], "meaning": "Both E0 and E1, G0 and G1 are valid v2 record values."}, {"path": "app/scripts/reportDeepUnderstandingRollout.ts", "lines": [1820, 1848], "meaning": "Current source/config validation and needs_human_review+ai_candidate or approved+human determine P-ready; there is no E1/G1 minimum test."}]
write(OUT / "P442.namespace-and-stock-writer.plan.json", plan)
print(json.dumps({"selected": len(selected), "namespaces": len(namespace_rows), "retainedE0": 56, "selectedInput": rel(selected_path)}, indent=2))
