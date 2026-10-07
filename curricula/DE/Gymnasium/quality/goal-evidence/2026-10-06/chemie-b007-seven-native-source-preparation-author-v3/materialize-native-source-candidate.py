#!/usr/bin/env python3
"""Prepare inert B007 canonical/source/card candidates; never write active inputs."""
from pathlib import Path
from datetime import datetime, timezone
from copy import deepcopy
import hashlib
import json
import uuid

ROOT = Path(__file__).resolve().parents[7]
HERE = Path(__file__).resolve().parent
BASE = HERE.parent
AUTHOR = BASE / 'chemie-b007-seven-routines-four-material-corrections-author-v2'
QA = HERE / 'qa-artifacts'
QA.mkdir(exist_ok=True)
STAMP = datetime.now(timezone.utc).isoformat()
CANON = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
KINDS = ROOT / 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
V = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'

def read(path):
    return json.loads(path.read_text())

def bind(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def valhash(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True).encode()).hexdigest()

def dump(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

assert bind(CANON)['sha256'] == '764c11d951d28be38709d8b01b5eb6d4b3be71e87d9daf5ea4d1dc46f67529a0'
assert bind(KINDS)['sha256'] == 'd16aa527265d69c200be7ebd7e7f664a9d6b273af4f8fded64c43b286b5e0f54'
assert bind(V)['sha256'] == '9eda9bf03bfc2139e999c469fe3be7532ed3abab80673b6313483eb40d0c0e55'
original = read(CANON)
candidate = deepcopy(original)
by_id = {goal['id']: goal for goal in candidate['goals']}
routines = read(AUTHOR / 'seven-routines.de-en.author-candidate.json')['prototypes']
assert len(routines) == 7
ids = {row['localKey']: row['id'] or str(uuid.uuid5(uuid.UUID(row['splitFromCurrentGoalId']), 'skillpilot:de-gymnasium:chemie:b007:routine:' + row['localKey'])) for row in routines}
assert len(set(ids.values())) == 7
label = ids['label']
handling_parent = '7be6f951-a614-52dc-94d3-2ce0d33765ff'
solution_parent = '53fd1bfd-facb-54ae-b2dc-f667ed1414fc'
source_input_path = BASE / 'chemie-b007-three-safety-solutions-source-boundary-author-v1/three-current-goals-and-source-inputs.actual.json'
source_inputs = read(source_input_path)
rows = source_inputs['currentSourceBindingRows']
assert len(rows) == 413 and len({(row['sourceExtractionPath'], row['sourceGoalId']) for row in rows}) == 403
source_by_id = {row['sourceGoalId']: row for row in rows}
optional_source_id = 'he-chem-seki-8-1-facultative-solubility-9572d6f8'
optional_source = {
    'id': optional_source_id, 'passageId': 'he-chem-seki:8.1:facultative', 'topicCode': '8.1',
    'sourceText': 'Gesättigte, ungesättigte, konzentrierte und verdünnte Lösungen; Graphen zur Löslichkeit',
    'parentHeading': 'Temperaturabhängigkeit der Löslichkeit',
    'sourceDocumentPath': 'curricula/DE/Gymnasium/input/HE/lower-secondary/g9-chemie.pdf',
    'sourceUrl': 'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-chemie.pdf',
    'physicalPage': 13, 'printedPage': 12, 'jurisdiction': 'DE-HE', 'schoolForm': 'Gymnasium',
    'stage': 'SekI', 'grades': ['8'], 'durationModel': 'G9', 'courseLevel': 'unspecified',
    'curricularRequirement': 'facultative', 'isExistingOfficialExtractionRecord': False,
    'status': 'author_candidate_primary_page_component_needs_independent_source_review',
    'humanApproval': False,
}
placements = []
for row in routines:
    key = row['localKey']
    if key == 'label':
        goal = by_id[label]
        for field in ['title', 'titleEn', 'description', 'descriptionEn']:
            goal[field] = row[field]
        goal['requires'] = row['requiresAuthorProposal']
    else:
        parent = by_id[row['splitFromCurrentGoalId']]
        goal = {field: deepcopy(parent[field]) for field in ['weight', 'tags', 'dimensionTags']}
        goal.update({field: row[field] for field in ['title', 'titleEn', 'description', 'descriptionEn']})
        goal.update({'id': ids[key], 'shortKey': 'canonical_chemistry_sek1_b007_' + key,
                     'type': 'atomic', 'contains': [], 'requires': row['requiresAuthorProposal'],
                     'weight': 1, 'phase': 'GLOBAL', 'area': 'Grundlagen', 'level': 2,
                     'core': key != 'solubility', 'applicability': {'jurisdiction': ['DE-HE']},
                     'examples': [], 'resourceLinks': []})
        goal['dimensionTags']['topicCode'] = 'CANONICAL.CHEMISTRY.SEK1.B007.' + key.upper()
        goal['extendedData'] = {'applicabilityMappingInheritance': 'boundary',
                                'provenance': {'splitFromCanonicalGoalId': row['splitFromCurrentGoalId'],
                                               'authorCandidatePackage': str(HERE.relative_to(ROOT)),
                                               'routineLocalKey': key,
                                               'sourceBindingStatus': 'prospective_only_no_national_clearance'}}
        candidate['goals'].append(goal)
        by_id[goal['id']] = goal
    source_ids = [optional_source_id] if key == 'solubility' else row['candidatePrimarySourceGoalIds']
    witnesses = []
    for source_id in source_ids:
        if source_id == optional_source_id:
            witnesses.append(optional_source)
        else:
            src = source_by_id[source_id]
            witnesses.append({'sourceGoalId': source_id, 'sourceExtractionPath': src['sourceExtractionPath'],
                              'sourceRecordValueSha256': valhash(src['currentOfficialSourceRecord']),
                              'sourceDocumentPath': 'curricula/DE/Gymnasium/input/HE/lower-secondary/g9-chemie.pdf',
                              'sourceUrl': 'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-chemie.pdf',
                              'physicalPage': 12, 'printedPage': 11, 'jurisdiction': 'DE-HE',
                              'stage': 'SekI', 'grades': ['8'], 'durationModel': 'G9',
                              'courseLevel': 'unspecified', 'curricularRequirement': 'mandatory',
                              'matchType': 'aspect_of_named_row_not_whole_row_or_national_clearance'})
    placements.append({'routineLocalKey': key, 'nativeCandidateGoalId': ids[key],
                       'goalTextBindingSha256': valhash({field: row[field] for field in ['title', 'titleEn', 'description', 'descriptionEn']}),
                       'sourceWitnesses': witnesses, 'placementStatus': 'author_candidate_requires_independent_native_source_review',
                       'national403OriginalSourceHoldCleared': False})

for parent_id, keys in [(handling_parent, ['handling', 'disposal']), (solution_parent, ['preparation', 'solubility', 'mass_fraction', 'volume_fraction'])]:
    goal = by_id[parent_id]
    goal['type'] = 'cluster'
    goal['contains'] = [ids[key] for key in keys]
    goal['weight'] = len(keys)
    # The new children have distinct routine prerequisites; no new universal
    # prerequisite is claimed on either converted author cluster.
    goal['requires'] = []
    # Preserve prior titles/descriptions, image and historical source metadata.
    # A separate requires-risk receipt must assess external consumers before integration.

canon_candidate_path = QA / 'DE_DEU_S_GYM_CANONICAL_CHEMIE.native-author-candidate.json'
dump(canon_candidate_path, candidate)
dump(QA / 'chemie.semantic-kinds.native-author-input.json', read(KINDS))
root_id = '442c31c5-c561-5c7a-90bb-2335d779175c'
review_view = {'viewFormatVersion': '1.0', 'viewId': 'chemie-b007-author-review-universe-382',
               'landscapeId': original['landscapeId'], 'language': 'de-DE',
               'title': 'Inerte B007-Autorenprüfung des Kandidatenuniversums',
               'scope': {'schoolForm': 'Gymnasium', 'jurisdiction': 'DE', 'stage': 'CrossStage'},
               'rootNodes': [{'kind': 'canonicalSubtree', 'goalId': root_id}]}
dump(QA / 'all-candidate-atoms.review-only.view.json', review_view)
he_view = {'viewFormatVersion': '1.0', 'viewId': 'chemie-b007-he8-author-review-only',
           'landscapeId': original['landscapeId'], 'language': 'de-DE',
           'title': 'B007 Quellenkandidat HE G9 Jahrgang 8',
           'scope': {'schoolForm': 'Gymnasium', 'jurisdiction': 'DE-HE', 'stage': 'SekI', 'durationModel': 'G9'},
           'rootNodes': [
               {'kind': 'structure', 'id': 'b007-he8-mandatory', 'label': 'HE 8.1 – verbindliche Teilaspekte', 'children': [{'kind': 'goalEntry', 'goalId': ids[key]} for key in ids if key != 'solubility']},
               {'kind': 'structure', 'id': 'b007-he8-facultative', 'label': 'HE 8.1 – fakultative Erweiterung Löslichkeit', 'children': [{'kind': 'goalEntry', 'goalId': ids['solubility']}]},
           ]}
dump(QA / 'he8-seven-routines.prospective-source.view.json', he_view)
base_config = {'schemaVersion': 1, 'bookId': 'chemie-b007-native-author-universe',
               'title': 'Inerte native B007-Autorenprüfung',
               'landscapePath': str(canon_candidate_path.relative_to(ROOT)),
               'compositionViewPath': str((QA / 'all-candidate-atoms.review-only.view.json').relative_to(ROOT)),
               'semanticKindLedgerPath': str((QA / 'chemie.semantic-kinds.native-author-candidate.json').relative_to(ROOT)),
               'goalVisualizationQaPath': str(V.relative_to(ROOT)), 'publicationMode': 'review',
               'atlasBaseUrl': 'https://skillpilot.com/lernzielbuch', 'evidenceReviewPaths': [],
               'outputPath': str((QA / 'candidate-native-pure-book-model.json').relative_to(ROOT))}
dump(QA / 'candidate-native-book.config.json', base_config)
old_config = deepcopy(base_config)
old_config.update({'bookId': 'chemie-b007-baseline-author-universe', 'landscapePath': str(CANON.relative_to(ROOT)),
                   'semanticKindLedgerPath': str(KINDS.relative_to(ROOT)), 'outputPath': str((QA / 'baseline-native-pure-book-model.json').relative_to(ROOT))})
dump(QA / 'baseline-native-book.config.json', old_config)

case_path = AUTHOR / 'cases.de-en.author-candidate.json'
card_path = AUTHOR / 'primary-cards.de-en.author-candidate.json'
cases = read(case_path)['cases']
cards = read(card_path)['cards']
assert len(cases) == 14 and len(cards) == 2
case_binders = [{'caseLocalKey': case['caseLocalKey'], 'routineLocalKey': case['routineLocalKey'],
                 'nativeCandidateGoalId': ids[case['routineLocalKey']], 'originalCaseBodyUnchanged': True,
                 'materialFileBinding': bind(case_path), 'wholeCaseValueSha256': valhash(case),
                 'materialStatusRetained': 'ai_candidate/needs_human_review E1/G1',
                 'bodyCandidateGoalIdNotRewritten': case['candidateGoalId']} for case in cases]
memory_node = '1e372b97-6f1c-596c-8a8b-fc03193d784a'
deck = 'de_gymnasium_chemistry_basics_seki'
card_binders = [{'cardLocalKey': card['cardLocalKey'], 'nativeCandidateOriginGoalId': ids[card['originRoutineLocalKey']],
                 'candidateCardId': str(uuid.uuid5(uuid.UUID(ids[card['originRoutineLocalKey']]), 'primary-card:' + card['cardLocalKey'])),
                 'candidateDeckId': deck, 'candidateMemoryGoalIds': [memory_node],
                 'originalCardBodyUnchanged': True, 'wholeCardValueSha256': valhash(card),
                 'materialFileBinding': bind(card_path), 'activationStatus': 'not_active',
                 'nativeMemoryCardApproval': False, 'nativeVisibilityReview': 'pending'} for card in cards]
dump(HERE / 'seven-routine-uuid-and-fourteen-case-two-card-binders.author-candidate.json', {
    'schemaVersion': 1, 'createdAtUTC': STAMP, 'role': 'inert UUID/binder author candidate, not native P or M approval',
    'uuidAlgorithm': 'UUID v5; namespace=unchanged broad canonical UUID, name=skillpilot:de-gymnasium:chemie:b007:routine:<localKey>',
    'routineGoalIds': ids, 'caseCount': 14, 'cardCount': 2, 'caseBinders': case_binders, 'primaryCardBinders': card_binders,
    'materialFilesCopiedOrRewritten': False, 'nativeApproval': False, 'humanApproval': False, 'strictCompletionsAdded': 0,
})
dump(HERE / 'seven-source-placement-intents-and-national-holds.author-candidate.json', {
    'schemaVersion': 1, 'createdAtUTC': STAMP, 'role': 'narrow primary-source placement author candidate, no national clearance',
    'placements': placements, 'newFacultativeSourceComponentCandidate': optional_source,
    'niQualitativeWitnessRetainedAsSeparateHold': {'sourceGoalId': 'ni-chemistry-seki-kc2015-st-5-6-1-kompetenz-003-cdaa7726',
        'physicalPage': 51, 'printedPage': 51, 'stage': 'SekI', 'grades': ['5', '6'], 'courseLevel': 'unspecified',
        'status': 'qualitative_solubility_property_only_no_quantitative_saturation_routine_mapping',
        'quantitativeCompulsoryCoverageClaim': False},
    'originalNationalSourceObligationCount': 403, 'originalMatchedMappingRowCount': 413,
    'allOriginalSourceInputFileBindings': source_inputs['allConfiguredMappingInputBindings'],
    'all403RecordsAndHistoricalMappingStatusesUnchanged': True,
    'nationalMappingOrCompositionIntegration': 'HOLD; current broad mapping rows must not automatically become full child coverage or compulsory facet claims',
    'sourceHoldsCleared': 0, 'nativeApproval': False, 'humanApproval': False, 'strictCompletionsAdded': 0,
})
dump(HERE / 'seven-memory-decisions-and-two-narrow-card-intents.author-candidate.json', {
    'schemaVersion': 1, 'createdAtUTC': STAMP, 'role': 'author memory/card intents with real candidate origin UUIDs; no native M verdict',
    'routineDecisions': [{'routineLocalKey': row['localKey'], 'candidateGoalId': ids[row['localKey']],
        'decisionIntent': row['memoryAuthorDecision'], 'cardBindingIntents': [b for b in card_binders if b['nativeCandidateOriginGoalId'] == ids[row['localKey']]],
        'candidateReferencedDeckIds': [deck] if row['memoryAuthorDecision']['decision'] == 'memory_required' else [],
        'candidateReferencedMemoryGoalIds': [memory_node] if row['memoryAuthorDecision']['decision'] == 'memory_required' else [],
        'nativeApproval': False, 'nativeVisibilityReview': 'pending'} for row in routines],
    'existingMemoryNodeOrDeckFilesModified': False, 'primaryCardsTwoWholeBodiesUnchanged': True,
    'actualFutureCardOriginAndVisibilityReviewRequired': True, 'humanApproval': False,
})
report_path = BASE / 'chemie-q1-current378-active-integration-verification-v1/final-current-central.stage-1.actual.stdout.json'
strict = next(subject for subject in read(report_path)['subjects'] if subject['subject'] == 'chemie')['strictCompleteGoalIds']
assert len(strict) == 112 and not set(strict) & {label, handling_parent, solution_parent}
original_by_id = {goal['id']: goal for goal in original['goals']}
assert all(by_id[goal_id] == original_by_id[goal_id] for goal_id in strict)
changed_old = [goal_id for goal_id in original_by_id if by_id[goal_id] != original_by_id[goal_id]]
assert set(changed_old) == {label, handling_parent, solution_parent}
dump(HERE / 'current378-and-protected112-author-input-guard.actual.json', {
    'schemaVersion': 1, 'createdAtUTC': STAMP, 'role': 'actual author byte/value preservation; no native gate pass',
    'baselineActiveCanon': bind(CANON), 'baselineKinds': bind(KINDS), 'baselineVisualizationQa': bind(V),
    'historicalCurrent378CentralReport': bind(report_path), 'protectedStrictGoalIds': strict,
    'protected112WholeGoalValuesExactInBaseCandidate': True,
    'protected112BindingsMustStillBeCheckedAgainstNativeModels': True,
    'changedExistingGoalIds': changed_old, 'newAtomicUUIDs': [goal_id for key, goal_id in ids.items() if key != 'label'],
    'baselineWholeGoalCount': len(original['goals']), 'candidateWholeGoalCount': len(candidate['goals']),
    'expectedAtomicDenominator': {'current': 378, 'candidate': 382, 'new': 6, 'oldAtomsToClusters': 2},
    'outsideAffectedThreeEveryOldWholeGoalObjectExact': True,
    'baselineBookMeaning': 'Review-universe comparison only; no national course/stage/source atlas claim.',
    'frontierAndPageBindingRisks': 'Turning an old direct atomic prerequisite into a cluster can change reference kind, require all child routines and source facets. Whole-goal equality is not a proof that inherited prerequisite semantics or page/context binding remains equal.',
    'activeWrites': False, 'nativeApproval': False, 'humanApproval': False, 'strictCompletionsAdded': 0,
})
print(json.dumps({'preparedCanonical': bind(canon_candidate_path), 'goalCount': len(candidate['goals']), 'routineIds': ids, 'protected112WholeValuesExact': True, 'caseBodiesUnchanged': 14, 'cardBodiesUnchanged': 2}))
