"""Seal verified bounded independent SOURCE result without rewriting FIRST."""
import hashlib
import importlib.util
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'biologie-health-twelve-six-source-bindings-resolution-author-successor-20261010-v2'

def read(path):
    return json.loads(Path(path).read_text(encoding='utf-8'))

def binding(path):
    path = Path(path)
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def write(path, obj):
    assert not path.exists(), path
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    read(path)

now = datetime.now(timezone.utc).isoformat()
first_path = OWN / 'FIRST.six-source-resolution-independent-a.inspection.json'
first = read(first_path)
assert binding(first_path)['sha256'] == 'sha256:76a243cfeba1097db5ca2eaf5887a62a3ebe820557754d2248666fcf35f5404b'
assert binding(OWN / 'FIRST.six-source-resolution-independent-a.freeze.json')['sha256'] == 'sha256:aaeec38842c9c8b35dc42217446ba3f0c73e160e1552b64b34e8d1e1e56ea6e0'
aliases = read(AUTHOR / 'inputs/all-normal-source-inputs.actual-regular-portable-bindings.json')['records']
norm = first['additionalNormativeRestriction']['wholePdf']
portable_norm = next(r['actualRegularPortableBinding'] for r in aliases if r['normalLogicalInputPathDiagnosticOnly'] == norm['path'])
assert portable_norm['sha256'] == norm['sha256']
assert portable_norm['bytes'] == norm['bytes']
assert binding(ROOT / portable_norm['path']) == portable_norm
portability_path = OWN / 'checks/HB2022-FIRST-input-portability-resolution.actual.json'
write(portability_path, {'schemaVersion': 1, 'createdAt': now, 'role': 'Additive portability resolution for unchanged extra normative FIRST source; no replacement scientific judgment', 'retainedExactFIRST': binding(first_path), 'originalLogicalCacheLocatorRetainedOnlyAsDiagnosticHistory': norm, 'authoritativeRegularCommittableWholePrimary': portable_norm, 'wholePrimaryBytesExactToActuallyReadFIRSTSource': True, 'independentlyGeneratedAndViewedWholeRelevantPages': [binding(p) for p in sorted((OWN / 'primary').glob('HB2022.*'))], 'FIRSTBytesChanged': False, 'scientificJudgmentChanged': False, 'freshSourceApproval': False, 'humanApproved': 0, 'strictGain': 0, 'activeWrites': []})

normal_path = OWN / 'checks/normal-source-atlas-and-native-model.actual.json'
bindings_path = OWN / 'checks/bindings-json-portability-history-and-all31-deltas.actual.json'
primaries_path = OWN / 'checks/actual-primary-pages96dpi-and-direct-source-counts.json'
normal, checks, primaries = read(normal_path), read(bindings_path), read(primaries_path)
assert normal['protected353NativePageExactCount'] == 353
assert normal['exactWholeNativePages'] == 392
assert normal['canonicalCurricularAtomicUnion'] == 394
assert primaries['allPrimaryPdfTextsAndRasterPixelsExact'] is True
assert checks['mappingRecordsRemoved'] == 6
assert checks['ordinaryCurriculumSymlinkErrors'] == []
passed_raw = [OWN / 'terminal/normal-source-native.actual.attempt3.txt', OWN / 'terminal/bindings-json-portability-history.actual.attempt3.txt', OWN / 'terminal/primary96dpi-and-bio12-direct-source-counts.actual.txt']
assert all(p.read_text().rstrip().endswith('ACTUAL_PROCESS_EXIT_CODE=0') for p in passed_raw)
spec = importlib.util.spec_from_file_location('ordinary_schema_validator_final', ROOT / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
assert module.curriculum_symlink_errors(ROOT) == []

entry_path = OWN / 'neutral-six-source-resolution-independent-a.entry.json'
entry = {
    'schemaVersion': 1, 'createdAt': now,
    'role': 'Neutral final handoff to independent A genuine bounded SOURCE resolution',
    'subject': 'biologie', 'packageState': 'inactive',
    'authorEntry': first['authorEntry'], 'authorFreeze': first['authorFreeze'],
    'genuineFirstJudgment': binding(first_path),
    'genuineFirstFreeze': binding(OWN / 'FIRST.six-source-resolution-independent-a.freeze.json'),
    'firstSealedBeforeAnyPeerInteraction': True,
    'firstJudgmentAndFreezeBytesUnchanged': True,
    'additiveFirstNormativeInputPortabilityResolution': binding(portability_path),
    'authoritativeAdditionalNormativePrimary': portable_norm,
    'boundedSourceResolutionAccepted': True,
    'acceptedMappingRemovalCount': 6,
    'acceptedRemovals': [{k:r[k] for k in ['sourceGoalId','canonicalGoalId','decision']} for r in first['sourceResolutionDecisions']],
    'preservedPartialContributionCount': 6,
    'noNewWholeCompetenceApprovalForOtherPartners': True,
    'unresolvedMachineSourceMappingBlockers': first['unresolvedSourceGaps'],
    'unresolvedCanonicalSourceRequirements': 1,
    'additionalMachineSourceBlockersInTheSixRemovalDelta': [],
    'sourceMappingCompletionClaimed': False,
    'wholeCourseSourceApproval': False,
    'MAPPING3Clearance': False,
    'strictGain': 0,
    'machineVerification': {
        'normalSourceAtlasAndWholeModel': binding(normal_path),
        'all31MappingDeltasAndExactHistoryJsonPortability': binding(bindings_path),
        'actualWholeOriginalPrimaryTextAnd96dpiPixels': binding(primaries_path),
        'passedActualExit0Raw': [binding(p) for p in passed_raw],
        'sourceViews': 24, 'canonicalCurricularAtomicUnion': 394,
        'wholeReceiptWitnessesBefore': 3294, 'wholeReceiptWitnessesAfter': 3286,
        'removedDirectWitnesses': 5, 'removedInheritedWitnesses': 3,
        'bio12DirectWitnessesBefore': 182, 'bio12DirectWitnessesAfter': 180,
        'protected353GoalIdSetExact': True,
        'protected353CompleteNativePagesExact': True,
        'exactWholeNativePages': 392,
        'changedWholeNativePages': 2,
        'changedFields': ['applicability','pageFingerprint'],
        'all394GoalContentEvidenceFingerprintsExact': True,
        'changedSourceViewOnly': 'de-gym-biologie-bundesweit-source-de-hh-seki',
        'changedSourceViewGoalCount': [115,113],
        'allAuthorPinnedBindingsExactRegularCommittable': 653,
        'allHistoricalExactBindingsRetained': 115,
        'ordinaryCurriculumSymlinkErrors': []
    },
    'verificationExecutionLimitations': ['The normal native model was regenerated in an external temporary capsule. Runtime PNG aliases use only frozen exact regular image files; no app/public assets were written.', 'The first normal-model attempt encountered missing public image copies, and the next capsule setup lacked a QA alias. Both raw failures remain retained; attempt3 completed successfully.', 'Two initial independent binding-check assumptions about optional decision IDs and aggregate HH decision keys were corrected; all three raw attempts are retained.', 'An exploratory raster comparison inferred scale from rounded width. The actual 96 dpi rerender is exact for all eight viewed primary pages; the probe is retained.'],
    'historicalDPAMAndVJudgmentsRetained': True,
    'unchangedDPAMVScientificReviewsRestarted': False,
    'newDPAMVApprovals': [],
    'humanReviewStatus': 'needs_human_review',
    'reviewAuthority': 'independent_ai_candidate',
    'humanApproved': 0, 'humanTrial': False,
    'humanGateIsSeparateFromMachineSourceGap': True,
    'activeWrites': [], 'gitWrites': [], 'githubWrites': []
}
write(entry_path, entry)
committable = set(subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z','--'], cwd=ROOT).decode().split('\0'))
own_bindings = []
for p in sorted(OWN.rglob('*')):
    assert not p.is_symlink(), p
    if not p.is_file(): continue
    assert p.relative_to(ROOT).as_posix() in committable, p
    if p.suffix == '.json': read(p)
    if p.suffix == '.jsonl':
        for line in p.read_text().splitlines():
            if line.strip(): json.loads(line)
    own_bindings.append(binding(p))
author_freeze = read(AUTHOR / 'FINAL.six-source-bindings-neutral-author.freeze.json')
external = {b['path']:b for b in author_freeze['ownBindings'] + author_freeze['externalBindings']}
for b in [first['authorEntry'], first['authorFreeze'], portable_norm] + normal['modelInputsIndependentlyReadAndBoundAfterFIRST']:
    external[b['path']] = b
for b in external.values():
    assert b['path'] in committable, b['path']
    assert not (ROOT / b['path']).is_symlink(), b['path']
    assert binding(ROOT / b['path']) == b, b['path']
freeze_path = OWN / 'FINAL.six-source-resolution-independent-a.freeze.json'
write(freeze_path, {'schemaVersion':1, 'createdAt':now, 'role':'Additive final freeze for genuine independent A bounded SOURCE resolution; immutable FIRST retained with explicit exact-byte portability addendum', 'entry':binding(entry_path), 'ownBindings':own_bindings, 'externalBindings':sorted(external.values(), key=lambda b:b['path']), 'allAuthoritativeBindingsRegularCommittableAndExact':True, 'historicalAndGenuineFirstBytesExact':True, 'firstNormativeCacheLocatorRetainedAsDiagnosticHistoryOnly':True, 'boundedSixRemovalAcceptance':True, 'HB037NeedsCanonicalGoalStillOpen':True, 'sourceMappingCompletionClaimed':False, 'MAPPING3Clearance':False, 'strictGain':0, 'humanApproved':0, 'humanTrial':False, 'activeWrites':[], 'gitWrites':[], 'githubWrites':[]})
print(json.dumps({'entry':binding(entry_path), 'finalFreeze':binding(freeze_path), 'first':binding(first_path), 'firstFreeze':binding(OWN / 'FIRST.six-source-resolution-independent-a.freeze.json'), 'ownBindings':len(own_bindings), 'externalBindings':len(external)}, ensure_ascii=False, indent=2))
