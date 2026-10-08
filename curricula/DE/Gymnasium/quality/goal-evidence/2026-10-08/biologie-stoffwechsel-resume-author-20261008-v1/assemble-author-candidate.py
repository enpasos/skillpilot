"""Author continuation only: retain reviewed science, correct bounded HE source roles.

No live curriculum, registry, ledger, review verdict or image approval is written.
"""
import copy
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path.cwd()
OUT = Path(__file__).resolve().parent
BASE = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08"
OLD = BASE / "biologie-he-metabolism-ecology-twenty-four-whole-science-author-20261008-v1"
V4 = BASE / "biologie-he-metabolism-ecology-six-case-targeted-remediation-author-root-20261008-v4"
V5 = BASE / "biologie-he-metabolism-ecology-one-profile-two-field-followup-author-root-20261008-v5"
A = BASE / "biologie-he-metabolism-ecology-twenty-four-whole-science-independent-a-20261008-v1"
B = BASE / "biologie-he-metabolism-ecology-twenty-four-whole-science-independent-b-20261008-v1"
CANON = ROOT / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json"
EXTRACTION = BASE / "biologie-he-evolution-eighteen-operative-sources-author-20261008-v2/DE_HE_BIOLOGIE_SEKII_KC2024.evolution18-operative-portable-final-20261008-v2.source-extraction.json"
MAPPING = BASE / "biologie-he-evolution-eighteen-decision-locators-author-root-20261008-v3/hessen_biology_upper_secondary.evolution18-decision-locators.author-20261008-v3.review.json"
STAMP = datetime.datetime.now(datetime.timezone.utc).isoformat()
READY = [4, 5, 6, 7, 9, 10, 15, 20, 21, 22, 23]
SOURCE_FOLLOWUP = [11, 12, 13, 14, 17, 18, 19, 24]
SELECTED = sorted(READY + SOURCE_FOLLOWUP)
HOLD = [1, 2, 3, 8, 16]
inputs = []


def read(path):
    path = Path(path)
    inputs.append(path)
    return json.loads(path.read_text())


def write(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def binding(path):
    path = Path(path)
    raw = path.read_bytes()
    return {"path": str(path.relative_to(ROOT)), "sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}


def component(page, first, last, scope):
    path = OLD / f"primary/current-HE-physical-page-{page:03}.whole-official.txt"
    inputs.append(path)
    raw = path.read_bytes()
    # Keep exact extracted original line bytes, including soft hyphens.
    text = "\n".join(raw.decode().splitlines()[first - 1:last])
    return {
        "recordId": f"HE-current-p{page}-lines{first}-{last}",
        "originalText": text,
        "physicalPage": page,
        "printedPage": page,
        "zeroBasedPdfPage": page - 1,
        "firstTextLine1Based": first,
        "lastTextLine1Based": last,
        "wholeOriginalPagePath": str(path.relative_to(ROOT)),
        "wholeOriginalPageSha256": "sha256:" + hashlib.sha256(raw).hexdigest(),
        "originalTextSha256": "sha256:" + hashlib.sha256(text.encode()).hexdigest(),
        "primaryUrl": "https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf",
        "primaryPdfSha256": "sha256:52c278d6f5a7383361631d5251550c42222f13e1bbe2aa16d39ca3b12c5e1558",
        "officialNumberingClaim": False,
        "normalization": "None; exact retained page lines also verified against newly downloaded current official PDF",
        "actualOriginalCourseScope": scope,
    }


current = read(CANON)
current_by_id = {g["id"]: g for g in current["goals"]}
context = read(OLD / "rebase-current/selected24.current-whole-goals.context.exact.json")
profiles = read(V5 / "P24.v4-exact-except-two-copied-meta-focus-fields.author.candidates.json")
cases = read(V4 / "whole48.six-targeted-case-only.remediation.author.json")
proposals = read(OLD / "source/whole24.actual-primary-components-source-kind-operator-atom.author-proposals.json")
pool = read(OLD / "source/whole24-all-current-regional-source-duties-all-1n-partners.lossless.json")
plans = read(A / "source-eight-roles-commit-checkpoint/eight-source-bounded-contribution-plans-with-truthful-HOLD-PENDING.independent-a.checkpoint.json")
read(A / "targeted-six-case-followup-v4/completed-six-case-five-profile-science-and-source-only-P5.independent-a.exact-handoff.entry.json")
read(A / "targeted-P17-two-field-followup-v5/P17-two-field-only-genuine-scientific-followup.independent-a.first.verdict.json")
read(B / "targeted-one-profile-two-field-followup-v5/two-focus-fields-targeted-scientific-first.verdict.independent-b.json")
source = read(EXTRACTION)
mapping = read(MAPPING)

assert len(source["sourceGoals"]) == 144
assert all(g == current_by_id[g["id"]] for g in context["wholeGoals"])
all_ids = context["goalIds"]
selected_ids = [all_ids[n - 1] for n in SELECTED]
ready_ids = [all_ids[n - 1] for n in READY]
followup_ids = [all_ids[n - 1] for n in SOURCE_FOLLOWUP]
selected_id_set = set(selected_ids)
plan_by_ordinal = {x["ordinal"]: x for x in plans["eightWholeRoleInputsAndConcretePendingPlans"]}
selected_goals = [copy.deepcopy(current_by_id[g]) for g in selected_ids]
write("whole19.current-goals-and-context.author.json", {
    "schemaVersion": 1,
    "role": "Exact current goal bodies, every direct prerequisite/parent/consumer, no new semantic verdict",
    "ordinals": SELECTED,
    "goalIds": selected_ids,
    "wholeGoals": selected_goals,
    "contexts": [copy.deepcopy(x) for x in context["contexts"] if x["goalId"] in selected_id_set],
    "activeWrites": 0,
})
selected_profiles = copy.deepcopy(profiles)
selected_profiles["reviewId"] = "biologie-stoffwechsel19-resume-author-20261008-v1"
selected_profiles["reviewedAt"] = STAMP
selected_profiles["reviewer"] = "codex-biology-resume-author-candidate-not-independent-reviewer"
selected_profiles["goals"] = [copy.deepcopy(x) for x in profiles["goals"] if x["goalId"] in selected_id_set]
write("P19.exact-retained-v5.author.candidates.json", selected_profiles)
selected_cases = copy.deepcopy(cases)
selected_cases["wholeCurrentGoalBodies"] = selected_goals
selected_cases["goalCount"] = 19
selected_cases["caseCount"] = 38
selected_cases["cases"] = [copy.deepcopy(x) for x in cases["cases"] if x["goalId"] in selected_id_set]
selected_cases["role"] = "Exact retained v4 complete DE/EN cases for19; no new case science verdict"
write("whole38.exact-retained-v4.DEEN.author.json", selected_cases)
write("all45-regional-duties-all293-partners.exact-retained.author.json", pool)

# Explicit methods and operator contributions. These are authored proposals,
# neither a new named mandatory topic nor whole original source coverage.
role_specs = {
    11: ("Q4.1", [component(47, 42, 44, "GK_LK")],
         "Causal analysis of supplied organism/trophic concentration data supports an ecological management contribution. Bioaccumulation and biomagnification are the authored analytical method; endocrine receptor activity is a different mechanism and is not claimed here."),
    12: ("Q4.1", [component(47, 21, 24, "GK_LK"), component(47, 42, 44, "GK_LK")],
         "Repeated stochastic patch simulations estimate effects and uncertainty of habitat intervention. Original Q3.1 idealized exponential/logistic growth remains separate; this random-model method cannot substitute for that named original duty."),
    13: ("Q2.1", [component(42, 23, 25, "GK_LK")],
         "Comparative reproductive-isolation, appearance and lineage evidence operationalizes the named population-genetic species concept. Morphological/phylogenetic comparison is an authored contrast method; no literal official trio or equivalence between every species concept is claimed."),
    14: ("Q2.1", [component(42, 23, 25, "GK_LK"), component(42, 29, 31, "GK_LK")],
         "Supplied reproductive-success curves and explicit relative-fitness/selection-coefficient conventions operationalize selection and reproductive fitness. Numeric conventions belong to the task model; no fitted-fitness-curve mandate or context-free intrinsic fitness ranking is claimed."),
    17: ("Q4.1", [component(47, 21, 24, "GK_LK"), component(47, 42, 44, "GK_LK")],
         "Local demography, directional exchange and recolonization form a habitat-intervention model for causal management reasoning. Redistribution is distinguished from demographic surplus. Sources/sinks and metapopulation are authored model choices, not literal compulsory original topics or substitutes for exponential/logistic growth."),
    18: ("Q4.1", [component(47, 21, 24, "GK_LK"), component(47, 42, 44, "GK_LK")],
         "An explicit threshold/hysteresis model explains limits of reversing an intervention and supports prevention/restoration decisions. Thresholds are synthetic assumptions; a model does not establish empirical tipping points or a standalone named compulsory theory."),
    19: ("Q4.1", [component(47, 15, 24, "GK_LK"), component(47, 42, 44, "GK_LK")],
         "Population-data model application with validation, units, domain and causal limits contributes to ecological decision support. Bioinformatics is an authored method label; the population-data alternative does not claim all climate tasks or performed ecological field measurement."),
    24: ("Q4.1", [component(47, 21, 24, "GK_LK"), component(47, 42, 44, "GK_LK")],
         "Disturbance-specific resistance and recovery analysis supports conservation management choices. Resilience vocabulary is an authored concept model, not an independently named compulsory topic or complete coverage of every original sustainability dimension."),
}
new_proposals = []
eight_delta = []
for n in SELECTED:
    old = proposals["whole24Proposals"][n - 1]
    item = copy.deepcopy(old)
    if n in SOURCE_FOLLOWUP:
        topic, spans, reason = role_specs[n]
        item["proposedActualPrimaryTopic"] = topic
        item["actualPrimaryComponents"] = spans
        item["proposedSourceKind"] = "authoredExtensionNotNamedMandatory"
        item["sourceAtomOperatorBoundary"] = reason
        item["authorBoundedContribution"] = reason
        item["originalPendingRole"] = plan_by_ordinal[n]["currentSourceRoleStatus"]
        item["originalSource12P45OnlyAnchorHoldResolvedByAuthorProposalNotApproval"] = n == 12
        item["sourceRoleIndependentFollowup"] = "PENDING_TWO_GENUINE_INDEPENDENT_REVIEWS"
        item["namedMethodMandatory"] = False
        item["wholeSourceObligationCoverage"] = False
        item["wholeCanonicalGoalApproval"] = False
        item["authoredTargetCourseLevel"] = "LK"
        item["actualOriginalCourseScopes"] = sorted({s["actualOriginalCourseScope"] for s in spans})
        item["scopeInterpretation"] = "Original common GK/LK context permits an authored LK deepening; no new LK-only original topic is inferred. Canonical applicability unchanged. HE reading does not approve any BY/NI regional role."
        eight_delta.append({
            "ordinal": n, "goalId": item["goalId"], "sourceGoalId": item["sourceGoalId"],
            "beforeActualPrimaryTopic": old["proposedActualPrimaryTopic"],
            "afterActualPrimaryTopic": item["proposedActualPrimaryTopic"],
            "beforeRecordIds": [s["recordId"] for s in old["actualPrimaryComponents"]],
            "afterRecordIds": [s["recordId"] for s in item["actualPrimaryComponents"]],
            "boundedContribution": reason,
            "legacyExactAndOfficialCompetencyClaimRemovedInCandidate": True,
            "independentDecision": "PENDING_NOT_CLAIMED",
        })
    item["authorDecision"] = "AUTHOR_CANDIDATE_NOT_SOURCE_REVIEW_APPROVAL"
    item["wholeCandidateApproval"] = False
    item["mandatoryNamedWholeGoalClaim"] = False
    new_proposals.append(item)
write("source19.complete-operator-scope-candidates.author.json", {
    "schemaVersion": 1, "role": "Eleven retained bounded roles and eight concrete targeted HE authored-method proposals",
    "goals": new_proposals, "selectedOrdinals": SELECTED,
    "sourceRoleFollowupOrdinals": SOURCE_FOLLOWUP,
    "allOtherOriginalOperatorDutiesAndRegionalPartnersRetained": True,
    "sourceReviewApproval": False, "activeWrites": 0, "strictGainClaimed": 0,
    "humanApproval": False, "humanTrial": False,
})
write("source-eight-concrete-locator-role-delta.author.json", {
    "schemaVersion": 1, "role": "Substantive bounded source/operator correction; not a hash refresh",
    "changes": eight_delta, "reviewersRequired": 2, "currentCanonicalGoalBodiesChanged": 0,
    "allOriginalQ3_1NamedGrowthAndPracticalDutiesRetained": True,
    "allOriginal24HoldsExceptAuthorProposalForEightRolesRetained": True,
    "activeWrites": 0, "strictGainClaimed": 0,
})

# Make fully reviewable operative source/mapping candidates. Existing 144 IDs,
# all other125 source rows/decisions and every partner target stay exact.
source_candidate = copy.deepcopy(source)
mapping_candidate = copy.deepcopy(mapping)
source_candidate["extractionId"] = "he-biology-stoffwechsel19-resume-author-20261008-v1"
source_candidate["authorContinuationStatus"] = "author_candidate_pending_targeted_independent_reviews"
mapping_candidate["reviewId"] = "he-biology-stoffwechsel19-resume-author-20261008-v1"
mapping_candidate["status"] = "author_candidate_pending_targeted_independent_reviews"
source_output = OUT / "HE-source144.source19-operative.author-candidate.json"
mapping_candidate["sourceExtractionPath"] = str(source_output.relative_to(ROOT))
by_source_id = {s["id"]: s for s in source_candidate["sourceGoals"]}
decision_by_source = {d["sourceGoalId"]: d for d in mapping_candidate["decisions"]}
selected_source_ids = {x["sourceGoalId"] for x in new_proposals}
for passage in source_candidate["passages"]:
    if "sourceGoalIds" in passage:
        passage["sourceGoalIds"] = [g for g in passage["sourceGoalIds"] if g not in selected_source_ids]
for item in new_proposals:
    sid = item["sourceGoalId"]
    old_row = by_source_id[sid]
    spans = item["actualPrimaryComponents"]
    first = spans[0]
    topic = item["proposedActualPrimaryTopic"]
    original_text = "\n\n".join(c["originalText"] for c in spans)
    span_text = "; ".join(f"physical/printed p{s['physicalPage']} lines{s['firstTextLine1Based']}-{s['lastTextLine1Based']}" for s in spans)
    pid = f"he-bio-sekii:stoffwechsel19-author:{sid}"
    row = copy.deepcopy(old_row)
    row.pop("bulletIndex", None)
    row.pop("aspectIndex", None)
    row.update({
        "passageId": pid, "topicCode": topic,
        "sourceText": row["description"],
        "sourceSpan": f"HE current {span_text}; {topic}; authored bounded contribution, no official numbering",
        "parentBulletText": original_text,
        "rawSourceText": original_text,
        "rawSourceSpan": f"HE actual {span_text}",
        "rawParentBulletText": original_text,
        "sourceRef": f"Hessen KC Biologie Ausgabe2024, Stand01.08.2025; {topic}; {span_text}. {item['sourceAtomOperatorBoundary']}",
        "sourceDocumentKey": "KC2024_BIOLOGIE_SEKII_STAND_20250801",
        "granularity": "authored-model-operationalization" if item["ordinal"] in SOURCE_FOLLOWUP else "boundedOriginalCompetencyAspect",
        "sourceKind": item["proposedSourceKind"],
        "authoredComponent": True, "isOfficialBullet": False, "officialNumberingClaim": False,
        "courseLevel": item["authoredTargetCourseLevel"],
        "stage": "SekII", "sourcePage": first["zeroBasedPdfPage"], "sourceLine": first["firstTextLine1Based"] - 1,
        "tags": ["jurisdiction:DE-HE", "stage:SekII", f"courseLevel:{item['authoredTargetCourseLevel']}", f"topic:{topic}", f"phase:{topic.split('.')[0]}"],
        "actualPrimaryComponents": spans, "actualOriginalRecordIds": [s["recordId"] for s in spans],
        "originalCommonScopeIsNotCanonicalLKOnlySourceMandate": item["ordinal"] in SOURCE_FOLLOWUP,
        "wholeOriginalBulletCoverage": False, "wholeCurrentCanonicalCoverage": False,
        "wholeCandidateApproval": False,
    })
    old_row.clear()
    old_row.update(row)
    source_candidate["passages"].append({
        "id": pid, "topicCode": topic, "title": row["title"],
        "text": original_text, "rawText": original_text,
        "sourceUrl": first["primaryUrl"], "sourceGoalIds": [sid],
        "actualPrimaryComponents": spans, "authoredOperationalization": True,
        "wholeOriginalSourceCoverage": False,
    })
    decision = decision_by_source[sid]
    decision.update({
        "topicCode": topic, "sourceSpan": row["sourceSpan"], "matchType": "partial",
        "rationale": "Authored bounded contribution rather than an exact standalone official competency. " + item["sourceAtomOperatorBoundary"] + " All other original operators and regional/partner duties retained. Pending genuine independent source review; no whole source or goal approval.",
        "reviewedAt": STAMP, "reviewer": "codex-biology-resume-author-candidate-not-independent-reviewer",
        "sourceKind": item["proposedSourceKind"], "wholeOriginalSourceCoverage": False,
        "wholeCanonicalGoalApproval": False, "authorCandidate": True,
    })
    for partner in mapping_candidate["mappings"]:
        if partner.get("legacyGoalId") == sid:
            partner["matchType"] = "partial"
source_candidate.setdefault("qualityReview", {})["stoffwechsel19AuthorContinuation"] = {
    "authority": "author_candidate", "selectedSourceGoalIds": sorted(selected_source_ids),
    "unrelated125SourceRowsRetainedExact": True,
    "whole144Release": False, "previousNeuroGK2HoldRetained": True,
    "independentSourceRoleReviews": "pending", "humanApproval": False,
}
mapping_candidate["authorStoffwechsel19Continuation"] = {
    "reviewAuthority": "author_candidate", "selectedSourceGoalIds": sorted(selected_source_ids),
    "partnerTargetsAndAll144IDsRetained": True, "whole144ReviewClaim": False,
    "wholeOriginalObligationCoverage": False, "sourceRoleReviewsPending": True,
}
write(source_output.name, source_candidate)
write("HE-mapping144.source19-operative.author-candidate.review.json", mapping_candidate)

# Keep a minimal explicit English correction separate from all retained cases,
# profiles and contexts. Its adoption needs affected current D/P/page bindings.
english = read(OLD / "whole24.keep-originals-and-one-English-wording-proposal.author.json")
write("tracer-English-one-field-unapplied.author-proposal.json", {
    "schemaVersion": 1, "patches": english["patches"],
    "applied": False, "goalBodyCaseOrProfileChanged": False,
    "requiresTargetedDescriptionAndPageContextBindingReviewIfAdopted": True,
})

old_by_id = {s["id"]: s for s in source["sourceGoals"]}
new_by_id = {s["id"]: s for s in source_candidate["sourceGoals"]}
old_decisions = {s["sourceGoalId"]: s for s in mapping["decisions"]}
new_decisions = {s["sourceGoalId"]: s for s in mapping_candidate["decisions"]}
unchanged = set(old_by_id) - selected_source_ids
assert set(old_by_id) == set(new_by_id) and len(unchanged) == 125
assert all(old_by_id[s] == new_by_id[s] for s in unchanged)
assert all(old_decisions[s] == new_decisions[s] for s in unchanged)
assert [(x.get("legacyGoalId"), x.get("canonicalGoalId"), x.get("reviewDecisionId")) for x in mapping["mappings"]] == [(x.get("legacyGoalId"), x.get("canonicalGoalId"), x.get("reviewDecisionId")) for x in mapping_candidate["mappings"]]
assert all(c["wholeCurrentGoal"] == current_by_id[c["goalId"]] for c in selected_cases["cases"])
assert all(sum(c["points"] for c in x["scoring"]["criteria"]) == 10 for x in selected_cases["cases"])
assert len(selected_profiles["goals"]) == 19 and len(selected_cases["cases"]) == 38
assert len(pool["sourceGoals"]) == 45 and pool["allPartnerRows"] == 293
write("author-delta-and-retention.actual.json", {
    "schemaVersion": 1, "createdAt": STAMP,
    "actualCurrentGoalBodiesExact": 24, "selectedGoalBodiesExact": 19,
    "retainedV5WholeProfileBodiesExact": 19, "retainedV4WholeDEENCasesExact": 38,
    "maximumPointSums": "38/38 exactly10", "all144SourceIDsRetained": True,
    "unrelatedSourceRowsAndDecisionsExact": 125, "allPartnerTargetTriplesExact": True,
    "all45OriginalRegionalDutiesAnd293PartnerRowsRetainedExact": True,
    "elevenPriorScienceAndBoundedSourceReadyOrdinals": READY,
    "eightConcreteSourceFollowupOrdinals": SOURCE_FOLLOWUP,
    "fiveHeldOrdinalsUnchangedAndExcluded": HOLD,
    "currentCanonicalWrites": 0, "registryWrites": 0, "ledgerWrites": 0,
    "newIndependentReviews": 0, "actualImageReviewClaims": 0,
    "newStrictClosures": 0, "bindingRestorations": 0,
    "humanApproval": False, "humanTrial": False,
})
write("current-official-PDF-targeted-original-spans.actual.json", {
    "schemaVersion": 1, "verifiedAt": STAMP,
    "primaryUrl": "https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf",
    "actualCurrentDownloadedPdfBytes": 505276,
    "actualCurrentDownloadedPdfSha256": "52c278d6f5a7383361631d5251550c42222f13e1bbe2aa16d39ca3b12c5e1558",
    "version": "Ausgabe2024, Stand01.08.2025",
    "freshPdftotextLayoutPageChecks": [
        {"physicalPage": n, "actualExitCode": 0, "exactRetainedWholePageMatch": True,
         "sha256": hashlib.sha256((OLD / f"primary/current-HE-physical-page-{n:03}.whole-official.txt").read_bytes()).hexdigest()}
        for n in [42, 45, 46, 47]
    ],
    "PDFWorkingCopyLocalOnly": True, "PDFRequiredPortableInput": False,
    "officialUrlsAndStructuredOriginalSpansAreDurableAuthority": True,
    "notHumanSourceApproval": True,
})
write("neutral-author-continuation.entry.json", {
    "schemaVersion": 1, "createdAt": STAMP,
    "role": "AUTHOR continuation: eleven already source/science-clear bodies plus eight substantively corrected bounded HE source roles",
    "goalIds": selected_ids, "ordinals": SELECTED,
    "eligibleRetainedScienceSourceSubsetGoalIds": ready_ids,
    "sourceRoleFollowupGoalIds": followup_ids,
    "wholeCurrentGoalBodies": str((OUT / "whole19.current-goals-and-context.author.json").relative_to(ROOT)),
    "wholeCases": str((OUT / "whole38.exact-retained-v4.DEEN.author.json").relative_to(ROOT)),
    "wholeProfiles": str((OUT / "P19.exact-retained-v5.author.candidates.json").relative_to(ROOT)),
    "sourceRoleCandidates": str((OUT / "source19.complete-operator-scope-candidates.author.json").relative_to(ROOT)),
    "operativeFull144SourceCandidate": str(source_output.relative_to(ROOT)),
    "operativeFull144MappingCandidate": str((OUT / "HE-mapping144.source19-operative.author-candidate.review.json").relative_to(ROOT)),
    "allRegionalDutiesAndPartners": str((OUT / "all45-regional-duties-all293-partners.exact-retained.author.json").relative_to(ROOT)),
    "reviewInstructions": "Retain valid whole scientific reviews and resolved v4/v5 findings; do not restart unchanged cases. Independently review actual new HE row/passage/decision source roles, eight changed operator/locator contributions and their exact original full context, including P12/P17 Q4.1 model-management anchors. Check all regional/BY/NI partner scope duties; HE alone is not BY approval. Eleven previous source/science-ready goals still need exact new operative source binding acceptance. Judge each targeted source-kind/partial-coverage claim without inventing named mandatory topics or whole original coverage. Actual native D/P pages and image V are a later separate review after the truly clear subset. Retain five excluded current-goal holds, legacy NeuroGK2, full144 boundaries and both protected M7 floors. The English proposal is inactive and needs targeted D/P context review if adopted.",
    "scientificCaseChanges": 0, "profileBodyChanges": 0,
    "sourceRoleIndependentReviewsPending": 2,
    "nativeDAndFinalRasterPAndV": "PENDING_NOT_CLAIMED",
    "semanticMemoryDecisions": "Existing exact classification/no_memory_needed retained; no new native or scientific approval claim",
    "activeWrites": 0, "newStrictClosures": 0, "bindingRestorations": 0,
    "humanApproval": False, "humanTrial": False,
})
all_inputs = sorted(set(inputs))
outputs = sorted(p for p in OUT.glob("*.json") if p.name != "author-first-input-output.freeze.json")
write("author-first-input-output.freeze.json", {
    "schemaVersion": 1, "createdAt": STAMP,
    "role": "Author input/output seal only, not independent review or scientific approval",
    "inputs": [binding(p) for p in all_inputs],
    "outputs": [binding(p) for p in outputs],
    "activeWrites": 0, "newStrictClosures": 0,
    "humanApproval": False, "humanTrial": False,
})
print(json.dumps({"selected": 19, "readyFromPriorPair": 11, "sourceRoleFollowupPending": 8, "retainedCases": 38, "retainedProfiles": 19, "sourceIds": 144, "unrelatedRowsExact": 125, "activeWrites": 0, "strictGain": 0}))
