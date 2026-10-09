# SPDX-License-Identifier: Apache-2.0
"""Record independent whole-child science, semantic, memory and source limits."""
from pathlib import Path
from datetime import datetime, timezone
import json
import hashlib
from copy import deepcopy

BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
AUTHOR = BASE / 'biologie-evolution-one-fossil-culture-semantic-split-author-c-v1'
OUT = BASE / 'biologie-evolution-two-semantic-children-independent-b-v1'
ENTRY = AUTHOR / 'neutral-begun-two-child-whole-candidate.commit-checkpoint.entry.json'
NOW = datetime.now(timezone.utc).isoformat()

def read(p):
    return json.loads(Path(p).read_text())

def binding(p):
    p = Path(p)
    assert not p.is_absolute() and p.is_file()
    assert not any(q.is_symlink() for q in [p, *p.parents])
    b = p.read_bytes()
    return {'path': str(p), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def write(name, obj):
    p = OUT / name
    assert not p.exists(), p
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    return binding(p)

OUT.mkdir(parents=True, exist_ok=True)
entry = read(ENTRY)
input_keys = ['exactOriginalInputs', 'wholeGoalAndParentClusterCandidates',
              'currentWholePAndFourConstructedBilingualCases', 'sourcePlacementAndSemanticProposalsPending']
for key in input_keys:
    assert binding(entry[key]['path']) == entry[key], key
frame = read(entry['exactOriginalInputs']['path'])
bodies = read(entry['wholeGoalAndParentClusterCandidates']['path'])
materials = read(entry['currentWholePAndFourConstructedBilingualCases']['path'])
proposals = read(entry['sourcePlacementAndSemanticProposalsPending']['path'])
canonical_path = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
canonical = read(canonical_path)
goals = {g['id']: g for g in canonical['goals']}
parent_id = entry['originalParentId']
ids = entry['candidateGoalIds']
assert len(canonical['goals']) == 479 and all(i not in goals for i in ids)
assert frame['wholeOriginalParent'] == bodies['wholeOriginalParent'] == goals[parent_id]
original_parent, cluster = bodies['wholeOriginalParent'], bodies['candidateParentCluster']
changed_parent_fields = [k for k in original_parent if original_parent[k] != cluster[k]]
assert set(changed_parent_fields) == {'type', 'weight', 'contains'}
assert cluster['type'] == 'cluster' and cluster['weight'] == 2 and cluster['contains'] == ids
assert [g['id'] for g in bodies['candidateChildren']] == ids
assert [m['goalId'] for m in materials['entries']] == ids
assert len(frame['wholeOriginalSourceDutyRows']) == 13
assert len(frame['wholeOriginalAndCurrentPartnerGoals']) == 22
old_frame = read(frame['originalWholeSourceFrameBinding']['path'])
assert binding(frame['originalWholeSourceFrameBinding']['path']) == frame['originalWholeSourceFrameBinding']
old_rows = {r['rowId']: r for r in old_frame['wholeOriginalSourceDutyRows']}
old_partners = {r['goalId']: r for r in old_frame['wholeOriginalAndCurrentPartnerGoals']}
assert all(row == old_rows[row['rowId']] for row in frame['wholeOriginalSourceDutyRows'])
assert all(row == old_partners[row['goalId']] for row in frame['wholeOriginalAndCurrentPartnerGoals'])
assert set(x for r in frame['wholeOriginalSourceDutyRows'] for x in r['wholeCanonicalPartnerGoalIds']) == {r['goalId'] for r in frame['wholeOriginalAndCurrentPartnerGoals']}
for partner in frame['wholeOriginalAndCurrentPartnerGoals']:
    assert partner['wholeCurrentGoal'] == partner['wholeOriginalFrameGoal'] == goals[partner['goalId']]
    assert partner['wholeOriginalFrameEqualCurrent'] is True
for material, child in zip(materials['entries'], bodies['candidateChildren']):
    assert material['wholeCandidateGoal'] == child
    assert child['requires'] == original_parent['requires']
    assert child['contains'] == [] and child['type'] == 'atomic' and child['weight'] == 1
    assert child['applicability']['jurisdiction'] == ['DE-BY']
    assert child['resourceLinks'] == []
    assert len(material['newAuthoredWholeCases']) == 2
    for case, brief in zip(material['newAuthoredWholeCases'], material['wholeProfile']['applicationCaseBriefs']):
        assert case['caseId'] == brief['id']
        for lang in ['De', 'En']:
            assert brief['taskDemand'+lang] == case['material'+lang] + '\n\n' + ('Auftrag: ' if lang == 'De' else 'Task: ') + case['task'+lang] + '\n\n' + ('Frische Variation: ' if lang == 'De' else 'Fresh variation: ') + case['freshTransferTask'+lang]
            assert brief['expectedPerformance'+lang] == case['workedResponse'+lang] + '\n\nTransfer: ' + case['workedFreshTransfer'+lang]
        assert case['actualExperimentPerformed'] is False and case['actualLearnerPerformance'] is False
assert [r['rowId'] for r in proposals['sourceRoleProposals']] == [r['rowId'] for r in frame['wholeOriginalSourceDutyRows']]
assert all(r['originalWholePartnerGoalIds'] == f['wholeCanonicalPartnerGoalIds'] for r, f in zip(proposals['sourceRoleProposals'], frame['wholeOriginalSourceDutyRows']))
assert all(r['existingDecisionOrEdgeChanged'] is False for r in proposals['sourceRoleProposals'])
rp = next(r for r in frame['wholeOriginalSourceDutyRows'] if r['rowId'] == 'source-duty-0276')
assert rp['wholeCanonicalPartnerGoalIds'] == [parent_id]
assert proposals['specificRPWholeDutyHold']['candidateChildAssigned'] is None

exact_inputs = write('two-children.exact-whole-goals-parent-four-bilingual-cases.input.json', {
    'schemaVersion': 1, 'license': 'CC-BY-4.0', 'role': 'whole semantic candidates and four bilingual complete case/profile inputs actually read',
    'createdAt': NOW, 'neutralAuthorEntry': binding(ENTRY),
    'wholeGoalAndParentCandidateBinding': entry['wholeGoalAndParentClusterCandidates'],
    'wholeCasesAndProfilesBinding': entry['currentWholePAndFourConstructedBilingualCases'],
    'wholeOriginalParent': original_parent, 'candidateParentCluster': cluster,
    'candidateChildren': bodies['candidateChildren'], 'wholeCaseProfileEntries': materials['entries'],
    'all13Duties22WholePartnersActuallyReadBinding': entry['exactOriginalInputs'], 'activeWrites': []
})

row_reasons = {
    'source-duty-0015': 'BB complete fossil/skull/tree source and its five original partners are retained. Fossil child provides a bounded chronology/trait facet; it does not replace the full partner union or establish a cultural requirement from that source alone.',
    'source-duty-0030': 'BE counterpart is preserved independently with the five whole partners and original extraction; the same limited fossil component does not authorize regional projection or whole-source closure.',
    'source-duty-0072': 'BY official combined competence has both original clauses: traits-to-human-evolution hypothesis/temporal reconstruction and cultural importance for today in the environment. Those clauses distribute coherently to the two children. Named source contents and regional placement still need actual independent source/view closure.',
    'source-duty-0227': 'HH broad evolution, diversity, relatedness, reproduction and human origin source has ten partners. The two children cover only human fossil/cultural facets; reproduction and other existing partners are not rewritten or swallowed.',
    'source-duty-0237': 'MV broad origins, theories, factors, fossils and modern-human evolution source has seventeen partners. A partial fossil interpretation cannot approve upper primate/cultural-selection extensions or complete the whole source.',
    'source-duty-0255': 'NW Darwin/selection/variation, breeding analogy, species, fossils, tree hypotheses and human-evolution source retains nine partners. Human fossil reasoning does not remove those other topics.',
    'source-duty-0275': 'RP anatomy/genetics/immunobiology relationship duty retains the separate systematic-classification partner plus original parent. Fossil traits can be a contribution but cannot silently become complete anatomy/genetic source coverage.',
    'source-duty-0276': 'RP ancestry-to-selected-human-behaviour requires an explanatory link absent from all four new cases. The sole original parent partner remains retained and this entire duty stays HOLD/unassigned; no upper LK primate substitute.',
    'source-duty-0277': 'RP cultural effects on human development and biosphere align with the cultural child contribution. The original row and sole parent partner remain exact; no active regional mapping approval or stronger upper selection-advantage substitution.',
    'source-duty-0284': 'SH individual/stem development, systematics, fossils, breeding, theory, factors and humans retain thirteen partners. Both child competencies are only bounded pieces, never automatic whole-course approval.',
    'source-duty-0311': 'SN broad evolution mechanisms, homologies, intermediate forms and human/cultural history retain seventeen partners. All wider methods/content duties remain separate; textual synthetic cases prove no microscopy or actual investigation.',
    'source-duty-0321': 'ST broad evolution, species, ultimate/proximate explanations, factors, fossil/mosaic/homology, human history and misuse retain eighteen partners. Natural-object documentation, modelling, model experiments/software are not executed by these text cases.',
    'source-duty-0329': 'TH broad mechanisms, human evolution, archaeogenetics, cultural/social evolution and rejection of racial categorisation retain eighteen partners. The two child cases do not erase or automatically complete those source and projection duties.'
}
source_read = write('two-children.independent-b.complete13-duty22-partner-scope-and-preservation.verdict.json', {
    'schemaVersion': 1, 'license': 'CC-BY-4.0', 'role': 'own substantive source/partner scope judgment with exact full input retained, no fresh whole-source approval',
    'createdAt': NOW, 'exactWhole13Rows22Partners': entry['exactOriginalInputs'],
    'originalWhole18Source35Partner30Frame': frame['originalWholeSourceFrameBinding'],
    'all13RowsEqualExactOriginalWholeFrame': True, 'all22PartnersEqualOriginalAndActiveCurrentGoals': True,
    'sourceRowsRemoved': 0, 'partnersRemoved': 0, 'sourceDecisionsOrEdgesChanged': 0,
    'parentTypeWeightContainsOnlyProposedChanges': changed_parent_fields,
    'childApplicabilityIsInactiveBYOnlyProposalNotWholeParent12CountryInheritance': True,
    'wholeRowJudgments': [{'rowId': r['rowId'], 'sourceGoalId': r['wholeOriginalDecision']['sourceGoalId'],
        'originalWholePartnerGoalIds': r['wholeCanonicalPartnerGoalIds'], 'status': 'HOLD_whole_source_and_projection_not_reapproved',
        'ownReason': row_reasons[r['rowId']]} for r in frame['wholeOriginalSourceDutyRows']],
    'wholePartnerIdsActuallyRead': [r['goalId'] for r in frame['wholeOriginalAndCurrentPartnerGoals']],
    'wholePartnerInterpretation': 'These are intact competence bodies, not just membership IDs: broad source partners include separate reproductive, species, systematic, evolutionary-mechanism, dating, human-history, cultural-selection and misuse competencies. The proposed two children substitute none of those whole competencies by a topical keyword.',
    'RPUncoveredDutyExact': deepcopy(rp), 'RPWholeDutyHoldExact': proposals['specificRPWholeDutyHold'],
    'RPSourceClosure': False, 'wholeSourceApproval': False, 'wholeCourseApproval': False,
    'regionalViewApproval': False, 'humanApproval': False, 'strictGain': 0, 'activeWrites': []
})

fossil_review = {
    'goalId': ids[0], 'scienceVerdict': 'KEEP_exact_inactive_whole_child_candidate',
    'semanticKindDecision': 'curricularAtomic', 'atomicityDecision': 'atomic',
    'ownAtomicityReason': 'The assessed product is a bounded interpretation of fossil evidence. Chronological constraints determine which evolutionary hypothesis the same trait set can support; uncertainty and ancestry limits belong to that interpretation. There is no cultural-impact assessment hidden within it. Successful culture analysis does not grant this fossil competence.',
    'memoryDecision': 'no_memory_needed',
    'ownMemoryReason': 'Goal success requires fresh inference from supplied traits/intervals and a justified revision when provenance changes. There is no fixed taxon list, name-date association or isolated definition whose rote retention is the assessed competence. Compact recall cards are neither mandated nor sufficient.',
    'requiredCards': [], 'requiredCardVisibilityChecks': 'not_applicable_no_memory_goal_or_deck_created; future learner projection/native visibility remains separate',
    'PWholeGoalCoverage': 'Both whole expectations map to the actual goal: trait-supported hypotheses, chronological reconstruction, and limits on direct ancestor inference. Full DE/EN cases/rubrics are equivalent. Two contexts vary mosaic chronology versus habitat/provenance rather than merely rename a fossil.',
    'caseJudgments': [
        {'caseId': 'fossils-mosaic-order-and-overlap', 'status': 'KEEP',
         'ownEvidence': 'F1 [3.5,4.0] Ma is wholly older than F2 [1.9,2.2], wholly older than F3 [0.2,0.3]. Bipedal evidence in F1 with small cranial volume supports a mosaic/trajactory hypothesis within the constructed dataset, not a measured ancestor chain. F4 [2.1,2.6] overlaps F2 [1.9,2.2] at [2.1,2.2]: F1 precedes both, both precede F3, F4 and F2 are not certainly individually ordered. Skull volume supplies neither a human-group hierarchy nor inevitable progress.'},
        {'caseId': 'habitat-hypothesis-and-provenance', 'status': 'KEEP',
         'ownEvidence': 'X [2.9,3.1] is wholly older than Y [2.5,2.8] and Z [2.3,2.6]; Y/Z overlap [2.5,2.6]. An originally associated woodland pollen/bipedal pelvis combination contradicts the strict occurrence-only treelessness hypothesis as posed. Reworking breaks that association and removes this counterexample without proving H. Neither initial origin location nor a single evolutionary cause follows from these later reduced cards.'}
    ],
    'sourceBoundary': 'Named BY Savannenhypothese/source history is not fully tested by the synthetic occurrence-exclusivity H. This distinction is explicit in the worked response and remains an open source/context gate.',
    'newMaterialFindings': [], 'nativePOrVApproval': False
}
culture_review = {
    'goalId': ids[1], 'scienceVerdict': 'KEEP_exact_inactive_whole_child_candidate',
    'semanticKindDecision': 'curricularAtomic', 'atomicityDecision': 'atomic',
    'ownAtomicityReason': 'The assessed product is one evidence-based analysis of effects of a socially transmitted practice. Identifying the transmission mechanism specifies why the practice is cultural; human/environment consequences and conditional causal limits specify its influence. Those are facets of the same inquiry, without adding an independent fossil reconstruction or requiring inherited allele-frequency change.',
    'memoryDecision': 'no_memory_needed',
    'ownMemoryReason': 'Assessment changes with supplied transmission histories, benefit/environment indicators and altered operational conditions. Reciting a definition or a technology list cannot establish the demanded conditional analysis. No fixed recall targets or necessary cards are introduced.',
    'requiredCards': [], 'requiredCardVisibilityChecks': 'not_applicable_no_memory_goal_or_deck_created; future learner projection/native visibility remains separate',
    'PWholeGoalCoverage': 'Expectations and four-lingual case representations demand material-specific cultural transmission/modification, biological distinction, human benefit, environmental consequence, justified causal limits and changed-condition reassessment. They preserve analysis of cultural importance for present people in their environment, not a universal culture ranking.',
    'caseJudgments': [
        {'caseId': 'irrigation-transmission-and-current-tradeoffs', 'status': 'KEEP',
         'ownEvidence': 'The supplied changes are population +300, model supply +800 in the stated series, crop-failure -12 percentage points and wetland -60 ha. Learned/modified irrigation through family/school supports social transmission; it does not make skills inherited alleles. Weather/trade are explicit confounds. The dry-period salinity premise makes an initial benefit conditional; asking for reliable salt/water-balance evidence is appropriate without claiming a real successful remedy.'},
        {'caseId': 'sanitation-cumulative-knowledge-and-biosphere', 'status': 'KEEP',
         'ownEvidence': 'A changes from 30 to8 model cases per1000, a22-per1000 decrease, then24 with failure; B28 alone does not supply a controlled difference-in-differences or establish a single cause. Reduced pathogen exposure is stated only as plausible; nutrient input supplies a separate ecological effect. A revised publicly taught guide is cultural transmission without genetic-change evidence, and its successful execution is explicitly unproven.'}
    ],
    'sourceBoundary': 'Cultural transmission and modern effects do not satisfy RP ancestry-to-selected-behaviour; neither upper LK selection advantages nor all historical social/archaeogenetic source contents are silently added.',
    'newMaterialFindings': [], 'nativePOrVApproval': False
}

first_verdict = write('two-children.independent-b.science-A-M-P-FIRST.verdict.json', {
    'schemaVersion': 1, 'license': 'CC-BY-4.0', 'createdAt': NOW,
    'role': 'genuine independent whole two-child science/A/M/P candidate review; no old18 review restart',
    'reviewer': 'Codex /root/evo12_visual_independent_b; model variant not exposed',
    'disclosure': {'authorCandidateGoalProfileCasesAndAMSourceRoleProposalsRead': True,
        'authorQSTechnicalChecksReadBeforeFIRST': False, 'authorDraftDeltaOpinionsReadBeforeFIRST': False,
        'peerWholeChildReviewRead': False,
        'priorKnowledge': 'Original parent atomarity concern and RP duty/Savanna source boundaries were known before this authorized targeted task. No blind-review claim; current judgments independently evaluate the complete candidate contents.',
        'independence': 'Own complete DE/EN goal/case/rubric/transfer interpretation, all13 full duty rows/all22 whole partner reading, direct interval/numerical counterchecks and distinct semantic/memory reasoning. Author proposals are inputs, not scientific acceptance.'},
    'neutralAuthorEntry': binding(ENTRY), 'exactWholeTwoInput': exact_inputs, 'own13Duty22PartnerReview': source_read,
    'parentDecision': {'goalId': parent_id, 'proposedSemanticKind': 'curricularArea', 'proposedAtomicity': 'cluster',
        'ownReason': 'The original fossil-hypothesis/chronology result and current cultural-influence analysis can be assessed independently. Preserving their original conjunction as a cluster and assessing each child separately corrects that semantic bundling at candidate level.',
        'originalParentDescriptionDEENProvenanceRequiresPreservedExactly': True,
        'originalEVO18BATOMICITY001Disposition': 'resolved_by_semantic_design_on_exact_inactive_two_child_candidate_only; active parent finding not closed or rebound',
        'currentAuthoritativeKindChanged': False},
    'childDecisions': [fossil_review, culture_review],
    'originalCompetenceUnionAssessment': {'status': 'lossless_for_original_parent_goal_DEEN_semantics',
        'fossilTraitsToBoundedBiologicalEvolutionHypotheses': ids[0], 'chronologicalReconstruction': ids[0],
        'culturalImportanceForPresentHumansInEnvironment': ids[1],
        'noOriginalDescriptionFacetDiscarded': True, 'noNewMandatoryTaskLabelQuota': True,
        'wholeRegionalSourceUnionClosure': False,
        'RPAdditionalAncestryBehaviourDuty': 'retained completely in exact input and unassigned/HOLD; absent from all4 cases; lossless source closure is not achieved by the two-child semantic union'},
    'newMaterialOrSemanticCorrectionFindings': [],
    'requiredOpenGates': ['source-duty-0276 ancestry-to-selected-human-behaviour whole operator',
        'all13 source/course/duration/regional-view scopes and full partner-preserving mapping',
        'BY named Savannenhypothese/context and first-origin claim qualification',
        'authoritative proposed parent/child kind and memory integration plus actual DAG/weights/applicability/visibility',
        'new child actual raster images, pixel reviews and native dual D/P/V',
        'protected old394/current299 contexts and all central M7 gates'],
    'reviewAuthority': 'ai_candidate', 'status': 'needs_human_review', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'wholeSourceApproval': False, 'wholeCourseApproval': False, 'regionalViewApproval': False,
    'currentNativeDPApproval': False, 'currentVApproval': False, 'currentM7Approval': False,
    'humanApproval': False, 'humanTrial': False, 'actualExperimentPerformed': False, 'actualLearnerPerformance': False,
    'newScientificClosures': 0, 'restoredBindings': 0, 'strictGain': 0, 'activeWrites': []
})
first_freeze = write('two-children.independent-b.science-A-M-P-FIRST.freeze.json', {
    'schemaVersion': 1, 'license': 'CC-BY-4.0', 'createdAt': datetime.now(timezone.utc).isoformat(),
    'role': 'immutable own science FIRST before author QS and ordinary scoped proposed-child P2 verification',
    'sealedArtifacts': [first_verdict, exact_inputs, source_read], 'neutralAuthorEntry': binding(ENTRY),
    'exactInputBindings': [entry[k] for k in input_keys],
    'activeCanonicalBindingAtOwnFIRST': binding(canonical_path), 'peerWholeChildReviewRead': False,
    'authorQSTechnicalChecksReadBeforeFIRST': False, 'strictGain': 0, 'activeWrites': []
})
print(json.dumps({'scienceFIRST': first_verdict, 'scienceFIRSTFreeze': first_freeze, 'newCorrectionFindings': 0, 'strictGain': 0}, ensure_ascii=False))
