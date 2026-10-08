# SPDX-License-Identifier: Apache-2.0
import copy
import datetime
import hashlib
import json
import os
import pathlib
import subprocess

ROOT = pathlib.Path.cwd()
OWN = pathlib.Path(__file__).parent
REQUIRED = {}


def rel(p):
    return str(p.relative_to(ROOT))


def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def bound(p):
    p = ROOT / p if not p.is_absolute() else p
    out = {"path": rel(p), "sha256": sha(p), "bytes": p.stat().st_size}
    REQUIRED[out["path"]] = out
    return out


def read(p):
    bound(p)
    return json.loads(p.read_text())


def put(name, value):
    p = OWN / name
    p.parent.mkdir(parents=True, exist_ok=True)
    data = (value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode()
    with p.open("xb") as out:
        out.write(data)
    return p


guard = read(OWN / "checks/genuine-one-pair-and-current191-baseline.technical.json")
id = guard["selectedGoalId"]
for key, item in guard["beforeBindings"].items():
    p = ROOT / item["path"]
    assert sha(p) == item["sha256"], (key, p)
    bound(p)
for item in guard["otherProtectedFiles"]:
    assert sha(ROOT / item["path"]) == item["sha256"]
    bound(ROOT / item["path"])
for fname in ["initial-current191-guards.terminal.actual.json", "native-D1-pair-v3.terminal.actual.json", "current-P1-V1-full391.terminal.actual.json", "current-D1.terminal.actual.json", "AM/A1.native.terminal.actual.json", "AM/M1.native.terminal.actual.json", "AM/M391.native.terminal.actual.json"]:
    assert read(OWN / fname)["exitCode"] == 0, fname
for name in ["initial-declared-inputs.technical.json", "native-one-pair-D-declared-inputs.technical.json", "P-V-full391-declared-inputs.technical.json"]:
    for item in read(OWN / "checks" / name)["files"]:
        p = ROOT / item["path"]
        assert sha(p) == item["sha256"].removeprefix("sha256:"), p
        bound(p)
for seal_entry in guard["seals"].values():
    p = ROOT / seal_entry["seal"]["path"]
    assert sha(p) == seal_entry["seal"]["sha256"]
    for item in read(p)["frozenFiles"]:
        q = ROOT / item["path"]
        assert sha(q) == item["sha256"].removeprefix("sha256:"), q
        bound(q)
for entry in guard["sourceClassAMScienceAdoption"]["genuineIndependentScienceSeals"]:
    p = ROOT / entry["path"]
    assert sha(p) == entry["sha256"]
    for item in read(p)["frozenFiles"]:
        q = ROOT / item["path"]
        assert sha(q) == item["sha256"], q
        bound(q)

registry = read(OWN / "before/registry.json")
bio = next(s for s in registry["subjects"] if s["subject"] == "biologie")
old_bio = copy.deepcopy(bio)
d_path = rel(OWN / "native-d-one/resolution-index.json")
p_path = rel(OWN / "positive/current1.future-active.config.json")
assert d_path not in bio["resolutionIndexPaths"] and p_path not in bio["positiveEvidenceConfigPaths"]
bio["resolutionIndexPaths"].append(d_path)
bio["positiveEvidenceConfigPaths"].append(p_path)
assert all(bio[k] == v for k, v in old_bio.items() if k not in ["resolutionIndexPaths", "positiveEvidenceConfigPaths"])
put("candidate/registry-biologie.future-entry.json", bio)
put("candidate/registry.future-active.reviewable.json", registry)
put("candidate/ledger-preserve-only.technical.json", {"currentLedger": guard["beforeBindings"]["ledger"], "activeBatchConfigPaths": guard["allSevenChemistryClaimsExact"], "action": "preserve_exact_no_write"})

central = read(OWN / "before/current191-central.actual.json")
subjects = {s["subject"]: s for s in central["subjects"]}
assert subjects["biologie"]["strictComplete"] == 191 and subjects["biologie"]["denominator"] == 391
assert id not in subjects["biologie"]["strictCompleteGoalIds"]
assert subjects["mathematik"]["strictComplete"] == subjects["mathematik"]["denominator"] == 807
assert subjects["physik"]["strictComplete"] == subjects["physik"]["denominator"] == 478
assert subjects["chemie"]["strictComplete"] == 173 and subjects["chemie"]["denominator"] == 378
replacements = [
    {"target": guard["beforeBindings"][key]["path"], "source": bound(OWN / source), "expectedBefore": guard["beforeBindings"][key]} for key, source in [
        ("canonical", "candidate/canonical.one-current191-future-active.json"),
        ("kinds", "candidate/semantic-kinds.future-active.json"),
        ("qa", "candidate/visualization-qa.future-active.json"),
        ("atomicity", "candidate/semantic-atomicity.future-active.jsonl"),
        ("memory", "candidate/memory-card-review.future-active.jsonl"),
    ]
]
ops = []
for item in guard["copies"]:
    source = ROOT / item["source"]["path"]
    assert sha(source) == item["source"]["sha256"]
    assert not (ROOT / item["target"]).exists()
    ops.append({"action": "copy_exact", "source": rel(source), "sourceSha256": "sha256:" + sha(source), "target": item["target"], "expectedBefore": "missing"})
assert len(ops) == 5
plan = {
    "role": "Inactive reviewed current19 whole-pair integration plan, rebased on actual191",
    "subject": "biologie",
    "selectedGoalIds": [id],
    "beforeCanonicalSha256": guard["beforeBindings"]["canonical"]["sha256"],
    "futureCanonicalSource": replacements[0]["source"]["path"],
    "futureCanonicalSha256": "sha256:" + replacements[0]["source"]["sha256"],
    "reviewedActiveReplacementFiles": replacements,
    "replaceQaFrom": rel(OWN / "candidate/visualization-qa.future-active.json"),
    "mergeOnlyBiologyRegistryEntryFrom": rel(OWN / "candidate/registry-biologie.future-entry.json"),
    "registryBefore": guard["beforeBindings"]["registry"],
    "registryMergeInstruction": "Append exactly the new genuine native-one index and P1 config to the current Biology entry; preserve existing standalone indexes and all other subjects. The original18 index retains19 deferred and its genuine B HOLD; this separate current native1 pair closes only the actually corrected current body.",
    "ledgerPreserveOnly": rel(OWN / "candidate/ledger-preserve-only.technical.json"),
    "assetOperations": ops,
    "beforeBindings": guard["beforeBindings"],
    "protectedOtherFiles": guard["otherProtectedFiles"],
    "protectedStrictGoalIds": {key: s["strictCompleteGoalIds"] for key, s in subjects.items()},
    "protectedCurrentGoalIds": {key: s["currentGoalIds"] for key, s in subjects.items()},
    "strictBaselineReport": bound(OWN / "before/current191-central.actual.json"),
    "currentStrictBiologyActual": 191,
    "currentDenominatorBiologyActual": 391,
    "expectedPotentialAfterStrictBiology": 192,
    "potentialNewScientificClosures": 1,
    "newScientificClosuresClaimedBeforeCentralCheck": 0,
    "restoredBindingGainClaimedBeforeCentralCheck": 0,
    "exactOtherWholeGoalBodies": 473,
    "exactOtherCurrentPages": 390,
    "allOriginalSourceAndMappingBodiesUnchanged": True,
    "changedGoalFields": ["titleEn", "descriptionEn", "resourceLinks"],
    "classifierAndAMOnlyGenuineReviewedCurrent19RowChanged": True,
    "otherClassifierAndAMRowsAndAllCardsViewsExact": True,
    "actualNativeChecksExit0": ["currentD1", "closedP1", "actualPairedV1", "A1", "M1", "M391-retained390", "pureWhole391"],
    "excluded12Split": "3ee4b55c-81c3-5826-9d26-1a8c22cbd0b8 remains open; no child or structural changes in this plan",
    "trueReviewerRunsAndAllHistoricalFirstVerdictsPreserved": True,
    "mustRunAfterApply": [
        {"argv": ["node", "app/node_modules/tsx/dist/cli.mjs", rel(OWN / "check-current-reviewed-D1.technical.mts"), "--active"], "purpose": "Actual integrated current D1 native resolution binding"},
        {"argv": ["node", "app/node_modules/tsx/dist/cli.mjs", "app/scripts/positiveGoalEvidenceReview.ts", "--mode=check", "--config=" + p_path], "purpose": "Ordinary public P1 CLI against actually installed PNG and active source-kind ledger"},
        {"argv": ["npm", "--prefix", "app", "run", "check:goal-visualization-assets"], "purpose": "Actual canonical/frontend/backend assets and public links after exact copies"},
        {"argv": ["npm", "--prefix", "app", "run", "quality:deep-understanding-rollout:check"], "purpose": "Actual current central five-gate report, protected IDs/floors and net gain; no completion claim until terminal result"},
    ],
    "standardAtlasAfterStableIntegration": "Regenerate the ordinary source-atlas receipt at the stable new canonical as required, preserving original source outputs and honest metadata-only lineage; bundle final full builds with stable integration checks.",
    "portableOperativeBundleContract": "The genuine native-one copied bundle/book.pdf and bundle/book.html and manifest artifacts are required operative dependencies. Raw ignored rendered paths, if named by old history, remain historical observations only. No ignored-input exception, forced add or schema/validator change.",
    "separateHumanApprovalAndTrial": True,
    "activeWrites": 0,
}
plan_path = put("ready-root-reviewed-guarded-integration-plan.technical.json", plan)

for p in OWN.rglob("*"):
    if p.is_file():
        if p.suffix == ".json":
            json.loads(p.read_text())
        if p.suffix == ".jsonl":
            for line in p.read_text().splitlines():
                json.loads(line)
        bound(p)
for path in read(ROOT / "app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json")["mappingPaths"]:
    bound(ROOT / path)
for path in ["app/scripts/validateGoalDescriptionReviewCampaign.ts", "app/scripts/validateGoalDescriptionReviewCampaignResults.ts", "app/scripts/validateGoalDescriptionReviewDualRound.ts", "app/scripts/validateGoalDescriptionDualRoundResolution.ts", "app/scripts/validateGoalDescriptionRolloutSynthesisDecisionManifest.ts", "app/scripts/goalDescriptionRolloutResolutionSynthesis.ts", "app/scripts/reportDeepUnderstandingRollout.ts", "app/scripts/goalBookModel.ts", "app/scripts/goalBookOriginalSources.ts", "app/scripts/positiveGoalEvidenceProfileModel.ts", "app/scripts/semanticAtomicityReview.ts", "app/scripts/memoryCardReview.ts"]:
    bound(ROOT / path)
ignore = subprocess.run(["git", "check-ignore", "--no-index", "--stdin"], input="\n".join(REQUIRED) + "\n", capture_output=True, text=True)
assert ignore.returncode in [0, 1]
assert not ignore.stdout.strip(), ignore.stdout
links = []
for path in REQUIRED:
    p = ROOT / path
    assert p.exists(), p
    if p.is_symlink():
        target = os.readlink(p)
        assert not os.path.isabs(target), p
        resolved = p.resolve(strict=True)
        assert resolved.is_relative_to(ROOT)
        assert rel(resolved) in REQUIRED
        links.append({"path": path, "relativeTarget": target, "target": bound(resolved), "broken": False})
portable = put("checks/final-required-input-portability-and-symlinks.actual.technical.json", {"checkedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "requiredFiles": list(REQUIRED.values()), "actualGitCheckIgnoreExit": ignore.returncode, "ignoredRequiredFiles": [], "actualContainedRelativeSymlinks": links, "brokenRequiredSymlinks": 0, "ownCandidateSymlinks": 0, "allOwnJSONAndJSONLParse": True, "operativeBundlePDFAndHTMLNotIgnored": True, "activeWrites": 0, "strictGainClaimed": 0})
put("TECHNICAL-READINESS.md", "# HE19 current-one reviewed technical handoff\n\nThe actual baseline is Biology **191/391**, Chemistry173/378, Mathematics807/807 and Physics478/478, from the terminal current central report. This inactive dossier claims no new strict closure.\n\nThe genuine corrected-current A/B Native1 pair passes existing campaign, result, dual, synthesis, resolution, current-goal and standalone-index APIs. Its complete two-case P body is unchanged, E1/G1 and needs_human_review. Actual paired whole PNG,360/680 and new native page reviews are preserved. Only the two independently science-reviewed English fields and the primary image link change on the selected whole goal;473 other whole goal bodies and390 other whole pages are exact. Source classification/atomicity/memory19 derive from two genuine whole source-science decisions; A1/M1 and fullM391 retained390 pass natively. Existing cards and eight views are unchanged.\n\nThe ready plan preserves all current strict IDs, all seven Chemistry claims and separate human gates. It supplies five exact asset copies and five exact active content-ledger replacements plus an append-only Biology registry merge. Root must apply it under the recorded guards and run actual active D1/P1/assets/central checks before counting a potential192/391. The source-atlas receipt and final full build are updated at a stable integration state.\n\nAll operative required files actually pass git check-ignore and exist; the sole contained author image symlink resolves to a declared commit-capable selected PNG. Operative native render dependencies are bundle/book.pdf and bundle/book.html. The original eighteen-goal B scope HOLD and A KEEP are unchanged historical judgments; the new one-goal pair handles the actually corrected current body. Ord12 remains split-review open. No active write, learner data, new image generation, new scientific run, human approval or human trial is claimed.\n\nTwo real initial native-synthesis/index failures from empty optional deferred fields remain preserved. The standard contracts require omission when no goal is deferred; no schema or validator was changed.\n")
own_files = [p for p in OWN.rglob("*") if p.is_file()]
seal = put("technical-preparation.final.freeze.json", {"schemaVersion": 1, "sealedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "kind": "Inactive exact current191-rebased genuine reviewed one-goal technical preparation", "ownFiles": [bound(p) for p in sorted(own_files)], "requiredPortableInputGuard": bound(portable), "readyPlan": bound(plan_path), "genuineSourceSeals": guard["seals"], "nativeCurrentD1": "PASS_actual0", "nativeClosedP1": "PASS_actual0", "actualPairedV1": "PASS", "nativeA1M1M391": "PASS_actual0", "other473WholeGoalsAnd390WholePagesExact": True, "strictGainClaimed": 0, "activeWrites": 0, "humanApproval": False, "humanTrial": False})
print(json.dumps({"readyPlan": rel(plan_path), "finalSeal": rel(seal), "sha256": sha(seal), "nativeDPAMV1": "PASS", "baselineActual": "191/391", "potentialAfterRootActiveChecks": "192/391", "portableRequiredFiles": len(REQUIRED), "ignoredRequired": 0, "brokenSymlinks": 0, "assetCopies": 5, "activeWrites": 0, "strictGainClaimed": 0}))
