"""Reviewable inert integration plan; exactly one unchanged central Chemie run.

All native D/P/A/M/V inputs must be frozen before invocation. Active repository
files are read-only inputs; physical candidate substitutions occur only in a
new temporary sparse root. No status or checker is weakened.
"""
from pathlib import Path
import argparse
import copy
import datetime
import hashlib
import json
import os
import re
import shutil
import subprocess
import tempfile

OWN = Path(__file__).resolve().parent
REPO = OWN.parents[6]
OWN_REL = OWN.relative_to(REPO).as_posix()
BASE = "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/"
PREP = BASE + "chemie-current-fifteen-reviewed-integration-preparation-v1/"
AM = BASE + "chemie-current-four-native-atomicity-memory-integration-preparation-author-v1/"
POSITIVE = BASE + "chemie-current-fifteen-positive-reviewed-bindings-v1/"
DESCRIPTION = BASE + "chemie-current-fifteen-description-native-reviewed-integration-v1/"
VISUAL = BASE + "chemie-current-three-reviewed-visual-integration-v1/"
METADATA = BASE + "chemie-current-coordinate-provider-license-targeted-author-v7/"
REGISTRY = "curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json"
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
parser = argparse.ArgumentParser()
parser.add_argument("--visual-freeze", required=True)
parser.add_argument("--visual-freeze-sha256", required=True)
parser.add_argument("--metadata-a-freeze", required=True)
parser.add_argument("--metadata-a-freeze-sha256", required=True)
parser.add_argument("--metadata-b-freeze", required=True)
parser.add_argument("--metadata-b-freeze-sha256", required=True)
args = parser.parse_args()


def read(path):
    return json.loads((REPO / path).read_text())


def bind(path):
    data = (REPO / path).read_bytes()
    return {"path": path, "sha256": "sha256:" + hashlib.sha256(data).hexdigest(), "bytes": len(data)}


def write(name, data):
    path = OWN / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    return OWN_REL + "/" + name


def verify_freeze(path, digest):
    assert bind(path)["sha256"] == "sha256:" + digest, path
    data = read(path)
    for row in data["files"]:
        assert bind(row["path"])["sha256"] == row["sha256"], row["path"]
        assert bind(row["path"])["bytes"] == row["bytes"], row["path"]
    return {"freeze": bind(path), "fileCount": len(data["files"]), "allFrozenOwnOutputsByteExact": True}


assert REPO.name == "skillpilot"
assert not (OWN / "future-central-chemistry.actual.stdout.json").exists(), "Exactly one future central invocation per immutable plan stage"
frozen = [
    verify_freeze(AM + "four-native-atomicity-memory-author.final.freeze.json", "e571a7939a74765a074a400380d1c3471e23bbcb7a05899c7043b448ec890279"),
    verify_freeze(POSITIVE + "current-fifteen-positive-bindings.final.freeze.json", "a261029760e965ee3e58c2fcb107bf5234281b052e3d62f810b14f07adb8f619"),
    verify_freeze(DESCRIPTION + "current-fifteen-description-native-reviewed-integration-v1.final.freeze.json", "e68c05da39d50f5c3c774b345cb4c76e9cd3497fd7ba232d4cee6fe5247f29fe"),
    verify_freeze(args.visual_freeze, args.visual_freeze_sha256),
    verify_freeze(METADATA + "coordinate-two-source-metadata-fields-author-v7.final.freeze.json", "54939bf85930d3ec154714ed585b3cd28a0a7d1583152baf19e9b5b23a14462c"),
    verify_freeze(args.metadata_a_freeze, args.metadata_a_freeze_sha256),
    verify_freeze(args.metadata_b_freeze, args.metadata_b_freeze_sha256),
]
# Source audit decisions are substantive prerequisites; a freeze alone is not approval.
metadata_a = read(args.metadata_a_freeze)
metadata_b = read(args.metadata_b_freeze)
assert metadata_a["decision"] == "KEEP_CORRECTED_PROVIDER_LICENSE_WITH_EXACT_EXISTING_NATIVE_D_REUSE"
assert metadata_a["actualAuditExitCode"] == 0
assert metadata_b["decision"] == "KEEP_TARGETED_TWO_FIELD_CORRECTION"
assert metadata_b["fieldDecisionCounts"] == {"KEEP": 2, "REVISE": 0}
raw = (REPO / REGISTRY).read_text()
registry = json.loads(raw)
chem = next(s for s in registry["subjects"] if s["subject"] == "chemie")
future = copy.deepcopy(chem)
am_info = read(AM + "isolated-root.reproduction.author.json")
replacements = {}
for new_path in am_info["futureActiveAtomicityConfigPaths"]:
    new = read(new_path)
    previous = [p for p in chem["semanticAtomicityConfigPaths"] if read(p)["reviewId"] == new["reviewId"]]
    assert len(previous) == 1
    replacements[previous[0]] = new_path
assert len(replacements) == 3
future["semanticAtomicityConfigPaths"] = [replacements.get(p, p) for p in chem["semanticAtomicityConfigPaths"]]
future["memoryReviewConfigPath"] = am_info["futureActiveMemoryConfigPath"]
new_p = [PREP + "positive.eight.future-active.config.json", PREP + "positive.seven.future-active.config.json"]
new_d = [DESCRIPTION + name + "/resolution-index.json" for name in ["native-original-ten", "native-current-three", "native-coordinate-single", "native-aromatic-single"]]
future["positiveEvidenceConfigPaths"] = chem["positiveEvidenceConfigPaths"] + new_p
future["resolutionIndexPaths"] = chem["resolutionIndexPaths"] + new_d
selected = {id for p in new_p for id in read(p)["scope"]["goalIds"]}
assert len(selected) == 15
new_d_claims = [r["goalId"] for p in new_d for r in read(p)["resolutions"] if r["strictDescriptionComplete"]]
assert len(new_d_claims) == len(set(new_d_claims)) == 15 and set(new_d_claims) == selected
for path in chem["resolutionIndexPaths"]:
    assert not selected & {r["goalId"] for r in read(path)["resolutions"] if r["strictDescriptionComplete"]}, path
for path in chem["positiveEvidenceConfigPaths"]:
    assert not selected & set(read(path)["scope"]["goalIds"]), path
assert set(future) == set(chem)
allowed = {"semanticAtomicityConfigPaths", "memoryReviewConfigPath", "positiveEvidenceConfigPaths", "resolutionIndexPaths"}
assert all(future[k] == chem[k] for k in chem if k not in allowed)

# Preserve every original byte outside the single Chemie subject object.
decoder = json.JSONDecoder()
position = re.search(r'"subjects"\s*:\s*\[', raw).end()
spans = []
while True:
    while raw[position].isspace() or raw[position] == ",":
        position += 1
    if raw[position] == "]":
        break
    row, end = decoder.raw_decode(raw, position)
    spans.append((position, end, row["subject"]))
    position = end
start, end, _ = next(s for s in spans if s[2] == "chemie")
replacement = json.dumps(future, ensure_ascii=False, indent=4).replace("\n", "\n    ")
future_raw = raw[:start] + replacement + raw[end:]
future_registry = json.loads(future_raw)
assert all(a == b for a, b in zip(registry["subjects"], future_registry["subjects"], strict=True) if a["subject"] != "chemie")
(OWN / "central-registry.current.before.snapshot.json").write_text(raw)
(OWN / "central-registry.future-chemistry-only-change.config.json").write_text(future_raw)
future_config_path = write("central-future-chemistry-only-check.config.json", {**registry, "subjects": [future]})
write("registry-routing-and-nonchem-byte-preservation.plan.json", {"schemaVersion": 1, "documentType": "inert-author-single-subject-registry-routing-plan", "currentRegistry": bind(REGISTRY), "onlyChemieObjectChanged": True, "allOriginalBytesOutsideChemieObjectExact": True, "otherSubjectRawEntries": [{"subject": subject, "sha256": "sha256:" + hashlib.sha256(raw[s:e].encode()).hexdigest(), "bytes": len(raw[s:e].encode())} for s, e, subject in spans if subject != "chemie"], "replacedAtomicityConfigs": replacements, "replacedMemoryConfig": {"before": chem["memoryReviewConfigPath"], "after": future["memoryReviewConfigPath"]}, "appendedPositiveConfigs": new_p, "appendedDescriptionIndices": new_d, "selectedGoalIds": sorted(selected), "uniqueStrictDescriptionOwners": 15, "noPreviousStrictDescriptionOrPositiveScopeOverlap": True, "allOldIndicesAndSupersessionsWithdrawalsPreserved": True, "allOtherChemieFieldsUnchanged": True, "noProtectedFloorsOrDurationOrSourceOrContentChange": True, "actualCentralRunScope": "Chemie only through unchanged standard config contract", "activeWrites": False})

isolated = Path(tempfile.mkdtemp(prefix="skillpilot-chemie-fifteen-future-central-"))
copies, links = [], []
def physical(source, destination):
    path = isolated / destination
    path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(REPO / source, path)
    copies.append({"source": bind(source), "isolatedDestination": destination})
def link(source, destination):
    path = isolated / destination
    path.parent.mkdir(parents=True, exist_ok=True)
    path.symlink_to(os.path.relpath(REPO / source, path.parent))
    links.append({"readOnlySource": source, "temporaryDestination": destination})
for path in (REPO / "app/scripts").iterdir():
    if path.is_file():
        physical(path.relative_to(REPO).as_posix(), path.relative_to(REPO).as_posix())
link("app/scripts/config", "app/scripts/config")
for path in ["app/node_modules", "app/src", "contracts", "docs", "scripts"]:
    link(path, path)
physical("app/package.json", "app/package.json")
quality = "curricula/DE/Gymnasium/quality"
special = {"goal-book-publication", "goal-visualization-qa", "deep-understanding-rollout"}
for child in (REPO / quality).iterdir():
    if child.name not in special:
        link(child.relative_to(REPO).as_posix(), child.relative_to(REPO).as_posix())
for directory, excluded in [("goal-book-publication", {"chemie.semantic-kinds.json"}), ("goal-visualization-qa", {"chemie.qa.json"}), ("deep-understanding-rollout", {Path(REGISTRY).name})]:
    for child in (REPO / quality / directory).iterdir():
        if child.name not in excluded:
            link(child.relative_to(REPO).as_posix(), child.relative_to(REPO).as_posix())
physical(OWN_REL + "/central-registry.future-chemistry-only-change.config.json", REGISTRY)
physical(METADATA + "prospective-current378.canonical.metadata-only.author-candidate.json", chem["landscapePath"])
physical(PREP + "semantic-kinds.future-reviewed-input.json", chem["semanticKindLedgerPath"])
physical(VISUAL + "prospective-current-active-path.chemie.qa.json", chem["visualizationQaPath"])
for child in (REPO / "curricula/DE/Gymnasium").iterdir():
    if child.name not in {"quality", "canonical", "visualizations", "memory-decks"}:
        link(child.relative_to(REPO).as_posix(), child.relative_to(REPO).as_posix())
for child in (REPO / "curricula/DE/Gymnasium/canonical").iterdir():
    if child.name != Path(chem["landscapePath"]).name:
        link(child.relative_to(REPO).as_posix(), child.relative_to(REPO).as_posix())

new_images = {"b8d3b453-d638-5518-aab0-d84ec2e8567c", "973c12d9-d863-5292-8c68-9c80cdacf9e2", "363c5740-8a3c-50b8-8c3a-5548c80c36ea"}
visual_layout = VISUAL + "prospective-three-asset-check-layout/"
archive = read(VISUAL + "historical-before-byteexact-archive.manifest.json")
for row in archive["entries"]:
    assert bind(row["original"]["path"])["sha256"] == row["original"]["sha256"]
    assert bind(row["preservedCopy"]["path"])["sha256"] == row["original"]["sha256"]
for root in ["curricula/DE/Gymnasium/visualizations/chemie", "app/public/assets/goal-visualizations/chemie", "backend/src/main/resources/static/assets/goal-visualizations/chemie"]:
    for child in (REPO / root).iterdir():
        if child.name not in new_images:
            link(child.relative_to(REPO).as_posix(), child.relative_to(REPO).as_posix())
    for id in new_images:
        for child in (REPO / visual_layout / root / id).iterdir():
            assert child.is_file() and child.suffix != ".jpg"
            physical(child.relative_to(REPO).as_posix(), root + "/" + id + "/" + child.name)

deck_name = "de_gymnasium_chemistry_flashcards_organic_q1.de.json"
deck_candidate = AM + "organic-q1-deck.one-reviewed-card.author-candidate.json"
for root in ["curricula/DE/Gymnasium/memory-decks", "app/public/data", "backend/src/main/resources/static/data"]:
    for child in (REPO / root).iterdir():
        if child.name != deck_name:
            link(child.relative_to(REPO).as_posix(), child.relative_to(REPO).as_posix())
    physical(deck_candidate, root + "/" + deck_name)

guards = [bind(REGISTRY), bind(chem["landscapePath"]), bind(chem["semanticKindLedgerPath"]), bind(chem["visualizationQaPath"])]
guards += [row["original"] for row in archive["entries"]]
guards += [bind(root + "/" + deck_name) for root in ["curricula/DE/Gymnasium/memory-decks", "app/public/data", "backend/src/main/resources/static/data"]]
helper_bindings = [row["source"] for row in copies if row["isolatedDestination"].startswith("app/scripts/")]
write("actual-isolated-candidate-layout-and-frozen-inputs.plan.json", {"schemaVersion": 1, "documentType": "inert-author-actual-isolated-layout-and-frozen-gates", "createdAtUTC": NOW, "isolatedRoot": str(isolated), "allNativeGatePackagesActuallyFrozen": frozen, "physicalCandidateAndUnmodifiedHelperCopies": copies, "temporaryRelativeReadOnlyLinks": links, "threePngsEachSourceFrontendBackendExactCopies": True, "oldJpgsAbsentOnlyFromTemporaryActivePathsAfterArchiveVerification": True, "oneCorrectedDeckSourceFrontendBackendExactCopies": True, "allActiveInputBindingsBefore": guards, "centralCheckerWillRunOnceOnlyForChemistry": True, "activeWrites": False})
command = [str(REPO / "app/node_modules/.bin/tsx"), str(isolated / "app/scripts/reportDeepUnderstandingRollout.ts"), "--config=" + future_config_path, "--mode=check", "--format=json"]
result = subprocess.run(command, cwd=isolated, text=True, capture_output=True)
(OWN / "future-central-chemistry.actual.stdout.json").write_text(result.stdout)
(OWN / "future-central-chemistry.actual.stderr.txt").write_text(result.stderr)
write("future-central-chemistry.actual.cli.receipt.json", {"schemaVersion": 1, "documentType": "inert-author-one-standard-central-chemistry-future-check", "createdAtUTC": NOW, "argv": command, "cwd": str(isolated), "exitCode": result.returncode, "actualInvocationCount": 1, "stdoutPath": OWN_REL + "/future-central-chemistry.actual.stdout.json", "stderrPath": OWN_REL + "/future-central-chemistry.actual.stderr.txt", "unmodifiedHelperBindings": helper_bindings, "noAlternativeCheckerOrForcedStatus": True, "activeWrites": False})
if result.stdout.strip():
    report = json.loads(result.stdout)
    assert len(report["subjects"]) == 1 and report["subjects"][0]["subject"] == "chemie"
    current = report["subjects"][0]
    protected = set(read(BASE + "chemie-current-atomic-description-positive-gap-author-v1/actual-inputs.before-native-preparation.json")["protectedStrictGoalIds"])
    actual_strict = set(current["strictCompleteGoalIds"])
    write("actual-future-strict-progress-and-protected-floor.receipt.json", {"schemaVersion": 1, "documentType": "inert-author-actual-future-strict-progress", "currentDenominator": current["denominator"], "actualFutureStrictComplete": current["strictComplete"], "actualFutureGates": current["gates"], "requiredChecks": current["requiredChecks"], "blockingIssues": current["issues"], "baselineStrictCount": 112, "protected112StrictGoalIds": sorted(protected), "allProtected112StillStrict": protected <= actual_strict, "selected15CurrentStrictGoalIds": sorted(selected & actual_strict), "selected15NotStrictGoalIds": sorted(selected - actual_strict), "actualFutureNetGain": current["strictComplete"] - 112, "actualFutureNewScientificClosuresAfterAuthorizedIntegration": len((selected & actual_strict) - protected), "actuallyIntegratedScientificClosuresNow": 0, "restoredActiveBindingsNow": 0, "actualActiveStrictNetGainNow": 0, "sourceSupersetScopeHoldsRetained": True, "humanApproval": False, "humanTrial": False, "activeWrites": False})
for before in guards:
    after = bind(before["path"])
    assert after["sha256"] == before["sha256"] and after["bytes"] == before["bytes"], before["path"]
write("active-no-write-postcheck.actual-guard.json", {"schemaVersion": 1, "documentType": "inert-author-postcheck-no-active-write-guard", "allActiveInputsByteExact": guards, "allOriginalThreeJpgCopiesAndThreeSourcePromptsRemainByteExact": True, "allActiveThreeDeckCopiesRemainByteExact": True, "allOtherRegistrySubjectRawBytesPreservedInFuturePlan": True, "historicalImmutableGatePackagesRemainExact": frozen, "activeWrites": False, "gitWrites": False})
print(json.dumps({"exitCode": result.returncode, "actualInvocationCount": 1, "isolatedRoot": str(isolated), "actualFutureStrict": report["subjects"][0]["strictComplete"] if result.stdout.strip() else None, "issues": report["subjects"][0]["issues"] if result.stdout.strip() else result.stderr}))
