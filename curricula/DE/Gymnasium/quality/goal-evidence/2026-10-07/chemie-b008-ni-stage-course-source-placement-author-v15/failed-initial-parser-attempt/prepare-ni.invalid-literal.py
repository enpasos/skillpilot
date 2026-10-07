# SPDX-License-Identifier: Apache-2.0
"""Prepare inactive, source-specific NI child placements without historical writes."""
from pathlib import Path
from copy import deepcopy
import hashlib
import json

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
V12 = OWN.parent / 'chemie-b008-current169-routing-placement-author-v12'
V14 = OWN.parent / 'chemie-b008-bb-be-model-data-source-placement-author-v14'
assert not (OWN / 'author.final.freeze.json').exists()


def read(path):
    return json.loads(path.read_text())


def bind(path):
    payload = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(payload).hexdigest(), 'bytes': len(payload)}


def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


for previous in (V12, V14):
    for payload in read(previous / 'author.final.freeze.json')['payloads']:
        assert bind(ROOT / payload['path']) == payload

candidate = read(V14 / 'candidate/canonical.current503-bb-be-source-metadata.author-candidate.json')
before = deepcopy(candidate)
by_goal = {goal['id']: goal for goal in candidate['goals']}
routine_ids = read(V12 / 'current169-protected-guard-and-field-intents.author.json')['routineGoalIds']
all_original = read(V12 / 'exact-original1646-current-source-witness-and-primary-review-routes.author-input.json')
ni_original = [row for row in all_original['originalWholeDuties'] if '/NI/' in row['sourceExtractionPath']]
assert len(ni_original) == 371

# Each selection was made from the actual complete source goal and its physical
# table/operator context. These are partial components, never whole-duty approval.
selections = [
    ('SekI', 'st-5-6-1-kompetenz-009', 'lower-chemical-question-hypothesis', [51, 52], 'Question identification plus the adjacent explicit hypothesis-test planning progression; not a full proof of every own operationalization.'),
    ('SekI', 'st-5-6-2-kompetenz-002', 'lower-chemical-question-hypothesis', [51, 52], 'The hypothesis-testing operator complements the simple chemical question; full independent scope approval remains pending.'),
    ('SekI', 'st-5-6-1-kompetenz-006', 'lower-guided-hypothesis-investigation', [51, 52], 'Actual guided physical experimentation, not a paper-only simulation.'),
    ('SekI', 'st-5-6-1-kompetenz-007', 'lower-guided-hypothesis-investigation', [51], 'Safety component of an actual guided investigation.'),
    ('SekI', 'st-5-6-1-kompetenz-010', 'lower-guided-hypothesis-investigation', [51], 'Complete experiment-protocol duty is retained; this supplies only the documentation component.'),
    ('SekI', 'st-7-8-3-kompetenz-011', 'lower-independently-planned-hypothesis-investigation', [53], 'Self-planned actual detection experiments; source-specific detections remain distinct.'),
    ('SekI', 'st-7-8-4-kompetenz-003', 'lower-independently-planned-hypothesis-investigation', [54], 'Self-planned quantitative experiment plus real performance and protocol.'),
    ('SekI', 'cr-7-8-1-kompetenz-005', 'lower-independently-planned-hypothesis-investigation', [59], 'Plan and perform checking experiments under safety constraints.'),
    ('SekI', 'st-5-6-1-kompetenz-010', 'data-documentation', [51], 'Protocol component; no replacement of physical experimental performance.'),
    ('SekI', 'cr-7-8-2-kompetenz-002', 'data-documentation', [60], 'Actual qualitative/quantitative experiment protocol component.'),
    ('SekI', 'st-7-8-3-kompetenz-006', 'lower-chemical-data-interpretation', [53], 'Represent measured chemical data in diagrams; density/boiling duties stay separate.'),
    ('SekI', 'st-9-10-5-kompetenz-015', 'lower-chemical-data-interpretation', [55], 'Find and explain trends and relationships in ionization data and infer conclusions.'),
    ('SekI', 'cr-7-8-2-kompetenz-003', 'data-validity', [60], 'Describe and interpret measurement deviations; cannot grant generic full source closure.'),
    ('SekI', 'cr-7-8-1-kompetenz-008', 'own-inquiry-process-reflection', [59], 'Develop and compare improvements of actual performed investigations.'),
    ('SekI', 'cr-9-10-3-kompetenz-013', 'own-inquiry-process-reflection', [61], 'Reflect one's own work, retaining planning/structuring/presentation parts separately.'),
    ('SekI', 'st-7-8-3-kompetenz-019', 'sek1-model-use-criticism', [53], 'Critical use of a simple atom model.'),
    ('SekI', 'st-9-10-5-kompetenz-016', 'sek1-model-use-criticism', [55], 'Change atom conceptions on the basis of actual findings.'),
    ('SekI', 'st-9-10-7-kompetenz-003', 'sek1-model-use-criticism', [57], 'Apply bonding models to a chemical question.'),
    ('SekI', 'st-9-10-7-kompetenz-009', 'sek1-model-use-criticism', [57], 'Discuss model explanatory power critically; other topic-specific contents remain open.'),
    ('SekI', 'st-5-6-1-kompetenz-012', 'chemical-applications-society', [51], 'Chemistry in learners' + "'" + ' everyday lives; no whole decision or career claim.'),
    ('SekI', 'cr-9-10-3-kompetenz-017', 'chemical-applications-society', [61], 'Socially relevant chemical reactions from different perspectives; criteria/decision endpoints remain distinct.'),
    ('SekI', 'cr-9-10-3-kompetenz-018', 'chemistry-career-choice', [61], 'Explicit career-field recognition is only a partial component: the full comparative personal career-choice routine is not stated verbatim here.'),
    ('SekI', 'st-7-8-4-kompetenz-004', 'sek1-source-information', [54], 'Research atomic-mass data from different sources; full quantitative content retained.'),
    ('SekI', 'st-7-8-3-kompetenz-007', 'sek1-source-information', [53], 'Use tables to research substance properties; exact topic values remain separate.'),
    ('SekI', 'st-9-10-6-kompetenz-009', 'sek1-source-information', [56], 'Research data about elements.'),
    ('SekI', 'cr-7-8-2-kompetenz-007', 'chemical-representation-transformation', [60], 'Translate deliberately between chemical everyday and specialist language.'),
    ('SekI', 'st-7-8-4-kompetenz-005', 'chemical-representation-transformation', [54], 'Chemical model representation in correct specialist language.'),
    ('SekI', 'st-9-10-6-kompetenz-012', 'chemical-presentation', [56], 'Plan, structure and present the team work.'),
    ('SekI', 'cr-9-10-3-kompetenz-013', 'chemical-presentation', [61], 'Present one's own chemical work; reflection stays independently visible.'),
    ('SekII', 'ep-2-kompetenz-016', 'upper-theory-based-question-hypothesis', [13, 36], 'Authentic everyday CO2 question plus the explicit scientifically justified hypothesis operator. Selected here as a didactic prerequisite, not an invented full NI topic duty.'),
    ('SekII', 'q-energie-2-kompetenz-010', 'upper-hypothesis-investigation', [18, 33, 34, 36], 'Plan and actually perform factor-controlled reaction-rate experiments; the operator appendix and protocol context bound the hypothesis/investigation component.'),
    ('SekII', 'q-protolyse-1-kompetenz-010', 'upper-hypothesis-investigation', [21, 33, 34], 'Real quantitative titration is retained, not replaced by a worksheet; full titration competence is not this generic component.'),
    ('SekII', 'ep-3-kompetenz-007', 'upper-hypothesis-investigation', [14], 'Actual laboratory hazards and safety component of upper investigations.'),
    ('SekII', 'q-energie-1-kompetenz-007', 'data-documentation', [17, 33, 34], 'Calorimetric investigation with protocol/documentation context; real experiment remains required.'),
    ('SekII', 'q-energie-1-kompetenz-010', 'upper-quantitative-hypothesis-data-evaluation', [17, 9, 36], 'Mathematical tabulated enthalpy-data evaluation plus documented digital-measurement support; does not replace topic enthalpy calculation mastery.'),
    ('SekII', 'q-ggw-1-kompetenz-008', 'upper-quantitative-hypothesis-data-evaluation', [19, 9, 36], 'Infer chemical equilibrium characteristics from actual experimental data; hypothesis checks remain an own explicit operationalization.'),
    ('SekII', 'q-energie-1-kompetenz-007', 'data-validity', [17, 6, 33], 'Actual reflection of calorimetric results is a partial validity component, not verbatim evidence for every generic measurement-error case.'),
    ('SekII', 'q-energie-1-kompetenz-007', 'own-inquiry-process-reflection', [17, 33, 34], 'Reflect results of one's own actual experiment, preserving the physical-performance duty.'),
    ('SekII', 'ep-1-kompetenz-016', 'upper-model-use-criticism', [12], 'Discuss the limits and possibilities of actual structural models.'),
    ('SekII', 'q-ggw-1-kompetenz-009', 'upper-model-use-criticism', [19], 'Infer equilibrium characteristics from an actual model experiment.'),
    ('SekII', 'q-ggw-1-kompetenz-010', 'upper-model-use-criticism', [19], 'Discuss transferability of model representations; no automatic receptor/enzyme or all-model source claim.'),
    ('SekII', 'q-ggw-2-kompetenz-006', 'upper-source-information', [20, 9, 10, 11], 'Research distinct sources and retain their reliability checks; the table explicitly exemplifies broader communication duties.'),
    ('SekII', 'q-ggw-2-kompetenz-006', 'upper-source-criticism', [20, 10, 11], 'Source reliability is stated directly; attribution/intention remain broader explicit communication context, not a source ID invented by this author.'),
    ('SekII', 'ep-1-kompetenz-017', 'chemical-representation-transformation', [12], 'Transform actual spatial molecular representation into Lewis writing.'),
    ('SekII', 'q-organik-4-kompetenz-004', 'chemical-representation-transformation', [31], 'Transform a synthesis route into an explicit flow diagram; no all-synthesis subject-matter approval.'),
    ('SekII', 'q-protolyse-1-kompetenz-011', 'chemical-presentation', [21, 34], 'Research and present acid/base contexts; this is genuine shared gA/eA content, not the eA-only technical-process presentation duty.'),
]

sources = {}
input_bindings = []
for stage, name in [('SekI', 'DE_NI_CHEMIE_SEKI_KC2015'), ('SekII', 'DE_NI_CHEMIE_SEKII_KC2022')]:
    directory = 'lower-secondary' if stage == 'SekI' else 'upper-secondary'
    path = ROOT / f'curricula/DE/Gymnasium/input/NI/{directory}/source-extraction/{name}.source-extraction.json'
    source = read(path)
    sources[stage] = source
    snapshot = OWN / 'inputs' / (stage + '.exact-source-extraction.json.bin')
    snapshot.parent.mkdir(parents=True, exist_ok=True)
    snapshot.write_bytes(path.read_bytes())
    input_bindings.append({'stage': stage, 'currentSource': bind(path), 'exactSourceSnapshot': bind(snapshot), 'existingActualPrimaryPdf': bind(ROOT / source['sourceDocument']['path']), 'sourceDocument': source['sourceDocument']})

components = []
for stage, suffix, key, pages, rationale in selections:
    prefix = 'ni-chemistry-seki-kc2015-' if stage == 'SekI' else 'ni-chemistry-sekii-kc2022-'
    matching = [goal for goal in sources[stage]['sourceGoals'] if goal['id'].startswith(prefix + suffix + '-')]
    assert len(matching) == 1, (stage, suffix)
    source_goal = matching[0]
    if stage == 'SekII':
        assert source_goal['courseLevel'] == 'GK_LK', source_goal['id']
    components.append({'stage': stage, 'wholeExistingSourceGoal': source_goal, 'currentExistingSourceGoalId': source_goal['id'], 'specificCandidateKey': key, 'specificChildGoalId': routine_ids[key], 'actualPrimaryOperatorContext': [bind(OWN / 'primary' / f'NI-{stage}.physical-page-{page:03}.txt') for page in pages], 'boundedComponentRationale': rationale, 'matchType': 'partial', 'wholeOriginalSourceClosure': False, 'independentSourceApproval': False})

lower_groups = {
    '277a3c20-6082-5a95-be08-c1e386efe79b': ['sek1-model-use-criticism'],
    '49b13b33-34b7-5e4e-861c-b21082cb9922': ['data-documentation', 'lower-chemical-data-interpretation', 'data-validity'],
    '542822de-cb96-56cf-a487-0fc3b5820f57': ['chemical-applications-society', 'chemistry-career-choice'],
    '91238ba1-5c63-50c7-a4fd-9bbe492c6b61': ['lower-chemical-question-hypothesis', 'lower-guided-hypothesis-investigation', 'lower-independently-planned-hypothesis-investigation', 'own-inquiry-process-reflection'],
    'b6327e98-8ab9-5d7f-b826-4023bc1a56a7': ['sek1-source-information', 'chemical-representation-transformation', 'chemical-presentation'],
}
upper_groups = {
    '277a3c20-6082-5a95-be08-c1e386efe79b': ['upper-model-use-criticism'],
    '49b13b33-34b7-5e4e-861c-b21082cb9922': ['data-documentation', 'upper-quantitative-hypothesis-data-evaluation', 'data-validity'],
    '91238ba1-5c63-50c7-a4fd-9bbe492c6b61': ['upper-hypothesis-investigation', 'own-inquiry-process-reflection'],
    'b6327e98-8ab9-5d7f-b826-4023bc1a56a7': ['upper-source-information', 'upper-source-criticism', 'chemical-representation-transformation', 'chemical-presentation'],
}

metadata = []
for key in sorted({component['specificCandidateKey'] for component in components}):
    goal = by_goal[routine_ids[key]]
    old = deepcopy(goal['applicability'])
    goal['applicability']['jurisdiction'] = list(dict.fromkeys(old['jurisdiction'] + ['DE-NI']))
    metadata.append({'goalId': goal['id'], 'candidateKey': key, 'field': 'applicability', 'before': old, 'after': deepcopy(goal['applicability']), 'independentApproval': False})

views = read(V12 / 'actual-bounded-primary-witness-child-selections-and-remaining43-view-holds.author.json')['all43AffectedCurrentViews']
view_proposals = []
for row in views:
    if row['scope']['jurisdiction'] != 'DE-NI':
        continue
    view = read(ROOT / row['candidateBinding']['path'])
    stage = row['scope']['stage']
    groups = lower_groups if stage == 'SekI' else upper_groups
    changes = []

    def walk(nodes):
        result = []
        for original in nodes:
            node = deepcopy(original)
            if node.get('kind') == 'goalEntry' and node.get('goalId') in groups:
                keys = groups[node['goalId']]
                replacements = [{'kind': 'goalEntry', 'goalId': routine_ids[key]} for key in keys]
                result.extend(replacements)
                changes.append({'originalExactNode': node, 'explicitProposedChildNodes': replacements, 'currentWholeSourceComponentInputs': [component for component in components if component['stage'] == stage and component['specificCandidateKey'] in keys], 'fullOriginalFamilyDutyClosure': False})
                continue
            if 'children' in node:
                node['children'] = walk(node['children'])
            result.append(node)
        return result

    view['rootNodes'] = walk(view['rootNodes'])
    assert len(changes) == (5 if stage == 'SekI' else 4)
    if stage == 'SekII':
        prerequisite_keys = ['sek1-model-use-criticism', 'lower-chemical-data-interpretation', 'upper-theory-based-question-hypothesis', 'lower-chemical-question-hypothesis', 'lower-guided-hypothesis-investigation', 'lower-independently-planned-hypothesis-investigation', 'sek1-source-information']
        view['rootNodes'].append({'kind': 'structure', 'id': 'ni-b008-source-route-prerequisites-' + row['scope']['courseProfile'].lower(), 'label': 'Voraussetzungen der Quellenroutinen (Kandidatenprüfung)', 'children': [{'kind': 'goalEntry', 'goalId': routine_ids[key], 'projectionRole': 'prerequisiteOnly'} for key in prerequisite_keys]})
    target = OWN / 'source-view-candidates' / (row['viewId'] + '.bounded-author-candidate.json')
    write(target, view)
    view_proposals.append({'viewId': row['viewId'], 'scope': row['scope'], 'exactV12Before': row['candidateBinding'], 'candidateView': bind(target), 'explicitConvertedParentReplacements': changes, 'targetRoutineCount': sum(len(keys) for keys in groups.values()), 'genuineLKOnlySourceIdsProjectedIntoGK': 0, 'independentPlacementApproval': False})

mapping_proposals = []
for stage, directory in [('SekI', 'lower-secondary'), ('SekII', 'upper-secondary')]:
    current = ROOT / f'curricula/DE/Gymnasium/mapping/DE-NI/{directory}/ni_chemistry_{directory.replace("-", "_")}_source_extraction_to_canonical_chemistry.review.json'
    original = read(current)
    mapping = deepcopy(original)
    selected = [component for component in components if component['stage'] == stage]
    added = []
    existing = {(item['legacyGoalId'], item['canonicalGoalId']) for item in mapping['mappings']}
    for component in selected:
        key = (component['currentExistingSourceGoalId'], component['specificChildGoalId'])
        if key in existing:
            continue
        item = {'legacyGoalId': key[0], 'canonicalGoalId': key[1], 'matchType': 'partial', 'reviewDecisionId': key[0]}
        mapping['mappings'].append(item)
        existing.add(key)
        added.append(item)
    affected = {component['currentExistingSourceGoalId'] for component in selected}
    for decision in mapping['decisions']:
        if decision['sourceGoalId'] in affected:
            historical = deepcopy(decision)
            decision['canonicalGoalIds'] = list(dict.fromkeys(item['canonicalGoalId'] for item in mapping['mappings'] if item['legacyGoalId'] == decision['sourceGoalId']))
            decision.update({'decision': 'needs_view_placement_review', 'reviewer': None, 'reviewedAt': None, 'rationale': 'AUTHOR candidate: bounded NI stage/course primary components and exact partial child mappings need independent review; full original source and all historical target routes remain retained.', 'historicalDecisionBeforeCandidate': historical})
    mapping['reviewId'] = original['reviewId'] + '.ni-b008-author-v15'
    mapping['status'] = 'author_candidate_pending_independent_source_and_placement_review'
    mapping['summary'] = {'allHistoricalMappingsExactAndRetained': True, 'partialChildBindingsAdded': len(added), 'pendingCurrentSourceDecisionIds': sorted(affected), 'newIndependentSourceApproval': 0, 'wholeSourceIdsDeletedOrInvented': 0}
    snapshot = OWN / 'inputs' / (stage + '.exact-source-mapping.json.bin')
    snapshot.write_bytes(current.read_bytes())
    target = OWN / 'candidate-source-mappings' / (stage + '.source-mapping.author-candidate.json')
    write(target, mapping)
    assert mapping['mappings'][:len(original['mappings'])] == original['mappings']
    assert all(decision in mapping['decisions'] for decision in original['decisions'] if decision['sourceGoalId'] not in affected)
    mapping_proposals.append({'stage': stage, 'exactCurrentSourceMapping': bind(current), 'exactSnapshot': bind(snapshot), 'candidateMapping': bind(target), 'exactAddedPartialMappings': added, 'pendingActualSourceIds': sorted(affected), 'everyHistoricalFamilySourceDutyRouteRetained': True})

before_by = {goal['id']: goal for goal in before['goals']}
for goal in candidate['goals']:
    for field in ['title', 'titleEn', 'description', 'descriptionEn', 'requires', 'contains']:
        assert goal.get(field) == before_by[goal['id']].get(field)
write(OWN / 'candidate/canonical.current503-ni-source-metadata.author-candidate.json', candidate)
write(OWN / 'exact-ni-primary-stage-course-partial-components-and-view-proposals.json', {'role': 'Whole source-specific NI author inputs; partial components, not whole source closure', 'lineageV12': bind(V12 / 'author.final.freeze.json'), 'lineageV14': bind(V14 / 'author.final.freeze.json'), 'currentSourceInputs': input_bindings, 'exactWholeOriginal371NIFamilyDutiesUnchanged': ni_original, 'allNational1646OriginalDutiesRetained': True, 'wholeSourceComponentProposals': components, 'newSourceSpecificMetadata': metadata, 'threeSpecificCandidateViews': view_proposals, 'guardedSourceMappingProposals': mapping_proposals, 'fullOriginalSourceDutyClosure': False, 'all26WholeDEENBodiesAnd52MaterialCasesExact': True, 'original16NoFacetDutyRoutesStillHold': True, 'v12EightProtectedPageContextDeltasStillHold': True, 'strictGain': 0, 'activeWrites': 0, 'humanApproval': False})
print(json.dumps({'sourceSpecificComponentBindings': len(components), 'NIOriginalFamilyDutiesRetained': len(ni_original), 'threeSpecificViews': len(view_proposals), 'convertedParentNodeProposals': sum(len(row['explicitConvertedParentReplacements']) for row in view_proposals), 'sourceApplicabilityProposals': len(metadata), 'actualSourceDecisionInputsPending': sum(len(row['pendingActualSourceIds']) for row in mapping_proposals), 'allBodiesAndRelationsUnchanged': True, 'strictGain': 0}))
