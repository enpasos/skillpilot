#!/usr/bin/env python3
"""Targeted immutable source/material lineage checks; no active writes or approval."""
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
FREEZE = HERE / 'native-source-preparation-author-v11.final.freeze.json'
assert not FREEZE.exists(), 'Sealed history must never be overwritten'
STAMP = datetime.now(timezone.utc).isoformat()


def read(path):
    return json.loads(path.read_text())


def bind(path):
    raw = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}


def verify(row):
    actual = bind(ROOT / row['path'])
    assert actual['sha256'] == row['sha256'], row['path']
    if 'bytes' in row:
        assert actual['bytes'] == row['bytes'], row['path']
    return actual


def valhash(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True).encode()).hexdigest()


def dump(path, value):
    assert path.parent == HERE
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


authority = {'schemaVersion': 1, 'createdAtUTC': STAMP,
             'role': 'targeted actual inert author checks, not independent native QA approval',
             'nativeApproval': False, 'humanApproval': False, 'humanTrial': False,
             'strictCompletionsAdded': 0, 'restoredActiveBindings': 0, 'activeWrites': False}
guard = read(HERE / 'current378-protected112-and-nine-family-structure-input-guard.actual.json')
for key in ['baselineActiveCanon', 'baselineKinds', 'baselineVisualizationQa', 'historicalAuthoritativeCentralReportBinding']:
    verify(guard[key])
original = read(ROOT / guard['baselineActiveCanon']['path'])
candidate_path = QA / 'DE_DEU_S_GYM_CANONICAL_CHEMIE.native-author-candidate.json'
candidate = read(candidate_path)
old_by_id = {g['id']: g for g in original['goals']}
by_id = {g['id']: g for g in candidate['goals']}
assert len(candidate['goals']) == len(by_id) == 503
assert len(original['goals']) == 479
assert all(by_id[g] == old_by_id[g] for g in guard['protectedStrictGoalIds'])
assert len(guard['protectedStrictGoalIds']) == 112
assert all(by_id[g] == old_by_id[g] for g in old_by_id if g not in guard['originalFamilyGoalIds'])
schema_path = ROOT / 'docs/landscape-runtime.schema.json'
schema = read(schema_path)
validator = jsonschema.validators.validator_for(schema)(schema)
errors = list(validator.iter_errors(candidate))
assert not errors, [(list(e.path), e.message) for e in errors]
schema_receipt = {'candidateBinding': bind(candidate_path), 'schemaBinding': bind(schema_path),
                  'validatorType': type(validator).__name__, 'actualErrors': [], 'passed': True}
for relation in ['contains', 'requires']:
    visiting, done = set(), set()
    def visit(goal_id):
        assert goal_id not in visiting, relation + ' cycle at ' + goal_id
        if goal_id in done:
            return
        visiting.add(goal_id)
        for ref in by_id[goal_id].get(relation, []):
            ref_id = ref.split(':')[-1]
            assert ref_id in by_id, relation + ' unresolved ' + ref
            visit(ref_id)
        visiting.remove(goal_id)
        done.add(goal_id)
    for goal_id in by_id:
        visit(goal_id)

V7 = BASE / 'chemie-b008-twenty-six-literal-operator-prerequisite-author-v7'
V8 = BASE / 'chemie-b008-twenty-six-positive-materials-author-v8'
V9 = BASE / 'chemie-b008-targeted-material-corrections-author-v9'
V10 = BASE / 'chemie-b008-colour-calibration-domain-targeted-author-v10'
atoms_path = V7 / 'twenty-six-atomic-boundaries.de-en.author-proposal.json'
profiles_path = V8 / 'twenty-six-positive-profiles.de-en.author-candidate.json'
cases_path = V10 / 'fifty-two-cases.de-en.author-candidate.json'
atoms = {a['candidateKey']: a for a in read(atoms_path)['atoms']}
profiles = {p['candidateKey']: p for p in read(profiles_path)['profiles']}
cases = {c['caseKey']: c for c in read(cases_path)['cases']}
v8_cases = {c['caseKey']: c for c in read(V8 / 'fifty-two-cases.de-en.author-candidate.json')['cases']}
v9_cases = {c['caseKey']: c for c in read(V9 / 'fifty-two-cases.de-en.author-candidate.json')['cases']}
binder = read(HERE / 'twenty-six-native-uuid-and-current-v10-material-profile-binders.author-candidate.json')
assert len(atoms) == len(profiles) == len(binder['profileBinders']) == 26
assert len(cases) == len(v8_cases) == len(v9_cases) == 52
assert sum(cases[k] == v8_cases[k] for k in cases) == 40
assert sum(cases[k] == v9_cases[k] for k in cases) == 51
assert set(cases) == set(v8_cases) == set(v9_cases)
atom_checks, profile_checks = [], []
ids = binder['routineGoalIds']
retained_keys = {r['candidateKey'] for r in binder['atomBinders'] if r['retainedSingleRoutineUUID']}
assert retained_keys == {'criteria-decision', 'upper-scientific-discourse'}
for key, atom in atoms.items():
    goal_id = ids[key]
    expected_id = atom['originalFamilyGoalId'] if key in retained_keys else str(uuid.uuid5(
        uuid.UUID(atom['originalFamilyGoalId']), 'skillpilot:de-gymnasium:chemie:b008:routine:' + key))
    assert goal_id == expected_id
    for native, author in [('title', 'titleDe'), ('titleEn', 'titleEn'), ('description', 'descriptionDe'), ('descriptionEn', 'descriptionEn')]:
        assert by_id[goal_id][native] == atom[author]
    assert by_id[goal_id]['requires'] == [ids.get(r, r) for r in atom['prerequisiteProposalKeysOrExistingIds']]
    atom_checks.append({'candidateKey': key, 'goalId': goal_id, 'uuidCorrect': True,
                        'DEENFullTitleDescriptionExactReviewedV7': True,
                        'directRequiresExactReviewedV7Proposal': True,
                        'wholeV7PrototypeValueSha256': valhash(atom)})
for row in binder['profileBinders']:
    key = row['candidateKey']
    profile = profiles[key]
    assert valhash(profile) == row['wholeProfileValueSha256']
    assert profile['goalId'] is None and row['bodyGoalIdRetained'] is None
    assert profile['status'] == row['status'] == 'ai_candidate'
    assert profile['reviewStatus'] == row['reviewStatus'] == 'needs_human_review'
    verify(row['unchangedV8ProfileBinding'])
    assert profile['descriptionBindingCandidate'] == {'de': atoms[key]['descriptionDe'], 'en': atoms[key]['descriptionEn']}
    assert set(profile['caseKeys']) == {r['caseKey'] for r in row['correctedCurrentMaterials']}
    for material in row['correctedCurrentMaterials']:
        case = cases[material['caseKey']]
        assert valhash(case) == material['wholeCaseValueSha256']
        assert case['candidateKey'] == key
        verify(material['actualCurrentV10Materials'])
    profile_checks.append({'candidateKey': key, 'goalId': row['nativeCandidateGoalId'],
                           'wholeProfileValueSha256': valhash(profile), 'wholeProfileExactReviewedV8': True,
                           'actualCurrentMaterialCaseKeys': profile['caseKeys'],
                           'wholeCurrentV10CasesExactToDirectBinders': True,
                           'nativeProfileApproval': False})
for goal_id in guard['convertedClusterGoalIds']:
    restored = deepcopy(by_id[goal_id])
    for field in ['type', 'contains', 'weight', 'requires']:
        restored[field] = old_by_id[goal_id][field]
    assert restored == old_by_id[goal_id], 'Unexpected converted-parent change beyond declared structure'
    assert by_id[goal_id]['requires'] == []

lineage_specs = [
    ('source-structure-synthesis-v4', 'chemie-b008-nine-current-source-structure-synthesis-v4/operator-synthesis.final.freeze.json', '903d24f1299ed8c06559515e000d9c5c5f062cd9221897ada2ce1934f162a17a'),
    ('author-operator-v7', 'chemie-b008-twenty-six-literal-operator-prerequisite-author-v7/four-targeted-prototypes.author-v7.final.freeze.json', 'fba66db68a64a993512575fe00caf97bd56daa414a5b25be8b699a343b350667'),
    ('independent-A-operator-v7', 'chemie-b008-four-products-v7-independent-a-followup-v1/same-independent-a.v7-followup.complete.final.freeze.json', '6fee139b31e178283e52d98fe94ee8ff5e3d38826fff735690129f6a188837fd'),
    ('independent-B-operator-v7', 'chemie-b008-four-products-v7-independent-b-followup-v1/independent-b-v7-followup.final.freeze.json', 'af8895e3abb7781fd4131f29fc623711a6675199024bb3d42d753448fb634e73'),
    ('author-materials-and-profiles-v8', 'chemie-b008-twenty-six-positive-materials-author-v8/author-materials-v8.final.freeze.json', 'a86b11b5de0ea0e858468bc37dccdbdda06f0d4c2461dc10e9cd8eea57ac97e1'),
    ('independent-A-materials-v8', 'chemie-b008-fifty-two-materials-v8-independent-a-v1/independent-a.v8-materials.complete.final.freeze.json', 'ba866739b7ec4c121bfc81d633946b97e44a91d49f9151ed8f713d7e0064e325'),
    ('independent-B-materials-v8', 'chemie-b008-fifty-two-materials-v8-independent-b-v1/independent-b-v8-materials.final.freeze.json', 'fb954d56b2f1b0d187843e435b92c72ca8783d4e8f291783974a0a4ea919154d'),
    ('author-targeted-materials-v9', 'chemie-b008-targeted-material-corrections-author-v9/author-targeted-materials-v9.final.freeze.json', '1f345647b538dec5d88ac575643dce1754aee4375a1f0641c48a433a604e941a'),
    ('independent-A-material-deltas-v9', 'chemie-b008-twelve-material-deltas-v9-independent-a-v1/independent-a-v9-material-deltas.final.freeze.json', 'eb2a9538b54e9ddb3ac0b4709049322786a603ff6be04e01c7f9b939104cc5a9'),
    ('author-transfer-domain-v10', 'chemie-b008-colour-calibration-domain-targeted-author-v10/author-calibration-domain-v10.final.freeze.json', '4d87c6e7ab2ff360979f2ae410ae970258353b23f1506c69c0554e583e1ac347'),
    ('independent-A-two-transfer-fields-v10', 'chemie-b008-colour-calibration-domain-v10-independent-a-followup-v1/independent-a-v10-two-transfer-fields.final.freeze.json', 'dd873121f48a01f6de442624dce1fed481879c143dd97d5f55d8a16664af43e2'),
    ('independent-B-twelve-current-cases-v10', 'chemie-b008-twelve-material-deltas-v10-independent-b-v1/independent-b-v10-material-deltas.final.freeze.json', '85145db992725f7a0456795871948c99954107a4712f0c5d6a6378b77ec0dc0b'),
]
lineage = []
for role, rel_path, expected in lineage_specs:
    path = BASE / rel_path
    actual = bind(path)
    assert actual['sha256'] == expected, rel_path
    freeze = read(path)
    files = freeze.get('files', freeze.get('ownFiles', []))
    assert files, 'Actual own-file freeze list required'
    for row in files:
        # Historical packages use either repository-relative or package-relative
        # own-file paths. Resolve that existing convention without changing them.
        listed_path = Path(row['path'])
        file_path = ROOT / listed_path if listed_path.parts[0] in ['curricula', 'app', 'docs', 'contracts'] else path.parent / listed_path
        assert file_path.resolve().is_relative_to(path.parent.resolve()), 'Own freeze listed an outside file'
        verify({**row, 'path': str(file_path.relative_to(ROOT))})
    lineage.append({'role': role, 'freezeBinding': actual, 'actuallyVerifiedFrozenOwnFileCount': len(files),
                    'allFrozenOwnFilesStillExact': True, 'historicalNativeOrHumanApprovalPromoted': False})

source = read(HERE / 'twenty-six-partial-source-components-and-original-national-holds.author-candidate.json')
inventory_path = ROOT / source['sourceInventoryBinding']['path']
verify(source['sourceInventoryBinding'])
inventory = read(inventory_path)
assert len(inventory['directBindings']) == 1646
source_input_checks = []
for row in inventory['files']:
    mapping = bind(ROOT / row['mappingPath'])
    extraction = bind(ROOT / row['sourceExtractionPath'])
    assert mapping['sha256'] == row['mappingSha256']
    assert extraction['sha256'] == row['sourceExtractionSha256']
    source_input_checks.append({'mapping': mapping, 'sourceExtraction': extraction, 'wholeFilesByteExact': True})
assert len(source_input_checks) == 29
all_source_values = {r['wholeSourceGoal']['id']: r['wholeSourceGoal'] for r in inventory['directBindings']}
all_source_passages = {r['wholeSourceGoal']['id']: r['wholePassage'] for r in inventory['directBindings']}
partial_map_path = QA / 'BY.partial-source-route.author-candidate.json'
partial_map = read(partial_map_path)
assert len(source['placements']) == 26
assert len(partial_map['mappings']) == 51
assert all(r['matchType'] == 'partial' for r in partial_map['mappings'])
for placement in source['placements']:
    assert placement['nativeCandidateGoalId'] == ids[placement['candidateKey']]
    for witness in placement['primaryComponents']:
        source_id = witness['originalSourceGoalId']
        assert valhash(all_source_values[source_id]) == witness['wholeSourceGoalValueSha256']
        assert valhash(all_source_passages[source_id]) == witness['originalWholePassageValueSha256']
        verify(witness['originalSourceExtractionBinding'])
        verify(witness['retainedPrimaryCaptureBinding'])
        assert witness['proposedMatchType'] == 'partial'
        assert witness['wholeSourceRowOrAllSharedContextsCleared'] is False
for mapping in partial_map['mappings']:
    assert mapping['legacyGoalId'] in all_source_values and mapping['canonicalGoalId'] in by_id
native = read(HERE / 'actual-native-pure-model-schema-and-protected112-bindings.json')
assert native['actualPureModelPages'] == {'baseline': 378, 'candidate': 395, 'partialBYSourceProducts': 26}
assert native['protected112WholeObjectsAndGoalFingerprintsExact'] is True
assert native['protected112PageContentIgnoringPaginationExactCount'] == 108
for row in native['productionHelpers'] + native['actualPureBookModelBindings']:
    verify(row)
views = read(HERE / 'actual-affected-existing-source-views-and-operator-placement-holds.json')
assert views['actuallyAffectedSourceViewCount'] == 43
assert views['pendingConvertedClusterGoalEntryFindingCount'] == 141
for row in views['affectedViews']:
    verify(row['sourceViewBinding'])
native_input = read(HERE / 'twenty-six-actual-native-goal-page-source-material-fingerprint-inputs.json')
assert len(native_input['nativeRoutinePages']) == 26
for row in native_input['nativeRoutinePages']:
    assert row['actualWholeUniversePage']['goalId'] == row['actualPartialBYSourcePage']['goalId'] == row['nativeCandidateGoalId']
    assert row['actualWholeUniversePage']['goalFingerprint'] == row['actualPartialBYSourcePage']['goalFingerprint']
    assert row['actualWholeUniversePage']['description'] == atoms[row['candidateKey']]['descriptionDe']

image_checks = []
for goal_id in guard['originalFamilyGoalIds']:
    assert by_id[goal_id]['resourceLinks'] == old_by_id[goal_id]['resourceLinks']
    for resource in old_by_id[goal_id]['resourceLinks']:
        url = resource.get('url', '')
        if not url.startswith('/assets/goal-visualizations/'):
            continue
        frontend = ROOT / 'app/public' / url.lstrip('/')
        source_asset = ROOT / 'curricula/DE/Gymnasium/visualizations' / url.split('/goal-visualizations/', 1)[1]
        assert frontend.exists() and source_asset.exists()
        copies = [bind(frontend), bind(source_asset)]
        assert len({r['sha256'] for r in copies}) == 1
        image_checks.append({'goalId': goal_id, 'actualCopies': copies, 'resourceLinksAndImageBytesRetained': True,
                             'actualImageInspectionOrCurrentVApprovalPerformedHere': False})
assert len(image_checks) == 9
historical19 = read(BASE / 'chemie-b007-seven-routines-four-material-corrections-author-v2/actual-current-input-preservation-and-turn-revalidation.json')['activeCurrentCheckpointInputsRehashedExactly']
parallel_paths = {'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
                  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',
                  'docs/qa-ci/status/curriculum-quality-status.json', 'docs/qa-ci/status/curriculum-quality-status.md',
                  'docs/legal/ai-transparency-inventory.json'}
active_checks = []
for row in historical19:
    actual = bind(ROOT / row['path'])
    exact = actual['sha256'] == row['sha256'] and actual['bytes'] == row['bytes']
    assert exact or row['path'] in parallel_paths, row['path']
    active_checks.append({'historicalBinding': row, 'actualCurrentBinding': actual, 'exactHistoricalInput': exact,
                         'deltaExplanation': None if exact else 'Parent-authorized parallel Biology/source-view/image integration; no write by this Chemistry author. Historical binding unmodified.'})
assert len(active_checks) == 19
policy_bindings = [bind(ROOT / 'AGENTS.md'), bind(ROOT / 'LICENSING.md'), bind(ROOT / 'docs/concept/skill-graph/atomic-goal-visualizations.md')]
primary_root = inventory_path.parent / 'primary-inputs'
read_spans = [
    ('by8.actual-main.txt', [[1, 80]]), ('by9-ntg.actual-main.txt', [[1, 75]]),
    ('by9-ch.actual-main.txt', [[82, 102]]), ('by10-ch.actual-main.txt', [[1, 96]]),
    ('by11.actual-main.txt', [[1, 115]]), ('by12-ga.actual-main.txt', [[38, 64], [67, 215]]),
    ('actual-primary-pdf-pages/ni-i-physical-page-054.txt', [[1, 51]]),
    ('actual-primary-pdf-pages/ni-i-physical-page-060.txt', [[1, 65]]),
    ('actual-primary-pdf-pages/ni-ii-physical-page-017.txt', [[1, 67]]),
]
dump(HERE / 'actual-primary-reading-material-review-lineage-and-national-holds.json', {
    **authority, 'exactImmutableReviewAndAuthorLineage': lineage,
    'v7FourTargetedProductsAnd22UnchangedPrototypeReviewContinuity': True,
    'v10CurrentMaterialsHave40WholeV8CasesAnd51WholeV9CasesExact': True,
    'AReviewRoute': 'v8 immutable case/profile baseline → v9 eleven changed-case KEEP and one new calibration-domain transfer finding → v10 two corrected-transfer fields KEEP, same own finding resolved',
    'BReviewRoute': 'v8 immutable baseline → fresh independent v10 twelve changed-case KEEP, old own findings resolved; forty unchanged whole-case reviews reused exactly',
    'historicalReviewBodyNotReissuedByAuthorAsOwnIndependentVerdict': True,
    'actuallyReadRetainedPrimarySpans': [{'binding': bind(primary_root / p), 'lineRanges': ranges} for p, ranges in read_spans],
    'freshOfficialWebPagesOpened': [
        'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/8/chemie',
        'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/chemie/ch-ntg',
        'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/chemie/ch',
        'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch',
        'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/11/chemie',
        'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/chemie/grundlegend'],
    'freshWebVsRetainedCaptureFullByteEqualityClaimed': False,
    'actualK11RetainedPrimaryLines': [138, 140],
    'nineteenHistoricalCheckpointInputsCurrentEqualityNotAssumed': True,
    'allOriginalSource1646WholeRecordsRetainedExternally': verify(source['sourceInventoryBinding']),
    'all29OriginalMappingExtractionPairsActualByteExact': source_input_checks,
    'sourceHoldsCleared': 0, 'wholeNationalSourceOrCourseUnionApproval': False,
})
dump(HERE / 'actual-targeted-schema-material-and-active-preservation-checks.json', {
    **authority, 'actualRuntimeLandscapeSchemaCheck': schema_receipt,
    'actualUnchangedProductionNativeKindAndPureBookChecks': bind(HERE / 'actual-native-pure-model-schema-and-protected112-bindings.json'),
    'twentySixUUIDTextAndDirectRequiresChecks': atom_checks,
    'twentySixCurrentProfileAndFiftyTwoV10MaterialChecks': profile_checks,
    'wholeUnchangedV8CaseObjectCount': 40, 'wholeUnchangedV9CaseObjectCount': 51,
    'sevenConvertedParentsOnlyTypeContainsWeightRequiresChanged': True,
    'retainedSingleRoutineIds': guard['retainedSingleRoutineGoalIds'],
    'protected112WholeGoalObjectsAndGoalFingerprintsExact': True,
    'outsideNineExistingWholeGoalObjectsExact': True,
    'containsAndRequiresReferenceResolutionAndDagsPassed': True,
    'all51ProspectiveSourceEdgesPartialAndResolveActualSourceGoalIDs': True,
    'prospectiveMappingReviewFileIsNotReviewedPublicationSchemaArtifact': True,
    'fullNationalSourceAtlasBuildOrApprovalPerformed': False,
    'nineExistingImageSourceAndFrontendCopyChecks': image_checks,
    'actualCheckpointInputChecks': active_checks,
    'exactHistoricalCheckpointInputCount': sum(r['exactHistoricalInput'] for r in active_checks),
    'checkpointInputCount': 19, 'currentPolicyBindings': policy_bindings,
    'chemistryCanonKindsVSourceWatchAndMemoryReportUnchanged': True,
    'mathematicsPhysicsCanonAndMaturityFloorPolicyByteExact': True,
    'nativeMemoryDecisionsOrCardsActivated': 0, 'newVisualizationsGenerated': 0,
    'nativePApprovalOrActualLearnerEvidenceCreated': 0,
    'fullBuildOrPDFOrGlobalQSRerunPerformed': False,
})
files = [bind(p) for p in sorted(HERE.rglob('*')) if p.is_file() and p != FREEZE]
assert not any(Path(r['path']).suffix.lower() in ['.png', '.jpg', '.pdf'] for r in files)
assert sum(r['bytes'] for r in files) < 10_000_000
dump(FREEZE, {
    **authority, 'freezeId': 'chemie-b008-twenty-six-native-source-preparation-author-v11-20261006',
    'files': files, 'packageFileCountExcludingFreeze': len(files), 'packageBytesExcludingFreeze': sum(r['bytes'] for r in files),
    'inputBindings': [bind(atoms_path), bind(profiles_path), bind(cases_path), verify(source['sourceInventoryBinding'])]
                     + [r['freezeBinding'] for r in lineage] + policy_bindings,
    'currentActiveChemistryBaseline': {'strictCompleted': 112, 'curricularAtomic': 378},
    'actualPureNativePages': {'baseline': 378, 'candidateUniverse': 395, 'partialBYSourceProducts': 26},
    'newAtomicUUIDs': 24, 'retainedSingleAtomicUUIDs': 2, 'convertedBroadClusterUUIDs': 7,
    'actualWholeCasesDirectlyBound': 52, 'actualWholeV8ProfilesDirectlyBound': 26,
    'actualNewNativePositiveUnderstandingEvidenceV2ProfilesOrDescriptionDecisions': 0,
    'protected112WholeObjectsAndGoalFingerprintsExact': True,
    'protectedChangedPageContextCount': 4, 'protectedRequiresConsumerCount': 3,
    'actualAffectedExistingSourceViews': 43, 'pendingConvertedClusterGoalEntryFindings': 141,
    'originalNationalSourceObligationsRemainSeparate': 1646,
    'explicitProspectiveNativePartialSourceComponents': 51,
    'integrationStatus': 'HOLD pending independently checked native D/P/A/M/V, narrow source/stage/course/target decisions, current wrapper/consumer routes and protected bindings',
    'runtimeProductCodeOrRegistryOrLedgerWrites': False,
    'gitDeploymentOrPublicationOperations': False,
})
for row in read(FREEZE)['files']:
    verify(row)
print(json.dumps({'freeze': bind(FREEZE), 'ownFilesIncludingFreeze': len(files)+1,
                  'ownBytesIncludingFreeze': sum(r['bytes'] for r in files)+FREEZE.stat().st_size,
                  'runtimeLandscapeSchemaPassed': True, 'UUIDsBound': 26, 'materialsBound': 52,
                  'nativePurePages': [378,395,26], 'originalSourcePairsExact': 29,
                  'protectedWholeGoalAndGoalFpExact': 112, 'activeWrites': 0, 'strictAdded': 0}))
