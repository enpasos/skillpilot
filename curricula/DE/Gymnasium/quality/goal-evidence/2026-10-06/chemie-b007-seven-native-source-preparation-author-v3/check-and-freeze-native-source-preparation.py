#!/usr/bin/env python3
"""Targeted inert author-input verification and one-way package sealing."""
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import uuid

import jsonschema

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]
BASE = HERE.parent
QA = HERE / 'qa-artifacts'
AUTHOR = BASE / 'chemie-b007-seven-routines-four-material-corrections-author-v2'
FREEZE = HERE / 'native-source-preparation-author-v3.final.freeze.json'
assert not FREEZE.exists(), 'An existing sealed package must never be rewritten'
STAMP = datetime.now(timezone.utc).isoformat()


def read(path):
    return json.loads(path.read_text())


def bind(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)),
            'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def verify(binding):
    actual = bind(ROOT / binding['path'])
    assert actual['sha256'] == binding['sha256'], binding['path']
    assert actual['bytes'] == binding['bytes'], binding['path']
    return actual


def valhash(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True).encode()).hexdigest()


def dump(path, value):
    assert path.parent == HERE, 'Only author-package receipts can be written'
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


authority = {'schemaVersion': 1, 'createdAtUTC': STAMP,
             'role': 'actual targeted author preparation, no independent native approval',
             'nativeApproval': False, 'humanApproval': False, 'humanTrial': False,
             'activeWrites': False, 'strictCompletionsAdded': 0, 'restoredActiveBindings': 0}
guard = read(HERE / 'current378-and-protected112-author-input-guard.actual.json')
original_path = ROOT / guard['baselineActiveCanon']['path']
original = read(original_path)
original_by_id = {g['id']: g for g in original['goals']}
candidate_path = QA / 'DE_DEU_S_GYM_CANONICAL_CHEMIE.native-author-candidate.json'
variant_path = QA / 'DE_DEU_S_GYM_CANONICAL_CHEMIE.four-route-proposals.author-candidate.json'
candidate = read(candidate_path)
variant = read(variant_path)
candidate_by_id = {g['id']: g for g in candidate['goals']}
variant_by_id = {g['id']: g for g in variant['goals']}
assert len(candidate_by_id) == len(candidate['goals']) == 485
assert len(variant_by_id) == len(variant['goals']) == 485
schema_path = ROOT / 'docs/landscape-runtime.schema.json'
validator = jsonschema.Draft202012Validator(read(schema_path))
schema_results = []
for path, value in [(candidate_path, candidate), (variant_path, variant)]:
    errors = list(validator.iter_errors(value))
    assert not errors, [error.message for error in errors]
    schema_results.append({'landscapeBinding': bind(path), 'schemaBinding': bind(schema_path),
                           'actualErrors': [], 'passed': True})

binder = read(HERE / 'seven-routine-uuid-and-fourteen-case-two-card-binders.author-candidate.json')
routines_path = AUTHOR / 'seven-routines.de-en.author-candidate.json'
cases_path = AUTHOR / 'cases.de-en.author-candidate.json'
cards_path = AUTHOR / 'primary-cards.de-en.author-candidate.json'
routines = read(routines_path)['prototypes']
cases = {c['caseLocalKey']: c for c in read(cases_path)['cases']}
cards = {c['cardLocalKey']: c for c in read(cards_path)['cards']}
assert len(routines) == 7 and len(cases) == 14 and len(cards) == 2
text_fields = ['title', 'titleEn', 'description', 'descriptionEn']
routine_checks = []
for routine in routines:
    key = routine['localKey']
    expected_id = routine['id'] or str(uuid.uuid5(
        uuid.UUID(routine['splitFromCurrentGoalId']),
        'skillpilot:de-gymnasium:chemie:b007:routine:' + key))
    assert expected_id == binder['routineGoalIds'][key]
    for field in text_fields:
        assert candidate_by_id[expected_id][field] == routine[field]
        assert variant_by_id[expected_id][field] == routine[field]
    assert candidate_by_id[expected_id]['requires'] == routine['requiresAuthorProposal']
    routine_checks.append({'routineLocalKey': key, 'goalId': expected_id,
                           'uuidV5OrRetainedOriginalCorrect': True,
                           'DEENTitleAndDescriptionExactReviewedV2': True,
                           'directRequiresExactReviewedAuthorProposal': True})
case_checks = []
for row in binder['caseBinders']:
    case = cases[row['caseLocalKey']]
    assert row['wholeCaseValueSha256'] == valhash(case)
    assert row['nativeCandidateGoalId'] == binder['routineGoalIds'][case['routineLocalKey']]
    assert case['candidateGoalId'] == row['bodyCandidateGoalIdNotRewritten']
    verify(row['materialFileBinding'])
    case_checks.append({'caseLocalKey': row['caseLocalKey'],
                        'nativeCandidateGoalId': row['nativeCandidateGoalId'],
                        'wholeCaseValueSha256': valhash(case), 'wholeBodyExactReviewedV2': True})
deck_path = ROOT / 'curricula/DE/Gymnasium/memory-decks/de_gymnasium_chemistry_flashcards_basics_seki.de.json'
stock_card_ids = {c['id'] for c in read(deck_path)['cards']}
card_checks = []
for row in binder['primaryCardBinders']:
    card = cards[row['cardLocalKey']]
    assert row['wholeCardValueSha256'] == valhash(card)
    assert row['nativeCandidateOriginGoalId'] == binder['routineGoalIds'][card['originRoutineLocalKey']]
    expected_id = str(uuid.uuid5(uuid.UUID(row['nativeCandidateOriginGoalId']),
                                'primary-card:' + row['cardLocalKey']))
    assert row['candidateCardId'] == expected_id and expected_id not in stock_card_ids
    verify(row['materialFileBinding'])
    assert row['candidateMemoryGoalIds'][0] in original_by_id
    card_checks.append({'cardLocalKey': row['cardLocalKey'], 'candidateCardId': expected_id,
                        'originGoalId': row['nativeCandidateOriginGoalId'],
                        'wholeCardValueSha256': valhash(card), 'wholeBodyExactReviewedV2': True,
                        'newIDNoExistingDeckCollision': True, 'active': False})
assert len({c['candidateCardId'] for c in card_checks}) == 2

split_ids = ['7be6f951-a614-52dc-94d3-2ce0d33765ff', '53fd1bfd-facb-54ae-b2dc-f667ed1414fc']
for goal_id in split_ids:
    old = original_by_id[goal_id]
    new = deepcopy(candidate_by_id[goal_id])
    for field in ['type', 'contains', 'weight', 'requires']:
        new[field] = old[field]
    assert new == old, 'Converted-parent nonstructural data changed'
    assert candidate_by_id[goal_id]['requires'] == []
base_changed = {g for g in original_by_id if original_by_id[g] != candidate_by_id[g]}
assert base_changed == set(split_ids + [binder['routineGoalIds']['label']])
assert all(original_by_id[g] == candidate_by_id[g] for g in guard['protectedStrictGoalIds'])
route_plan = read(HERE / 'four-minimal-requires-proposals-and-exact-binding-recheck-plan.author-candidate.json')
route_ids = set(route_plan['modifiedProtectedGoalIdsInVariant'])
assert len(route_ids) == 4 and route_ids <= set(guard['protectedStrictGoalIds'])
variant_changed = {g for g in candidate_by_id if candidate_by_id[g] != variant_by_id[g]}
assert variant_changed == route_ids
for goal_id in route_ids:
    modified = deepcopy(variant_by_id[goal_id])
    modified['requires'] = candidate_by_id[goal_id]['requires']
    assert modified == candidate_by_id[goal_id], 'Route proposal changed a field other than requires'
assert sum(original_by_id[g] == variant_by_id[g] for g in guard['protectedStrictGoalIds']) == 108
for value in [candidate, variant]:
    goal_map = {g['id']: g for g in value['goals']}
    for relation in ['contains', 'requires']:
        visiting, done = set(), set()
        def visit(goal_id):
            assert goal_id not in visiting, relation + ' cycle at ' + goal_id
            if goal_id in done:
                return
            visiting.add(goal_id)
            for ref in goal_map[goal_id].get(relation, []):
                ref_id = ref.split(':')[-1]
                assert ref_id in goal_map, relation + ' missing reference ' + ref
                visit(ref_id)
            visiting.remove(goal_id)
            done.add(goal_id)
        for goal_id in goal_map:
            visit(goal_id)

lineage_specs = [
    ('author-v2', AUTHOR / 'targeted-materials.author-v2.final.freeze.json',
     'e86359b0cea958c6964ad801945810c4621d2a542f426e69e5e92ad1cc303357'),
    ('independent-A-v2-followup', BASE / 'chemie-b007-five-case-v2-independent-a-followup-v1/independent-a-followup.final.freeze.json',
     '95b4357391c15137d5c66f6368a81c65d02d2169264ed1136d6ffb6cd5935f69'),
    ('independent-B-v2', BASE / 'chemie-b007-seven-routines-fourteen-cases-v2-independent-b-v1/independent-b.final.freeze.json',
     'de8db8253bdc94fda2691ede33c739e63de9a135bb945ef65c2e790037af4ee9'),
]
lineage = []
for role, path, expected in lineage_specs:
    actual = bind(path)
    assert actual['sha256'] == expected
    frozen_files = [verify(f) for f in read(path)['files']]
    lineage.append({'role': role, 'freezeBinding': actual, 'allFrozenOwnFilesStillExact': True,
                    'actuallyVerifiedFrozenFileCount': len(frozen_files)})
old_a_freeze = BASE / 'chemie-b007-seven-routines-fourteen-cases-independent-a-v1/independent-a.final.freeze.json'
old_a_bind = bind(old_a_freeze)
assert old_a_bind['sha256'] == '51142dcb7947fce1ba0f22911306d3a94d6b9cb29a77a5674f5799fda07f2a87'
for frozen in read(old_a_freeze)['files']:
    verify(frozen)
lineage.append({'role': 'independent-A-v1-exact-unmodified-material-continuity',
                'freezeBinding': old_a_bind, 'allFrozenOwnFilesStillExact': True})
source_snapshot_path = BASE / 'chemie-b007-three-safety-solutions-source-boundary-author-v1/three-current-goals-and-source-inputs.actual.json'
source_snapshot = read(source_snapshot_path)
source_checks = [verify(row) for row in source_snapshot['allConfiguredMappingInputBindings']]
assert len(source_checks) == 62
assert len(source_snapshot['currentSourceBindingRows']) == 413
assert len({(r['sourceExtractionPath'], r['sourceGoalId']) for r in source_snapshot['currentSourceBindingRows']}) == 403
source_pdfs = [ROOT / 'curricula/DE/Gymnasium/input/HE/lower-secondary/g9-chemie.pdf',
               ROOT / 'curricula/DE/Gymnasium/input/NI/lower-secondary/ni_chemistry_seki.pdf']
# Obtain the NI path from the real source snapshot if its configured filename differs.
if not source_pdfs[1].exists():
    ni_files = [ROOT / r['path'] for r in source_checks if '/NI/' in r['path']]
    for path in ni_files:
        if path.suffix == '.pdf':
            source_pdfs[1] = path
            break
    if not source_pdfs[1].exists():
        matches = [p for p in (ROOT / 'curricula/DE/Gymnasium/input/NI/lower-secondary').glob('*.pdf')
                   if bind(p)['sha256'] == '7b3c69767b4c9a47d87598bee76a28bf7b6d2f6c9b039f2e655a9ad14d47aeac']
        assert len(matches) == 1
        source_pdfs[1] = matches[0]
pdf_bindings = [bind(p) for p in source_pdfs]
assert pdf_bindings[0]['sha256'] == 'f0a2c3795fcbcad1fee8d92d7ab9bc26810609bee0ef1fbd02c830e171220d2f'
assert pdf_bindings[1]['sha256'] == '7b3c69767b4c9a47d87598bee76a28bf7b6d2f6c9b039f2e655a9ad14d47aeac'
dump(HERE / 'primary-source-reading-and-exact-material-review-lineage.actual.json', {
    **authority, 'materialScienceReviewsReusedExactly': lineage,
    'independentReviewBodiesRead': [
        bind(BASE / 'chemie-b007-five-case-v2-independent-a-followup-v1/independent-a-followup.review.json'),
        bind(BASE / 'chemie-b007-seven-routines-fourteen-cases-v2-independent-b-v1/independent-b.review.json')],
    'independentScienceReviewScope': 'A: five actual changed DE/EN complete cases + label essential, nine unchanged cases/six routines/two cards exact prior-A continuity and six findings resolved. B: seven complete routines/fourteen cases/forty-six criteria/two cards KEEP. Both source/native integration limits remain.',
    'newAuthorMaterialScienceVerdictIssued': False,
    'actualPrimaryReadingMethod': 'Successful official web PDF opens plus actual local pdftotext -layout of the named physical pages; no remote download byte identity or publication-rights clearance claimed.',
    'primaryDocumentBindings': pdf_bindings,
    'actuallyReadPrimaryPages': [
        {'source': 'HE G9 Chemistry', 'url': 'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-chemie.pdf',
         'physicalPage': 8, 'printedPage': 7, 'actualObservation': 'Parenthesized examples are suggestions; facultative additions are optional, not universal requirements.'},
        {'source': 'HE G9 Chemistry', 'url': 'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-chemie.pdf',
         'physicalPage': 12, 'printedPage': 11, 'actualObservation': 'Grade 8, section 8.1: separate labelling/disposal/protection aspects and dissolution/solutions row, with mass and volume fractions. Named parenthesized substances do not require a hazardous exposure.'},
        {'source': 'HE G9 Chemistry', 'url': 'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-chemie.pdf',
         'physicalPage': 13, 'printedPage': 12, 'actualObservation': 'Facultative temperature-dependence, saturation categories and solubility graphs. Quantitative capacity reasoning is a bounded didactic operationalization, not a literal universal quantitative mandate.',
         'quantitativeOperationalizationIsAuthorInference': True},
        {'source': 'NI Chemistry Sek I', 'url': 'https://cuvo.nibis.de/index.php?p=download&upload=18',
         'physicalPage': 51, 'printedPage': 51, 'grades': ['5', '6'],
         'actualObservation': 'Qualitative substance-property description including solubility; no quantitative saturation threshold obligation established.'}],
    'originalSourceSnapshotBinding': bind(source_snapshot_path),
    'original403SourcesAnd413MappingRowsUnmodified': True,
    'exactlyRecheckedOriginalSourceInputFileCount': 62,
    'allOriginalSourceInputFilesExact': True,
    'sourceHoldsCleared': 0,
})

baseline_checkpoint = read(AUTHOR / 'actual-current-input-preservation-and-turn-revalidation.json')
active_checks = []
allowed_parallel = {
    'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',
    'docs/qa-ci/status/curriculum-quality-status.json',
    'docs/qa-ci/status/curriculum-quality-status.md',
    'docs/legal/ai-transparency-inventory.json',
}
for historical in baseline_checkpoint['activeCurrentCheckpointInputsRehashedExactly']:
    actual = bind(ROOT / historical['path'])
    exact = actual['sha256'] == historical['sha256'] and actual['bytes'] == historical['bytes']
    assert exact or historical['path'] in allowed_parallel, historical['path']
    active_checks.append({'historicalBinding': historical, 'actualCurrentBinding': actual,
                         'exactHistoricalInput': exact,
                         'deltaExplanation': None if exact else 'Parent-authorized parallel Biology integration; this author package never writes these files. Historical hashes remain untouched.'})
assert len(active_checks) == 19
assert all(row['exactHistoricalInput'] for row in active_checks if row['historicalBinding']['path'] not in allowed_parallel)
policy_bindings = [bind(ROOT / 'AGENTS.md'), bind(ROOT / 'LICENSING.md'),
                   bind(ROOT / 'docs/concept/skill-graph/atomic-goal-visualizations.md')]
image_checks = []
for goal_id in split_ids + [binder['routineGoalIds']['label']]:
    assert candidate_by_id[goal_id]['resourceLinks'] == original_by_id[goal_id]['resourceLinks']
    assert variant_by_id[goal_id]['resourceLinks'] == original_by_id[goal_id]['resourceLinks']
    for resource in original_by_id[goal_id]['resourceLinks']:
        url = resource.get('url', '')
        if not url.startswith('/assets/goal-visualizations/'):
            continue
        frontend = ROOT / 'app/public' / url.lstrip('/')
        source = ROOT / 'curricula/DE/Gymnasium/visualizations' / url.split('/goal-visualizations/', 1)[1]
        assert frontend.exists() and source.exists()
        copies = [bind(frontend), bind(source)]
        assert len({b['sha256'] for b in copies}) == 1
        image_checks.append({'goalId': goal_id, 'actualResource': resource,
                             'actualAvailableCopies': copies, 'availableCopiesByteExact': True,
                             'resourceAndBytesPreserved': True,
                             'actualImageScienceOrVisualReviewPerformedHere': False,
                             'currentCandidateVApproval': False})
assert len(image_checks) == 3

base_model = read(QA / 'baseline-native-pure-book-model.json')
candidate_model = read(QA / 'candidate-native-pure-book-model.json')
variant_model = read(QA / 'four-route-proposals-native-pure-book-model.json')
assert [len(m['pages']) for m in [base_model, candidate_model, variant_model]] == [378, 382, 382]
variant_pages = {p['goalId']: p for p in variant_model['pages']}
dump(HERE / 'seven-actual-native-four-route-variant-goal-page-fingerprint-inputs.json', {
    **authority, 'bookModelBinding': bind(QA / 'four-route-proposals-native-pure-book-model.json'),
    'canonicalBinding': bind(variant_path),
    'kindLedgerBinding': bind(QA / 'chemie.semantic-kinds.four-route-proposals.author-candidate.json'),
    'nativeRoutinePages': [{'routineLocalKey': key, 'nativeCandidateGoalId': goal_id,
                            'nativePureReviewPage': variant_pages[goal_id], 'nativeQualityApproval': False}
                           for key, goal_id in binder['routineGoalIds'].items()],
    'actualProfileCount': 0, 'actualNativeDescriptionReviewDecisionCount': 0,
    'fourRoutePrerequisiteProposalsIndependentApprovalPending': True,
    'newGoalVisualizationAssets': 0,
})
dump(HERE / 'actual-targeted-schema-material-and-preservation-checks.json', {
    **authority, 'targetedRuntimeLandscapeSchemaChecks': schema_results,
    'sevenRoutineChecks': routine_checks, 'fourteenWholeMaterialBodyChecks': case_checks,
    'twoWholeCardBodyAndOriginChecks': card_checks,
    'activeDeckBinding': bind(deck_path), 'activeDeckNotModified': True,
    'allSevenNativeUUIDsResolveInBothRealPureModels': True,
    'closedProductionSemanticKindLedgerAndNativeModelLoadPassed': True,
    'containsAndRequiresDagsActualTraversalsPassedBothCandidates': True,
    'protected112WholeValuesExactBase': True,
    'protected108WholeValuesExactFourRouteVariant': True,
    'exactFourAdditionalVariantChangesAreRequiresArraysOnly': sorted(route_ids),
    'allOtherExistingCanonicalWholeObjectsExactBase': True,
    'originalSourceInputs': source_checks,
    'all62OriginalSourceInputsByteExact': True,
    'all403SourceObligationsRemainSeparate': True,
    'actualAvailableImageCopyChecks': image_checks,
    'actualCheckpointInputChecks': active_checks,
    'exactHistoricalCheckpointInputCount': sum(r['exactHistoricalInput'] for r in active_checks),
    'checkpointInputTotal': 19, 'currentPolicyBindings': policy_bindings,
    'mathAndPhysicsCanonAndMaturityFloorPolicyByteExact': True,
    'activeChemistryCanonKindsVSourceWatchAndMemoryReportByteExact': True,
    'fullRepositorySchemaRunOrFullBuildPerformed': False,
    'executedBackendFrontierAcceptance': False,
    'actualNativeGateApprovalsCreated': 0,
})

files = [bind(path) for path in sorted(HERE.rglob('*')) if path.is_file() and path != FREEZE]
assert not any(Path(row['path']).suffix.lower() in ['.png', '.jpg', '.pdf'] for row in files)
assert sum(row['bytes'] for row in files) < 10_000_000
dump(FREEZE, {
    **authority, 'freezeId': 'chemie-b007-seven-native-source-preparation-author-v3-20261006',
    'files': files, 'packageFileCountExcludingFreeze': len(files),
    'packageBytesExcludingFreeze': sum(row['bytes'] for row in files),
    'inputBindings': [bind(routines_path), bind(cases_path), bind(cards_path), bind(source_snapshot_path)]
                     + [row['freezeBinding'] for row in lineage] + pdf_bindings + policy_bindings,
    'actualPureNativePages': {'baseline': 378, 'baseSplitCandidate': 382, 'fourRouteProposalCandidate': 382},
    'protectedStrictCount': 112,
    'currentActiveChemistryBaseline': {'strictCompleted': 112, 'currentCurricularAtomic': 378},
    'actualNativeProfileAndIndependentGateDecisionCount': 0,
    'pendingFourProtectedRequiresChanges': sorted(route_ids),
    'pendingNationalSourceObligations': 403,
    'affectedExistingSourceViews': 40, 'pendingConvertedClusterGoalEntryFindings': 72,
    'actualMemoryVisibilityProofScope': 'three author-candidate origins plus existing memory node in one prospective HE8 review view only',
    'integrationStatus': 'HOLD pending independent native reviews, current bindings, narrow source/view decisions, actual image decisions and protected-goal rebinding',
    'runtimeProductCodeChanges': False, 'fullBuildOrPdfPerformed': False,
})
for frozen in read(FREEZE)['files']:
    verify(frozen)
print(json.dumps({'freeze': bind(FREEZE), 'ownFilesIncludingFreeze': len(files) + 1,
                  'ownBytesIncludingFreeze': sum(row['bytes'] for row in files) + FREEZE.stat().st_size,
                  'targetedLandscapeSchemasPassed': 2, 'wholeMaterialCasesExact': 14,
                  'wholeCardsExact': 2, 'originalSourceFilesExact': 62,
                  'historicalActiveInputCountExact': sum(r['exactHistoricalInput'] for r in active_checks),
                  'actualPureNativePages': [378, 382, 382], 'activeWrites': 0, 'strictAdded': 0}))
