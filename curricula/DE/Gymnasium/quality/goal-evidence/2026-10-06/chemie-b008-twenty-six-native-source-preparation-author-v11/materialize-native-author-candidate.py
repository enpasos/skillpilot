#!/usr/bin/env python3
"""Concrete inert B008 IDs, graph, exact reviewed materials and partial sources."""
from collections import defaultdict
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import uuid

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]
BASE = HERE.parent
QA = HERE / 'qa-artifacts'
assert not (HERE / 'native-source-preparation-author-v11.final.freeze.json').exists(), 'Sealed history must not be rewritten'
QA.mkdir(exist_ok=True)
STAMP = datetime.now(timezone.utc).isoformat()
V7 = BASE / 'chemie-b008-twenty-six-literal-operator-prerequisite-author-v7'
V8 = BASE / 'chemie-b008-twenty-six-positive-materials-author-v8'
V10 = BASE / 'chemie-b008-colour-calibration-domain-targeted-author-v10'
ORIGIN = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b008-nine-source-operator-structural-current-author-candidate-v3'
CANON = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
KINDS = ROOT / 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
VQA = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'


def read(path):
    return json.loads(path.read_text())


def bind(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def valhash(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True).encode()).hexdigest()


def dump(path, value):
    assert path.is_relative_to(HERE)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


for path, expected in [(CANON, '764c11d951d28be38709d8b01b5eb6d4b3be71e87d9daf5ea4d1dc46f67529a0'),
                       (KINDS, 'd16aa527265d69c200be7ebd7e7f664a9d6b273af4f8fded64c43b286b5e0f54'),
                       (VQA, '9eda9bf03bfc2139e999c469fe3be7532ed3abab80673b6313483eb40d0c0e55')]:
    assert bind(path)['sha256'] == expected
original = read(CANON)
candidate = deepcopy(original)
by_id = {goal['id']: goal for goal in candidate['goals']}
atoms_path = V7 / 'twenty-six-atomic-boundaries.de-en.author-proposal.json'
atoms = read(atoms_path)['atoms']
assert len(atoms) == 26
families = defaultdict(list)
for atom in atoms:
    families[atom['originalFamilyGoalId']].append(atom)
assert len(families) == 9
ids = {a['candidateKey']: (a['originalFamilyGoalId'] if len(families[a['originalFamilyGoalId']]) == 1 else str(uuid.uuid5(
    uuid.UUID(a['originalFamilyGoalId']), 'skillpilot:de-gymnasium:chemie:b008:routine:' + a['candidateKey']))) for a in atoms}
assert len(set(ids.values())) == 26
new_ids = set(ids.values()) - set(by_id)
assert len(new_ids) == 24
text_fields = [('title', 'titleDe'), ('titleEn', 'titleEn'), ('description', 'descriptionDe'), ('descriptionEn', 'descriptionEn')]
atom_binders = []
for atom in atoms:
    key, parent_id = atom['candidateKey'], atom['originalFamilyGoalId']
    goal_id = ids[key]
    retained = goal_id in by_id
    if retained:
        goal = by_id[goal_id]
    else:
        parent = by_id[parent_id]
        tags = [tag for tag in parent['tags'] if tag not in ['SekI', 'SekII']]
        stage = atom['stageProposal']
        tags += ['SekI'] if stage == 'SekI' else ['SekII'] if stage == 'SekII' else ['SekI', 'SekII']
        goal = {'id': goal_id, 'shortKey': 'canonical_chemistry_b008_' + key.replace('-', '_'),
                'type': 'atomic', 'contains': [], 'weight': 1, 'tags': tags,
                'dimensionTags': deepcopy(parent['dimensionTags']), 'examples': [], 'resourceLinks': [],
                'applicability': {'jurisdiction': ['DE-BY']},
                'extendedData': {'applicabilityMappingInheritance': 'boundary', 'provenance': {
                    'splitFromCanonicalGoalId': parent_id, 'authorCandidatePackage': str(HERE.relative_to(ROOT)),
                    'routineCandidateKey': key, 'sourceBindingStatus': 'prospective_partial_components_only_no_national_clearance'}}}
        goal['dimensionTags']['topicCode'] = 'CANONICAL.CHEMISTRY.B008.' + key.upper().replace('-', '_')
        candidate['goals'].append(goal)
        by_id[goal_id] = goal
    for native, author in text_fields:
        goal[native] = atom[author]
    goal['requires'] = [ids.get(ref, ref) for ref in atom['prerequisiteProposalKeysOrExistingIds']]
    atom_binders.append({'candidateKey': key, 'nativeCandidateGoalId': goal_id,
                         'originalFamilyGoalId': parent_id, 'retainedSingleRoutineUUID': retained,
                         'fullReviewedV7PrototypeValueSha256': valhash(atom),
                         'sourceOperatorScopeContractDe': atom['sourceOperatorScopeContractDe'],
                         'proposedStageBoundariesNotFinalSourceClearance': atom['stageProposal'],
                         'actualDirectRequires': goal['requires']})
split_parent_ids = []
for parent_id, children in families.items():
    if len(children) == 1:
        continue
    goal = by_id[parent_id]
    goal.update({'type': 'cluster', 'contains': [ids[a['candidateKey']] for a in children],
                 'requires': [], 'weight': len(children)})
    split_parent_ids.append(parent_id)
assert len(split_parent_ids) == 7
assert len(candidate['goals']) == 503
candidate_path = QA / 'DE_DEU_S_GYM_CANONICAL_CHEMIE.native-author-candidate.json'
dump(candidate_path, candidate)
dump(QA / 'chemie.semantic-kinds.native-author-input.json', read(KINDS))

profiles_path = V8 / 'twenty-six-positive-profiles.de-en.author-candidate.json'
cases_path = V10 / 'fifty-two-cases.de-en.author-candidate.json'
profiles = read(profiles_path)['profiles']
cases = read(cases_path)['cases']
assert len(profiles) == 26 and len(cases) == 52
case_by_key = {case['caseKey']: case for case in cases}
profile_binders = []
for profile in profiles:
    key = profile['candidateKey']
    atom = next(a for a in atoms if a['candidateKey'] == key)
    assert profile['descriptionBindingCandidate'] == {'de': atom['descriptionDe'], 'en': atom['descriptionEn']}
    assert profile['status'] == 'ai_candidate' and profile['reviewStatus'] == 'needs_human_review'
    bound_cases = []
    for case_key in profile['caseKeys']:
        case = case_by_key[case_key]
        assert case['candidateKey'] == key
        bound_cases.append({'caseKey': case_key, 'wholeCaseValueSha256': valhash(case),
                            'actualCurrentV10Materials': bind(cases_path),
                            'wholeCaseBodyCopiedOrChanged': False,
                            'materialScienceReviewRoute': 'exact v8 baseline + v9 A eleven KEEP + v10 A two transfer-field KEEP + fresh v10 B twelve changed-case KEEP; original bodies/decisions remain immutable'})
    assert len(bound_cases) == 2
    profile_binders.append({'candidateKey': key, 'nativeCandidateGoalId': ids[key],
                            'unchangedV8ProfileBinding': bind(profiles_path),
                            'wholeProfileValueSha256': valhash(profile),
                            'bodyGoalIdRetained': profile['goalId'],
                            'correctedCurrentMaterials': bound_cases,
                            'relativeV8MaterialFilenameIsSupersededOnlyByThisExplicitV10Binder': True,
                            'status': 'ai_candidate', 'reviewStatus': 'needs_human_review',
                            'evidenceLevel': 'E1', 'generationLevel': 'G1',
                            'nativePApproval': False, 'actualLearnerPerformance': False})

inventory_path = ORIGIN / 'all-national-original-nine-source-obligations.actual.json'
inventory = read(inventory_path)
assert bind(inventory_path)['sha256'] == 'a51f97421266fbf2355b386c0e24e65d84b94da9aa51fa1b3429da78d89c4951'
assert len(inventory['directBindings']) == 1646 and len(inventory['files']) == 29
by_source_span = {r['wholeSourceGoal']['sourceSpan']: r for r in inventory['directBindings'] if '/BY/' in r['sourceExtractionPath']}
# Hand-selected bounded primary components; every mapping is explicitly partial.
source_choices = {
    'lower-chemical-question-hypothesis': ['C8.1.3', 'C9-NTG.1.3'],
    'upper-theory-based-question-hypothesis': ['C11.1.3', 'C12-GA.1.8'],
    'lower-guided-hypothesis-investigation': ['C8.1.2'],
    'lower-independently-planned-hypothesis-investigation': ['C9-NTG.1.2', 'C10-HG_SG_MUG_WWG_SWG.1.2'],
    'upper-hypothesis-investigation': ['C11.1.2', 'C12-GA.1.9'],
    'data-documentation': ['C8.1.2'],
    'lower-chemical-data-interpretation': ['C8.1.4', 'C9-NTG.1.4'],
    'upper-quantitative-hypothesis-data-evaluation': ['C12-GA.1.7', 'C12-GA.1.12'],
    'data-validity': ['C11.1.4', 'C12-GA.1.27'],
    'foreign-inquiry-process-and-reach': ['C8.1.5', 'C10-HG_SG_MUG_WWG_SWG.1.5'],
    'own-inquiry-process-reflection': ['C12-GA.1.14'],
    'upper-scientific-validity': ['C12-GA.1.15'],
    'sek1-source-information': ['C8.1.10', 'C9-NTG.1.9'],
    'upper-source-information': ['C12-GA.1.16', 'C12-GA.1.17', 'C12-GA.1.20', 'C12-GA.1.23'],
    'upper-source-criticism': ['C12-GA.1.18', 'C12-GA.1.26'],
    'criteria-arguments': ['C9-NTG.1.10'],
    'chemical-applications-society': ['C9-HG_SG_MUG_WWG_SWG.1.13'],
    'chemistry-career-choice': ['C9-HG_SG_MUG_WWG_SWG.1.13'],
    'criteria-decision': ['C10-HG_SG_MUG_WWG_SWG.1.11', 'C10-HG_SG_MUG_WWG_SWG.1.13', 'C12-GA.1.28', 'C12-GA.1.29', 'C12-GA.1.30', 'C12-GA.1.34'],
    'upper-knowledge-influences': ['C11.1.11'],
    'upper-chemical-effects-sustainability': ['C12-GA.1.31', 'C12-GA.1.33'],
    'upper-scientific-discourse': ['C12-GA.1.21', 'C12-GA.1.24'],
    'sek1-model-use-criticism': ['C10-HG_SG_MUG_WWG_SWG.1.7', 'C8.1.7'],
    'upper-model-use-criticism': ['C11.1.6', 'C12-GA.1.4', 'C12-GA.1.11', 'C12-GA.1.13'],
    'chemical-representation-transformation': ['C11.1.8', 'C12-GA.1.19'],
    'chemical-presentation': ['C12-GA.1.22'],
}
assert set(source_choices) == set(ids)
span_sources = {
    'C8': ('by8.actual-main.txt', 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/8/chemie', 'SekI', ['8'], 'unspecified'),
    'C9-NTG': ('by9-ntg.actual-main.txt', 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/chemie/ch-ntg', 'SekI', ['9'], 'unspecified'),
    'C9-HG_SG_MUG_WWG_SWG': ('by9-ch.actual-main.txt', 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/chemie/ch', 'SekI', ['9'], 'unspecified'),
    'C10-HG_SG_MUG_WWG_SWG': ('by10-ch.actual-main.txt', 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch', 'SekI', ['10'], 'unspecified'),
    'C11': ('by11.actual-main.txt', 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/11/chemie', 'SekII', ['11'], 'unspecified'),
    'C12-GA': ('by12-ga.actual-main.txt', 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/chemie/grundlegend', 'SekII', ['12'], 'grundlegendes Anforderungsniveau; existing SkillPilot compatibility profile GK'),
}
placements, mappings = [], []
for key, spans in source_choices.items():
    witnesses = []
    for span in spans:
        row = by_source_span[span]
        src = row['wholeSourceGoal']
        filename, url, stage, grades, course = span_sources[span.split('.')[0]]
        text_path = ORIGIN / 'primary-inputs' / filename
        witnesses.append({'originalSourceGoalId': src['id'], 'originalSourceSpan': span,
                          'originalSourceExtractionBinding': bind(ROOT / row['sourceExtractionPath']),
                          'wholeSourceGoalValueSha256': valhash(src),
                          'originalWholePassageValueSha256': valhash(row['wholePassage']),
                          'retainedPrimaryCaptureBinding': bind(text_path),
                          'actualPrimaryURL': url, 'jurisdiction': 'DE-BY', 'stage': stage,
                          'grades': grades, 'courseBoundedToActuallyReadPage': course,
                          'originalDeduplicatedCourseAndTopicTagsRetainedAsHold': src.get('tags', []),
                          'originalHistoricalMappingStatusNotPromoted': row['wholeMapping'].get('matchType'),
                          'proposedMatchType': 'partial',
                          'wholeSourceRowOrAllSharedContextsCleared': False})
        mappings.append({'legacyGoalId': src['id'], 'canonicalGoalId': ids[key], 'matchType': 'partial',
                         'reviewDecisionId': 'author-v11-component-' + key + '-' + span})
    placements.append({'candidateKey': key, 'nativeCandidateGoalId': ids[key], 'primaryComponents': witnesses,
                       'sourceOperatorContractDe': next(a['sourceOperatorScopeContractDe'] for a in atoms if a['candidateKey'] == key),
                       'status': 'author_candidate_partial_component_requires_independent_source_review',
                       'newUniversalSourceTargetClaim': False,
                       'caseSpecificContentAndContextUnionObligationsRemain': True,
                       'nativeCoverageApproval': False})
source_map_path = QA / 'BY.partial-source-route.author-candidate.json'
dump(source_map_path, {'version': 1, 'reviewId': 'chemie-b008-author-v11-bounded-BY-partial-components',
                       'sourceLandscapeId': 'ff1ca997-b6cc-5ece-8e13-5498b4bbf808',
                       'targetLandscapeId': original['landscapeId'],
                       'sourceExtractionPath': 'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_CHEMIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json',
                       'status': 'author_candidate_not_active', 'mappings': mappings, 'decisions': [],
                       'note': 'Every row is a bounded author partial component. Original1646 obligations remain separate. File lies outside active mapping directories; no native mapping approval or automatic whole-source transfer.'})

root_id = '442c31c5-c561-5c7a-90bb-2335d779175c'
all_view = {'viewFormatVersion': '1.0', 'viewId': 'chemie-b008-native-author-review-universe-395',
            'landscapeId': original['landscapeId'], 'language': 'de-DE',
            'title': 'B008 inertes Vergleichsuniversum – keine nationale Quellenfreigabe',
            'scope': {'schoolForm': 'Gymnasium', 'jurisdiction': 'DE', 'stage': 'CrossStage'},
            'rootNodes': [{'kind': 'canonicalSubtree', 'goalId': root_id}]}
dump(QA / 'all-candidate-atoms.review-only.view.json', all_view)
# Distinct actual-target products, shown once each under an explicitly named
# best-read source/stage. This is a review composition, not a complete course.
assigned = defaultdict(list)
for atom in atoms:
    assigned[source_choices[atom['candidateKey']][0].split('.')[0]].append(atom)
source_nodes = []
for source_key, rows in assigned.items():
    filename, url, stage, grades, course = span_sources[source_key]
    source_nodes.append({'kind': 'structure', 'id': 'b008-' + source_key.lower().replace('_', '-'),
                         'label': source_key + ' · ' + stage + ' · begrenzte Primärkomponenten',
                         'children': [{'kind': 'goalEntry', 'goalId': ids[a['candidateKey']]} for a in rows]})
source_view_path = QA / 'BY26.partial-source-products.review-only.view.json'
dump(source_view_path, {'viewFormatVersion': '1.0', 'viewId': 'chemie-b008-BY26-author-primary-products',
                        'landscapeId': original['landscapeId'], 'language': 'de-DE',
                        'title': 'B008 geprüfte Routineprodukte – eng gelesene BY-Quellenkomponenten',
                        'scope': {'schoolForm': 'Gymnasium', 'jurisdiction': 'DE-BY', 'stage': 'CrossStage', 'durationModel': 'G9'},
                        'rootNodes': source_nodes})
config = {'schemaVersion': 1, 'bookId': 'chemie-b008-native-author-review-universe',
          'title': 'B008 inerte native Vorbereitung', 'landscapePath': str(candidate_path.relative_to(ROOT)),
          'compositionViewPath': str((QA / 'all-candidate-atoms.review-only.view.json').relative_to(ROOT)),
          'semanticKindLedgerPath': str((QA / 'chemie.semantic-kinds.native-author-candidate.json').relative_to(ROOT)),
          'goalVisualizationQaPath': str(VQA.relative_to(ROOT)), 'publicationMode': 'review',
          'atlasBaseUrl': 'https://skillpilot.com/lernzielbuch', 'evidenceReviewPaths': [],
          'outputPath': str((QA / 'candidate-native-pure-book-model.json').relative_to(ROOT))}
dump(QA / 'candidate-native-book.config.json', config)
old_config = deepcopy(config)
old_config.update({'bookId': 'chemie-b008-baseline-review-universe', 'landscapePath': str(CANON.relative_to(ROOT)),
                   'semanticKindLedgerPath': str(KINDS.relative_to(ROOT)),
                   'outputPath': str((QA / 'baseline-native-pure-book-model.json').relative_to(ROOT))})
dump(QA / 'baseline-native-book.config.json', old_config)
source_config = deepcopy(config)
source_config.update({'bookId': 'chemie-b008-BY26-partial-author-products',
                      'compositionViewPath': str(source_view_path.relative_to(ROOT)),
                      'outputPath': str((QA / 'BY26-partial-source-native-pure-book-model.json').relative_to(ROOT))})
dump(QA / 'BY26-partial-source-native-book.config.json', source_config)

central_report = BASE / 'chemie-q1-current378-active-integration-verification-v1/final-current-central.stage-1.actual.stdout.json'
strict = next(s for s in read(central_report)['subjects'] if s['subject'] == 'chemie')['strictCompleteGoalIds']
assert len(strict) == 112 and not set(strict).intersection(families)
old_by_id = {g['id']: g for g in original['goals']}
assert all(by_id[g] == old_by_id[g] for g in strict)
assert all(by_id[g] == old_by_id[g] for g in old_by_id if g not in families)
authority = {'schemaVersion': 1, 'createdAtUTC': STAMP, 'role': 'concrete inert author candidate, no native gate approval',
             'nativeApproval': False, 'humanApproval': False, 'humanTrial': False,
             'strictCompletionsAdded': 0, 'restoredActiveBindings': 0, 'activeWrites': False}
dump(HERE / 'twenty-six-native-uuid-and-current-v10-material-profile-binders.author-candidate.json', {
    **authority, 'uuidAlgorithm': 'UUIDv5 namespace=existing split family UUID, name=skillpilot:de-gymnasium:chemie:b008:routine:<candidateKey>; retain the two unchanged single-routine identities.',
    'routineGoalIds': ids, 'atomBinders': atom_binders, 'profileBinders': profile_binders,
    'wholeProfileBodiesCopiedOrRewritten': False, 'wholeMaterialBodiesCopiedOrRewritten': False,
    'actualNativePositiveUnderstandingEvidenceV2ProfilesAuthoredInThisPackage': 0,
    'actualNativeDescriptionReviewDecisions': 0})
dump(HERE / 'twenty-six-partial-source-components-and-original-national-holds.author-candidate.json', {
    **authority, 'placements': placements, 'prospectiveNativeMappingFormatBinding': bind(source_map_path),
    'actuallyReadPrimaryComponentsNotFullNationalClearance': True,
    'sourceInventoryBinding': bind(inventory_path), 'sourceInputPairBindings': inventory['files'],
    'originalNationalSourceObligationCount': 1646, 'sourceInputPairCount': 29,
    'originalWholeNationalMappingFilesOrStatusesModified': False,
    'ni23DiscourseBindingsRemainSekIIAndThreeEAOnly': True,
    'lowerOwnReflectionAndOtherUntestedStageScopeBranches': 'HOLD; the chosen explicit own-reflection component is C12-GA E10; no universal SekI exact route inferred.',
    'historicalInfluencesBeyondLiteralC11List': 'HOLD for additional historical-context source route; the literal C11 witness does not itself name historical influences.',
    'modelAlternativesExperimentalAndModelBranchesRemainDistinct': True,
    'wholeSourceContextOrCourseUnionNotClearedByOneCaseOrComponent': True,
    'K11ActualRetainedPrimaryLines': [138, 140],
    'sourceHoldsCleared': 0})
dump(HERE / 'current378-protected112-and-nine-family-structure-input-guard.actual.json', {
    **authority, 'baselineActiveCanon': bind(CANON), 'baselineKinds': bind(KINDS), 'baselineVisualizationQa': bind(VQA),
    'historicalAuthoritativeCentralReportBinding': bind(central_report), 'protectedStrictGoalIds': strict,
    'protected112WholeGoalObjectsExact': True, 'originalFamilyGoalIds': list(families),
    'convertedClusterGoalIds': split_parent_ids,
    'retainedSingleRoutineGoalIds': [ids[a['candidateKey']] for a in atoms if len(families[a['originalFamilyGoalId']]) == 1],
    'new24AtomicUUIDs': sorted(new_ids), 'candidateWholeGoalCount': len(candidate['goals']),
    'denominatorArithmetic': {'current': 378, 'newAtomicUUIDs': 24, 'oldAtomsToClusters': 7, 'candidate': 395},
    'outsideAffectedNineEveryOldWholeGoalObjectExact': True,
    'existingCurrentCanonicalParentContextRetainedAsIntegrationHold': {
        'goalId': '2da7abbb-7ade-5acc-b7b1-1d98d7334352',
        'title': 'Chemische Erkenntnisgewinnung und Kommunikation (Sek I)',
        'requires': ['266a2b2a-9ee2-52f6-ae09-59343da9a60b'],
        'risk': 'Old global SekI wrapper and its coarse inherited laboratory prerequisite cannot substantiate final upper-stage/source/operator placement or the reviewed minimal new atom prerequisites. Explicit partial BY review view corrects presentation only; no active graph migration or runtime route approval.'},
    'currentB007382CandidateNotUsedAsActiveBaseline': True,
    'currentNativeSourceAtlasAndProtectedBindingsStillPending': True})
print(json.dumps({'candidateWholeGoals': 503, 'candidateCurricularAtomicExpected': 395,
                  'newAtomUUIDs': 24, 'retainedSingleRoutineUUIDs': 2,
                  'convertedClusters': 7, 'actualCaseBinders': 52, 'actualProfileBinders': 26,
                  'partialNativeSourceMappings': len(mappings), 'strictAdded': 0, 'activeWrites': 0}))
