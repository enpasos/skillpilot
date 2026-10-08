# SPDX-License-Identifier: Apache-2.0
"""Prepare inactive SL components from actual source pages; no review approval."""
from copy import deepcopy
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
OLDER = OWN.parent.parent / '2026-10-07'
PREVIOUS = OLDER / 'chemie-b008-sh-current480-source-placement-author-v19'
V12 = OLDER / 'chemie-b008-current169-routing-placement-author-v12'
V20 = OLDER / 'chemie-b008-sl-current480-source-placement-author-v20'
assert not (OWN / 'author.final.freeze.json').exists()

def read(p):
    return json.loads(p.read_text())

def bind(p):
    b = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def write(p, x):
    assert p.is_relative_to(OWN)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(x, ensure_ascii=False, indent=2) + '\n')

for row in read(PREVIOUS / 'author.final.freeze.json')['payloads']:
    assert bind(ROOT / row['path']) == row
active_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
active = read(active_path)
before = read(PREVIOUS / 'inputs/active-current480.json.bin')
old_candidate = read(PREVIOUS / 'candidate/canonical.current504-sh-source-metadata.author-candidate.json')
before_by_id = {g['id']: g for g in before['goals']}
active_by_id = {g['id']: g for g in active['goals']}
candidate = deepcopy(active)
candidate_by_id = {g['id']: g for g in candidate['goals']}
field_changes = []
new_ids = []
for proposed in old_candidate['goals']:
    goal_id = proposed['id']
    if goal_id not in before_by_id:
        assert goal_id not in candidate_by_id
        new = deepcopy(proposed)
        candidate['goals'].append(new)
        candidate_by_id[goal_id] = new
        new_ids.append(goal_id)
        continue
    for key in set(before_by_id[goal_id]) | set(proposed):
        if before_by_id[goal_id].get(key) != proposed.get(key):
            assert active_by_id[goal_id].get(key) == before_by_id[goal_id].get(key), (goal_id, key)
            if key in proposed:
                candidate_by_id[goal_id][key] = deepcopy(proposed[key])
            else:
                candidate_by_id[goal_id].pop(key, None)
            field_changes.append({'goalId': goal_id, 'field': key})
assert len(candidate['goals']) == 504 and len(new_ids) == 24
routine_ids = read(V12 / 'current169-protected-guard-and-field-intents.author.json')['routineGoalIds']
for filename, source in [
    ('active-current480.json.bin', active_path),
    ('active-kinds-current480.json.bin', ROOT / 'curricula/DE/Gymnasium/quality/semantic-kind/chemie.semantics.json'),
    ('active-qa-current.json.bin', ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'),
    ('active-rollout-registry.json.bin', ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'),
]:
    if not source.exists() and filename == 'active-kinds-current480.json.bin':
        registry = read(ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
        chemistry = next(s for s in registry['subjects'] if s['subject'] == 'chemie')
        source = ROOT / chemistry['semanticKindLedgerPath']
    target = OWN / 'inputs' / filename
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(source.read_bytes())
sources = {}
passages = {}
source_inputs = []
for stage, directory in [('SekI', 'lower-secondary'), ('SekII', 'upper-secondary')]:
    path = next((ROOT / f'curricula/DE/Gymnasium/input/SL/{directory}/source-extraction').glob('*CHEMIE*.source-extraction.json'))
    sources[stage] = read(path)
    passages[stage] = {p['id']: p for p in sources[stage]['passages']}
    source_inputs.append({'stage': stage, 'exactCurrentExtraction': bind(path), 'officialSourceDocuments': sources[stage]['sourceDocuments']})
readings = {}
for name in ['seven-lower-specific-content-pages.actual-reading.receipt.json', 'fifteen-upper-specific-content-pages.actual-reading.receipt.json']:
    for row in read(OWN / name)['readings']:
        readings[(row['officialDocument']['key'], row['physicalPage1Based'])] = row
assert len(readings) == 22

# Concrete existing source IDs, never invented IDs for generic paragraphs.
lower = [
    ('ae4ffb3d', 'lower-chemical-question-hypothesis', 'Developing experimental solutions supplies a question/design component. The explicit hypothesis, predicted counterevidence and all-domain duty are not established by this single bullet.'),
    ('672006aa', 'lower-guided-hypothesis-investigation', 'Actual experimental property investigations, with real performance retained. Hypothesis interpretation is a partial component under the cumulative MSA framework, not a reported learner performance.'),
    ('23710bb3', 'lower-independently-planned-hypothesis-investigation', 'Actual planning AND carrying out separation of complex mixtures. Full methods and substance-specific competence remain a whole original duty.'),
    ('d8a6a27e', 'lower-independently-planned-hypothesis-investigation', 'Actual planning AND performance of metal property tests. Generic routine does not replace the substantive metal investigation.'),
    ('e3b97259', 'data-documentation', 'Explicit experimental performance, observation and explanation distinction.'),
    ('88752ad8', 'data-documentation', 'Explicit independent experiment protocols. Units, provenance and conditions stay part of the canonical routine, not fully evidenced by a short source bullet alone.'),
    ('cd4d0ca4', 'lower-chemical-data-interpretation', 'Actual inference of CO2 properties from experiments, with source p7 cumulative inquiry and p6 data/fact distinction. No invented standalone source hypothesis operator.'),
    ('33fe4936', 'chemical-applications-society', 'Research on actual applications in workplaces, plus societal contexts. This is not complete personal career choice.'),
    ('ce1154cb', 'chemical-applications-society', 'Actual scientific explanation AND evaluation of CO2 climate relevance; whole content duty and natural/anthropogenic sources retained.'),
    ('c90894cb', 'sek1-source-information', 'Actual research on local water pollution. Whole water chemistry and place-specific duty remain retained.'),
    ('7da909d5', 'sek1-source-information', 'Actual discussion of claims from different sources on the greenhouse effect; source selection/reception component is retained.'),
    ('88752ad8', 'chemical-representation-transformation', 'Actual protocols supply a bounded information structuring/representation component under source p6/p7 communication, not all representation transformations.'),
    ('7da909d5', 'chemical-presentation', 'Actual exchange on diverse sources supplies a bounded communication component under p6/p7; no invented compulsory slide presentation.'),
]
upper = [
    ('7ecc4cf4', 'upper-source-information', 'Research and comparison of carbon structures in the NW introduction; explicit component, not complete complex-source or pharmaceutical scope.'),
    ('99c98d98', 'upper-source-information', 'Distinct language-branch source research/comparison retained separately.'),
    ('517803a2', 'chemical-presentation', 'Actual carbon oxide fact sheet in NW, with the full two-oxide body unchanged.'),
    ('b86bf9d9', 'chemical-presentation', 'Actual separate language-branch fact sheet; no NW-only nitrogen requirement imported.'),
    ('ef0ae4b3', 'chemical-representation-transformation', 'Actual NW radical-substitution structural representation and technical explanation; full reaction mechanism duty retained.'),
    ('5e9268d2', 'chemical-representation-transformation', 'Separate language-branch representation of radical substitution; corresponding source body and stage remain exact.'),
    ('85dedac5', 'chemical-applications-society', 'Actual NW sustainability evaluation of restrictions on halogenated alkanes, not all social application domains.'),
    ('e022fbd2', 'chemical-applications-society', 'Actual separate language-branch evaluation on the same compulsory sustainability topic.'),
]
gk = [
    ('2f0de6c8', 'upper-source-information', 'Actual GK research on fuel-cell applications; does not substitute for chemistry of cells or all complex-source domains.'),
    ('4e18be66', 'upper-source-criticism', 'Critical research/discussion on polymers in society, economics, environment and sustainability, with actual general media reflection context. Source-intention/validity remains a bounded partial component.'),
    ('64389569', 'chemical-applications-society', 'Compulsory economic/ecological discussion of fossil and renewable energy sources.'),
    ('4e18be66', 'chemical-applications-society', 'Compulsory critical social/environmental discussion of modern plastics; no personal career-choice claim.'),
]
lk = [
    ('d86d13ff', 'upper-source-information', 'Actual LK research on fuel-cell applications, including its distinct DMFC content context.'),
    ('eeda76e6', 'upper-source-criticism', 'Actual LK researched critical polymer/sustainability discussion, not automatic complete source-intention or all complex-domain proof.'),
    ('7f710761', 'chemical-applications-society', 'Actual LK economic/ecological energy discussion; retained whole thermal chemistry content.'),
    ('c61d4ef4', 'chemical-applications-society', 'Actual economic/environmental PEFC versus DMFC comparison; concrete whole content duty retained.'),
    ('eeda76e6', 'chemical-applications-society', 'Actual LK critical societal/economic/environmental/polymer sustainability discussion.'),
]
components = []
for lane, stage, items in [('lower', 'SekI', lower), ('GK', 'SekII', upper + gk), ('LK', 'SekII', upper + lk)]:
    for suffix, key, rationale in items:
        matches = [g for g in sources[stage]['sourceGoals'] if g['id'].endswith('-' + suffix)]
        assert len(matches) == 1
        goal = matches[0]
        page = int(next(t[len('sourcePage:'):] for t in goal['tags'] if t.startswith('sourcePage:')))
        document_key = next(t[len('sourceDocument:'):] for t in goal['tags'] if t.startswith('sourceDocument:'))
        assert (document_key, page) in readings
        assert lane != 'GK' or goal['courseLevel'] in {'GK_LK', 'GK'}
        components.append({'stage': stage, 'actualSourceLane': lane, 'originalSourceCourseLevel': goal['courseLevel'], 'actualCourseLevel': goal['courseLevel'], 'wholeUnchangedCurrentSourceGoal': goal, 'wholeCurrentPassage': passages[stage][goal['passageId']], 'currentExistingSourceGoalId': goal['id'], 'specificCandidateKey': key, 'specificChildGoalId': routine_ids[key], 'actualPrimaryPhysicalPage': page, 'actualPrimaryReadingReceipt': readings[(document_key, page)], 'actualGeneralOperatorWitness': bind(V20 / 'actual-six-primary-twenty-six-whole-page-reading.portable-receipts.json'), 'boundedComponentRationale': rationale, 'matchType': 'partial', 'wholeOriginalSourceClosure': False, 'independentSourceApproval': False, 'operatorContextSourceGoalIdsNotInvented': True, 'NWOnlyNitrogenDutyNotImposedOnLanguageBranch': True})
assert len(components) == 38
metadata = []
for key in sorted({c['specificCandidateKey'] for c in components}):
    goal = candidate_by_id[routine_ids[key]]
    old = deepcopy(goal['applicability'])
    goal['applicability']['jurisdiction'] = list(dict.fromkeys(old['jurisdiction'] + ['DE-SL']))
    metadata.append({'goalId': goal['id'], 'candidateKey': key, 'field': 'applicability', 'before': old, 'after': deepcopy(goal['applicability']), 'status': 'author_candidate_pending_independent_source_placement_review'})
lower_groups = {
    '49b13b33-34b7-5e4e-861c-b21082cb9922': ['data-documentation', 'lower-chemical-data-interpretation'],
    '542822de-cb96-56cf-a487-0fc3b5820f57': ['chemical-applications-society'],
    '91238ba1-5c63-50c7-a4fd-9bbe492c6b61': ['lower-chemical-question-hypothesis', 'lower-guided-hypothesis-investigation', 'lower-independently-planned-hypothesis-investigation'],
    'b6327e98-8ab9-5d7f-b826-4023bc1a56a7': ['sek1-source-information', 'chemical-representation-transformation', 'chemical-presentation'],
}
upper_groups = {
    '542822de-cb96-56cf-a487-0fc3b5820f57': ['chemical-applications-society'],
    'b6327e98-8ab9-5d7f-b826-4023bc1a56a7': ['upper-source-information', 'upper-source-criticism', 'chemical-representation-transformation', 'chemical-presentation'],
}
compiled_prior = read(PREVIOUS / 'actual-native43-source-view-findings-three-SH-models-and-current173-contexts.json')
views = []
for row in compiled_prior['actual43SourceViews']:
    if row['scope']['jurisdiction'] != 'DE-SL':
        continue
    before_path = ROOT / row['afterViewBinding']['path']
    view = read(before_path)
    stage = row['scope']['stage']
    lane = 'lower' if stage == 'SekI' else row['scope']['courseProfile']
    groups = lower_groups if stage == 'SekI' else upper_groups
    changes = []
    def walk(nodes):
        result = []
        for old in nodes:
            node = deepcopy(old)
            if node.get('kind') == 'goalEntry' and node.get('goalId') in groups:
                keys = groups[node['goalId']]
                selected = [c for c in components if c['actualSourceLane'] == lane and c['specificCandidateKey'] in keys]
                assert {c['specificCandidateKey'] for c in selected} == set(keys)
                children = [{'kind': 'goalEntry', 'goalId': routine_ids[k]} for k in keys]
                result.extend(children)
                changes.append({'wholeOriginalParentNode': node, 'explicitSourceSpecificChildren': children, 'actualCourseAdmissibleWholeSourceComponents': selected, 'wholeFamilyDutyClosure': False})
            else:
                if 'children' in node:
                    node['children'] = walk(node['children'])
                result.append(node)
        return result
    view['rootNodes'] = walk(view['rootNodes'])
    assert len(changes) == (4 if stage == 'SekI' else 2)
    # Existing upper research routines require the lower information routine.
    # This one prerequisite is explicit authored scope semantics, not inferred
    # automatically from a phase/course label to silence compiler diagnostics.
    prereqs = [] if stage == 'SekI' else ['sek1-source-information']
    if prereqs:
        view['rootNodes'].append({'kind': 'structure', 'id': 'sl-b008-source-route-prerequisites-' + lane.lower(), 'label': 'Voraussetzungen der Quellenarbeit', 'children': [{'kind': 'goalEntry', 'goalId': routine_ids[k], 'projectionRole': 'prerequisiteOnly'} for k in prereqs]})
    target = OWN / 'source-view-candidates' / (row['viewId'] + '.bounded-author-candidate.json')
    write(target, view)
    views.append({'viewId': row['viewId'], 'scope': row['scope'], 'actualSelectedSourceLane': lane, 'beforeExactView': bind(before_path), 'candidateView': bind(target), 'explicitParentReplacements': changes, 'targetRoutineCount': sum(map(len, groups.values())), 'prerequisiteOnlyRoutineCount': len(prereqs), 'fullCareerChoiceNotClaimed': True, 'GKUsesLKOnlySourceIds': False, 'independentPlacementApproval': False})
mapping_proposals = []
for stage, directory in [('SekI', 'lower-secondary'), ('SekII', 'upper-secondary')]:
    path = next((ROOT / f'curricula/DE/Gymnasium/mapping/DE-SL/{directory}').glob('*chemistry*source_extraction*review.json'))
    existing = read(path)
    mapping = deepcopy(existing)
    seen = {(r['legacyGoalId'], r['canonicalGoalId']) for r in mapping['mappings']}
    added = []
    for component in [c for c in components if c['stage'] == stage]:
        pair = (component['currentExistingSourceGoalId'], component['specificChildGoalId'])
        if pair not in seen:
            new = {'legacyGoalId': pair[0], 'canonicalGoalId': pair[1], 'matchType': 'partial', 'reviewDecisionId': pair[0]}
            mapping['mappings'].append(new)
            added.append(new)
            seen.add(pair)
    affected = {c['currentExistingSourceGoalId'] for c in components if c['stage'] == stage}
    for decision in mapping['decisions']:
        if decision['sourceGoalId'] in affected:
            original = deepcopy(decision)
            decision['canonicalGoalIds'] = list(dict.fromkeys(r['canonicalGoalId'] for r in mapping['mappings'] if r['legacyGoalId'] == decision['sourceGoalId']))
            decision.update({'decision': 'needs_view_placement_review', 'reviewer': None, 'reviewedAt': None, 'rationale': 'AUTHOR-only SL concrete source/operator/course components. Whole original duties remain retained. Original generic-family mappings are not automatically full child coverage; the explicit three-view candidate is separate and requires independent source placement review.', 'historicalDecisionBeforeCandidate': original})
    mapping.update({'reviewId': existing['reviewId'] + '.sl-b008-author-v21', 'status': 'author_candidate_pending_independent_source_and_placement_review', 'summary': {'allHistoricalMappingsExactAndRetained': True, 'partialChildBindingsAdded': len(added), 'pendingCurrentSourceDecisionIds': sorted(affected), 'newIndependentSourceApproval': 0, 'wholeSourceIdsDeletedOrInvented': 0, 'ordinaryAtlasDecisionProjectionRequiresSeparateActualReview': True}})
    target = OWN / 'candidate-source-mappings' / (stage + '.source-mapping.author-candidate.json')
    write(target, mapping)
    assert mapping['mappings'][:len(existing['mappings'])] == existing['mappings']
    mapping_proposals.append({'stage': stage, 'exactCurrentMapping': bind(path), 'candidateMapping': bind(target), 'exactAddedPartialMappings': added, 'pendingActualSourceIds': sorted(affected), 'historicalMappingsRetained': True, 'newSourceApproval': 0})
strict = read(OWN.parent / 'biologie-stoffwechsel-nineteen-reviewed-integration-root-20261008-v1/strict-current-nineteen-new-scientific-closures.actual.json')
assert next(s for s in strict['subjects'] if s['subject'] == 'chemie')['strictComplete'] == 177
guard_old = read(PREVIOUS / 'current480-three-way-bounded-field-rebase.actual.json')
protected_ids = guard_old['all173ProtectedTextImageAndMetadataValuesExact']
write(OWN / 'current480-three-way-bounded-field-rebase.actual.json', {'role': 'Actual fresh177 active chemistry field merge, no active write or independent approval', 'current480': bind(active_path), 'previousExactCurrent480': bind(PREVIOUS / 'inputs/active-current480.json.bin'), 'previousCandidate504': bind(PREVIOUS / 'candidate/canonical.current504-sh-source-metadata.author-candidate.json'), 'exactAppliedPreviousFieldDeltas': field_changes, 'exactNew24IDs': new_ids, 'all173ProtectedTextImageAndMetadataValuesExact': protected_ids, 'fresh177CentralEvidence': bind(OWN.parent / 'biologie-stoffwechsel-nineteen-reviewed-integration-root-20261008-v1/strict-current-nineteen-new-scientific-closures.actual.json'), 'previousEightContextHoldsRetained': True, 'strictGain': 0, 'activeWrites': 0})
write(OWN / 'candidate/canonical.current504-sl-source-metadata.author-candidate.json', candidate)
write(OWN / 'exact-sl-primary-course-components-and-three-view-proposals.author.json', {'role': 'Neutral bounded SL source/component and explicit stage/course view candidate; not source closure', 'sealedPrevious': bind(PREVIOUS / 'author.final.freeze.json'), 'immutableOriginal65SLDuties': read(V20 / 'retained-original-sixty-five-duty-and-eight-open-source-view-bindings.json')['originalDutyBindings'], 'immutableAll1646OriginalDuties': bind(V12 / 'exact-original1646-current-source-witness-and-primary-review-routes.author-input.json'), 'sourceInputs': source_inputs, 'specificPartialChildComponents': components, 'explicitSourceMetadataProposals': metadata, 'threeSpecificCandidateViews': views, 'guardedSourceMappingProposals': mapping_proposals, 'actualSpecific22SourcePageReceipts': [bind(OWN / n) for n in ['seven-lower-specific-content-pages.actual-reading.receipt.json', 'fifteen-upper-specific-content-pages.actual-reading.receipt.json']], 'retainedGeneral26SourcePageReceipts': bind(V20 / 'actual-six-primary-twenty-six-whole-page-reading.portable-receipts.json'), 'operatorParagraphsHaveNoInventedSourceIds': True, 'bothIntroductionBranchesRetained': True, 'NWOnlyNitrogenDutyNotExportedToLanguageBranch': True, 'wholeCareerChoiceSourceCoverage': False, 'wholeComplexModelDomainSourceCoverage': False, 'allWholeOriginalSourceAndPracticalDutiesRetained': True, 'wholeOriginalSourceClosure': False, 'sourceGateOrStatusPromotions': 0, 'strictGain': 0, 'activeWrites': 0, 'humanApproval': False})
assert bind(active_path) == bind(OWN / 'inputs/active-current480.json.bin') | {'path': str(active_path.relative_to(ROOT))}
print(json.dumps({'components': len(components), 'selectedExistingSourceGoals': len({c['currentExistingSourceGoalId'] for c in components}), 'metadata': len(metadata), 'views': len(views), 'inactiveWhole': len(candidate['goals']), 'fieldConflicts': 0, 'wholeSourceClosure': False, 'strictGain': 0, 'activeWrites': 0}))
