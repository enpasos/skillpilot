#!/usr/bin/env python3
"""Record this reviewer's actual source reading and first source-only decisions.

This is a receipt writer, not a review engine or a campaign substitute. The
source judgments below were made after original-page and whole-partner reads.
"""
import collections
import datetime
import hashlib
import json
import pathlib
import subprocess

BASE = pathlib.Path("curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08")
AUTHOR = BASE / "biologie-stoffwechsel-first-three-regional-source-remediation-author-20261008-v1"
OWN = BASE / "biologie-stoffwechsel-first-three-regional-source-independent-a-20261008-v1"


def read(path):
    return json.loads(pathlib.Path(path).read_text())


def ref(path):
    path = pathlib.Path(path)
    data = path.read_bytes()
    return {"path": str(path), "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}


def objsha(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def write(name, value):
    path = OWN / name
    if path.exists():
        raise RuntimeError("Preserve first record: " + str(path))
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    return ref(path)


now = datetime.datetime.now(datetime.timezone.utc).isoformat()
input_freeze_path = OWN / "three-regional-source.independent-a.first-input.freeze.json"
input_freeze = read(input_freeze_path)
for original in input_freeze["files"]:
    assert ref(original["path"])["sha256"] == original["sha256"], original["path"]

candidate_path = AUTHOR / "source/three-targets-twenty-whole-source-duties-twenty-five-bounded-roles.author-candidate.json"
candidate = read(candidate_path)
original_path = AUTHOR / "input/selected20-whole-duties-all268-partner-rows.exact.json"
original = read(original_path)
old = {row["sourceKey"]: row for row in original["wholeSourceDuties"]}
partner_path = AUTHOR / "input/all268-whole-current-partner-bodies.exact.json"
partners = read(partner_path)["rows"]
canonical_path = pathlib.Path("curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json")
current = {goal["id"]: goal for goal in read(canonical_path)["goals"]}
contexts_path = AUTHOR / "input/whole-current-three-goals-and-contexts.exact.json"
contexts = read(contexts_path)["goals"]
captures = read(AUTHOR / "primary/actual-targeted-whole-source-page-capture.author.receipt.json")["captures"]
residuals_path = AUTHOR / "source/four-specific-original-operator-duties.still-open.author.json"
residuals = read(residuals_path)["residuals"]
assert len(candidate["rows"]) == 20 and len(partners) == 268 and len(residuals) == 4

# Exact retained bodies/decisions/rows and the 25 actual source-target edges.
for row in candidate["rows"]:
    retained = old[row["sourceKey"]]
    assert row["wholeRetainedOriginalSourceDuty"] == retained
    assert row["wholeCurrentMappingDecisionUnchanged"] == retained["wholeCurrentDecision"]
    assert [x["wholeMappingPartnerRow"] for x in row["allWholePartnerRowsForThisDuty"]] == retained["allPartnerRows"]
    for locator in row["originalPrimaryLocators"]:
        if "wholeOfficialPage" in locator:
            lines = pathlib.Path(locator["wholeOfficialPage"]["path"]).read_text().splitlines()
            assert "\n".join(lines[locator["lineStart"] - 1:locator["lineEnd"]]) == locator["actualOriginalText"]
roles = {(row["sourceKey"], role["goalId"]) for row in candidate["rows"] for role in row["selectedTargetRoles"]}
assert roles == {(edge["sourceKey"], edge["goalId"]) for edge in original["wholeDirectEdges"]}
assert len(roles) == 25
unique_bodies = {}
source_ordinals = collections.defaultdict(set)
for row in partners:
    goal = row["wholeCurrentCanonicalPartnerBody"]
    assert goal == current[goal["id"]], goal["id"]
    unique_bodies[goal["id"]] = goal
    source_ordinals[goal["id"]].add(row["sourceOrdinal"])
assert len(unique_bodies) == 104
context_resource_differences = {}
for context in contexts:
    assert context["wholeGoal"] == current[context["wholeGoal"]["id"]]
    for kind in ("wholePrerequisiteBodies", "wholeParentBodies", "wholeRequiresConsumers"):
        for goal in context[kind]:
            if goal != current[goal["id"]]:
                changed = sorted(key for key in set(goal) | set(current[goal["id"]])
                                 if goal.get(key) != current[goal["id"]].get(key))
                assert kind == "wholeRequiresConsumers" and changed == ["resourceLinks"], (goal["id"], changed)
                context_resource_differences[goal["id"]] = {
                    "changedFields": changed,
                    "frozenAuthorWholeContextBodySHA256": objsha(goal),
                    "currentWholeContextBodySHA256": objsha(current[goal["id"]]),
                    "currentResourceLinks": current[goal["id"]]["resourceLinks"],
                    "wholeLearningTextScopeAndGraphEdgesUnchanged": True,
                    "protectedSeparateNineteenImageIntegrationNotReopened": True}

page_receipts = []
for capture in captures:
    if "physicalPage" in capture:
        physical = capture["physicalPage"]
        command = ["pdftotext", "-layout", "-f", str(physical), "-l", str(physical), capture["wholeOriginalPDF"]["path"], "-"]
        actual = subprocess.check_output(command)
        assert actual == pathlib.Path(capture["wholeOriginalPage"]["path"]).read_bytes()
        page_receipts.append({"jurisdiction": capture["jurisdiction"], "physicalPage": physical,
                              "wholeOriginalPDF": capture["wholeOriginalPDF"],
                              "authorWholePageCapture": capture["wholeOriginalPage"],
                              "officialURL": capture["officialURL"],
                              "wholeOriginalPagePersonallyRead": True,
                              "independentReextractionCommand": command,
                              "reextractedBytesEqualAuthorCapture": True})
    else:
        page_receipts.append({"jurisdiction": "BY", "actualNativeCourse": capture["actualOfficialCourse"],
                              "officialURL": capture["officialURL"],
                              "authorRawOfficialHTML": capture["rawOfficialHTMLBytes"],
                              "authorReadableWholeOfficialText": capture["completeRetainedReadableText"],
                              "officialCurrentWebSectionsPersonallyRead": ["B13 3.1", "B13 3.3"],
                              "originalEAandGAOperatorsPersonallyCompared": True,
                              "normalizedExtractionTopicIsNotLiteralOfficialSubsection": True})
assert sum("physicalPage" in item for item in page_receipts) == 28

# Original page 23 was also read during the independent NRW whole-field read;
# it is extra context, not a fictitious 29th page in the author's 28-page input.
import fitz
nw_path = pathlib.Path("curricula/DE/Gymnasium/input/NW/lower-secondary/g9_bi_klp_-3413_2019_06_23_0.pdf")
with fitz.open(nw_path) as pdf:
    extra_text = pdf[22].get_text()
extra_page = {"jurisdiction": "NW", "physicalPage": 23, "wholeOriginalPDF": ref(nw_path),
              "personallyReadAsAdditionalWholeFieldContext": True,
              "extractor": "PyMuPDF page.get_text()", "wholeExtractedTextSHA256": hashlib.sha256(extra_text.encode()).hexdigest(),
              "notAddedToAuthorPhysicalPageCount": True}

read_receipt = write("three-regional-source.independent-a.first.primary-reading.receipt.json", {
    "schemaVersion": 1, "recordedAt": now, "role": "Independent SOURCE A actual personal primary reading",
    "authorCompletePDFPages": 28, "currentOfficialBYCoursePages": 2,
    "personallyReadPDFPagesIncludingOneExtraNRWPage": 29,
    "sourcePageReceipts": page_receipts, "additionalWholeFieldContext": extra_page,
    "allTwentyWholeRetainedSourceBodiesRead": True,
    "all268WholePartnerRowsReadInTheirOwnSourceUnions": True,
    "all104UniqueCurrentPartnerFullLearningTextsDEENAndGoalLinksPersonallyRead": True,
    "wholePartnerScientificGatesNewlyApproved": False,
    "reviewReadingScope": "All complete source duties, retained source decisions, native stage/course headers, exact whole partner bodies and every partner's complete DE/EN competency text; targeted judgment of 25 changed source-role statements only.",
    "officialPDFsAndWebContentRetainThirdPartyRights": True,
    "newPeerBJudgmentsReadBeforeFirstSeal": False,
    "historicalOriginalAandBFindingsRead": True,
    "activeWrites": 0, "humanApproval": False, "humanTrial": False})

preservation = write("three-regional-source.independent-a.first.original-and-partner-preservation.actual.json", {
    "schemaVersion": 1, "checkedAt": now, "inputFreeze": ref(input_freeze_path),
    "all104FrozenFileDigestsMatch": True, "originalSourceInput": ref(original_path),
    "allTwentyWholeOriginalSourceDutiesExact": True, "allTwentyWholeSourceDecisionsExact": True,
    "allTwentyCompletePartnerRowListsExact": True, "selectedEdgesExactCount": 25,
    "all268CurrentCanonicalPartnerBodiesExact": True,
    "wholeCurrentThreeGoalBodiesExact": True,
    "allCurrentContextLearningTextsScopeAndGraphEdgesExact": True,
    "wholeContextBodiesIncludingResourcesExact": not context_resource_differences,
    "parallelProtectedNineteenIntegrationContextResourcesOnly": context_resource_differences,
    "currentCanonicalFileAtCheck": ref(canonical_path),
    "uniquePartnerBodies": [{"goalId": gid, "sourceOrdinals": sorted(source_ordinals[gid]),
                             "wholeCanonicalBodySHA256": objsha(goal),
                             "newScienceGateDecision": "NONE; retained partner only"}
                            for gid, goal in unique_bodies.items()],
    "allCandidatePDFLocatorLineRangesExact": True, "all28WholeOfficialPDFPageCaptureBytesIndependentlyReextractedExact": True,
    "newBindings": 0, "droppedBindings": 0, "restoredWithdrawnBindings": 0,
    "activeWrites": 0, "strictGainClaimed": 0,
    "historicalEmbeddedHashesAreHistoryNotCurrentInputGuards": True})

# First independent judgments, stated after the actual primary and partner reads.
reasons = {
    1: "BB physical 29 carries photosynthesis significance, ecosystem matter/energy links, trophic energy and cycles. The full retained seven-partner union includes word-equation, practical prerequisites, significance and cycles. The current Q3 atom contributes its photosynthesis basis only; light reaction, Calvin phases and ATP/NADPH are not made Sek-I requirements.",
    2: "BB physical 30 makes cellular respiration an energy-conversion principle. The three retained partners separate advanced stages, ATP significance and human aerobic/anaerobic comparison. The original page does not itself name those three molecular stages or license the normalized anaerobic wording as a literal original duty. A bounded energy-principle contribution is sound; universal equivalence is absent.",
    3: "BE physical 29 has the same original ecosystem table, independently bound to the BE PDF. Its own complete seven-partner list remains. Photosynthesis significance is the actual contribution; the retained region is not upgraded to the full molecular Q3 explanation.",
    4: "BE physical 30 has its own original source binding for cellular energy conversion. The three exact partners remain intact. The bounded respiration-principle role respects the original page rather than treating normalized aerobic/anaerobic or advanced stages as literal native content.",
    5: "Both current BY13 EA and GA section 3.1 require external-factor/rate explanation and, separately, judging consequences for wild and cultivated plants. The sole actual partner explains reactions/factors. Its unchanged cases do not supply the separate evaluative operator. Rate/factor explanation is a real partial contribution; the concrete consequence duty remains HOLD.",
    6: "Both actual BY13 EA and GA section 3.1 require chromatographic separation of leaf pigments. The two whole partners are theoretical antenna structure/function and light-dependence demonstration; neither names the chromatographic procedure. Pigment absorption is contextual only. EA's separate content names light-harvesting complexes, whereas the GA method competency does not impose the full LK antenna goal. The practical separation duty remains HOLD.",
    7: "Both actual BY13 EA and GA section 3.3 include aerobic glucose degradation, energy equivalents/carrier regeneration and the further comparison with photosynthesis to derive principles. The one whole partner sketches respiration stages. The first portion is a valid partial contribution. Prerequisite photosynthesis knowledge and the existing inhibition cases do not perform the explicit comparison/derivation operator; HOLD remains.",
    8: "HE physical 45 under Q3.2 basic level names abiotic rate factors, light-dependent primary reactions, Calvin fixation/reduction/regeneration and their connection. This supports the entire unchanged current explanatory atom as a bounded GK/LK component. The original table is not headed literal Q3.2.1; that is a normalized ID. Shared Q3.2 leaf/spectra, method and practical obligations are not closed.",
    9: "HE physical 45 explicitly names glycolysis, oxidative decarboxylation, tricarboxylic cycle and respiratory chain with matter/energy balances. The unchanged overview/sketch atom is a valid bounded GK/LK component. The stronger original balance breadth, full Q3.2 union and real practical work are not newly certified; normalized Q3.2.2 remains distinguished from a literal official numbering.",
    10: "HE physical 46 places the light-harvesting-complex principle after the actual elevated-level/LK heading. Explaining antenna structure and function is the current theoretical component, with LK preserved. The method duty and the shared whole photosynthesis scope are not closed, and this does not invent GK applicability. Q3.2.3 is only the normalized extraction identifier.",
    11: "MV physical 21/22 are the actual class-8 duty: assimilation/dissimilation, fermentation/respiration and relations to gas exchange/blood/heart. The full 17-partner union retains these distinct competencies. Basic anabolic meaning and energy-producing respiration are valid limited contributions. No later class-10 or three-stage biochemical content is borrowed into this class-8 binding.",
    12: "NW physical 22 requires a word reaction scheme and photosynthesis significance for plants/animals. The entire IF1 plant/organ/reproduction/germination union of eleven partners is preserved. The current photosynthesis atom carries this limited scheme/meaning contribution, without Calvin or molecular electron-chain equivalence and without completing practical germination or identification work.",
    13: "NW physical 30 explicitly contrasts the basic photosynthesis and respiration energy processes; physical 31 retains historical experiments and field-method obligations. All 21 ecosystem/nature-protection partners remain. The advanced respiration atom supplies a limited conceptual energy-process contribution, not its three-stage whole scope or the original comparison as a newly assessed operator.",
    14: "SH physical 27, printed 25, distinctly labels grades 7-9(10) SE5/6 as photosynthesis/respiration relations, light-to-chemical energy, glucose, carbohydrate degradation and biosphere matter/energy. The 28 partners preserve nutrition, transport, ecosystem and sustainability components. Both target contributions are partial; stronger Sek-II clauses and nonselected SE operators are not imported.",
    15: "SN physical 38, printed 26, really names interaction of light-dependent and light-independent reactions, gross equation, reaction conditions and energy conversion. The candidate correctly preserves that stronger class-9 contribution rather than reducing it to a word scheme. It does not assert full Calvin-phase/electron-chain depth. The same original distinguishes respiration's degradation/energy release and actual CO2/heat measurement experiments; all 18 partners remain without fictitious experimental performance.",
    16: "ST physical 28-31 combines cell structure/nutrition with microbes and alcoholic fermentation. The whole 20-partner union has structural and theoretical microbial/human-glucose partners, but no new performance of the mandatory yeast-temperature experiment. There is no named three-stage respiration demand in this combined 7/8 source. For the selected respiration atom, structural prerequisite context only is accurate; the original practical duty stays HOLD.",
    17: "ST physical 34/35 names respiration as energy for muscle activity with word/gross equations, within the full human-systems duty. The 34 whole partners preserve digestion, circulation, immunity, reproduction and health. The selected contribution is basic cellular energy provision; advanced three molecular stages and compulsory practical work are not newly claimed.",
    18: "ST physical 36/37 describes photosynthesis with environmental factors and simple schemes, word/gross equation, and its prerequisite relation to dissimilation. The 18 partners preserve plant organs, transport, osmotic prerequisites and actual experiments. Factors/process basis and assimilation-dissimilation relation are the two genuine partial contributions; molecular Calvin/three-stage respiration and agricultural/procedural operators remain separate.",
    19: "TH physical 22-24, printed 16-18, is the complete 7/8 human-systems duty. It explicitly contains respiration word/sum equation, oxygen for energy release and nutrition relation. Its 54 full partners retain reproduction, nerves, health, immunity, blood/circulation and real investigations. The normalized description is broader than the chosen excerpt, but the original basis itself is present; no three-stage or whole experimental completion is implied.",
    20: "TH physical 26/27, printed 20/21, names plant photosynthesis location, matter/energy conversion and factors/result interpretation; respiration mitochondria, glucose-to-ATP/heat and gross equation; additional crop/storage consequences and fungi/fermentation. All 20 partners remain. Both target contributions are partial. The actual practical alternative is plant-respiration CO2 or fermentation, not an invented universal AND; culture/storage judgments and procedures remain distinct."
}
rows = []
for row in candidate["rows"]:
    ordinal = row["sourceOrdinal"]
    role_decisions = []
    for author_role in row["selectedTargetRoles"]:
        role_decisions.append({"goalId": author_role["goalId"], "reviewedRole": author_role["role"],
                               "verdict": "KEEP_BOUNDED_CURRENT_TARGET_COMPONENT" if ordinal in (8, 9, 10) else
                                          "KEEP_CONTEXT_ONLY_NO_FULL_OPERATOR_COVERAGE" if ordinal in (6, 16) else
                                          "KEEP_PARTIAL_CURRENT_TARGET_CONTRIBUTION",
                               "fullUnchangedCurrentTargetSupportedByThisSourceAlone": ordinal in (8, 9, 10),
                               "authorRoleBodySHA256": objsha(author_role),
                               "independentlyReviewedNativeStage": row["nativeStage"],
                               "independentlyReviewedNativeCourseScope": row["nativeCourseScope"],
                               "sourceRoleAStatus": "PASS_WITH_EXPLICIT_BOUNDARY",
                               "wholeSourceOperatorCompletenessNewlyApproved": False,
                               "targetBodyExpanded": False})
    rows.append({"sourceOrdinal": ordinal, "sourceKey": row["sourceKey"],
                 "wholeRetainedSourceInputSHA256": objsha(row["wholeRetainedOriginalSourceDuty"]),
                 "wholeOriginalSourceDutyAndDecisionRead": True,
                 "wholePartnerRowCount": len(row["allWholePartnerRowsForThisDuty"]),
                 "allCurrentWholePartnerBodiesPersonallyReadForSourceRoleBoundary": True,
                 "allExistingPartnerScienceGatesReopened": False,
                 "originalPrimaryLocators": [{k: v for k, v in loc.items() if k != "actualOriginalText"}
                                             for loc in row["originalPrimaryLocators"]],
                 "independentRationale": reasons[ordinal], "selectedTargetRoleDecisions": role_decisions,
                 "wholeSourceUnionNewlyApproved": False,
                 "concreteOriginalDutiesStillOpen": [x["status"] for x in residuals if x["sourceOrdinal"] == ordinal],
                 "changedMappingsOrWithdrawnBindingRestorationsApproved": False})

verdicts = write("twenty-source25-role.independent-a.first.verdicts.json", {
    "schemaVersion": 1, "reviewedAt": now, "reviewer": "curricula_live_diagnosis independent SOURCE A",
    "status": "needs_human_review", "reviewAuthority": "ai_candidate", "evidenceLevel": "E1",
    "role": "Genuine first targeted source-role review, not a new Science/P/D/V or human gate",
    "neutralAuthorEntry": ref(AUTHOR / "neutral-three-regional-source-role-remediation.author.corrected-count.entry.json"),
    "inputFreeze": ref(input_freeze_path), "primaryReadingReceipt": read_receipt,
    "exactPreservationCheck": preservation, "sourceCount": 20, "directTargetRoleCount": 25,
    "wholePartnerRowCount": 268, "uniqueWholePartnerGoals": 104, "sourceRows": rows,
    "targetSourceRoleJudgments": [{"ordinal": context["ordinal"], "goalId": context["wholeGoal"]["id"],
                                   "wholeCurrentGoalBodySHA256": objsha(context["wholeGoal"]),
                                   "currentTargetContributionSourceRoleReview": "PASS_WITH_EXPLICIT_BOUNDARIES",
                                   "fullCurrentTargetCarriedByBoundedHEComponent": True,
                                   "allActualRegionalRolesReadAndPreserved": True,
                                   "notAnHEOnlyRegionalReview": True,
                                   "scienceAndPDecision": "KEEP_EXACT_ORIGINAL_GENUINE_DECISIONS_NO_RESTART",
                                   "wholeNativeDOrVDecision": "PENDING_SEPARATE_ACTUAL_CURRENT_CANDIDATE",
                                   "strictMachineClosure": "NOT_CLAIMED", "humanApproval": False}
                                  for context in contexts],
    "originalFindingDisposition": [
        {"originalFindingId": "A24-REGIONAL01-02-SCOPE", "disposition": "RESOLVED_FOR_THESE_25_BOUNDED_TARGET_ROLES_ONLY", "rationale": "All current regional duties and full partners were read. Sek-I partial/context roles, the actual stronger SN coupling contribution, and HE bounded full-target components are explicitly separated. No blanket advanced-stage equivalence or new whole-union closure is claimed."},
        {"originalFindingId": "A24-BY-CHROMATOGRAPHY03", "disposition": "HOLD_ORIGINAL_METHOD_DUTY_RETAINED"},
        {"originalFindingId": "BIO24-B-S01-BY-PLANT-CONSEQUENCES", "disposition": "HOLD_ORIGINAL_JUDGMENT_OPERATOR_RETAINED"},
        {"originalFindingId": "BIO24-B-S02-BY-COMPARISON", "disposition": "HOLD_ORIGINAL_COMPARISON_DERIVATION_OPERATOR_RETAINED"},
        {"originalFindingId": "BIO24-B-S03-BY-CHROMATOGRAPHY", "disposition": "HOLD_ORIGINAL_METHOD_DUTY_RETAINED"},
        {"originalFindingId": "BIO24-B-S41-ST-PRACTICAL-UNION", "disposition": "HOLD_ORIGINAL_PRACTICAL_DUTY_RETAINED"}],
    "independentRetainedOpenDutyJudgments": [
        {"sourceOrdinal": 5, "goalId": candidate["goalIds"][0], "verdict": "HOLD", "duty": "Judge factor-change consequences for wild and cultivated plants", "wholePartnerIds": [candidate["goalIds"][0]], "whyStillOpen": "The sole mapped atom explains factors, not the separate consequence judgment. No assessed companion is added."},
        {"sourceOrdinal": 7, "goalId": candidate["goalIds"][1], "verdict": "HOLD", "duty": "Compare catabolic respiration with anabolic photosynthesis and derive general metabolic principles", "wholePartnerIds": [candidate["goalIds"][1]], "whyStillOpen": "An overview sketch and predecessor knowledge do not perform comparison plus derivation. The unchanged two scientific cases supply no new comparison witness."},
        {"sourceOrdinal": 6, "goalId": candidate["goalIds"][2], "verdict": "HOLD", "duty": "Perform chromatographic separation of leaf pigments and interpret the mixture for absorption", "wholePartnerIds": [candidate["goalIds"][2], "fc89ed54-1a78-55a9-8e54-751d6d46dad6"], "whyStillOpen": "A theoretical antenna and light-dependence demonstration do not perform pigment chromatography."},
        {"sourceOrdinal": 16, "goalId": candidate["goalIds"][1], "verdict": "HOLD", "duty": "Plan, perform and record yeast-fermentation experiments with conditions; temperature effect is compulsory", "wholePartnerIds": [x["wholeMappingPartnerRow"]["canonicalGoalId"] for x in candidate["rows"][15]["allWholePartnerRowsForThisDuty"]], "whyStillOpen": "All twenty current partners are retained. Human glucose comparison and theoretical microbial use do not supply the yeast-temperature procedure; separate practical goal8 work remains open."}],
    "newCandidateSourceRoleBlockingFindings": [], "remainingConcreteWholeOperatorDuties": 4,
    "wholeOriginal293PartnerUniversalUnionApproved": False,
    "compoundOrdinal8And16DecisionsReopenedOrClosed": False,
    "otherNineteenCurrentNativeDecisionsReopened": False,
    "sourceMappingsOrExtractionChanged": False,
    "activeWrites": 0, "strictGainClaimed": 0, "humanApproval": False, "humanTrial": False,
    "newPeerBJudgmentsReadBeforeFirstSeal": False,
    "contentLicense": "CC-BY-4.0 for own review text; original official sources retain third-party rights"})

entry = write("three-regional-source.independent-a.first.verdict.entry.json", {
    "schemaVersion": 1, "role": "Neutral handoff of SOURCE A's own sealed first decisions",
    "goalIds": candidate["goalIds"], "sourceVerdicts": verdicts,
    "inputFreeze": ref(input_freeze_path), "primaryReadingReceipt": read_receipt,
    "exactOriginalAndPartnerCheck": preservation,
    "source20Roles25Partners268": "PASS_BOUNDED_ROLE_STATEMENTS_AND_EXACT_PRESERVATION",
    "openWholeOperatorDuties": 4, "allWholeUnionsApproved": False,
    "nativeDandV": "PENDING_SEPARATE_CURRENT_CANDIDATE", "newScienceOrPReview": False,
    "activeWrites": 0, "strictGainClaimed": 0, "humanApproval": False, "humanTrial": False})

# Confirm the exact frozen author inputs again before the immutable first seal.
for original in input_freeze["files"]:
    assert ref(original["path"])["sha256"] == original["sha256"], original["path"]
files = [ref(path) for path in sorted(OWN.iterdir()) if path.is_file()]
seal = write("three-regional-source.independent-a.first-verdict.freeze.json", {
    "schemaVersion": 1, "sealedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "role": "Immutable independent SOURCE A first verdict before any new peer B exchange",
    "entry": entry, "ownFiles": files, "actualFrozenAuthorInputs": input_freeze["files"],
    "sourceRows": 20, "boundedTargetRoles": 25, "allWholePartnerRows": 268,
    "newCandidateSourceRoleBlockingFindings": 0, "genuineWholeOperatorHoldsRetained": 4,
    "newPeerBJudgmentsReadBeforeFirstSeal": False,
    "activeWrites": 0, "strictGainClaimed": 0, "humanApproval": False, "humanTrial": False})
print(json.dumps({"entry": entry, "firstSeal": seal, "sourceRows": 20, "roles": 25,
                  "wholePartners": 268, "newBoundedRoleBlockers": 0, "retainedOperatorHolds": 4}, ensure_ascii=False))
