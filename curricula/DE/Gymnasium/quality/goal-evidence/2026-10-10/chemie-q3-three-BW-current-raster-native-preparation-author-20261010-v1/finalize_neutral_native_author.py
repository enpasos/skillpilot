# SPDX-License-Identifier: Apache-2.0
"""Freeze a completed real normal handoff; never confer any independent approval."""
from pathlib import Path
import datetime
import hashlib
import importlib.util
import json
import subprocess

ROOT = Path.cwd()
DIR = Path(__file__).resolve().parent
PREFIX = DIR.relative_to(ROOT).as_posix()
OLD = "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09"
AUTHOR = f"{OLD}/chemie-q3-three-BW-context-bound-practical-companions-author-v1"
IDS = ["d2d735de-bede-5310-8aeb-8bb7562c7b75", "a0f6ba09-f072-5887-a797-fa369453c62a", "7b39fa19-fec3-575e-9324-a3226b703358"]
STAMP = datetime.datetime.now(datetime.timezone.utc).isoformat()
assert not (DIR / "author.final.freeze.json").exists()

def read(p):
    return json.loads((ROOT / p).read_text())

def own(p):
    return read(f"{PREFIX}/{p}")

def bind(p):
    path = ROOT / p
    assert path.is_file() and not path.is_symlink(), f"Frozen input must be a real file: {p}"
    return {"path": p, "sha256": "sha256:" + hashlib.sha256(path.read_bytes()).hexdigest(), "bytes": path.stat().st_size}

def put(p, data):
    path = DIR / p
    assert not path.exists(), f"No frozen or earlier output replacement: {p}"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    return bind(path.relative_to(ROOT).as_posix())

native = f"{PREFIX}/native/three-current-P"
manifest = read(f"{native}/bundle/manifest.json")
model = read(f"{native}/bundle/book-model.json")
assert [p["goalId"] for p in model["pages"]] == IDS
assert all(p["evidenceReview"] and p["evidenceReview"]["status"] == "needs_human_review" for p in model["pages"])
proof = own("checks/completed-normal-current-P-bound-native.actual.json")
assert all(row["actualExitCode"] == 0 for row in proof["terminals"])
pdfmanifest = read(f"{native}/bundle/book.pdf.render-manifest.json")
assert pdfmanifest["goalPageCount"] == 3 and pdfmanifest["physicalPageCount"] == 5

campaigns = []
for side in ("a", "b"):
    cpath = f"{native}/round-{side}/description-review-campaign.json"
    campaign = read(cpath)
    assert campaign["blindToOtherReviews"] is True
    assert len(campaign["batches"]) == 1 and campaign["batches"][0]["goalIds"] == IDS
    assert not list((ROOT / native / f"round-{side}/results").glob("*"))
    campaigns.append({"side": side, "campaignConfig": bind(cpath), "input": bind(f"{native}/round-{side}/description-review-input.json"), "bundleManifest": bind(f"{native}/round-{side}/review-bundle-manifest.json"), "batchDirectory": f"{native}/round-{side}/batches", "independenceGroupId": campaign["independenceGroupId"], "existingIndependentCurrentNativeReviews": 0})

meta = own("inputs/three-existing-raster-metadata-successor.exact.json")
assets = []
for row in meta["rows"]:
    gid = row["goalId"]
    b = bind(f"{PREFIX}/assets/chemie/{gid}/{gid}.png")
    assert b["sha256"] == "sha256:" + row["selectedPNG"]["sha256"]
    assets.append({"goalId": gid, "actualPNG": b, "nativeDimensions": row["nativeDimensions"], "originalSelectedPNG": bind(row["selectedPNG"]["path"]), "actualExisting360View": bind(row["display360"]["path"]), "actualExisting680View": bind(row["display680"]["path"]), "altTextDe": row["altTextDe"], "captionDe": row["captionDe"], "generator": row["provider"], "modelVersion": row["modelVersion"], "actualStoredFinalPrompt": bind(row["actualFinalPrompt"]["path"]), "originalGenerationPrompt": bind(row["originalGenerationPrompt"]["path"]), "actualImageReconstruction": bind(row["actualImageReconstruction"]["path"]), "decision": "KEEP exact existing pixels; prior independent approvals retained, current native context independently pending", "storedPromptAndTransmittedPromptAreNotAssumedByteIdentical": True})

old_refs = []
for side in ("a", "b"):
    folder = f"{OLD}/chemie-q3-three-BW-practical-companions-independent-{side}-v1"
    old_refs.append({"side": side, "wholeScienceVerdict": bind(f"{folder}/" + ("whole-CHEM3-independent-A.completed-science-AM-P-source-verdict.json" if side == "a" else "three-whole-BW-practical-and-source002.independent-b.completed.verdict.json")), "freeze": bind(f"{folder}/" + ("whole-CHEM3-independent-A.final.freeze.json" if side == "a" else "independent-b.final.freeze.json")), "wholeAtomicityRecords": bind(f"{folder}/atomicity/three-whole-practical.independent-{side}.review.jsonl"), "wholeMemoryRecords": bind(f"{folder}/memory/three-whole-practical.independent-{side}.review.jsonl"), "wholePositiveRecords": bind(f"{folder}/positive/three-whole-practical.independent-{side}.review.jsonl"), "currentNativeContextApprovalClaimedFromTheseHistoricalReviews": False})
visual_refs = [
    bind(f"{OLD}/chemie-q3-three-practical-rasters-independent-root-v1/three-original-360-680-pixel.independent-root.science-FIRST.json"),
    bind(f"{OLD}/chemie-q3-three-practical-rasters-independent-root-v1/three-whole-accessible-metadata-word-successor.independent-root.verdict.json"),
    bind(f"{OLD}/chemie-q3-three-practical-rasters-independent-root-v1/three-actual-pixels-and-successor-metadata.independent-root.final.freeze.json"),
    bind(f"{OLD}/chemie-q3-three-BW-practical-companion-rasters-independent-v-b-v1/three-current-actual-rasters-and-word-successor.independent-b.completed.verdict.json"),
    bind(f"{OLD}/chemie-q3-three-BW-practical-companion-rasters-independent-v-b-v1/independent-b.final.freeze.json"),
]
source_proof = own("checks/current-normal-BW-source-scopes-before185-after189.actual.json")
source_contexts = []
for side in ("before", "after"):
    context = f"{PREFIX}/source-atlas/{side}-portable-operative"
    source_contexts.append({"side": side, "actualNormalConfig": bind(f"{context}/normal-source-book.config.json"), "actualModel": bind(f"{context}/actual-source-book-model.json"), "actualManifest": bind(f"{context}/source-manifest.json"), "actualNavigation": bind(f"{context}/navigation.view.json"), "actualSourceViews": [bind(p) for p in read(f"{context}/source-manifest.json")["sourcePaths"]], "normalSourceScopeReceipt": bind(f"{PREFIX}/source-atlas/{side}.normal-full-source-scope.receipt.actual.json")})
scope_diff = own("checks/current-full-goal-page-context-and-protected177.actual-diff.json")
protected = own("checks/protected-all-five-current-and-strict-ID-sets.exact.json")
assert scope_diff["all177GoalObjectsAndPagesEqual"] is True
assert not set(scope_diff["changedExistingPageIds"]) & set(next(s["strictCompleteGoalIds"] for s in protected["subjects"] if s["subject"] == "chemie"))
assert (ROOT / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json").read_bytes() == (DIR / "inputs/current-canonical480.exact.json").read_bytes()
assert (ROOT / "curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json").read_bytes() == (DIR / "inputs/current-central-registry.exact.json").read_bytes()

layout = own("author-layout/final-current-P-native.author-layout.actual.json")
assert layout["actualNativePDF"] == bind(f"{native}/bundle/book.pdf")
assert layout["actualPagesViewed"] == 3 and layout["independentApprovalClaimed"] is False

entry = put("neutral-current-three-BW-practical-current-P-native.independent-review.entry.json", {
    "schemaVersion": 1, "preparedAt": STAMP,
    "role": "Complete frozen inactive actual normal author handoff for exactly three current whole BW practical D/P/V page-context reviews; no active integration or gate declaration",
    "goalIds": IDS, "actualCurrentNodes": 480, "actualCurrentCurricularAtomicGoals": 378,
    "inactiveCandidateNodes": 484, "inactiveCandidateCurricularAtomicGoals": 381,
    "nativeGoalPages": 3, "nativePhysicalPages": 5,
    "nativeScopeKind": "ordinary full381 canonical CrossStage review-only; separate actual BW185/189 source models are not national or whole programme clearance",
    "candidateCanonical": bind(f"{PREFIX}/candidate/current484-three-practical-raster.inactive.json"),
    "candidateSemanticKinds": bind(f"{PREFIX}/candidate/current484-381.semantic-kinds.inactive-input.json"),
    "candidateVisualizationQA": bind(f"{PREFIX}/candidate/current-qa-plus-three-native-pending.inactive-input.json"),
    "wholeCurrent378NormalConfig": bind(f"{PREFIX}/native/current378.normal.config.json"),
    "wholeCurrent378Model": bind(f"{PREFIX}/native/current378.actual-model.json"),
    "wholeInactive381CurrentPNormalConfig": bind(f"{PREFIX}/native/future381-current-P.normal.config.json"),
    "wholeInactive381CurrentPModel": bind(f"{PREFIX}/native/future381-current-P.actual-model.json"),
    "actualNativeBatchConfig": bind(f"{PREFIX}/native/three.current-P.batch.config.json"),
    "nativeBundle": bind(f"{native}/bundle/manifest.json"),
    "nativeBookModel": bind(f"{native}/bundle/book-model.json"),
    "actualNativePDF": bind(f"{native}/bundle/book.pdf"), "actualNativeHTML": bind(f"{native}/bundle/book.html"),
    "actualPDFRenderManifest": bind(f"{native}/bundle/book.pdf.render-manifest.json"),
    "actualHTMLRenderManifest": bind(f"{native}/bundle/book.html.render-manifest.json"),
    "actualReviewInput": bind(f"{native}/bundle/review-input.json"), "actualReviewMarkdown": bind(f"{native}/bundle/review.md"),
    "physicalPageMap": [{"goalId": gid, "physicalPage1Based": pdfmanifest["frontMatterPageCount"] + index + 1} for index, gid in enumerate(IDS)],
    "ordinaryIndependentCampaigns": campaigns,
    "currentPConfig": bind(f"{PREFIX}/positive/current-three.author.config.json"),
    "currentPRecords": bind(f"{PREFIX}/positive/current-three.author.review.jsonl"),
    "currentPWholeBodyRetentionProof": bind(f"{PREFIX}/checks/retained-whole-P-profile-bodies.actual.json"),
    "completeSixNewDEENPracticalCases": bind(f"{PREFIX}/science/whole-six-new-practical-protocol-cases.de-en.author-candidate.json"),
    "wholeOriginal40DEENCasesExact": bind(f"{PREFIX}/science/whole-original40-DEEN-cases.exact-retained.json"),
    "sixCurrentTheoryCasesExact": bind(f"{PREFIX}/science/six-current-whole-theory-cases.exact-selected.json"),
    "priorIndependentWholeScienceAMProfiles": old_refs,
    "actualPNGAndAccessibleMetadataInputs": assets,
    "priorIndependentActualOriginal360680PixelAndMetadataReviews": visual_refs,
    "actualMetadataSuccessor": bind(f"{PREFIX}/inputs/three-existing-raster-metadata-successor.exact.json"),
    "storedVsTransmittedPromptRepresentationDifferenceDisclosedByExistingIndependentB": True,
    "actualWholeBWPrimaryPDF": bind(f"{AUTHOR}/primary/official-BW-chemistry-20220325.actual-original.pdf"),
    "whole126SourceExtraction": bind(f"{PREFIX}/candidate/BW126-same-whole-source-tracked-primary-path.inactive.json"),
    "whole126Duty220PartnerMapping": bind(f"{PREFIX}/candidate/BW126-220-partners-same-reviewed-mapping-portable-source-path.inactive.review.json"),
    "wholeOriginal126Duty217PartnerMappingExact": bind(f"{PREFIX}/inputs/whole-original-BW126-217-mapping.exact.json"),
    "source002NewConcentrationContribution": "partial",
    "wholeSourceDutiesPreserved": 126, "all217PriorReviewedPartnerEdgesPreserved": True,
    "ordinarySourceAtlasBefore": 185, "ordinarySourceAtlasAfter": 189,
    "sourceScopeAdditionalExistingGenericProcessPartner": ["49b13b33-34b7-5e4e-861c-b21082cb9922"],
    "newPracticalSourceScope": {"BW-SekI": [], "BW-SekII-GK": IDS[:1], "BW-SekII-LK": IDS},
    "actualPortableBWSourceContexts": source_contexts,
    "whole154DurationPolicyExact": bind(f"{PREFIX}/inputs/current-whole-duration-policy154.exact.json"),
    "boundedExactExistingBWDurationProjection": bind(f"{PREFIX}/candidate/BW-existing-duration-policy-exact.scope-projection.json"),
    "actualSourceTransportProof": bind(f"{PREFIX}/checks/path-only-source-transport-no-science-review.actual.json"),
    "actualFullPNativeAndPortableSourceModelsProof": bind(f"{PREFIX}/checks/current-P-full381-and-portable-BW185-189.normal-models.actual.json"),
    "wholeCurrentSourceAndLearnerProjectionProof": bind(f"{PREFIX}/checks/current-BW-GK-LK-full-learner-projections.actual.json"),
    "allProtectedCurrentAndStrictFiveSubjectIDs": bind(f"{PREFIX}/checks/protected-all-five-current-and-strict-ID-sets.exact.json"),
    "actualWholeGoalAndPageContextDiff": bind(f"{PREFIX}/checks/current-full-goal-page-context-and-protected177.actual-diff.json"),
    "all177ProtectedGoalObjectsAndPagesUnchanged": True,
    "pendingThreeExistingTheoryContextGoalIds": scope_diff["changedExistingPageIds"],
    "allThreeAffectedExistingTheoryPagesOutsideProtected177": True,
    "noNewNativeApprovalForUnrenderedTheoryPages": True,
    "actualAuthorLayoutReading": bind(f"{PREFIX}/author-layout/final-current-P-native.author-layout.actual.json"),
    "normalCurrentResourceNativeCompletionProof": bind(f"{PREFIX}/checks/completed-normal-current-P-bound-native.actual.json"),
    "currentIndependentNativeReviews": 0, "currentIndependentNativeDPApproval": False,
    "currentIndependentNativeVApproval": False, "currentActiveGateApproval": False,
    "wholeSourceProgrammeCourseAndCorrosionApproval": False,
    "actualLearnerExperimentsClaimed": 0, "actualLearnerSessionOrChatDataUsed": False,
    "newScientificClosures": 0, "restoredActiveBindings": 0, "netStrictGain": 0, "activeWrites": [],
    "humanApproval": False, "humanTrial": False,
})

# Scoped use of the unchanged ordinary schema discovery/JSON validator.
spec = importlib.util.spec_from_file_location("normal_schema_validator", ROOT / "scripts/validate_schemas.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
schema = read("docs/landscape-runtime.schema.json")
json_files = sorted(DIR.rglob("*.json"))
assert all(module.validate_file(str(p.relative_to(ROOT)), schema) for p in json_files)
jsonl_files = sorted(DIR.rglob("*.jsonl"))
for p in jsonl_files:
    for line in p.read_text().splitlines():
        if line.strip():
            assert isinstance(json.loads(line), dict)
symlinks = [str(p.relative_to(ROOT)) for p in DIR.rglob("*") if p.is_symlink()]
assert not symlinks
normal_link_errors = module.curriculum_symlink_errors(ROOT)
assert not normal_link_errors, normal_link_errors
put("checks/scoped-normal-schema-json-and-portability.actual.json", {"schemaVersion": 1, "ordinaryValidator": bind("scripts/validate_schemas.py"), "actualScopedJSONFileCount": len(json_files), "actualJSONLFileCount": len(jsonl_files), "allJSONAndJSONLParsed": True, "normalScopedRuntimeDiscoveryValidationPassed": True, "actualNewPackageSymlinks": symlinks, "normalCurriculumSymlinkErrors": normal_link_errors, "schemaCheckerChanged": False, "newScientificClosures": 0, "strictGain": 0})
all_files = [bind(p.relative_to(ROOT).as_posix()) for p in sorted(DIR.rglob("*")) if p.is_file()]
seal = put("author.final.freeze.json", {"schemaVersion": 1, "sealedAt": STAMP, "role": "Final actual real inactive author handoff only; never an independent review, adoption or human approval", "neutralIndependentReviewEntry": entry, "allFrozenRealPackageFiles": all_files, "currentIndependentNativeReviews": 0, "allHistorical09ArtifactsPreserved": True, "newScientificClosures": 0, "restoredActiveBindings": 0, "strictGain": 0, "activeWrites": [], "humanApproval": False, "humanTrial": False})
print(json.dumps({"neutralIndependentReviewEntry": entry, "finalFreeze": seal, "ordinaryCampaigns": campaigns, "actualNativePDF": bind(f"{native}/bundle/book.pdf"), "actualNativeHTML": bind(f"{native}/bundle/book.html"), "currentIndependentNativeReviews": 0, "strictGain": 0, "activeWrites": []}, ensure_ascii=False))
