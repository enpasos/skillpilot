# SPDX-License-Identifier: Apache-2.0
"""Record scoped source facts and unapproved followups, never source votes."""
import copy
import json
import sys
from pathlib import Path
import fitz
from importlib.util import spec_from_file_location, module_from_spec

ROOT = Path(__file__).resolve().parent
sys.dont_write_bytecode = True
spec = spec_from_file_location('bounded', ROOT / 'prepare-bounded-author.py')
b = module_from_spec(spec)
spec.loader.exec_module(b)
read, dump, bind, objsha, REPO = b.read, b.dump, b.bind, b.objsha, b.REPO
assert not (ROOT / 'FILES.finite-bounded-author.seal.json').exists()
npath = b.NATIVE / 'NEUTRAL.exact-ten-current419-native-pages-whole-material-and-profile-review-inputs.json'
n = read(npath)
canonical = read(REPO / n['currentWholeCanonical']['path'])
byid = {g['id']: g for g in canonical['goals']}
s = read(b.OLD / 'inputs/existing-ten-source-scope-witnesses.history-and-current-identity.json')
sourceids = ['bb-chemistry-sekii-rlp-3-2-5-inhalte-013-aed46f7b', 'be-chemistry-sekii-rlp-3-2-5-inhalte-013-aed46f7b', 'bw-chem-sekii-3-4-3-b16-a01-5beea0bf', '5d29e11a-eac6-522a-b792-b74958461085', 'd7d3edbc-bec5-5153-aa0f-3181fe60f973']
sources = {r['sourceGoal']['id']: r for r in s['selectedWholeSourceGoalRows'] if r['sourceGoal']['id'] in sourceids}
mappings = {r['sourceGoalId']: r for r in s['selectedWholeMappingRows'] if r['sourceGoalId'] in sourceids}
pdfs = [
    ('BB', 'curricula/DE/Gymnasium/input/BB/upper-secondary/Teil_C_RLP_GOST_2022_Chemie.pdf', [41]),
    ('BE', 'curricula/DE/Gymnasium/input/BE/upper-secondary/Teil_C_RLP_GOST_2022_Chemie.pdf', [41]),
    ('BW', 'curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_CH_V2.pdf', [36]),
    ('HE', 'curricula/DE/Gymnasium/input/HE/upper-secondary/kcgo_chemie_21.04.2026.pdf', [47, 48]),
    ('NI', 'curricula/DE/Gymnasium/input/NI/upper-secondary/KC-CH_SII_Druck.pdf', [23]),
]
pdfreads = []
for jurisdiction, path, pages in pdfs:
    doc = fitz.open(REPO / path)
    pdfreads.append({'jurisdiction': 'DE-' + jurisdiction, 'document': bind(REPO / path), 'scopedWholePagesRead': [{'physicalPageOneBased': p, 'extractedTextSha256': b.digest(doc[p-1].get_text().encode())} for p in pages], 'wholeDocumentApproval': False, 'fullExtractedTextCommitted': False})
bwsource = copy.deepcopy(sources[sourceids[2]]['sourceGoal'])
assert bwsource['sourceRef'].endswith('S. 32.')
bwsource['sourceRef'] = bwsource['sourceRef'].replace('S. 32.', 'S. 34. (PDF-Seite 36).')
q = '25729c34-33d5-553a-a723-046113a7da47'
hh = 'd7461c15-6992-5342-b899-6c490ee0cbb7'
edta = 'e22a34d4-ac1e-5afe-8f77-0dfa4fd9f44f'
research = 'ac8b6c0f-98b2-5092-806d-d9498efbfa35'
proposals = []
for sid in sourceids[:2]:
    old = mappings[sid]
    proposals.append({'proposalId': sid + ':remove-unsupported-edta-edge', 'status': 'unapproved-author-proposal-source-hold-retained', 'wholeBeforeMappingSourceRow': old, 'wholeProposedEdges': [m for m in old['mappings'] if m['canonicalGoalId'] != edta], 'removeCanonicalTargetIds': [edta], 'residualDuty': 'Conductometry and the LK conductometric precipitation titration on the official page remain uncovered by these proposed remaining general-data edges. Do not treat removal as complete source coverage.', 'sourceFact': 'The whole local official PDF page 41 names conductometry within solubility/precipitation equilibria. It does not establish EDTA complexometry. BY EDTA evidence does not extend to BB/BE.', 'requiresApplicabilityFollowup': 'Recompute EDTA applicability using all genuine direct/ancestor evidence; no immediate removal or addition of jurisdictions from this isolated edge proposal.', 'newSourceVote': False})
bwmap = mappings[sourceids[2]]
bwedges = []
for target in [q, hh]:
    edge = copy.deepcopy(bwmap['mappings'][0])
    edge.update(canonicalGoalId=target, matchType='partial', courseLevelDecision='LK', courseLevelRationale='Author proposal: exact BW 3.4.3(16) belongs to the Leistungsfach section; qualitative and quantitative source components are represented by separate candidate edges. Not an accepted review decision.')
    bwedges.append(edge)
hhproposal = copy.deepcopy(byid[hh])
hhproposal['applicability']['jurisdiction'] = sorted(set(hhproposal['applicability']['jurisdiction']) | {'DE-BW'})
proposals.append({'proposalId': 'BW3.4.3-16-qualitative-and-quantitative', 'status': 'unapproved-author-proposal-source-course-acquisition-hold-retained', 'wholeBeforeSourceGoal': sources[sourceids[2]]['sourceGoal'], 'wholeProposedSourceGoal': bwsource, 'verifiedMetadataCorrection': {'oldPrintedPage': 32, 'actualPrintedPage': 34, 'actualPDFPageOneBased': 36, 'operatorUnchanged': True, 'sourceDocumentVersion': 'Überarbeitete Fassung vom 25. März 2022'}, 'wholeBeforeMappingSourceRow': bwmap, 'wholeProposedEdges': bwedges, 'wholeBeforeQuantitativeTarget': byid[hh], 'wholeProposedQuantitativeTargetIfSourceAdopted': hhproposal, 'targetChangedFields': ['applicability.jurisdiction'], 'qualitativeComponentTarget': q, 'quantitativeComponentTarget': hh, 'residualDuty': 'Independent source review must judge both partial edges together. d746 is currently absent from BW scope and depends on 5a58126e→9fef5c29→28c90c6a. Proposed BW applicability alone does not establish course placement, projection or transitive acquisition. Keep those open; do not copy LK into GK.', 'newSourceVote': False})
for sid in sourceids[3:]:
    old = mappings[sid]
    edges = []
    for target in [q, research]:
        edge = copy.deepcopy(old['mappings'][0])
        edge.update(canonicalGoalId=target, matchType='partial')
        edges.append(edge)
    proposals.append({'proposalId': sid + ':research-component', 'status': 'unapproved-author-proposal-research-acquisition-hold-retained', 'wholeBeforeMappingSourceRow': old, 'wholeProposedEdges': edges, 'existingResearchWholeTarget': byid[research], 'sourceFact': 'The complete retained BY GA/EA statements explicitly require targeted research in analogue/digital media as well as judging correctness and trustworthiness. Fixed invented source cards do not demonstrate that search/selection action.', 'localSourceGoal': sources[sid], 'retainedBYReference': bind(REPO / 'curricula/DE/Gymnasium/input/BY/gymnasium/Chemie.json'), 'researchEvidenceInCurrentT04': 'Absent: source criticism of supplied texts only. No new real or simulated research execution is claimed.', 'residualDuty': 'Review the existing research target route, stage/course/placement and prerequisite visibility. Then supply two complete research cases under that target if required; no source operator is declared covered merely by adding this proposed mapping.', 'newSourceVote': False})
dump('SOURCE.factual-holds-and-whole-mapping-proposals.json', {'schemaVersion': 1, 'role': 'author source facts and proposed deltas only', 'scopedOfficialLocalPDFReads': pdfreads, 'sourceProposals': proposals, 'currentCanonicalUnchanged': n['currentWholeCanonical'], 'activeMappingsChanged': [], 'sourceApprovals': [], 'humanApproval': False, 'humanTrial': False, 'retainedHolds': ['EDTA-BB-BE', 'BW-HH-explicit-quantitative-route-course-and-acquisition', 'BY-targeted-research-route-and-performance'], 'copiedWholeOfficialDocumentText': False})

# Fully specified alternatives for a later reviewed minimality decision. They
# are not materialised as a new canonical landscape, ledger, or denominator.
pairplans = []
for survivor, duplicate, finding in [('28c90c6a-3020-5c51-ac40-d802f3f12d2d', '29742d91-732f-5da5-bc46-e963885f9a4a', 'A-CURVE-MINIMALITY'), ('a449e874-6fec-502b-9667-6f078adc4d64', hh, 'A-HH-MINIMALITY')]:
    target = copy.deepcopy(byid[survivor])
    target['applicability']['jurisdiction'] = sorted(set(target['applicability']['jurisdiction']) | set(byid[duplicate]['applicability']['jurisdiction']))
    if survivor.startswith('28c90'):
        # The unrestricted current whole body already covers the second body;
        # preserve its GK interpretation/calculation/substance/indicator duty.
        reason = 'The broad existing GK/LK whole competence subsumes unrestricted strong/weak curve interpretation. Moving characteristic-point/substance/indicator interpretation to an LK-only goal would lose GK duty. New data correct P design but cannot settle canonical minimality.'
    else:
        target['description'] = 'Die lernende Person kann den pH-Wert von Pufferlösungen mithilfe der Henderson-Hasselbalch-Gleichung aus dem Verhältnis der korrespondierenden Säure-Base-Komponenten berechnen und die Gültigkeit der verwendeten Näherung begründen.'
        target['descriptionEn'] = 'The learner can calculate buffer pH using the Henderson-Hasselbalch equation from the conjugate acid-base component ratio and justify the validity of the approximation used.'
        target['requires'] = sorted(set(target['requires']) | set(byid[duplicate]['requires']))
        reason = 'The newest d746 already includes calculation and approximation validity. A diagnostics rename does not create a separate goal. The explicit hypothetical survivor retains the memory-required a449 identity and its existing card origin; union prerequisites and expanded source scope need independent didactic/acquisition review.'
    relations = []
    for g in canonical['goals']:
        for edge in ['contains', 'requires']:
            if duplicate in g.get(edge, []):
                after = list(dict.fromkeys(survivor if x == duplicate else x for x in g[edge]))
                relations.append({'goalId': g['id'], 'field': edge, 'wholeBefore': g[edge], 'wholeProposedIfMerged': after, 'removeSelfReferenceIfAny': g['id'] == survivor})
    matching = [r for r in s['selectedWholeMappingRows'] if any(m['canonicalGoalId'] == duplicate for m in r['mappings'])]
    pairplans.append({'findingId': finding, 'status': 'unresolved-scientific-minimality-followup-not-applied', 'authorJudgement': reason, 'currentWholeSurvivor': byid[survivor], 'currentWholeDuplicate': byid[duplicate], 'counterfactualWholeSurvivorIfReviewedMergeChosen': target, 'idTranslationIfReviewedMergeChosen': {duplicate: survivor}, 'canonicalRemovalIfReviewedMergeChosen': duplicate, 'currentRelationsRequiringSpecificRetarget': relations, 'selectedWholeMappingRowsRequiringRetargetAndRejudgement': matching, 'scopeAndPlacementImpact': 'Preserve all existing source-state/course duties and ordered paths. Audit each concrete learner-facing view/placement and every explicit goalEntry, canonicalSubtree, exam coveredGoalIds and prerequisite/reference. Do not infer successful migration from this bounded relation list.', 'currentMVPolicy': 'Keep both current original M/V records and asset bytes. The counterfactual changed survivor requires a fresh current semantic M decision and text/image-fit assessment; no approval in this packet. Keep removed-target evidence as immutable history.', 'HHCardPolicy': 'Retain a449 memory_required, memory goal1f2021c0, deck de_gymnasium_chemistry_equilibria_q3, kept card chem_eq_q3_006 and exact original bytes/origin. A merged description or new view needs review; never silently relabel no_memory_needed.', 'counterfactualDenominatorEffectIfIndependentlyAuthorized': -1, 'appliedDenominatorEffect': 0})
dump('AUTHOR.minimality-holds-and-explicit-merge-followup.json', {'schemaVersion': 1, 'role': 'unapproved author alternative, not a merge or alias decision', 'currentCanonical551AndCurricularAtomic419Unchanged': True, 'currentStrictInactive': {'complete': 312, 'denominator': 419, 'recomputedHere': False}, 'wholeGoalDeltasApplied': [], 'newIndependentVotes': 0, 'pairPlans': pairplans, 'whyNoCosmeticSeparation': 'Repeated HE/NI official curve and HH operators provide no distinct assessed obligation based only on examples or LK labels. Formal prediction versus data interpretation could be evaluated in a separate source-grounded proposal, but this packet does not establish that split.', 'strictGain': 0})

inputs = [REPO / 'AGENTS.md', npath, b.A / 'RESUME.checkpoint-stop.md', b.A / 'FIRST.scientific-outcomes.independent-a.json', b.A / 'READ.first-scientific.actual.json', b.A / 'CHECK.independent-calculations.actual.json', REPO / n['currentWholeCanonical']['path'], REPO / n['currentSemanticLedger']['path'], REPO / n['sourceAuthorSelector']['path'], REPO / n['sourceAuthorFiniteSeal']['path'], REPO / n['exactWholeTwentyDEENCases']['path'], REPO / n['exactWholeTenRawProfiles']['path'], REPO / n['wholeCurrentGoalAndNeighborObjects']['path'], REPO / n['exactCurrentMVAndHHCard']['path'], REPO / n['sourceScopeWitnessesAndHistory']['path'], REPO / n['authorOpenQuestions']['path'], REPO / n['authorOperatorBoundaries']['path'], REPO / n['authorMethodContextLimits']['path'], b.OLD / 'README.md', b.OLD / 'inputs/positive-profile-criteria.exact.md', REPO / 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json', REPO / 'app/scripts/positiveGoalEvidenceProfileModel.ts', REPO / 'docs/qa-ci/chemie-independent-reviews-checkpoint-2026-10-15.md', REPO / 'docs/qa-ci/chemie-acid7-source-author-checkpoint-2026-10-14.md', REPO / 'curricula/DE/Gymnasium/input/BY/gymnasium/Chemie.json']
inputs += [REPO / p for _, p, _ in pdfs]
dump('INPUTS.exact-bindings-and-actual-read-inventory.json', {'schemaVersion': 1, 'author': '/root/chemie_acid10_bounded_author_20261015', 'role': 'author remediation only, explicitly not independent reviewer', 'createdAtUTC': b.NOW, 'goalIds': n['goalIds'], 'exactInputs': [bind(p) for p in dict.fromkeys(inputs)], 'semanticReads': ['Full objective attachment and root AGENTS.md; both named checkpoints.', 'All ten whole current goal objects and seventeen unique direct neighbors, including the complete two exam objects; whole551 loaded for identities and relation analysis, not all551 scientifically rereviewed.', 'All twenty complete DE/EN cases and their full material/demands/answers/eighty criteria, all ten raw v2 profiles/forty expectations; every profile answer equals its full case answer before revision.', 'Independent FIRST A typed findings and complete explicit source/operator questions; not independent of that review.', 'Five source rows at issue and their whole mappings; current source facts checked against the exact local official PDF scopes listed separately; relevant HE/NI curve/HH operators read. The other historical191 source rows are machine-loaded/retained references, not represented as newly fully read or nationally approved.', 'Existing complete ten M/V records and exact HH card/deck/memory-goal visibility bindings; no new necessity decision or image review.'], 'technicalLoadsOnly': ['Entire current canonical551, existing191 source witness/mapping envelope and prior finite seals; not a new complete source/curriculum review.', 'Original complete finite author files verified by hash; original native campaigns are bound only and not reviewed or written.'], 'priorExposureDisclosed': 'Read current independent A results as an author. No independent FIRST seal or native D judgement claimed.', 'objectiveAttachment': bind(ROOT / 'inputs/goal-objective.supplied.md'), 'scientificApprovalsCreated': 0, 'humanOrLearnerDataRead': False})
findingstatus = []
for f in read(b.A / 'FIRST.scientific-outcomes.independent-a.json')['findings']:
    findingstatus.append({'findingId': f['id'], 'reviewerDecisionRetained': f['decision'], 'authorDisposition': 'candidate-corrected-awaiting-independent-recheck' if f['id'] == 'A-P-T05-OBSERVABLE' else 'open-source-or-minimality-hold-retained', 'change': 'Two full unknown synthetic pH/volume tables and explicit inference demands; matching full answers/rubrics/profile.' if f['id'] == 'A-P-T05-OBSERVABLE' else 'Factual source proposal or explicit minimality followup; no gate closure.', 'independentResolution': False})
dump('AUTHOR.findings-disposition-and-review-routing.json', {'schemaVersion': 1, 'role': 'author, no source/atomicity/D/P approvals', 'findings': findingstatus, 'sevenWholeGoalsUnchangedAndNotInThreeMinimalityHold': [gid for gid in n['goalIds'] if gid not in [n['goalIds'][4], n['goalIds'][5], n['goalIds'][7]]], 'separateRouting': 'Independent reviews may proceed on unchanged whole goals using the exact current native pages and complete materials; source duty, practical execution and course/acquisition holds remain where applicable. This list is not seven completed M7 goals.', 'nextNativeDForChangedT05': 'The canonical native page/context is unchanged, but the P material/profile revision requires independent checks of its exact new bytes. Existing empty native campaigns receive no author votes.', 'MAndV': n['exactCurrentMVAndHHCard'], 'newScientificApprovals': 0, 'strictGain': 0})
print(json.dumps({'sourceProposals': len(proposals), 'wholeGoalChanges': 0, 'minimalityHolds': 2, 'newSourceVotes': 0, 'strictGain': 0}))
