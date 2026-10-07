# SPDX-License-Identifier: Apache-2.0
"""Inactive ST gAN/eAN components; the two-hour elective remains a separate HOLD."""
from copy import deepcopy
from pathlib import Path
import hashlib
import json
import re

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
V12 = OWN.parent / 'chemie-b008-current169-routing-placement-author-v12'
V16 = OWN.parent / 'chemie-b008-nw-current480-source-placement-author-v16'
assert not (OWN / 'author.final.freeze.json').exists()


def read(path):
    return json.loads(path.read_text())


def bind(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


for payload in read(V16 / 'author.final.freeze.json')['payloads']:
    assert bind(ROOT / payload['path']) == payload
guard = read(V16 / 'current480-three-way-bounded-field-rebase.actual.json')
assert bind(ROOT / guard['current480']['path']) == guard['current480']
candidate = read(V16 / 'candidate/canonical.current504-nw-source-metadata.author-candidate.json')
before = deepcopy(candidate)
by_goal = {goal['id']: goal for goal in candidate['goals']}
routine_ids = read(V12 / 'current169-protected-guard-and-field-intents.author.json')['routineGoalIds']
original = read(V12 / 'exact-original1646-current-source-witness-and-primary-review-routes.author-input.json')
st_original = [row for row in original['originalWholeDuties'] if '/ST/' in row['sourceExtractionPath']]
assert len(st_original) == 423

selections = [
    ('lower', '8890f0b9', 'lower-guided-hypothesis-investigation', 20, [11, 12], 'Actual guided experiments with safety; hypothesis linkage is an own component, not a verbatim whole grade-7/8 requirement.'),
    ('lower', 'abd2a19d', 'lower-guided-hypothesis-investigation', 24, [11], 'Actually perform, evaluate and digitally record the detailed water investigation.'),
    ('lower', '5a907b98', 'lower-independently-planned-hypothesis-investigation', 29, [11, 12], 'Real self-planned and performed acid/base/salt experiments, with the general inquiry progression retained separately.'),
    ('lower', '10073a67', 'lower-independently-planned-hypothesis-investigation', 29, [11, 12], 'Guided planning plus self-performed carbonate/CO2 detection and protocol; original specific detection obligation stays whole.'),
    ('lower', '5a907b98', 'lower-chemical-question-hypothesis', 29, [11, 12], 'The subject experiment supplies an inquiry-planning component; the end-EF question/hypothesis standard is a transparent progression context, not a claim that every subdetail is mandatory in grade7/8.'),
    ('lower', 'abd2a19d', 'data-documentation', 24, [12, 16], 'Actual experiment digital protocol component, not simulated learner performance.'),
    ('lower', 'deed7604', 'data-documentation', 29, [13, 14], 'Experimental work recorded in specialist language; observation and interpretation stay separate on the actual page.'),
    ('lower', 'abd2a19d', 'lower-chemical-data-interpretation', 24, [12, 16], 'Evaluate actual water experiments; quantitative relationships and hypotheses remain bounded generic components.'),
    ('lower', '3136cee6', 'lower-chemical-data-interpretation', 30, [12, 16], 'Actually evaluate performed substitution/addition experiments; full organic topic duty is retained.'),
    ('lower', '7a82f2bf', 'sek1-model-use-criticism', 30, [10, 11, 12], 'Appropriate carbon-modification models and observed properties only; generic model criticism remains an independently reviewable component.'),
    ('lower', 'cccfe3c6', 'sek1-model-use-criticism', 24, [10, 11, 12], 'Use models for water/hydrogen/salt bonding; no all-model-domain source closure.'),
    ('lower', '0b973175', 'sek1-source-information', 20, [13, 16], 'Research actual substance-property information; end-EF autonomous quality checks do not become a full grade7/8 blanket claim.'),
    ('lower', '4f1fd17f', 'sek1-source-information', 30, [13, 15], 'Explicit critical check of selected-media information in its specialist context.'),
    ('lower', '02c7a938', 'sek1-source-information', 32, [13], 'The whole ethanol source explicitly contains autonomous multi-media research and critical checking; its other component duties are retained.'),
    ('lower', '02c7a938', 'chemical-representation-transformation', 32, [14], 'Explicit translation between everyday and specialist language in actual ethanol contexts.'),
    ('lower', '6be7c3be', 'chemical-representation-transformation', 30, [14, 16], 'Represent hydrocarbons through actual models/3D animations; no automatic mastery of all chemical model types.'),
    ('lower', '8ee31f39', 'chemical-presentation', 20, [13], 'Actually present experimental observations; general audience/medium choices remain an authored bounded component.'),
    ('lower', '02c7a938', 'chemical-presentation', 32, [13, 16], 'Actual topic explicitly includes correct documentary and presentation performance.'),
    ('lower', '553c3645', 'chemical-applications-society', 20, [4, 5, 15], 'Actual chemistry applications/products; no whole personal career-choice requirement.'),
    ('lower', 'f7c049a0', 'chemical-applications-society', 31, [4, 5, 15, 17], 'Real primary continuation page31: fossil/biogas energy under ecological/economic/social aspects. Original passage page30 is preserved as history.'),
    ('gAN', '40095541', 'upper-theory-based-question-hypothesis', 40, [11, 12, 17, 18], 'Specific independent gAN titration inquiry plus actual theoretical/inquiry progression; no invented operator source ID.'),
    ('eAN', '40095541', 'upper-theory-based-question-hypothesis', 49, [11, 12, 17, 18], 'Distinct eAN experiment source and theory/inquiry context; not transferred into gAN.'),
    ('gAN', '40095541', 'upper-hypothesis-investigation', 40, [11, 12, 17, 18], 'Actual compulsory self-planned and performed gAN acid/base experiments, with real safety/protocol requirements.'),
    ('eAN', '40095541', 'upper-hypothesis-investigation', 49, [11, 12, 17, 18], 'Distinct actual eAN compulsory experiments; full Titration/Puffer duties retained.'),
    ('eAN', 'a4bf686e', 'upper-hypothesis-investigation', 53, [11, 12, 17, 18], 'Actual eAN-only practicum with environmental/safety constraints; never projected as a gAN practicum obligation.'),
    ('gAN', '93427eb1', 'data-documentation', 40, [12, 16], 'gAN actual titration protocol; all titration chemistry remains separately required.'),
    ('eAN', '5e5fc696', 'data-documentation', 49, [12, 16], 'Distinct eAN titration course/results documented and presented.'),
    ('eAN', '1a694139', 'data-documentation', 53, [12, 16], 'eAN-only practicum: record and store real measured values digitally.'),
    ('gAN', 'd1409cbc', 'upper-quantitative-hypothesis-data-evaluation', 38, [12, 16], 'gAN computation results interpreted and diagrammed; general theory/relationships context is explicitly separate.'),
    ('gAN', 'f37b5cf9', 'upper-quantitative-hypothesis-data-evaluation', 39, [12, 16], 'gAN equilibrium actually investigated and digitally evaluated; no all-complex-hypothesis case closure.'),
    ('eAN', '98bb2108', 'upper-quantitative-hypothesis-data-evaluation', 49, [12, 16], 'eAN titration curves displayed and evaluated with spreadsheets; this exact eAN-only example is not a gAN requirement.'),
    ('eAN', '1a694139', 'upper-quantitative-hypothesis-data-evaluation', 53, [12, 16], 'eAN-only actual digital-measurement practicum and graph interpretation.'),
    ('gAN', '40095541', 'data-validity', 40, [11, 12, 15], 'Validity/reach is a bounded reflection component of self-performed inquiry; generic measurement-error completeness is not verbatim claimed.'),
    ('eAN', '83deadf9', 'data-validity', 53, [11, 12, 15], 'eAN-only explicit reflected qualitative/quantitative real experiment evaluation; whole generic validity goal still requires judgment.'),
    ('gAN', '40095541', 'own-inquiry-process-reflection', 40, [11, 12], 'Actual own planned/performed/evaluated gAN inquiry with Q reflection context; no claim that E1 paper work is real performance.'),
    ('eAN', '83deadf9', 'own-inquiry-process-reflection', 53, [11, 12, 17], 'Actual eAN practicum explicitly requires experiment reflection.'),
    ('gAN', 'bfd33c4a', 'upper-model-use-criticism', 39, [11, 12], 'Actual gAN equilibrium model experiment/table/spreadsheet/simulation; complex receptor/enzyme domains are not supplied.'),
    ('eAN', 'bfd33c4a', 'upper-model-use-criticism', 47, [11, 12], 'Distinct eAN equilibrium model investigation only; no all-model-domain claim.'),
    ('gAN', 'cf71a27a', 'upper-source-information', 44, [6, 13, 15, 16], 'gAN autonomous multi-source research about chemistry society/food/energy.'),
    ('eAN', 'cf71a27a', 'upper-source-information', 54, [6, 13, 15, 16], 'Distinct eAN autonomous sources/chemistry society duty.'),
    ('eAN', 'c2f043dc', 'upper-source-information', 53, [6, 13], 'eAN-only practicum multi-source information selection; not part of gAN compulsory practicum.'),
    ('gAN', 'cf71a27a', 'upper-source-criticism', 44, [13, 15, 16], 'gAN concrete multiple-source context plus actual common critical/trustworthy-source standard; whole author/intention subdetail remains a partial component.'),
    ('eAN', 'cf71a27a', 'upper-source-criticism', 54, [13, 15, 16], 'Distinct eAN multiple-source context; no new full source-quality gate claimed.'),
    ('gAN', '58226ff9', 'chemical-representation-transformation', 44, [13, 14, 16], 'gAN explicitly transform a mechanism into a scheme using specialist and sign language; full mechanism duty retained.'),
    ('eAN', '58226ff9', 'chemical-representation-transformation', 54, [13, 14, 16], 'Distinct eAN mechanism schema; higher eAN mechanism breadth is not merged into gAN.'),
    ('gAN', 'f570ba7f', 'chemical-presentation', 39, [13, 16], 'gAN calculation results explicitly interpreted and digitally presented.'),
    ('eAN', 'f570ba7f', 'chemical-presentation', 47, [13, 16], 'Distinct eAN digital presentation of calculation results.'),
    ('gAN', 'cf71a27a', 'chemical-applications-society', 44, [4, 5, 15, 17], 'gAN actual societal relevance of organic chemistry and sustainable food/energy applications.'),
    ('eAN', 'cf71a27a', 'chemical-applications-society', 54, [4, 5, 15, 17], 'Distinct eAN society/applications source; original whole nutrition/energy source still retained.'),
    ('gAN', '0200eba0', 'chemistry-career-choice', 44, [5, 15, 17], 'gAN explicit society/chemical-industry career links supply only the career-information component, not whole personal choice mastery.'),
    ('eAN', '0200eba0', 'chemistry-career-choice', 54, [5, 15, 17], 'Distinct eAN society/career-link source; whole comparison and personal-choice routine remains unapproved.'),
]

sources, passages, source_inputs = {}, {}, []
for stage, directory, name in [('SekI', 'lower-secondary', 'DE_ST_CHEMIE_SEKI_FACHLEHRPLAN_GYMNASIUM_2022'), ('SekII', 'upper-secondary', 'DE_ST_CHEMIE_SEKII_FACHLEHRPLAN_GYMNASIUM_2022')]:
    path = ROOT / f'curricula/DE/Gymnasium/input/ST/{directory}/source-extraction/{name}.source-extraction.json'
    source = read(path)
    sources[stage] = source
    passages[stage] = {row['id']: row for row in source['passages']}
    source_inputs.append({'stage': stage, 'exactCurrentExtraction': bind(path), 'exactSnapshot': bind(OWN / 'inputs' / (directory + '.exact-st-source-extraction.json.bin')), 'actualPrimaryPdf': bind(ROOT / source['sourceDocument']['path']), 'officialSourceDocument': source['sourceDocument']})

components, anchors = [], {}
for lane, suffix, key, page, contexts, rationale in selections:
    stage = 'SekI' if lane == 'lower' else 'SekII'
    candidates = [goal for goal in sources[stage]['sourceGoals'] if goal['id'].endswith('-' + suffix) and (lane == 'lower' or ('-gan-' if lane == 'gAN' else '-ean-') in goal['id'])]
    assert len(candidates) == 1, (lane, suffix)
    source_goal = candidates[0]
    assert 'wahlpflichtfach' not in source_goal['id']
    if stage == 'SekII':
        assert source_goal['courseLevel'] == ('GK' if lane == 'gAN' else 'LK')
    text = (OWN / 'primary' / f'ST.physical-page-{page:03}.txt').read_text().replace('-\n', '')
    words = re.findall(r'[A-Za-zÄÖÜäöüß]{9,}', source_goal['parentBulletText'])
    assert any(word in text for word in words), (source_goal['id'], page)
    current_page = int(re.search(r'PDF-S\. (\d+)', source_goal['sourceSpan']).group(1))
    if current_page != page:
        corrected = deepcopy(source_goal)
        for field in ['sourceSpan', 'sourceRef']:
            corrected[field] = re.sub(r'PDF-S\. \d+', f'PDF-S. {page}', corrected[field])
        anchors[source_goal['id']] = {'stage': stage, 'wholeCurrentSourceGoal': source_goal, 'wholeTargetedAnchorCandidate': corrected, 'originalPage': current_page, 'actualPage': page, 'actualWholePrimaryPage': bind(OWN / 'primary' / f'ST.physical-page-{page:03}.txt'), 'originalRawSourceFieldsUnchanged': True, 'independentApproval': False}
    components.append({'stage': stage, 'actualSourceLane': lane, 'actualCourseLevel': source_goal['courseLevel'], 'wholeUnchangedCurrentSourceGoal': source_goal, 'wholeCurrentPassage': passages[stage][source_goal['passageId']], 'currentExistingSourceGoalId': source_goal['id'], 'specificCandidateKey': key, 'specificChildGoalId': routine_ids[key], 'actualPrimaryPhysicalPage': page, 'actualWholePrimaryPage': bind(OWN / 'primary' / f'ST.physical-page-{page:03}.txt'), 'actualBoundedGeneralOperatorContexts': [bind(OWN / 'primary' / f'ST.physical-page-{p:03}.txt') for p in contexts], 'boundedComponentRationale': rationale, 'matchType': 'partial', 'wholeOriginalSourceClosure': False, 'independentSourceApproval': False})

lower_groups = {
    '277a3c20-6082-5a95-be08-c1e386efe79b': ['sek1-model-use-criticism'],
    '49b13b33-34b7-5e4e-861c-b21082cb9922': ['data-documentation', 'lower-chemical-data-interpretation'],
    '542822de-cb96-56cf-a487-0fc3b5820f57': ['chemical-applications-society'],
    '91238ba1-5c63-50c7-a4fd-9bbe492c6b61': ['lower-chemical-question-hypothesis', 'lower-guided-hypothesis-investigation', 'lower-independently-planned-hypothesis-investigation'],
    'b6327e98-8ab9-5d7f-b826-4023bc1a56a7': ['sek1-source-information', 'chemical-representation-transformation', 'chemical-presentation'],
}
upper_groups = {
    '277a3c20-6082-5a95-be08-c1e386efe79b': ['upper-model-use-criticism'],
    '49b13b33-34b7-5e4e-861c-b21082cb9922': ['data-documentation', 'upper-quantitative-hypothesis-data-evaluation', 'data-validity'],
    '542822de-cb96-56cf-a487-0fc3b5820f57': ['chemical-applications-society', 'chemistry-career-choice'],
    '91238ba1-5c63-50c7-a4fd-9bbe492c6b61': ['upper-theory-based-question-hypothesis', 'upper-hypothesis-investigation', 'own-inquiry-process-reflection'],
    'b6327e98-8ab9-5d7f-b826-4023bc1a56a7': ['upper-source-information', 'upper-source-criticism', 'chemical-representation-transformation', 'chemical-presentation'],
}
metadata = []
for key in sorted({row['specificCandidateKey'] for row in components}):
    goal = by_goal[routine_ids[key]]
    previous = deepcopy(goal['applicability'])
    goal['applicability']['jurisdiction'] = list(dict.fromkeys(previous['jurisdiction'] + ['DE-ST']))
    metadata.append({'goalId': goal['id'], 'candidateKey': key, 'field': 'applicability', 'before': previous, 'after': deepcopy(goal['applicability']), 'status': 'author_candidate_pending_independent_source_placement_review'})

old_compile = read(V16 / 'actual-native43-source-view-findings-three-NW-models-and-current173-contexts.json')
view_proposals = []
for row in old_compile['actual43SourceViews']:
    if row['scope']['jurisdiction'] != 'DE-ST':
        continue
    before_path = ROOT / row['afterViewBinding']['path']
    view = read(before_path)
    stage = row['scope']['stage']
    profile = row['scope'].get('courseProfile')
    groups = lower_groups if stage == 'SekI' else upper_groups
    lane = 'lower' if stage == 'SekI' else ('gAN' if profile == 'GK' else 'eAN')
    changes = []

    def walk(nodes):
        result = []
        for old in nodes:
            node = deepcopy(old)
            if node.get('kind') == 'goalEntry' and node.get('goalId') in groups:
                keys = groups[node['goalId']]
                selected = [item for item in components if item['actualSourceLane'] == lane and item['specificCandidateKey'] in keys]
                assert {item['specificCandidateKey'] for item in selected} == set(keys)
                replacement = [{'kind': 'goalEntry', 'goalId': routine_ids[key]} for key in keys]
                result.extend(replacement)
                changes.append({'wholeOriginalParentNode': node, 'explicitSourceSpecificChildren': replacement, 'actualCourseAdmissibleWholeSourceComponents': selected, 'wholeFamilyDutyClosure': False})
                continue
            if 'children' in node:
                node['children'] = walk(node['children'])
            result.append(node)
        return result

    view['rootNodes'] = walk(view['rootNodes'])
    assert len(changes) == 5
    prerequisite_keys = [] if stage == 'SekI' else ['sek1-model-use-criticism', 'lower-chemical-data-interpretation', 'lower-chemical-question-hypothesis', 'lower-guided-hypothesis-investigation', 'lower-independently-planned-hypothesis-investigation', 'sek1-source-information']
    if prerequisite_keys:
        view['rootNodes'].append({'kind': 'structure', 'id': 'st-b008-source-route-prerequisites-' + profile.lower(), 'label': 'Voraussetzungen der Quellenroutinen (Kandidatenprüfung)', 'children': [{'kind': 'goalEntry', 'goalId': routine_ids[key], 'projectionRole': 'prerequisiteOnly'} for key in prerequisite_keys]})
    target = OWN / 'source-view-candidates' / (row['viewId'] + '.bounded-author-candidate.json')
    write(target, view)
    view_proposals.append({'viewId': row['viewId'], 'scope': row['scope'], 'actualSelectedSourceLane': lane, 'beforeExactView': bind(before_path), 'candidateView': bind(target), 'fiveExplicitParentReplacements': changes, 'targetRoutineCount': sum(len(keys) for keys in groups.values()), 'prerequisiteOnlyRoutineCount': len(prerequisite_keys), 'GKUsesLKOnlySourceIds': False, 'GKUsesTwoHourElectiveSourceIds': False, 'independentPlacementApproval': False})

mapping_proposals = []
for stage, directory in [('SekI', 'lower-secondary'), ('SekII', 'upper-secondary')]:
    paths = list((ROOT / f'curricula/DE/Gymnasium/mapping/DE-ST/{directory}').glob('*chemistry*source_extraction*review.json'))
    assert len(paths) == 1, paths
    path = paths[0]
    existing = read(path)
    mapping = deepcopy(existing)
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
            decision.update({'decision': 'needs_view_placement_review', 'reviewer': None, 'reviewedAt': None, 'rationale': 'AUTHOR candidate: actual ST grade/course/primary components need independent review. All whole historical family duties and source IDs remain retained. The two-hour elective is not silently gAN; no full source closure claimed.', 'historicalDecisionBeforeCandidate': historical})
    mapping['reviewId'] = existing['reviewId'] + '.st-b008-author-v17'
    mapping['status'] = 'author_candidate_pending_independent_source_and_placement_review'
    mapping['summary'] = {'allHistoricalMappingsExactAndRetained': True, 'partialChildBindingsAdded': len(added), 'pendingCurrentSourceDecisionIds': sorted(affected), 'newIndependentSourceApproval': 0, 'wholeSourceIdsDeletedOrInvented': 0}
    snapshot = OWN / 'inputs' / (stage + '.exact-st-source-mapping.json.bin')
    snapshot.write_bytes(path.read_bytes())
    target = OWN / 'candidate-source-mappings' / (stage + '.source-mapping.author-candidate.json')
    write(target, mapping)
    assert mapping['mappings'][:len(existing['mappings'])] == existing['mappings']
    assert all(decision in mapping['decisions'] for decision in existing['decisions'] if decision['sourceGoalId'] not in affected)
    extraction_candidate = deepcopy(sources[stage])
    extraction_candidate['sourceGoals'] = [anchors[row['id']]['wholeTargetedAnchorCandidate'] if row['id'] in anchors else row for row in extraction_candidate['sourceGoals']]
    extraction_path = OWN / 'candidate-source-extractions' / (stage + '.source-extraction.targeted-anchor.author-candidate.json')
    write(extraction_path, extraction_candidate)
    mapping_proposals.append({'stage': stage, 'exactCurrentMapping': bind(path), 'exactSnapshot': bind(snapshot), 'candidateMapping': bind(target), 'exactAddedPartialMappings': added, 'pendingActualSourceIds': sorted(affected), 'targetedSourceAnchorCandidate': bind(extraction_path), 'historicalMappingsRetained': True, 'newSourceApproval': 0})

by_before = {goal['id']: goal for goal in before['goals']}
for goal in candidate['goals']:
    assert {k: v for k, v in goal.items() if k != 'applicability'} == {k: v for k, v in by_before[goal['id']].items() if k != 'applicability'}
write(OWN / 'candidate/canonical.current504-st-source-metadata.author-candidate.json', candidate)
elective = [row for row in st_original if 'wahlpflichtfach' in row['sourceGoalId']]
write(OWN / 'exact-st-primary-course-components-and-three-view-proposals.author.json', {'role': 'Neutral complete ST partial source/grade/course author inputs, not whole source closure', 'sealedV16': bind(V16 / 'author.final.freeze.json'), 'current480ThreeWayRebase': bind(V16 / 'current480-three-way-bounded-field-rebase.actual.json'), 'immutableOriginal423STDuties': st_original, 'immutableAll1646OriginalDuties': bind(V12 / 'exact-original1646-current-source-witness-and-primary-review-routes.author-input.json'), 'sourceInputs': source_inputs, 'specificPartialChildComponents': components, 'targetedWholeSourceGoalAnchorCorrections': list(anchors.values()), 'explicitSourceMetadataProposals': metadata, 'threeSpecificCandidateViews': view_proposals, 'guardedSourceMappingProposals': mapping_proposals, 'twoHourElectiveOriginalDutyHolds': elective, 'threeHourElectiveEqualsGANDirectFootnote': bind(OWN / 'primary/ST.physical-page-019.txt'), 'twoHourElectiveIsNotAutomaticallyGAN': True, 'grade10IsExplicitEFNotRelabeled': True, 'careerChoiceWholeSourceCoverage': False, 'upperAllComplexModelDomainsSourceCoverage': False, 'wholeOriginalSourceClosure': False, 'newSourceIds': 0, 'newImages': 0, 'strictGain': 0, 'activeWrites': 0, 'humanApproval': False})
print(json.dumps({'sealedBaseWhole504': True, 'STOriginalDutiesRetained': len(st_original), 'partialComponents': len(components), 'sourceAnchorCandidates': len(anchors), 'routineMetadataCandidates': len(metadata), 'sourceViewCandidates': len(view_proposals), 'twoHourElectiveOriginalDutyHolds': len(elective), 'strictGain': 0}))
