"""Publish bindings to existing own FIRST and bounded technical outputs only."""
import datetime
import hashlib
import json
from pathlib import Path

OWN = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[7]
AUTHOR = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-rest-five-content-source-author-a-v1"
def load(p):
    return json.loads(p.read_text())
def bind(p):
    b = p.read_bytes()
    return {"path": p.relative_to(ROOT).as_posix(), "sha256": hashlib.sha256(b).hexdigest(), "bytes": len(b)}
def write(name, payload):
    p = OWN / name
    assert not p.exists(), f"Immutable output already exists: {p}"
    p.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")

first_path = OWN / "five-whole-source-and-mechanism.independent-c.scientific-FIRST.freeze.json"
first = load(first_path)
for item in first["outputs"]:
    assert bind(ROOT / item["path"]) == item, item["path"]
verdict_path = OWN / "five-whole-source-and-mechanism.independent-c.scientific-FIRST.verdict.json"
verdict = load(verdict_path)
normal = OWN / "ordinary-ten-source-facets-five-current-kinds.actual.json"
normal_data = load(normal)
assert not normal_data["errors"]
for item in normal_data["inputs"]:
    assert bind(ROOT / item["path"]) == item, item["path"]
portability_path = OWN / "actual-normal-portability-schema-and-primary-byte-check.independent-c.json"
portability = load(portability_path)
assert not portability["curriculumSymlinkErrors"]

input_names = [
    "neutral-five-remaining-whole-content-source-and-honest-transfer.author-review.entry.json",
    "five-whole-content-source-candidates.with-ten-original-clauses-and29-partners.author-input.json",
    "selected-ten-whole-source-duty-and-original-partner-frame.author-neutral.json",
    "five-bilingual-source-mechanism.author-synthetic-witness-sketches.json",
    "five-proposed-additive-partial-source-edges.author-candidate.json",
    "remaining-five-whole-current-goals-and-original-source-pool.author-neutral-input.json",
    "remaining-five-actual-input.author.first.freeze.json",
    "five-remaining-whole-source-and-transfer.author-first.freeze.json",
]
input_bindings = [bind(AUTHOR / n) for n in input_names]
frame = load(AUTHOR / input_names[2])
for entry in frame["actualInputs"]:
    assert bind(ROOT / entry["path"]) == entry, entry["path"]
primary_png_inputs = [bind(p) for p in sorted((AUTHOR / "primary").glob("*.png"))]
first_verified = {"schemaVersion": 1, "at": datetime.datetime.now(datetime.timezone.utc).isoformat(), "ownFirstOutputBindingsVerified": len(first["outputs"]), "originalAuthorInputAndCurrentSourceBindingsVerified": len(input_bindings) + len(frame["actualInputs"]), "firstVerdictAndFreezeUnchanged": True, "currentChemistrySemanticAndSourceInputsUnchanged": True, "activeWritePerformed": False, "freshPeerChem5OutcomesRead": False}
write("final-original-first-and-current-binding-countercheck.actual.json", first_verified)

entry = {
    "schemaVersion": 1,
    "role": "completed independent C whole-five source/duty review; bounded contribution decisions, no whole-source or positive/native approval",
    "reviewer": "/root/biology_resume_candidate",
    "completedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "originalNeutralAuthorEntry": input_bindings[0],
    "ownFirstScientificVerdict": bind(verdict_path),
    "ownFirstScientificFreeze": bind(first_path),
    "ownExactInitialInputFreeze": bind(OWN / "five-exact-initial-inputs.independent-c.first.freeze.json"),
    "wholeFiveGoalIds": [x["id"] for x in verdict["wholeFiveGoals"]],
    "wholeFiveGoalsAndTenWholeDutyAssessmentsAnd29Partners": bind(verdict_path),
    "originalAuthorInputBindings": input_bindings,
    "originalSourceAndMappingAndModelBindings": [x for x in frame["actualInputs"] if not x["path"].endswith(".pdf")],
    "localOriginalPrimaryWorkingCacheStatus": portability["actualPrimaryPDFPortabilityStatus"],
    "ordinaryOfficialReferenceAndPortableExtracts": {
        "actualOriginalCourseColumnPageImagesSeen": primary_png_inputs,
        "actualIndependentlyReextractedWholePrimaryPageTexts": [bind(p) for p in sorted((OWN / "primary").glob("*.txt"))],
        "HEUrl": "https://kultus.hessen.de/sites/kultus.hessen.de/files/2026-07/kcgo_chemie_21.04.2026.pdf",
        "RPOriginalOfficialUrl": "https://bildung.rlp.de/lehrplaene/?tx_rlpbase_download%5Bitem%5D=67901&type=432522",
        "liveRetrievalReceiptAuthorActual": bind(AUTHOR / "live-two-official-primary-retrieval.author-technical.json"),
        "independentNewNetworkRetrievalClaimed": False,
        "RPLiveSourceAvailabilityApproved": False,
    },
    "ordinarySourceFacetAndCurrentKindCheck": bind(normal),
    "originalBodyAndEdgeByteValueCheck": bind(OWN / "actual-exact-original-duty-partner-inputs.independent-c.technical.json"),
    "ownNumericChecks": bind(OWN / "five-actual-independent-calculations.json"),
    "ordinaryPortabilitySchemaAndPrimaryByteCheck": bind(portability_path),
    "finalFirstAndCurrentCountercheck": bind(OWN / "final-original-first-and-current-binding-countercheck.actual.json"),
    "normalCommandsActuallyRun": [
        ["python3", (OWN / "seal-own-five-science-first-v2.py").relative_to(ROOT).as_posix()],
        ["app/node_modules/.bin/tsx", (OWN / "probe-ordinary-source-facets-and-current-kinds.independent-c.technical.mts").relative_to(ROOT).as_posix()],
        ["python3", "scripts/validate_schemas.py", "API curriculum_symlink_errors(Path.cwd()) only"],
        ["git", "check-ignore", "--stdin"],
        ["pdftotext", "-f", "actualPage", "-l", "actualPage", "-layout", "actualRetainedOriginalPDF", "-"],
    ],
    "normalPositiveEvidence": {"normalPReviewExecuted": False, "normalProfilesOrClosedCasesSupplied": False, "currentPApproval": False, "reason": "Input supplies five short synthetic mechanism sketches, not whole P profiles/cases/rubrics. No records/config approvals were invented."},
    "scientificConclusion": verdict["summary"],
    "explicitHoldBoundaries": verdict["requiredNextEvidence"],
    "noMutationClaims": {"activeSourceAtlas": False, "canonical": False, "registryOrQA": False, "runtime": False, "images": False, "semanticKindLedger": False, "humanFlags": False, "stageCommitPush": False},
    "independence": {"freshPeerBChem5ResultsRead": False, "ownFirstCreatedBeforeAnyPeerChem5Outcome": True, "authorCandidateTextsVisible": True, "authorFlagsUsedAsAuthority": False, "separateKpRasterAuthorRoleNotIndependentlyReviewed": True},
}
write("completed-five-whole-source-independent-c.neutral-integration.entry.json", entry)
freeze = {"schemaVersion": 1, "role": "final immutable independent C technical handoff; original scientific FIRST unchanged", "reviewer": "/root/biology_resume_candidate", "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "originalFirstScientificFreeze": bind(first_path), "outputs": [bind(p) for p in sorted(OWN.rglob("*")) if p.is_file()], "committableInputs": input_bindings + primary_png_inputs + [x for x in frame["actualInputs"] if not x["path"].endswith(".pdf")], "localWorkingOriginalPDFsNotClaimedTracked": portability["actualPrimaryPDFPortabilityStatus"], "freshPeerChem5OutcomesRead": False, "activeWrites": False, "strictGain": 0}
write("completed-five-whole-source-independent-c.final.freeze.json", freeze)
print(json.dumps({"entry": bind(OWN / "completed-five-whole-source-independent-c.neutral-integration.entry.json"), "finalFreeze": bind(OWN / "completed-five-whole-source-independent-c.final.freeze.json"), "outputs": len(freeze["outputs"]), "committableInputs": len(freeze["committableInputs"])}, indent=2))
