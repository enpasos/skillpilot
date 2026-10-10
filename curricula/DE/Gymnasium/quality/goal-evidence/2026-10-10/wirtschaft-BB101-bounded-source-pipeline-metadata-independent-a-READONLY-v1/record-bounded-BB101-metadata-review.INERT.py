"""Bounded metadata review, with mechanical reuse of untouched source history."""
from pathlib import Path
from datetime import datetime, timezone
from collections import Counter
import hashlib
import json

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
Q = "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/"
PREP = Q + "wirtschaft-common343-qualified-M6-integration-preparation-root-v1/"
COMMON = Q + "wirtschaft-common343-M6-fieldwise-composition-AUTHOR-INERT-v1/"
START = datetime.now(timezone.utc).isoformat()
inputs = {}


def digest(raw):
    return "sha256:" + hashlib.sha256(raw).hexdigest()


def raw(path):
    path = Path(path)
    absolute = path if path.is_absolute() else ROOT / path
    data = absolute.read_bytes()
    key = str(absolute.relative_to(ROOT))
    inputs.setdefault(key, {"path": key, "sha256": digest(data), "bytes": len(data)})
    return data


def read(path):
    return json.loads(raw(path))


def write(name, value):
    path = OUT / name
    with path.open("x", encoding="utf8") as stream:
        stream.write(value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    return str(path.relative_to(ROOT))


proposal_path = PREP + "actual-BB101-bounded-current-source-pipeline-metadata-proposal.READONLY.json"
proposal = read(proposal_path)
index_path = COMMON + "actual-final-source-fieldwise-pairs-and-consumed-BW-v2.INERT.json"
index = read(index_path)
before_s, before_m = read(proposal["sourcePredecessorPath"]), read(proposal["mappingPredecessorPath"])
ready_s, ready_m = read(proposal["candidateSourcePath"]), read(proposal["candidateMappingPath"])
write("observed-original-Root-BB101-ready-source.READONLY.snapshot.json", ready_s)
write("observed-original-Root-BB101-ready-mapping.READONLY.snapshot.json", ready_m)
for active_key, before_key in [("activeSourcePath", "sourcePredecessorPath"), ("activeMappingPath", "mappingPredecessorPath")]:
    pair = next(pair for pair in index["pairs"] if pair["activePath"] == proposal[active_key])
    assert pair["candidatePath"] == proposal[before_key]
    assert inputs[pair["candidatePath"]] == pair["candidate"]
assert ready_s["sourceGoals"] == before_s["sourceGoals"]
assert ready_s["passages"] == before_s["passages"]
assert ready_m["decisions"] == before_m["decisions"]
assert ready_m["mappings"] == before_m["mappings"]
changed_source_keys = sorted(k for k in ready_s.keys() | before_s.keys() if ready_s.get(k) != before_s.get(k))
changed_mapping_keys = sorted(k for k in ready_m.keys() | before_m.keys() if ready_m.get(k) != before_m.get(k))
assert changed_source_keys == ["boundedQualificationClosure", "pipelineStatus"]
assert changed_mapping_keys == ["boundedAuthorOpenOriginalCoverage", "boundedQualificationClosure", "historicalAuthorOpenOriginalCoverage", "status"]
history_base = Q + "wirtschaft-1826-classical-source-operator-fidelity-and-BB-claim-retirement-AUTHOR-INERT-v2/history-active/"
history_s_path = history_base + proposal["activeSourcePath"].replace("/", "__") + ".snapshot"
history_m_path = history_base + proposal["activeMappingPath"].replace("/", "__") + ".snapshot"
history_s, history_m = read(history_s_path), read(history_m_path)
old_s = {goal["id"]: goal for goal in history_s["sourceGoals"]}
current_s = {goal["id"]: goal for goal in ready_s["sourceGoals"]}
assert len(old_s) == 100 and len(current_s) == 101
unchanged = [goal_id for goal_id, goal in current_s.items() if old_s.get(goal_id) == goal]
changed = [goal_id for goal_id, goal in current_s.items() if goal_id in old_s and old_s[goal_id] != goal]
novel = [goal_id for goal_id in current_s if goal_id not in old_s]
retired = [goal_id for goal_id in old_s if goal_id not in current_s]
assert len(unchanged) == 94 and len(changed) == 4 and len(novel) == 3 and len(retired) == 2
assert set(changed + novel) == set(proposal["closedScope"]["actualQualifiedChangedOrNewRows"])
assert set(retired) == set(proposal["closedScope"]["unsupportedHistoricalSourceRowsRetiredNotDeletedFromHistory"])
assert all(goal_id in {d["sourceGoalId"] for d in history_m["decisions"]} for goal_id in retired)
assert history_s["pipelineStatus"]["steps"] and all(step["status"] == "complete" for step in history_s["pipelineStatus"]["steps"])
assert history_m["status"] == "complete"
core_path = COMMON + "candidate-core/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json"
core = read(core_path)
assert len(core["goals"]) == 689
core_ids = {goal["id"] for goal in core["goals"]}
decisions = ready_m["decisions"]
edges = ready_m["mappings"]
assert len(decisions) == 101 and {d["sourceGoalId"] for d in decisions} == set(current_s)
assert all(d["decision"] == "mapped" and d["canonicalGoalIds"] and set(d["canonicalGoalIds"]) <= core_ids for d in decisions)
assert all(edge["legacyGoalId"] in current_s and edge["canonicalGoalId"] in core_ids for edge in edges)
assert {edge["legacyGoalId"] for edge in edges} == set(current_s)
passage_ids = {p["id"] for p in ready_s["passages"]}
assert all(goal["passageId"] in passage_ids and goal["sourceSpan"] and goal["sourceRef"] for goal in ready_s["sourceGoals"])
decision_counts = Counter(d["matchType"] for d in decisions)
edge_counts = Counter(edge["matchType"] for edge in edges)
assert decision_counts == {"exact": 30, "partial": 71}
assert edge_counts == {"exact": 30, "partial": 148}
proofs = []
for ref in proposal["closedScope"]["currentIndependentProofs"]:
    proof = read(ref["path"])
    assert inputs[ref["path"]]["sha256"] == ref["sha256"]
    proofs.append({**ref, "actualBytesMatch": True, "readOnlyBoundedQualificationNotNewWhole101Review": True})
c = read(proposal["closedScope"]["currentIndependentProofs"][3]["path"])
personal = next(row for row in c["actual84DDAnd21EUAffectedRows"] if row["sourceGoalId"] == "bb-wirtschaft-sekii-q-lk-personal-g02-e3dcd4a1")
assert personal["actualSourcePerformanceContractRead"] is True
assert personal["fullNormativeCanonicalPerformanceNotClaimed"] is True
assert personal["boundedExistingDestinations"] == ["776457c2-8bb3-53b9-838b-a028319175fb"]
own_bb_closure_path = Q + "wirtschaft-BB8820-price-interval-direction-only-independent-a-closure-INERT-v1/actual-independent-two-language-price-interval-closure.SEALED.receipt.json"
read(own_bb_closure_path)
findings = [
    {"id": "BB101-META-1", "decision": "REVISE", "path": proposal["candidateMappingPath"], "fields": ["/summary/exactMappings", "/summary/partialMappings"], "actual": {"exactMappings": decision_counts["exact"], "partialMappings": decision_counts["partial"]}, "proposed": {"exactMappings": ready_m["summary"]["exactMappings"], "partialMappings": ready_m["summary"]["partialMappings"]}, "reason": "Status-only promotion retains a wrong current summary of31 exact/70 partial instead of actual30 exact/71 partial. Correct only those metadata counters, preserving all101 decisions and178 relationships."},
    {"id": "BB101-META-2", "decision": "REVISE", "path": proposal["candidateSourcePath"], "field": "/qualityReview/boundedAuthorOpenOriginalCoverage", "reason": "The Source retains this unmarked current author-open field with not_independently_qualified while its added closure/pipeline says qualified/complete. The Mapping already preserves the same earlier author object under an explicit historical field. Mark the Source object explicitly historical as well; preserve its whole content and all source/passages/partial bodies."},
]
assert ready_s["qualityReview"]["boundedAuthorOpenOriginalCoverage"]["status"].endswith("not_independently_qualified")
assert ready_m["historicalAuthorOpenOriginalCoverage"] == before_m["boundedAuthorOpenOriginalCoverage"]
mechanics_path = write("actual-source101-history94-changed4-new3-retired2-mapping101-and178-links.READONLY.json", {
    "checkedAt": datetime.now(timezone.utc).isoformat(), "wholeFinalSource32PairSource": inputs[proposal["sourcePredecessorPath"]], "wholeFinalSource32PairMapping": inputs[proposal["mappingPredecessorPath"]],
    "sourceRowsAndPassagesWholeExact": True, "allMappingDecisionAndRelationBodiesWholeExact": True,
    "sourceMetadataOnlyChangedKeys": changed_source_keys, "mappingMetadataOnlyChangedKeys": changed_mapping_keys,
    "currentSourceGoalIds": list(current_s), "historicalSourceCount": 100,
    "wholeHistorical94RowsMechanicallyExactNotScientificallyRereviewed": unchanged,
    "actuallyChanged4SourceIDs": changed, "actuallyNew3SourceIDs": novel,
    "retired2IDsPreservedInWholeSourceAndWholeMappingHistory": retired,
    "immutableHistoricalSource": inputs[history_s_path], "immutableHistoricalMapping": inputs[history_m_path],
    "current101AllDecisionsMappedToActual689": True, "actualWholeCore": inputs[core_path],
    "all178MappingsResolveSourceAndCanonicalIDs": True, "all101HavePassageSpanAndReference": True,
    "actualDecisionMatchTypes": dict(decision_counts), "actualEdgeMatchTypes": dict(edge_counts),
    "allPartialBoundariesAndOptionalChoiceRolesExactToQualifiedFinalPair": True,
    "proofs": proofs, "CpersonalActualBoundedReview": personal,
    "noNewWhole101HistoricalSourceReview": True, "noWholeOriginalCurriculumCoverageClaimFromPartialRelations": True,
    "noM6M7HumanOrNativeCIApproval": True, "activeWrites": 0,
})
read_bytes_code = ["app/scripts/positiveGoalEvidenceProfileModel.ts", "app/scripts/goalEvidenceProfileModel.ts", "app/scripts/positiveGoalEvidenceReview.ts", "app/scripts/goalBookModel.ts"]
for path in read_bytes_code:
    raw(path)
dependency_path = write("native-P343-andWholeBookModel-no-external-Source32-fingerprint-dependency.READONLY.json", {
    "actualCodeBindings": [inputs[path] for path in read_bytes_code],
    "PsemanticPayload": "Goal ID/shortKey/DEENtitle-description/effectiveSEMkind/semanticAtomic/type/nodeKind/tags/dimensionTags",
    "PinputPayload": "Native semantic GoalFP plus requires/contains/examples, goalVisualizations meta/assetDigests, criteriaFP and profileSchema/profileRuleVersion",
    "NativePConfigLoader": "CAN,SEM,Criteria,ProfileJSONL,optionalReviewRuns,configuredVisualAssets; no external Source/Mapping or35Views",
    "WholeEconomicsBookModelLoader": "CAN,SEM,QA,PJSONL,own wholeNavigationView and visual asset digests; no Source32/Mapping32; no externalLandscape or manifest route configured for this whole Book",
    "Core698aAndSEMd250UnchangedThereforeExistingNativeP343AndBookModelBindingsRetained": True,
    "actualOriginalSourcePDFAndPublicationBuildStillRequiredFromRootFinalCI": True,
    "noNativeFingerprintRecomputationOrPASSClaim": True,
})
review_path = write("bounded-BB101-pipeline-metadata-original-proposal.independent-REVISE-two-metadata-only-findings.READONLY.json", {
    "startedAt": START, "completedAt": datetime.now(timezone.utc).isoformat(), "reviewer": "/root/economics_final56_current_round_a", "decision": "REVISE", "scope": "Only current MAPPING1/2/3 completion metadata after whole bounded successor qualification and unchanged-history reuse",
    "proposalPath": proposal_path, "technicalContinuityReceipt": mechanics_path, "PBookSourceDependencyReceipt": dependency_path,
    "findings": findings,
    "positiveBoundedFindings": ["94 whole source rows retain exact valid predecessor bodies/evidence;4changed+3new source contracts have named bounded qualification and exactly resolve the claimed seven IDs.", "The two unsupported originals and their former decisions remain in actual immutable100-row histories; they are absent from all101 current sources and178 relationships.", "All101 decisions map to actual689 IDs, and all current Source rows retain nonempty passage/span/reference;71partial source decisions and148partial edges retain their whole original boundaries.", "The original BB22/23 mandatory facets remain distinct from expressly selected steering; current status strings explicitly disclaim newWhole101review/M7/human release.", "Root's seven-row successor closure can therefore close the specific inherited original-duty blockers after the two genuine metadata defects are corrected, subject to actual native Source/View/M6 gates."],
    "newWhole101Or94HistoricalScienceClaim": False, "partialToWholeFalseClaim": False, "DblindClaim": False,
    "activeWrites": 0, "nativeCIOrBuildRunsStarted": 0, "nativePAMFPsComputed": 0, "humanApprovalOrLearnerTrial": False,
    "ownEarlierNAIRUPAnd7cScopeAuthorshipDisclosed": True,
})
raw(Path(__file__))
guards = []
for path, before in list(inputs.items()):
    data = (ROOT / path).read_bytes()
    after = {"path": path, "sha256": digest(data), "bytes": len(data)}
    assert after == before, "Reviewed input changed: " + path
    guards.append({"before": before, "after": after, "exact": True})
guard_path = write("actual-readonly-BB101-metadata-and-history-inputs.exact.endguards.json", {"startedAt": START, "completedAt": datetime.now(timezone.utc).isoformat(), "allExact": True, "artifacts": guards})
artifacts = []
for path in sorted(OUT.iterdir()):
    if path.is_file():
        data = path.read_bytes()
        artifacts.append({"path": str(path.relative_to(ROOT)), "sha256": digest(data), "bytes": len(data)})
seal_path = write("actual-BB101-original-metadata-proposal-independent-REVISE-two-counter-status-findings.SEALED.receipt.json", {
    "sealedAt": datetime.now(timezone.utc).isoformat(), "role": "SEALED_BOUNDED_READONLY_SOURCE_PIPELINE_METADATA_REVIEW", "decision": "REVISE", "findings": [finding["id"] for finding in findings], "reviewPath": review_path, "inputEndguardsPath": guard_path, "allInputEndguardsExact": True, "inputGuardCount": len(guards), "sourceRowCount": 101, "unchangedHistoricalWholeSourceRowsExact": 94, "changedAndNewSourceRows": 7, "actualMappedDecisions": 101, "actualMappedEdges": 178, "activeWrites": 0, "newScienceOrNativeCIApproval": False, "artifacts": artifacts,
})
print(json.dumps({"seal": seal_path, "sha256": digest((ROOT / seal_path).read_bytes()), "decision": "REVISE", "findings": 2, "endguards": len(guards)}))
