# SPDX-License-Identifier: Apache-2.0
"""Close actual technical checks and seal the ordinary guarded preparation."""
import hashlib, importlib.util, json, subprocess
from datetime import datetime, timezone
from pathlib import Path
import jsonschema

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
CAP = ROOT / 'tmp/biologie-basis2-supplement-reviewed394-regular-resumed-v2-capsule'

def read(p):
    return json.loads(Path(p).read_text())

def bind(p):
    p = Path(p)
    raw = p.read_bytes()
    return {'path': p.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

def put(p, value):
    p = Path(p)
    assert not p.exists(), str(p)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return bind(p)

guard = read(OWN / 'reviewed-supplement-adoption.candidate.guard.json')
labels = ['ordinary-source-atlas394-refresh', 'ordinary-source-atlas394-freshness', 'ordinary-P2-genuine-unchanged-science', 'ordinary-A394-current-full', 'ordinary-M394-eight-scopes-normal-runtime-input-repaired', 'ordinary-V394-current-freshness', 'ordinary-whole394-genuine-native-context-frame', 'ordinary-central-bio246-of394', 'ordinary-dependent-status-source-CQR003-refresh', 'ordinary-all-nine-protected-maturity-floors']
for label in labels:
    record = read(OWN / 'checks' / (label + '.terminal.actual.json'))
    assert record['actualExitCode'] == 0, label
    for k in ['stdout', 'stderr']:
        assert bind(ROOT / record[k]['path']) == record[k]
status = read(OWN / 'checks/capsule.curriculum-quality-status.json')
bio = next(c for c in status['curricula'] if c['landscapeId'] == '08a43a1b-d97e-522c-9dfa-c950a493364e')
rules = {r['id']: r for r in bio['rules']}
assert bio['goals'] == 479 and bio['maturity'] == 'M6'
# The generic leaf count includes noncurricular runtime nodes. Use the actual
# authoritative curricularAtomic gate counters for the current394 denominator.
assert rules['CQR-003']['metrics']['totalAtomicGoals'] == 394
assert rules['CQR-003']['status'] == 'pass'
assert rules['CQR-003']['metrics']['unsupportedAssignedAtomicGoals'] == 0
assert rules['CQR-003']['metrics']['unmappedSourceAtomicGoals'] == 0
assert rules['CQR-301']['metrics']['leafGoals'] == 394
assert rules['CQR-302']['metrics']['reviewedGoals'] == 394
assert rules['CQR-302']['metrics']['keptCards'] == 27 and rules['CQR-302']['metrics']['visibilityScopes'] == 8
assert rules['CQR-303']['metrics']['strictComplete'] == 246 and rules['CQR-303']['metrics']['expectedGoals'] == 394
policy = read(CAP / 'app/scripts/config/curriculum-maturity-floor-policy.json')
assert len(policy['floors']) == 9
floor_entries = []
for floor in policy['floors']:
    row = next(c for c in status['curricula'] if c['landscapeId'] == floor['landscapeId'])
    assert int(row['maturity'][1:]) >= int(floor['minimumMaturity'][1:])
    floor_entries.append({'landscapeId': row['landscapeId'], 'subject': row['subject'], 'minimumMaturity': floor['minimumMaturity'], 'actualMaturity': row['maturity']})
assert [c['maturity'] for c in status['curricula'] if c['path'].endswith('DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')] == ['M7']
assert [c['maturity'] for c in status['curricula'] if c['path'].endswith('DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')] == ['M7']
dependent = put(OWN / 'checks/dependent-source-CQR003-and-nine-floors.actual.json', {
    'schemaVersion': 1, 'actualStatusExitCode': 0, 'actualFloorCheckExitCode': 0,
    'bioCQR003': rules['CQR-003'], 'bioCQR301': rules['CQR-301'], 'bioCQR302': rules['CQR-302'], 'bioCQR303': rules['CQR-303'],
    'allNineProtectedFloorsPassed': True, 'protectedFloors': floor_entries,
    'statusArtifact': bind(OWN / 'checks/capsule.curriculum-quality-status.json'),
    'machineM7NotYetAchievedForBiology': True, 'humanApproval': False, 'humanTrial': False, 'activeWrites': 0,
})

manifest = read(CAP / 'app/scripts/config/goal-books/de-gym-biology-national-atlas.sources.json')
view_bindings, scopes = [], {gid: [] for gid in guard['newGoalIds']}
for path in manifest['sourcePaths']:
    view = read(CAP / path)
    entries = [item for root in view['rootNodes'] for item in root.get('children', [])]
    assert all(item['kind'] == 'goalEntry' for item in entries)
    for gid in scopes:
        if any(item['goalId'] == gid and item.get('projectionRole', 'target') == 'target' for item in entries):
            scopes[gid].append(view['scope'])
    raw = (CAP / path).read_bytes()
    view_bindings.append({'path': path, 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)})
assert sorted(s['jurisdiction'] for s in scopes[guard['newGoalIds'][0]]) == ['DE-BB', 'DE-BE', 'DE-MV', 'DE-NW', 'DE-SH', 'DE-SN', 'DE-ST', 'DE-TH']
assert scopes[guard['newGoalIds'][1]] == [{'schoolForm': 'Gymnasium', 'jurisdiction': 'DE-SN', 'stage': 'SekI'}]
assert all(s['stage'] == 'SekI' for rows in scopes.values() for s in rows)
source_scope = put(OWN / 'checks/ordinary-atlas-two-exact-eight-and-SN-only-scopes.actual.json', {'schemaVersion': 1, 'sourceManifestExpectedAtoms': manifest['expectedCurricularAtomicGoalCount'], 'actualTargetScopes': scopes, 'actualOrdinarySourceViews': view_bindings, 'noBroadAncestorSourceInheritance': True, 'noSourceCoverageInvented': True, 'activeWrites': 0})

native = [OWN / 'native-d-current-supplement/bundle' / name for name in ['book.html', 'book.pdf']]
index = []
for p in native:
    line = subprocess.check_output(['git', 'ls-files', '--stage', '--', p.relative_to(ROOT).as_posix()], text=True).strip()
    assert line and line.split()[0] == '100644' and line.split()[2] == '0', line
    blob = subprocess.check_output(['git', 'cat-file', 'blob', line.split()[1]])
    assert blob == p.read_bytes()
    index.append({**bind(p), 'actualIndexObject': line.split()[1], 'actualBlobBytesExact': True})
ignored = subprocess.run(['git', 'check-ignore', '--stdin'], input='\n'.join(p.relative_to(ROOT).as_posix() for p in native) + '\n', text=True, capture_output=True)
assert ignored.returncode == 1 and not ignored.stdout
portable = put(OWN / 'checks/portable-native-two-index-bytes.actual.json', {'schemaVersion': 1, 'nativeFiles': index, 'actualRootAuthorizedOnlyTheseTwoNativeCopiesStaged': True, 'ordinaryCheckIgnoreExitCode': 1, 'noIgnoreOrValidatorRuleChanges': True, 'noAgentStageOrCommitOrPush': True})

guard['requiredTechnicalProofs'] = {
    'strictProgress': bind(OWN / 'checks/strict-bio246-of394-new2-old244-exact.actual.json'),
    'wholeCurrentFrame': bind(OWN / 'checks/capsule-whole394-genuine-reviewed-frame.actual.json'),
    'dependentStatusAndFloors': dependent, 'ordinarySourceScopes': source_scope,
    'currentSourcePreservation': bind(OWN / 'checks/current-source-partner-preservation.corrected-baseline-comparison.actual.json'),
    'originalGenuineSeals': bind(OWN / 'checks/original-six-science-and-two-current-context-seals.actual.json'),
    'currentTwoNormalDAdoption': bind(OWN / 'checks/genuine-current-two-native-D-direct-existing-contracts.actual.json'),
    'portableNativeTwo': portable,
}
guard['candidateActuallyCheckedStrictComplete'] = 246
guard['candidateBlockingIssues'] = 0
guard['genuineWholeNative394Exact'] = True
guard['allNineProtectedFloorsActuallyPassed'] = True
guard['activeIntegrationStatus'] = 'NOT_APPLIED'
guard['technicalFindingBIO_BASIS2_CONTEXT_B_TECH_001'] = 'RESOLVED_BY_NEW_CORRECTED_CURRENT_BASELINE_RECEIPT'
final_guard = put(OWN / 'reviewed-supplement-adoption.final.guard.json', guard)
plan = subprocess.run(['python', str(OWN / 'guarded-root-apply-reviewed-supplement.technical.py')], capture_output=True, text=True)
assert plan.returncode == 0, plan.stderr
plan_ref = put(OWN / 'concrete-root-read-only-guarded-apply-plan.actual.json', json.loads(plan.stdout))

spec = importlib.util.spec_from_file_location('ordinary_schema_validator', ROOT / 'scripts/validate_schemas.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
schema = read(ROOT / 'docs/landscape-runtime.schema.json')
files = sorted(OWN.rglob('*.json'))
errors = [p.relative_to(ROOT).as_posix() for p in files if not mod.validate_file(p.relative_to(ROOT).as_posix(), schema)]
assert not errors, errors
jsonschema.validate(read(ROOT / guard['candidate']['canonical']['path']), schema)
jsonl_count = 0
for p in OWN.rglob('*.jsonl'):
    for line in p.read_text().splitlines():
        if line.strip():
            json.loads(line)
            jsonl_count += 1
symlinks = [p.relative_to(ROOT).as_posix() for p in OWN.rglob('*') if p.is_symlink()]
assert not symlinks
all_paths = [p.relative_to(ROOT).as_posix() for p in OWN.rglob('*') if p.is_file()]
ordinary_ignore = subprocess.run(['git', 'check-ignore', '--stdin'], input='\n'.join(all_paths) + '\n', text=True, capture_output=True)
assert ordinary_ignore.returncode == 1 and not ordinary_ignore.stdout, ordinary_ignore.stdout
schema_ref = put(OWN / 'checks/affected-ordinary-schemas-and-portable-files.actual.json', {'schemaVersion': 1, 'ordinaryValidateFileParsedJsonCount': len(files), 'ordinaryValidateFileErrors': [], 'actualCanonicalRuntimeSchemaPassed': True, 'jsonlRecordsParsed': jsonl_count, 'packageSymlinks': [], 'ordinaryCheckIgnorePortableFileCount': len(all_paths), 'ordinaryCheckIgnoreExitCode': 1, 'noSchemaOrDiscoveryExceptions': True, 'activeWrites': 0})
for row in guard['before'].values():
    assert bind(ROOT / row['active']['path']) == row['active']
for item in guard['mappingInstalls'] + guard['imageInstalls']:
    assert not (ROOT / item['destination']).exists()
outputs = [bind(p) for p in sorted(OWN.rglob('*')) if p.is_file()]
seal = put(OWN / 'reviewed-supplement-integration-preparation.first-technical.freeze.json', {'schemaVersion': 1, 'role': 'IMMUTABLE_REVIEWED_SUPPLEMENT_TECHNICAL_FIRST_SEAL', 'sealedAtUtc': datetime.now(timezone.utc).isoformat(), 'declaredTechnicalOutputFiles': outputs, 'originalSixScienceSealsAndTwoNewContextSealsUnchanged': True, 'historicalFailedRunsPreserved': True, 'currentActive': '244/392', 'actualIsolatedCandidate': '246/394', 'newScientificReviewByIntegrator': False, 'activeWrites': 0, 'humanApproval': False, 'humanTrial': False})
entry = put(OWN / 'neutral-reviewed-supplement-basis2-integration-ready.technical.entry.json', {
    'schemaVersion': 1, 'role': 'NEUTRAL_REVIEWED_BASIS2_SOURCE_SUPPLEMENT_TECHNICAL_INTEGRATION_READY',
    'firstTechnicalSeal': seal, 'exactFinalGuard': final_guard, 'concreteReadOnlyApplyPlan': plan_ref,
    'guardedRootApplyScript': bind(OWN / 'guarded-root-apply-reviewed-supplement.technical.py'),
    'actualProgress': guard['requiredTechnicalProofs']['strictProgress'], 'actualWholeCurrentFrame': guard['requiredTechnicalProofs']['wholeCurrentFrame'],
    'actualDependentSourceAndFloors': dependent, 'actualOrdinarySourceScopes': source_scope,
    'correctedHistorical268Effective248Refined20Receipt': guard['requiredTechnicalProofs']['currentSourcePreservation'],
    'originalSixScienceAndCurrentTwoContextSealVerification': guard['requiredTechnicalProofs']['originalGenuineSeals'],
    'normalCurrentTwoDAdoption': guard['requiredTechnicalProofs']['currentTwoNormalDAdoption'],
    'portableNativeTwoIndexBytes': portable, 'affectedSchemaAndPortabilityProof': schema_ref,
    'selectedGoalIds': guard['newGoalIds'], 'existingWordGenuineContextSupersession': guard['contextSupersessionGoalId'],
    'currentActive': {'strictComplete': 244, 'denominator': 392, 'canonicalNodes': 476},
    'actualIsolatedCandidate': {'strictComplete': 246, 'denominator': 394, 'canonicalNodes': 479, 'blockingIssues': 0},
    'predictedNetStrictGain': 2, 'predictedNewScientificClosures': guard['newGoalIds'], 'restoredExistingBindingNetStrictGain': 0,
    'all244OldStrictIdsRetained': True, 'all392OldQAAndHumanFieldsExact': True,
    'all475OldNonrootGoalObjectsAndAll476RequiresExact': True,
    'all3084CurrentSourceMappingRowsExactPlus10BoundedPartialRows': True,
    'eightRuntimePartialMappingFilesSeparateFrom29CompleteAtlasMappingPaths': True,
    'fourOriginalOperatorHoldsRetained': True, 'old392AllPagesUnchangedClaim': False,
    'activeWrites': 0, 'newScientificReviewByIntegrator': False, 'humanApproval': False, 'humanTrial': False,
})
print(json.dumps({'entry': entry, 'firstTechnicalSeal': seal, 'actualIsolated': '246/394', 'netScientificGain': 2, 'sourceCQR003': 'pass', 'protectedFloorsPassed': 9, 'activeWrites': 0}))
