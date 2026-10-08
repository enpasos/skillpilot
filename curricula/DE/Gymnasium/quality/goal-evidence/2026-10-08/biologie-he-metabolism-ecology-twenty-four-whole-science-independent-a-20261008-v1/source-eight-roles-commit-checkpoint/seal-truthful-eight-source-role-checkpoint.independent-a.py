# SPDX-License-Identifier: Apache-2.0
"""Freeze inspected source-role inputs and open findings, never manufacture closure."""
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import subprocess

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[7]
FIRST = OWN.parent
AUTHOR = FIRST.parent / "biologie-he-metabolism-ecology-twenty-four-whole-science-author-20261008-v1"


def read(path):
    return json.loads(path.read_text())


def binding(path):
    raw = path.read_bytes()
    return {"path": str(path.relative_to(ROOT)), "sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}


def verify(pin):
    path = ROOT / pin["path"]
    assert path.is_file() and not path.is_symlink(), pin["path"]
    assert binding(path) == pin, pin["path"]
    return path


def put(name, value):
    with (OWN / name).open("x") as stream:
        stream.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


now = datetime.now(timezone.utc).isoformat()
prior_seals = [
    (FIRST / "whole24-science-source-P.independent-a.first.freeze.json", "56c15bf222e85f5ab92a69c5063d9cfd6f3b9aaa461690f611623dad64b3f58e"),
    (FIRST / "targeted-six-case-followup-v4/completed-six-case-five-profile-science-and-source-only-P5.independent-a.final.freeze.json", "155111e47b1da9b615e26960292793ad5dda968fb1baee2d04cfdc6b4559fb48"),
    (FIRST / "targeted-P17-two-field-followup-v5/P17-two-field-only-independent-a.first-final.freeze.json", "6a3b624617528d54460314dd0a6fa370cc1e1c0e70edec97de903a2371386b29"),
]
required = set()
for path, expected_sha in prior_seals:
    assert binding(path)["sha256"] == expected_sha
    required.add(path)
    for pin in read(path)["ownFiles"]:
        required.add(verify(pin))
proposals_path = AUTHOR / "source/whole24.actual-primary-components-source-kind-operator-atom.author-proposals.json"
duties_path = AUTHOR / "source/whole24-all-current-regional-source-duties-all-1n-partners.lossless.json"
canonical_path = AUTHOR / "rebase-current/canonical.current476.exact.json"
cases_path = FIRST.parent / "biologie-he-metabolism-ecology-six-case-targeted-remediation-author-root-20261008-v4/whole48.six-targeted-case-only.remediation.author.json"
required |= {proposals_path, duties_path, canonical_path, cases_path}
proposals = read(proposals_path)["whole24Proposals"]
duties = read(duties_path)
canonical = read(canonical_path)
goals = {goal["id"]: goal for goal in canonical["goals"]}
cases = read(cases_path)["cases"]
assert len(canonical["goals"]) == 476 and len(cases) == 48
ordinals = [11, 12, 13, 14, 17, 18, 19, 24]
selected = [proposal for proposal in proposals if proposal["ordinal"] in ordinals]
assert len(selected) == 8
contributions = {
    11: {
        "boundedContribution": "Given material on within-organism accumulation and increasing trophic concentrations can support ecological cause-effect analysis used for ecosystem management. Endocrine receptor effects are a different claim and are not established merely by trophic concentration.",
        "actualOperatorContentAnchor": "HE Q4.1 p47 lines42-44: cause-effect relationships in ecosystem management and assessment of conservation measures. Hormone-like environmental substances atline48 are contextual, not an interchangeable whole pollutant duty.",
        "proposedRoleForNextReview": "Authored operationalization of an ecological causal-analysis contribution; no named compulsory bioaccumulation/biomagnification competency asserted.",
        "currentBoundary": "Legacy officialCompetency/Q3.1.5/exact is not an original quote. Whole hormonal-substance or whole ecosystem-management coverage cannot be inferred from this one contribution.",
    },
    12: {
        "boundedContribution": "Repeated random patch simulations can estimate intervention effects and uncertainty; the supplied corridor/risk comparison is a concrete ecological-model method.",
        "actualOperatorContentAnchor": "HE Q4 p47 lines21-24: ecological models aid decisions and estimation/judgment/assessment of effects of human intervention. Existing proposed Q3.1 p45 lines15-17 names idealized exponential/logistic growth and does not itself name stochastic patch models.",
        "proposedRoleForNextReview": "Investigate an explicit authored operationalization under Q4.1 model/management context; retain Q3.1 exponential/logistic growth as a separate original obligation.",
        "currentBoundary": "HOLD_CURRENT_P45_ONLY_ANCHOR. A stochastic occupancy example cannot substitute for the explicitly named exponential and logistic growth models. No corrected whole source-kind/locator input has yet been sealed.",
    },
    13: {
        "boundedContribution": "Comparing reproductive isolation/gene exchange, appearance and lineage evidence can clarify why the population-genetic species concept differs from appearance alone, including limitations for asexual organisms and fossils.",
        "actualOperatorContentAnchor": "HE Q2.1 p42 lines23-25 names population-genetic species concept, isolation, relatedness, variation and speciation.",
        "proposedRoleForNextReview": "Authored comparative operationalization supporting the population-genetic species concept, with the morphological/phylogenetic comparison identified as authored method.",
        "currentBoundary": "Do not claim a literal mandatory trio of species concepts or old Q3.3.5 numbering. Biological reproductive isolation supports, but is not a blanket synonym for every population-genetic species formulation.",
    },
    14: {
        "boundedContribution": "Interpreting supplied reproductive-success curves and explicit relative-fitness/selection-coefficient conventions provides assessable application of named selection and reproductive fitness principles.",
        "actualOperatorContentAnchor": "HE Q2.1 p42 lines23-25 names selection and fitness; lines29-31 names adaptive value/reproductive fitness and cost-benefit analysis.",
        "proposedRoleForNextReview": "Authored quantitative operationalization of selection/fitness; particular fitted curves and s conventions are supplied model choices.",
        "currentBoundary": "No standalone official quantified-fitness-curve requirement, literal Q3.3.6 or general intrinsic fitness ranking across environments is proved.",
    },
    17: {
        "boundedContribution": "Local demography, source/sink exchange and recolonization supply a concrete causal model for reasoning about habitat connection or isolation. They distinguish redistribution from demographic surplus.",
        "actualOperatorContentAnchor": "HE Q4 p47 lines21-24 ecological model decision aids and Q4.1 lines42-44 cause-effect/management. Q3.1 p45 exponential/logistic development is background and stays a distinct duty.",
        "proposedRoleForNextReview": "Authored habitat-intervention model contribution under Q4.1; no named mandatory source/sink or metapopulation theory asserted.",
        "currentBoundary": "The legacy Q4.2.4 exact/officalCompetency statement is not an original literal duty. This model alone does not cover all conservation evaluation or the named exponential/logistic models.",
    },
    18: {
        "boundedContribution": "A supplied threshold/hysteresis model can explain why simply reversing an input may not restore an ecosystem and can support comparing restoration or prevention strategies.",
        "actualOperatorContentAnchor": "HE Q4 p47 lines21-24 effects of interventions estimated/judged/evaluated; Q4.1 lines42-44 cause-effect, preservation/restoration and conservation assessment.",
        "proposedRoleForNextReview": "Authored threshold-model operationalization for management reasoning, not a newly named compulsory tipping-point theory.",
        "currentBoundary": "Threshold values and hysteresis are explicit synthetic model assumptions, not an empirical proof or literal mandatory Q4.2.5. Whole original management competency is not approved by one modeled example.",
    },
    19: {
        "boundedContribution": "Applying supplied quantitative population models with separate validation, units, range and causality limits contributes to the use of ecological models for estimating effects. Population-data application is the selected alternative; it does not claim every climate-data task was covered.",
        "actualOperatorContentAnchor": "HE Q4 p47 lines15-24 interdisciplinary ecological understanding and ecological-model decision aids.",
        "proposedRoleForNextReview": "Authored data/model-application contribution; bioinformatics is an authored implementation/method label and not a named compulsory original topic.",
        "currentBoundary": "A checked fit is not a causal ecological explanation or the whole management assessment. No original Q4.2.6 bioinformatics mandate or performed quantitative field survey follows.",
    },
    24: {
        "boundedContribution": "Separating resistance and recovery under stated disturbances, then deriving management options, offers a concrete cause-effect/conservation reasoning model with biodiversity functions and bounded uncertainty.",
        "actualOperatorContentAnchor": "HE Q4 p47 lines21-24 model-supported intervention assessment; Q4.1 lines42-44 preservation, restoration, biodiversity and conservation measures.",
        "proposedRoleForNextReview": "Authored resilience operationalization supporting conservation/management choices; the specific resilience vocabulary is an authored concept model.",
        "currentBoundary": "Do not claim a literal standalone mandatory resilience concept or old Q4.2.8. The contributions remain bounded and do not stand for all original sustainability dimensions.",
    },
}
records = []
for proposal in selected:
    goal_id = proposal["goalId"]
    assert goals[goal_id] == proposal["wholeCurrentGoal"]
    edges = [edge for edge in duties["matchedEdgesData"] if edge["mappedTargetGoalId"] == goal_id]
    source_keys = {edge["sourceKey"] for edge in edges}
    source_rows = [row for row in duties["sourceGoals"] if row["sourceKey"] in source_keys]
    assert len(edges) == len(source_rows) == 1
    assert source_rows[0]["wholeRetainedExtractionGoal"]["id"] == proposal["sourceGoalId"]
    assert source_rows[0]["allPartnerRows"] == proposal["allExactCurrentHEPartnerRows"]
    assert len(source_rows[0]["allPartnerRows"]) == 1
    partner_ids = {partner["canonicalGoalId"] for partner in source_rows[0]["allPartnerRows"]}
    assert partner_ids == set(source_rows[0]["wholeCurrentDecision"]["canonicalGoalIds"]) == {goal_id}
    case_pair = [case for case in cases if case["goalId"] == goal_id]
    assert len(case_pair) == 2
    records.append({
        "ordinal": proposal["ordinal"], "goalId": goal_id, "sourceGoalId": proposal["sourceGoalId"],
        "wholeUnchangedCurrentGoal": goals[goal_id],
        "exactWholeSourceDutyAndAllPartnerRows": source_rows,
        "exactWholeMatchingEdges": edges,
        "allWholePartnerGoalBodies": [goals[partner_id] for partner_id in sorted(partner_ids)],
        "retainedActualPrimaryComponentsAlreadyPersonallyRead": proposal["actualPrimaryComponents"],
        "existingAuthorSourceKindProposal": proposal["proposedSourceKind"],
        "priorFullScientificCaseReviewRetainedFromOwnFirstAndV4V5": [case["caseId"] for case in case_pair],
        "currentSourceRoleStatus": "PENDING_CORRECTED_BOUNDED_ROLE_INPUT_AND_GENUINE_PAIR",
        "currentWholeSourceApproval": False,
        "boundedContributionPlanNotFinalApproval": contributions[proposal["ordinal"]],
        "namedMandatoryWholeGoalClaim": False,
        "allOtherOriginalOperatorObligationsRetained": True,
        "noOtherRegionalOrPlacementScopeApprovedFromHE": True,
        "wholeCurrentDenominatorOrApplicabilityChanged": False,
    })
whole_pages = []
for page in [42, 45, 47]:
    path = AUTHOR / f"primary/current-HE-physical-page-{page:03}.whole-official.txt"
    required.add(path)
    whole_pages.append({
        "physicalPage": page, "printedPage": page, "wholePortableOriginalText": binding(path),
        "wholeOriginalPagePersonallyReadForTargetedRoleBoundaries": True,
    })
receipt = {
    "schemaVersion": 1, "readAt": now,
    "role": "Actual targeted original-page/source-partner reading, not an eight-goal final source approval",
    "primaryUrl": "https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf",
    "actualCachedOfficialPdfSha256PreviouslyRead": "52c278d6f5a7383361631d5251550c42222f13e1bbe2aa16d39ca3b12c5e1558",
    "pdfWorkingCacheIsProvenanceNotRequiredCommitDependency": True,
    "wholeOriginalPages": whole_pages,
    "wholeSourceDutiesInspected": 8, "allPartnerRowsActuallyBound": 8,
    "allWholePartnerBodiesInspected": 8, "other285PartnerRowsNotNewlyReviewedOrApproved": True,
    "currentSourceRowsRemainLegacyNormalizedNotLiteralPrimary": True,
    "currentPeerBRead": False, "activeWrites": 0, "strictGainClaimed": 0,
    "humanApproval": False, "humanTrial": False,
}
put("eight-source-original-spans-and-whole-partners.actual-independent-a.reading.receipt.json", receipt)
status = {
    "schemaVersion": 1, "createdAt": now,
    "reviewer": "Independent A, neither source/case nor raster author; peerB24 remains unread",
    "checkpointReason": "User requested a commit-ready checkpoint while bounded role adjudication was underway. No final corrected operative source-role input and no genuine pair are present here; preserve truthful PENDING rather than convert contributions into whole approval.",
    "preservedCompletedOwnSeals": [binding(path) for path, _ in prior_seals],
    "eightWholeRoleInputsAndConcretePendingPlans": records,
    "all8CurrentSourceRoleDecisionsPending": True,
    "source12ExistingP45OnlyAnchorHOLD": True,
    "whole24OriginalSource1_2_3AndCompound8_16HoldsRetained": True,
    "casesProfilesGoalBodiesOrCurrentWholeDenominatorChanged": False,
    "nativeD_VAndFinalRasterP": "PENDING_NOT_CLAIMED",
    "sourceScienceClosuresClaimed": 0, "bindingRestorationsClaimed": 0,
    "currentPeerBRead": False, "activeWrites": 0, "strictGainClaimed": 0,
    "humanApproval": False, "humanTrial": False,
}
put("eight-source-bounded-contribution-plans-with-truthful-HOLD-PENDING.independent-a.checkpoint.json", status)
required.add(Path(__file__).resolve())
required |= {path for path in OWN.iterdir() if path.is_file()}
required_paths = sorted(required)
ignore = subprocess.run(["git", "check-ignore", "--no-index", *[str(path.relative_to(ROOT)) for path in required_paths]], cwd=ROOT, capture_output=True, text=True)
assert ignore.returncode == 1 and not ignore.stdout.strip()
parsed_json = parsed_jsonl = 0
for path in required_paths:
    assert path.is_file() and not path.is_symlink()
    if path.suffix == ".json":
        read(path)
        parsed_json += 1
    elif path.suffix == ".jsonl":
        for line in path.read_text().splitlines():
            if line.strip():
                json.loads(line)
        parsed_jsonl += 1
guard = {
    "schemaVersion": 1, "checkedAt": now,
    "requiredCommittedInputBindings": [binding(path) for path in required_paths],
    "actualRequiredFileCount": len(required_paths),
    "preservedOriginalV4V5AllSealedFileBindingsChecked": True,
    "whole476CanonicalAndSelected8BodiesExact": True,
    "exact8SourceDuties8Edges8CompletePartnerRows": True,
    "actualJSONParsed": parsed_json, "actualJSONLParsed": parsed_jsonl,
    "gitCheckIgnoreActual": {"exitCode": ignore.returncode, "ignoredRequiredInputs": 0, "stdout": ignore.stdout, "stderr": ignore.stderr},
    "brokenOrExternalRequiredSymlinks": 0,
    "existingP5V4NativeActualCLIExit0RetainedAsHistoricalSourceOnlyCheck": True,
    "newD_VOrFinalRasterPRunsClaimed": False,
    "fullRepositorySchemaCIOrBuildNotRunByThisFocusedSourceRoleAgent": True,
    "activeWrites": 0, "strictGainClaimed": 0,
}
put("eight-source-commit-checkpoint-focused-actual-input-and-portability.check.json", guard)
entry = {
    "schemaVersion": 1, "createdAt": now,
    "kind": "Neutral portable independent A source8 in-flight commit checkpoint, truthful incomplete-role status",
    "sourceRoleCheckpoint": binding(OWN / "eight-source-bounded-contribution-plans-with-truthful-HOLD-PENDING.independent-a.checkpoint.json"),
    "actualOriginalReadingReceipt": binding(OWN / "eight-source-original-spans-and-whole-partners.actual-independent-a.reading.receipt.json"),
    "actualFocusedChecks": binding(OWN / "eight-source-commit-checkpoint-focused-actual-input-and-portability.check.json"),
    "completedPriorOwnSealsUnchanged": [binding(path) for path, _ in prior_seals],
    "checkpointFreezePath": str((OWN / "eight-source-roles-commit-checkpoint.independent-a.immutable.freeze.json").relative_to(ROOT)),
    "remainingSource8Decisions": "All8 PENDING. Source12 oldp45-only model anchor is HOLD; an explicitp47 ecological-model/management anchor is a candidate for later exact author input and independent review. Existing source1/2/3, compound8/16 and finalnativeD/V remain open.",
    "nextAuthorizedWorkAfterUserResumes": "Author bounded operative source-kind/locator statements per supplied individual contribution plan, then genuinely review exact new input and whole partner roles. No named new curriculum mandate or broad whole/source closure may be inferred from the plans.",
    "currentPeerBRead": False, "activeWrites": 0, "strictGainClaimed": 0,
    "humanApproval": False, "humanTrial": False,
}
put("neutral-eight-source-roles-in-flight-commit-checkpoint.independent-a.entry.json", entry)
seal = {
    "schemaVersion": 1, "sealedAt": now,
    "kind": "Immutable truthful independent A source8 in-flight checkpoint, no fabricated final approval",
    "ownFiles": [binding(path) for path in sorted(OWN.iterdir()) if path.is_file()],
    "completedOriginalV4V5SealsPreserved": [binding(path) for path, _ in prior_seals],
    "requiredInputClosure": binding(OWN / "eight-source-commit-checkpoint-focused-actual-input-and-portability.check.json"),
    "sourceRolesApproved": 0, "sourceRolesPending": 8,
    "currentPeerBRead": False, "activeWrites": 0, "strictGainClaimed": 0,
    "humanApproval": False, "humanTrial": False,
}
put("eight-source-roles-commit-checkpoint.independent-a.immutable.freeze.json", seal)
print(json.dumps({
    "source8Approved": 0, "source8Pending": 8, "source12P45OnlyHold": True,
    "wholeCurrentSourceDuties": 8, "allWholePartnerRows": 8,
    "actualRequiredFiles": len(required_paths), "ignoredOrBrokenInputs": 0,
    "priorOriginalV4V5AllSealedFilesExact": True,
    "finalSeal": binding(OWN / "eight-source-roles-commit-checkpoint.independent-a.immutable.freeze.json"),
    "neutralEntry": binding(OWN / "neutral-eight-source-roles-in-flight-commit-checkpoint.independent-a.entry.json"),
}, ensure_ascii=False))
