# SPDX-License-Identifier: Apache-2.0
"""Inactive NW child components selected from actual primary pages, never all children."""
from copy import deepcopy
from pathlib import Path
import hashlib
import json
import re

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
V12 = OWN.parent / 'chemie-b008-current169-routing-placement-author-v12'
V15 = OWN.parent / 'chemie-b008-ni-stage-course-source-placement-author-v15'
assert not (OWN / 'author.final.freeze.json').exists()


def read(path):
    return json.loads(path.read_text())


def bind(path):
    payload = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(payload).hexdigest(), 'bytes': len(payload)}


def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


candidate = read(OWN / 'candidate/canonical.current504-rebased-before-nw.author-candidate.json')
before = deepcopy(candidate)
by_goal = {goal['id']: goal for goal in candidate['goals']}
routine_ids = read(V12 / 'current169-protected-guard-and-field-intents.author.json')['routineGoalIds']
original = read(V12 / 'exact-original1646-current-source-witness-and-primary-review-routes.author-input.json')
nw_original = [row for row in original['originalWholeDuties'] if '/NW/' in row['sourceExtractionPath']]
assert len(nw_original) == 192

# Every final-page choice below follows the actual whole physical page. Existing
# sourceGoalIds remain unchanged. A topic source only supplies the stated component;
# the whole 26 authored descriptions and all original topic duties remain open.
selections = [
    ('SekI', None, 'ed496ca9', 'lower-guided-hypothesis-investigation', 20, [17, 18], 'Actual measurement with E4/E5/K1; guided safe performance and recording, not a paper substitute.'),
    ('SekI', None, '977dc728', 'lower-independently-planned-hypothesis-investigation', 20, [17, 18], 'Actual separation experiment planning and performance; E1–E4 and K1 retain the chemical separation duty.'),
    ('SekI', None, '759d7610', 'lower-chemical-question-hypothesis', 24, [17, 18], 'Hypothesis-led oxide decomposition; question/expected-counterevidence details are own bounded operationalization.'),
    ('SekI', None, '759d7610', 'lower-independently-planned-hypothesis-investigation', 24, [18, 26], 'Only hypothesis-led planning and appropriate reagent selection; actual whole experiment competence remains a separate duty.'),
    ('SekI', None, 'b4037fbc', 'lower-chemical-question-hypothesis', 34, [26], 'Stoichiometry-led neutralisation hypotheses and actual testing; no generic topic closure.'),
    ('SekI', None, 'b4037fbc', 'lower-independently-planned-hypothesis-investigation', 34, [26], 'Actual neutralisation hypothesis testing plus E4 controlled safe planning; not a worksheet replacement.'),
    ('SekI', None, 'ed496ca9', 'data-documentation', 20, [18, 26], 'Measured substance property and K1 protocol component only.'),
    ('SekI', None, '7ddf32cf', 'data-documentation', 36, [26], 'Traceable documentation of digitally retrieved combustion measurement data; not actual own lab performance.'),
    ('SekI', None, '7ddf32cf', 'lower-chemical-data-interpretation', 36, [26], 'Compare combustion measurements, with the actual E5 hypothesis/relationship context.'),
    ('SekI', None, 'b4037fbc', 'lower-chemical-data-interpretation', 34, [26], 'Interpret the actual neutralisation test against a quantitative hypothesis; generic analysis remains a component.'),
    ('SekI', None, 'b4037fbc', 'data-validity', 34, [26], 'E5 explicitly requires possible-error reflection; the whole subject-specific test and all generic error types remain separate.'),
    ('SekI', None, 'a7bd7d36', 'sek1-model-use-criticism', 29, [26], 'Actual comparison of explanatory reach of different nuclear-shell models; no all-domain model claim.'),
    ('SekI', None, '42c2dc75', 'sek1-model-use-criticism', 33, [26, 27], 'Compare small-molecule model representations, including software; limits/revision are bounded by E6.'),
    ('SekI', None, 'e2ff06c6', 'sek1-source-information', 33, [18, 27], 'Retrieve actual digital technical-process information; retain the original industry/energy criterion duty.'),
    ('SekI', None, '308318c1', 'sek1-source-information', 35, [27], 'Critically question media claims about acid/alkaline solutions; only the information-processing component.'),
    ('SekI', None, '7ddf32cf', 'sek1-source-information', 36, [27], 'Retrieve digital combustion measurements; source quality/intention context is explicitly K2.'),
    ('SekI', None, 'e2ff06c6', 'criteria-arguments', 33, [19, 27], 'Actual information and evaluation-criterion selection; no blanket full pro/con or decision approval.'),
    ('SekI', None, '082a150a', 'criteria-arguments', 36, [27], 'Weigh product-use, economy, recyclability and environmental criteria, retaining the full product-specific duty.'),
    ('SekI', None, '9298284d', 'chemical-applications-society', 24, [8, 9], 'Metal recycling importance for resources, energy and own behaviour; no complete career-choice source.'),
    ('SekI', None, 'b3f26eec', 'chemical-applications-society', 36, [8, 9], 'Discuss fossil/regenerative energy in ecological, economic and ethical context.'),
    ('SekI', None, '082a150a', 'chemical-applications-society', 36, [8, 9], 'Actual chemical product use/environment/recycling context, not all societal applications.'),
    ('SekI', None, '42c2dc75', 'chemical-representation-transformation', 33, [18, 27], 'Compare different small-molecule representations; correct language and representation selection remain K3 context.'),
    ('SekI', None, 'f83b22c8', 'chemical-representation-transformation', 34, [27], 'Represent actual neutralisation on particle level in a digital presentation; retain its chemistry duty.'),
    ('SekI', None, 'f83b22c8', 'chemical-presentation', 34, [27], 'Explicit digital neutralisation presentation; full general audience/medium choices are own bounded operationalization.'),
    ('SekII', 'GK_LK', '25f83a8a', 'upper-theory-based-question-hypothesis', 28, [24, 33, 34], 'EF hypothesis formation supplies an initial component; actual shared Q E1–E3 add theory-led justification, not a new source ID.'),
    ('SekII', 'GK_LK', 'e895e987', 'upper-hypothesis-investigation', 30, [24, 34], 'Actually investigate controlled kinetic influences to test hypotheses; safe qualitative/quantitative protocol context stays explicit.'),
    ('SekII', 'GK', 'b14e1c36', 'upper-hypothesis-investigation', 39, [34], 'GK-specific actual hypothesis-led concentration experiment; LK analogue is independently identified, never transferred as GK evidence.'),
    ('SekII', 'LK', 'b14e1c36', 'upper-hypothesis-investigation', 48, [34], 'LK-specific concentration experiment planning; full topic duty and actual physical performance retained.'),
    ('SekII', 'GK', '8d9ab9b5', 'data-documentation', 39, [34, 35, 36], 'Actual calorimetry result and literature comparison with E5/K1 record/source context.'),
    ('SekII', 'LK', '8d9ab9b5', 'data-documentation', 48, [34, 35, 36], 'Distinct LK calorimetry source and record/literature provenance component.'),
    ('SekII', 'GK_LK', '7b750d8a', 'upper-quantitative-hypothesis-data-evaluation', 30, [24, 34], 'Graphically derive average reaction speed from actual measured data; Q E6/E8/E11 extend the bounded quantitative process.'),
    ('SekII', 'GK', 'b32bedfd', 'upper-quantitative-hypothesis-data-evaluation', 41, [34], 'GK galvanic-cell measurements and quantitative ordering; not automatic Nernst duty.'),
    ('SekII', 'LK', '7baa298c', 'upper-quantitative-hypothesis-data-evaluation', 51, [34], 'LK-only experimental-data derivation of Faraday/Nernst/Gibbs–Helmholtz; never added to GK.'),
    ('SekII', 'GK', 'dbf4b723', 'data-validity', 39, [36], 'GK actual analysis-data explanatory power, with shared B3 limits/reach context; generic error detail remains a bounded component.'),
    ('SekII', 'LK', 'dbf4b723', 'data-validity', 48, [36], 'Distinct LK analysis-data validity source; no whole source or human-performance approval.'),
    ('SekII', 'GK_LK', 'e895e987', 'own-inquiry-process-reflection', 30, [24, 34], 'EF kinetics has explicit E10; Q E10 independently requires reflection of the learner’s own results/process.'),
    ('SekII', 'GK_LK', '78432fed', 'upper-model-use-criticism', 30, [24, 34], 'Actual dynamic-equilibrium simulation with E9 model limits; receptor/enzyme and all complex-molecule domains are NOT supplied here.'),
    ('SekII', 'GK', 'f0949a94', 'upper-model-use-criticism', 45, [34], 'GK functional-polymer model and observed properties only; no general complex-domain model closure.'),
    ('SekII', 'LK', '22b68f06', 'upper-model-use-criticism', 56, [34], 'Distinct LK functional-polymer model; whole generic authored model domain still needs independent source judgment.'),
    ('SekII', 'GK_LK', '01d73256', 'upper-source-information', 31, [25, 26, 35, 36], 'Shared EF source forms/authorship/intention plus shared Q independent complex information processing and correct citations.'),
    ('SekII', 'GK_LK', '01d73256', 'upper-source-criticism', 31, [25, 26, 35, 36], 'Actual shared EF multi-source author-intention analysis and explicit Q quality/trustworthiness context.'),
    ('SekII', 'GK_LK', '8156e001', 'chemical-representation-transformation', 28, [25, 35], 'Digitally represent molecular geometry using EPA; preserve that precise chemistry/model domain.'),
    ('SekII', 'GK_LK', '6fb880bb', 'chemical-presentation', 30, [26, 36], 'Actual molecular kinetic sequence with E6/E7/E8/K11; display/media choices remain independently reviewable.'),
    ('SekII', 'GK_LK', '49deca1f', 'chemical-applications-society', 29, [27], 'Shared EF food-industry health/economy and consumption options; not a universal career or social-decision source.'),
    ('SekII', 'GK', '10aec9db', 'chemical-applications-society', 45, [36], 'GK chemical plastics applications and ecological/economic/social sustainable development.'),
    ('SekII', 'LK', '10aec9db', 'chemical-applications-society', 56, [36], 'Distinct LK plastics sustainability source; original complete topic duty retained.'),
]

sources, passages, inputs = {}, {}, []
for stage, name in [('SekI', 'DE_NW_CHEMIE_SEKI_KLP2019'), ('SekII', 'DE_NW_CHEMIE_SEKII_KLP2022')]:
    directory = 'lower-secondary' if stage == 'SekI' else 'upper-secondary'
    path = ROOT / f'curricula/DE/Gymnasium/input/NW/{directory}/source-extraction/{name}.source-extraction.json'
    extraction = read(path)
    sources[stage] = extraction
    passages[stage] = {row['id']: row for row in extraction['passages']}
    inputs.append({'stage': stage, 'exactExistingExtraction': bind(path), 'exactSnapshot': bind(OWN / 'inputs' / (stage + '.exact-nw-source-extraction.json.bin')), 'actualPrimaryPdf': bind(ROOT / extraction['sourceDocument']['path']), 'officialSourceDocument': extraction['sourceDocument']})

components, anchor_corrections = [], {}
for stage, course, suffix, key, page, contexts, rationale in selections:
    matches = [goal for goal in sources[stage]['sourceGoals'] if goal['id'].endswith('-' + suffix) and (course is None or goal['courseLevel'] == course)]
    assert len(matches) == 1, (stage, course, suffix, [x['id'] for x in matches])
    source_goal = matches[0]
    actual_text = (OWN / 'primary' / f'NW-{stage}.physical-page-{page:03}.txt').read_text()
    # Page text was actually read. Require a stable bounded scientific phrase on
    # that page, without treating this mechanical guard as scientific review.
    word_sample = re.findall(r'[A-Za-zÄÖÜäöüß]{9,}', source_goal['sourceText'])
    assert any(word in actual_text.replace('-\n', '') for word in word_sample), (source_goal['id'], page)
    original_page = passages[stage][source_goal['passageId']]['page']
    corrected = deepcopy(source_goal)
    corrected['sourceRef'] = re.sub(r'S\. \d+', f'S. {page}', corrected['sourceRef'])
    if isinstance(corrected.get('sourceSpan'), dict) and 'label' in corrected['sourceSpan']:
        corrected['sourceSpan']['label'] = re.sub(r'S\. \d+', f'S. {page}', corrected['sourceSpan']['label'])
    corrected.setdefault('metadata', {})['actualVerifiedPrimaryPhysicalPageAuthorCandidate'] = page
    corrected['metadata']['sourceAnchorIndependentApproval'] = False
    anchor_corrections[source_goal['id']] = {'stage': stage, 'sourceGoalId': source_goal['id'], 'wholeUnchangedCurrentSourceGoal': source_goal, 'wholeCorrectedAnchorCandidate': corrected, 'originalPassageStartPage': original_page, 'actualWholeBulletPrimaryPhysicalPage': page, 'actualPrimaryPage': bind(OWN / 'primary' / f'NW-{stage}.physical-page-{page:03}.txt'), 'independentApproval': False, 'sourceGoalTextChanged': False}
    components.append({'stage': stage, 'actualCourseLevel': source_goal['courseLevel'], 'wholeUnchangedCurrentSourceGoal': source_goal, 'wholeCurrentPassage': passages[stage][source_goal['passageId']], 'currentExistingSourceGoalId': source_goal['id'], 'specificCandidateKey': key, 'specificChildGoalId': routine_ids[key], 'actualPrimaryPhysicalPage': page, 'actualWholePrimaryPage': bind(OWN / 'primary' / f'NW-{stage}.physical-page-{page:03}.txt'), 'actualBoundedGeneralOperatorContexts': [bind(OWN / 'primary' / f'NW-{stage}.physical-page-{p:03}.txt') for p in contexts], 'boundedComponentRationale': rationale, 'matchType': 'partial', 'wholeOriginalSourceClosure': False, 'independentSourceApproval': False})

lower_groups = {
    '277a3c20-6082-5a95-be08-c1e386efe79b': ['sek1-model-use-criticism'],
    '49b13b33-34b7-5e4e-861c-b21082cb9922': ['data-documentation', 'lower-chemical-data-interpretation', 'data-validity'],
    '542822de-cb96-56cf-a487-0fc3b5820f57': ['chemical-applications-society'],
    '91238ba1-5c63-50c7-a4fd-9bbe492c6b61': ['lower-chemical-question-hypothesis', 'lower-guided-hypothesis-investigation', 'lower-independently-planned-hypothesis-investigation'],
    'b6327e98-8ab9-5d7f-b826-4023bc1a56a7': ['sek1-source-information', 'criteria-arguments', 'chemical-representation-transformation', 'chemical-presentation'],
}
upper_groups = {
    '277a3c20-6082-5a95-be08-c1e386efe79b': ['upper-model-use-criticism'],
    '49b13b33-34b7-5e4e-861c-b21082cb9922': ['data-documentation', 'upper-quantitative-hypothesis-data-evaluation', 'data-validity'],
    '542822de-cb96-56cf-a487-0fc3b5820f57': ['chemical-applications-society'],
    '91238ba1-5c63-50c7-a4fd-9bbe492c6b61': ['upper-theory-based-question-hypothesis', 'upper-hypothesis-investigation', 'own-inquiry-process-reflection'],
    'b6327e98-8ab9-5d7f-b826-4023bc1a56a7': ['upper-source-information', 'upper-source-criticism', 'chemical-representation-transformation', 'chemical-presentation'],
}

metadata = []
for key in sorted({row['specificCandidateKey'] for row in components}):
    goal = by_goal[routine_ids[key]]
    old = deepcopy(goal['applicability'])
    goal['applicability']['jurisdiction'] = list(dict.fromkeys(old['jurisdiction'] + ['DE-NW']))
    metadata.append({'goalId': goal['id'], 'candidateKey': key, 'field': 'applicability', 'before': old, 'after': deepcopy(goal['applicability']), 'status': 'author_candidate_pending_independent_source_placement_review'})

old_compile = read(V15 / 'actual-native43-source-view-findings-and-three-real-pure-models.json')
views = []
for row in old_compile['actual43SourceViews']:
    if row['scope']['jurisdiction'] != 'DE-NW':
        continue
    before_path = ROOT / row['afterViewBinding']['path']
    view = read(before_path)
    stage = row['scope']['stage']
    profile = row['scope'].get('courseProfile')
    groups = lower_groups if stage == 'SekI' else upper_groups
    changes = []

    def walk(nodes):
        result = []
        for original_node in nodes:
            node = deepcopy(original_node)
            if node.get('kind') == 'goalEntry' and node.get('goalId') in groups:
                keys = groups[node['goalId']]
                source_components = [item for item in components if item['stage'] == stage and item['specificCandidateKey'] in keys and (stage == 'SekI' or item['actualCourseLevel'] in ['GK_LK', profile])]
                assert {item['specificCandidateKey'] for item in source_components} == set(keys)
                replacements = [{'kind': 'goalEntry', 'goalId': routine_ids[key]} for key in keys]
                result.extend(replacements)
                changes.append({'wholeOriginalParentNode': node, 'explicitSourceSpecificChildren': replacements, 'actualCourseAdmissibleWholeSourceComponents': source_components, 'wholeFamilyDutyClosure': False})
                continue
            if 'children' in node:
                node['children'] = walk(node['children'])
            result.append(node)
        return result

    view['rootNodes'] = walk(view['rootNodes'])
    assert len(changes) == 5
    prerequisite_keys = [] if stage == 'SekI' else ['sek1-model-use-criticism', 'lower-chemical-data-interpretation', 'lower-chemical-question-hypothesis', 'lower-guided-hypothesis-investigation', 'lower-independently-planned-hypothesis-investigation', 'sek1-source-information']
    if prerequisite_keys:
        view['rootNodes'].append({'kind': 'structure', 'id': 'nw-b008-source-route-prerequisites-' + profile.lower(), 'label': 'Voraussetzungen der Quellenroutinen (Kandidatenprüfung)', 'children': [{'kind': 'goalEntry', 'goalId': routine_ids[key], 'projectionRole': 'prerequisiteOnly'} for key in prerequisite_keys]})
    target = OWN / 'source-view-candidates' / (row['viewId'] + '.bounded-author-candidate.json')
    write(target, view)
    views.append({'viewId': row['viewId'], 'scope': row['scope'], 'beforeExactView': bind(before_path), 'candidateView': bind(target), 'fiveExplicitParentReplacements': changes, 'targetRoutineCount': sum(len(keys) for keys in groups.values()), 'prerequisiteOnlyRoutineCount': len(prerequisite_keys), 'GKUsesLKOnlySourceIds': False, 'independentPlacementApproval': False})

mapping_proposals = []
for stage, directory in [('SekI', 'lower-secondary'), ('SekII', 'upper-secondary')]:
    paths = list((ROOT / f'curricula/DE/Gymnasium/mapping/DE-NW/{directory}').glob('*chemistry*source_extraction*review.json'))
    assert len(paths) == 1, paths
    path = paths[0]
    original_mapping = read(path)
    mapping = deepcopy(original_mapping)
    selected = [row for row in components if row['stage'] == stage]
    seen = {(row['legacyGoalId'], row['canonicalGoalId']) for row in mapping['mappings']}
    added = []
    for component in selected:
        key = (component['currentExistingSourceGoalId'], component['specificChildGoalId'])
        if key not in seen:
            item = {'legacyGoalId': key[0], 'canonicalGoalId': key[1], 'matchType': 'partial', 'reviewDecisionId': key[0]}
            mapping['mappings'].append(item)
            added.append(item)
            seen.add(key)
    affected = {row['currentExistingSourceGoalId'] for row in selected}
    for decision in mapping['decisions']:
        if decision['sourceGoalId'] in affected:
            historical = deepcopy(decision)
            decision['canonicalGoalIds'] = list(dict.fromkeys(row['canonicalGoalId'] for row in mapping['mappings'] if row['legacyGoalId'] == decision['sourceGoalId']))
            decision.update({'decision': 'needs_view_placement_review', 'reviewer': None, 'reviewedAt': None, 'rationale': 'AUTHOR candidate: actual NW physical-page/operator/course components and partial child bindings require independent review. Exact historical family duties and source IDs remain retained; whole-source closure is not claimed.', 'historicalDecisionBeforeCandidate': historical})
    mapping['reviewId'] = original_mapping['reviewId'] + '.nw-b008-author-v16'
    mapping['status'] = 'author_candidate_pending_independent_source_and_placement_review'
    mapping['summary'] = {'allHistoricalMappingsExactAndRetained': True, 'partialChildBindingsAdded': len(added), 'pendingCurrentSourceDecisionIds': sorted(affected), 'newIndependentSourceApproval': 0, 'wholeSourceIdsDeletedOrInvented': 0}
    snapshot = OWN / 'inputs' / (stage + '.exact-nw-source-mapping.json.bin')
    snapshot.write_bytes(path.read_bytes())
    target = OWN / 'candidate-source-mappings' / (stage + '.source-mapping.author-candidate.json')
    write(target, mapping)
    assert mapping['mappings'][:len(original_mapping['mappings'])] == original_mapping['mappings']
    assert all(decision in mapping['decisions'] for decision in original_mapping['decisions'] if decision['sourceGoalId'] not in affected)
    extraction_candidate = deepcopy(sources[stage])
    extraction_candidate['sourceGoals'] = [anchor_corrections[row['id']]['wholeCorrectedAnchorCandidate'] if row['id'] in anchor_corrections else row for row in extraction_candidate['sourceGoals']]
    # Passage ranges remain historical whole passages. A single bullet anchor may
    # lie on a continuation page; it must never shift every other bullet blindly.
    extraction_target = OWN / 'candidate-source-extractions' / (stage + '.source-extraction.targeted-anchor.author-candidate.json')
    write(extraction_target, extraction_candidate)
    mapping_proposals.append({'stage': stage, 'exactCurrentMapping': bind(path), 'exactSnapshot': bind(snapshot), 'candidateMapping': bind(target), 'exactAddedPartialMappings': added, 'pendingActualSourceIds': sorted(affected), 'targetedSourceAnchorCandidate': bind(extraction_target), 'historicalMappingsRetained': True, 'newSourceApproval': 0})

by_before = {goal['id']: goal for goal in before['goals']}
for goal in candidate['goals']:
    assert {k: v for k, v in goal.items() if k != 'applicability'} == {k: v for k, v in by_before[goal['id']].items() if k != 'applicability'}
write(OWN / 'candidate/canonical.current504-nw-source-metadata.author-candidate.json', candidate)
write(OWN / 'exact-nw-primary-course-components-and-three-view-proposals.author.json', {'role': 'Neutral whole NW source inputs and partial child-placement author proposals; not source closure', 'current480ThreeWayRebase': bind(OWN / 'current480-three-way-bounded-field-rebase.actual.json'), 'immutableOriginal192NWDuties': nw_original, 'immutableAll1646OriginalDuties': bind(V12 / 'exact-original1646-current-source-witness-and-primary-review-routes.author-input.json'), 'sourceInputs': inputs, 'specificPartialChildComponents': components, 'targetedWholeSourceGoalAnchorCorrections': list(anchor_corrections.values()), 'explicitSourceMetadataProposals': metadata, 'threeSpecificCandidateViews': views, 'guardedSourceMappingProposals': mapping_proposals, 'wholeOriginalSourceClosure': False, 'careerChoiceWholeSourceCoverage': False, 'upperAllComplexModelDomainsSourceCoverage': False, 'newSourceIds': 0, 'newImages': 0, 'strictGain': 0, 'activeWrites': 0, 'humanApproval': False})
print(json.dumps({'current480RebasedCandidate': 504, 'NWOriginalDutiesRetained': len(nw_original), 'partialComponents': len(components), 'sourceAnchorCandidates': len(anchor_corrections), 'routineMetadataCandidates': len(metadata), 'sourceViewCandidates': len(views), 'strictGain': 0}))
