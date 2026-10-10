from pathlib import Path
import datetime
import hashlib
import json
import os
import subprocess
import sys

import jsonschema
from referencing import Registry, Resource

ROOT = Path.cwd()
sys.path.insert(0, str(ROOT))
from scripts.validate_schemas import curriculum_symlink_errors, validate_file

OUT = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-sek1-insect-eight-reviewed-integration-technical-v1')


def sha(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()


def bind(path):
    path = Path(path)
    assert not path.is_absolute() and '..' not in path.parts, str(path)
    data = path.read_bytes()
    return {'path': str(path), 'sha256': sha(data), 'bytes': len(data)}


def read(path):
    return json.loads(Path(path).read_text())


seen = set()


def verify(value):
    if isinstance(value, dict):
        if isinstance(value.get('path'), str) and isinstance(value.get('sha256'), str):
            actual = bind(value['path'])
            assert actual['sha256'].removeprefix('sha256:') == value['sha256'].removeprefix('sha256:'), value['path']
            if isinstance(value.get('bytes'), int):
                assert actual['bytes'] == value['bytes'], value['path']
            seen.add(value['path'])
        for child in value.values():
            verify(child)
    elif isinstance(value, list):
        for child in value:
            verify(child)


def put(name, value):
    path = OUT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    assert not path.exists(), str(path)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return bind(path)


entry = read(OUT / 'reviewed-eight-integration.technical.entry.json')
verify(entry)
for seal in entry['actualReviewSeals']:
    verify(read(seal['path']))
plan = read(entry['actualRasterCopyPlan']['path'])
verify(plan)
terminals = read(OUT / 'checks/normal-inactive-terminals.actual.json')
assert len(terminals['runs']) == 4 and all(run['exitCode'] == 0 for run in terminals['runs'])
assert len(plan['exactCopies']) == 91
assert len(set(copy['to'] for copy in plan['exactCopies'])) == 91
assert all(not Path(copy['to']).exists() for copy in plan['exactCopies'])
proof_path = OUT / 'checks/normal-whole479-source31-scope24-native394-protected327.actual.json'
proof = read(proof_path)
assert proof['whole479SemanticSourceFingerprintsExact'] == 479 and proof['denominatorBeforeAndAfter'] == 394
assert proof['protected327WholeGoalsAndWholePagesExact'] and proof['remaining386WholePagesExact']
assert proof['normalModelRebuiltInMemoryExact'] and proof['source31Scopes24CountsAndEveryGoalSetWitnessExact']
assert proof['historicalOriginalFCCActualAblockBkeepDeferred'] and proof['currentFCCNotDeferredOrArtificiallySuperseded']
assert len(proof['nativeBindings']) == 8 and all(row['exactTitleDescriptionVisualizationAndOperativePReviewContext'] for row in proof['nativeBindings'])

resources = []
schemas_by_id = {}
declared_schema_ids = set()
for path in OUT.rglob('*.json'):
    value = read(path)
    if isinstance(value, dict) and isinstance(value.get('$schema'), str):
        declared_schema_ids.add(value['$schema'])
schema_paths = list(Path('contracts').rglob('*.schema.json'))
schema_paths.append(Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/deep-understanding-rollout.schema.json'))
for path in sorted(schema_paths):
    schema = read(path)
    if isinstance(schema, dict) and schema.get('$id') in declared_schema_ids:
        assert schema['$id'] not in schemas_by_id, schema['$id']
        schemas_by_id[schema['$id']] = schema
        resources.append((schema['$id'], Resource.from_contents(schema)))
registry = Registry().with_resources(resources)
runtime = read('docs/landscape-runtime.schema.json')
own_json = []
explicit_closed = []
for path in sorted(OUT.rglob('*.json')):
    value = read(path)
    assert validate_file(str(path), runtime), str(path)
    own_json.append(str(path))
    if isinstance(value, dict) and isinstance(value.get('$schema'), str) and value['$schema'].startswith('https://skillpilot.com/schemas/'):
        jsonschema.Draft202012Validator(schemas_by_id[value['$schema']], registry=registry).validate(value)
        explicit_closed.append(str(path))
# Validate actual full candidate against the unmodified runtime schema explicitly, in addition to ordinary discovery.
jsonschema.validate(read(entry['futureCanonicalCopy']['path']), runtime)
symlinks = curriculum_symlink_errors(ROOT)
assert not symlinks, symlinks
result = subprocess.run(['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', str(OUT)],
                        capture_output=True, check=True)
committable = set(os.fsdecode(path) for path in result.stdout.split(b'\0') if path)
own = [path for path in sorted(OUT.rglob('*')) if path.is_file() or path.is_symlink()]
assert all(str(path) in committable for path in own), [str(path) for path in own if str(path) not in committable]
schema_proof = put('checks/targeted-runtime-closed-schema-and-committable-portability.actual.json', {
    'schemaVersion': 1, 'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'normalOwnValidateFilePassed': own_json, 'explicitExistingClosedContractCheckedFiles': explicit_closed,
    'actualFullCandidateExplicitRuntimeSchemaPassed': True,
    'ordinaryCurriculumSymlinkErrors': symlinks, 'ownFilesAllCommittable': True,
    'ownFilesChecked': len(own), 'declaredBoundInputsReverified': len(seen),
    'normalInactiveTerminalsPassed': 4, 'activeBeforeBytesExact': True,
    'checkerChangesOrExceptions': False,
})
handoff = put('ADOPTION.handoff.actual.json', {
    'schemaVersion': 1, 'preparedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'authority': 'inactive_technical_adoption_handoff_only',
    'technicalIntegratorIsExistingIndependentA': True, 'thirdScientificReview': False,
    'scientificAndTechnicalReviewSeals': entry['actualReviewSeals'],
    'normalInactiveTerminals': bind(OUT / 'checks/normal-inactive-terminals.actual.json'),
    'normalWholeModelScopeProtectedProof': bind(proof_path), 'targetedPortabilityProof': schema_proof,
    'proposedActiveCopies': [
        {'from': entry['futureCanonicalCopy'], 'to': entry['beforeActiveBindings'][0]['path'],
         'scope': 'Only eight resourceLinks; all479 semantic fingerprints and protected327 fullGoals/fullPages unchanged'},
        {'from': entry['futureRegistry'], 'to': entry['beforeActiveBindings'][2]['path'],
         'scope': 'Append only Bio original7strict+1defer and currentFCC1strict D indices plus exact operative authorP7/P1 configs; allotherobjects/floors unchanged'},
    ],
    'inactiveFutureQA': bind(OUT / 'candidate/QA8.future-active.paired-current-machine.json'),
    'normalQAGenerationAndPairedMachineProof': bind(OUT / 'checks/normal-QA8-current-generation-and-exact-paired-KEEP.actual.json'),
    'QAAdoptionInstruction': 'Root may regenerate normal active QA after exact canonical/public/backend copies, then annotate only8current rows from the preserved paired actualKEEP; no human promotion or oldFCC retroapproval',
    'exactRasterAndMetadataCopyPlan': entry['actualRasterCopyPlan'], 'exactCopiesCount': 91,
    'actualCurrentPairedMachineV': entry['pairedCurrentMachineV'],
    'operativeExactAuthorP7AndCurrentP1': entry['operativeOriginalAuthorP7AndSeparateCurrentP1'],
    'original7PlusHistoricalDeferredFCCIndex': entry['normalOriginal7PlusDeferredFCCIndex'],
    'currentFCC1StrictIndex': entry['normalCurrentFCC1Index'],
    'originalFCCSupersessionToDeferredNeeded': False, 'noCurrentTwoKeepDeferred': True,
    'normalA394M394CurrentRootPreflight': entry['normalA394M394CurrentPreflight'],
    'wholeSource31Scope24KindsAMScientificChangesNeeded': False,
    'baselineProtectedStrictIds': 327, 'currentCentralStrictGainMustBeMeasuredAfterRootAdoption': True,
    'rootStillOwnsBundledFullChecks': True, 'activeWrites': False,
    'newActiveScientificClosures': 0, 'restoredActiveBindings': 0, 'strictNetGain': 0,
    'humanApproval': False, 'humanTrial': False,
})
final = put('technical.final.entry.json', {
    'schemaVersion': 1, 'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role': 'Completed inactive reviewed Insect8 normal technical integration; existing A integrator, not a third scientific reviewer',
    'originalPreparedEntry': bind(OUT / 'reviewed-eight-integration.technical.entry.json'),
    'adoptionHandoff': handoff, 'normalInactiveTerminalsPassed': 4,
    'normalModelScopeProtectedProof': bind(proof_path), 'targetedSchemaAndPortability': schema_proof,
    'whole479SemanticFingerprintAnd394CurrentDenominatorExact': True,
    'wholeSource31AndScope24Exact': True, 'protected327WholeGoalAndWholePageBodiesExact': True,
    'allOther386WholePagesAndQARowsExact': True,
    'whole394NormalModelReproducedExactlyInMemory': True,
    'localNativeFramesKeptSeparatelyNoPageFingerprintEquivalenceInvented': True,
    'operativeAuthorP7AndP1IdsAndWholeRawRecordsExact': True, 'positiveApproved': 0,
    'actualCurrentPairedVKEEP': 8, 'historicalOriginalFCCActualAblockBkeepPreserved': True,
    'normalCurrentDOnlyResolutions': 8, 'originalHistoricalDeferred': 1,
    'allOtherRegistrySubjectsAndFloorsExact': True, 'exactPNGAndCompleteDirectMetadataCopyCount': 91,
    'fullRepositoryCopyOrNewPDFBundle': False, 'activeRootBytesRemainExact': True,
    'rootActiveAdoptionPending': True, 'newActiveScientificClosures': 0,
    'restoredActiveBindings': 0, 'strictNetGain': 0, 'wholeM7Complete': False,
    'newWholeSourceOrCourseAMApproval': False, 'humanApproval': False,
    'humanTrial': False, 'actualLearnerPerformance': False,
    'modelParameters': {'provider': 'OpenAI', 'exactModelVersion': 'unknown', 'samplingParameters': 'unknown', 'modelDiversityClaim': False},
})
for path in [OUT / 'ADOPTION.handoff.actual.json', OUT / 'technical.final.entry.json']:
    assert validate_file(str(path), runtime)
verify(entry)
freeze = put('technical.final.freeze.json', {
    'schemaVersion': 1, 'sealedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role': 'Final inactive technical eight-goal adoption package; no active mutation or third scientific review',
    'entry': final, 'adoptionHandoff': handoff,
    'wholeOwnRegularFiles': [bind(path) for path in sorted(OUT.rglob('*'))
                            if path.is_file() and not path.is_symlink() and path.name != 'technical.final.freeze.json'],
    'unchangedScientificAndTechnicalSourceSeals': entry['actualReviewSeals'],
    'normalInactiveTerminalsPassed': 4, 'targetedSchemaAndPortabilityPassed': True,
    'rootActiveBytesReverifiedUnchanged': entry['beforeActiveBindings'],
    'rootAdoptionAndFullStableChecksPending': True, 'activeWrites': False,
    'strictNetGain': 0, 'humanApproval': False, 'humanTrial': False,
})
assert validate_file(str(OUT / 'technical.final.freeze.json'), runtime)
print('PASS inactive reviewed Insect8 whole479/394/source31/scope24/P7/P1/model/QA8/portability; no active or historical mutation')
print('ENTRY', final)
print('HANDOFF', handoff)
print('FREEZE', freeze)
