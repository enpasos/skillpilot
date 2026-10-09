# SPDX-License-Identifier: Apache-2.0
"""Bounded technical verification after the separately sealed scientific FIRST.

No scientific verdict is derived from equality or successful schema validation.
Only this independent review directory receives new artifacts.
"""
from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
from datetime import datetime, timezone

ROOT = Path.cwd()
BASE = Path(__file__).resolve().parent.relative_to(ROOT)
AUTHOR = BASE.parent / 'biologie-evolution-two-material-findings-author-successor-v1'
TARGETS = ['0db20819-ee94-54c6-8ecb-aff8c9b7419e', 'e3167331-f855-5030-9673-29f55a7b4230']


def load(p):
    return json.loads(Path(p).read_text())


def digest(p):
    p = Path(p)
    raw = p.read_bytes()
    return {'path': p.as_posix(), 'sha256': 'sha256:' + hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}


def verify(binding):
    p = Path(binding['path'])
    assert not p.is_absolute() and '..' not in p.parts, p
    assert p.is_file() and not p.is_symlink(), p
    actual = digest(p)
    assert actual == binding, (actual, binding)
    return actual


def write_new(n, d):
    p = BASE / n
    assert not p.exists(), p
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    load(p)
    return digest(p)


def diffs(a, b, p=''):
    if type(a) is not type(b):
        return [{'pointer': p, 'before': a, 'after': b}]
    if isinstance(a, dict):
        assert set(a) == set(b), p
        return [v for k in a for v in diffs(a[k], b[k], p + '/' + k.replace('~', '~0').replace('/', '~1'))]
    if isinstance(a, list):
        assert len(a) == len(b), p
        return [v for i, (x, y) in enumerate(zip(a, b)) for v in diffs(x, y, p + '/' + str(i))]
    return [] if a == b else [{'pointer': p, 'before': a, 'after': b}]


science_seal = load(BASE / 'two-material-corrections.independent-A.science-FIRST.freeze.json')
first_bindings = [verify(science_seal[k]) for k in ['scienceInput', 'scientificVerdict', 'primaryReferenceRecord']]
entry = load(AUTHOR / 'neutral-whole18-two-material-findings-author-successor.targeted-independent-review.entry.json')
keys = ['originalWholeAuthorEntry', 'wholeSource35Partners30ExactOriginalFrame',
        'currentWhole479ExactInactiveSnapshot', 'wholeKinds394UnchangedCandidate',
        'wholeMaterials18Cases36Successor', 'wholePositiveCandidateSet18',
        'normalP18Config', 'normalP18CandidateRecords', 'exactChangedValuesAndMaskedPreservation']
author_bindings = [verify(entry[k]) for k in keys]
original_entry = load(entry['originalWholeAuthorEntry']['path'])
old_keys = ['wholeMaterialsP18Cases36', 'normalCandidateSet', 'normalP18Config', 'normalP18Records', 'wholeCurrentKinds394']
old_bindings = [verify(original_entry[k]) for k in old_keys]
old = load(original_entry['wholeMaterialsP18Cases36']['path'])
new = load(entry['wholeMaterials18Cases36Successor']['path'])
assert len(old['entries']) == len(new['entries']) == 18
assert sum(len(e['newAuthoredWholeCases']) for e in new['entries']) == 36
changes = diffs(old['entries'], new['entries'], '/entries')
delta = load(entry['exactChangedValuesAndMaskedPreservation']['path'])
assert changes == delta['actualFieldChanges'] and len(changes) == 12
assert {c['pointer'].split('/')[2] for c in changes} == {'0', '14'}
allowed0 = {'/entries/0/wholeProfile/applicationCaseBriefs/0/' + s for s in ['taskDemandDe','taskDemandEn','expectedPerformanceDe','expectedPerformanceEn']}
allowed0 |= {'/entries/0/newAuthoredWholeCases/0/' + s for s in ['taskDe','taskEn','workedResponseDe','workedResponseEn']}
allowed14 = {'/entries/14/wholeProfile/applicationCaseBriefs/0/' + s for s in ['expectedPerformanceDe','expectedPerformanceEn']}
allowed14 |= {'/entries/14/newAuthoredWholeCases/0/' + s for s in ['workedResponseDe','workedResponseEn']}
assert {c['pointer'] for c in changes} == allowed0 | allowed14
unaffected = [i for i in range(18) if i not in [0,14]]
assert all(old['entries'][i] == new['entries'][i] for i in unaffected)
assert old['entries'][13] == new['entries'][13]
assert all(old['entries'][i]['wholeCurrentGoal'] == new['entries'][i]['wholeCurrentGoal'] for i in range(18))
assert all(old['entries'][i]['sourceDutyRowIds'] == new['entries'][i]['sourceDutyRowIds'] for i in range(18))
assert all(old['entries'][i]['sourceAndPartnerFrame'] == new['entries'][i]['sourceAndPartnerFrame'] for i in range(18))

frame = load(entry['wholeSource35Partners30ExactOriginalFrame']['path'])
assert len(frame['wholeCurrentGoalRows']) == len(frame['selectedGoalIds']) == 18
assert len(frame['wholeOriginalSourceDutyRows']) == frame['sourceDutyCount'] == 35
assert len(frame['wholeOriginalAndCurrentPartnerGoals']) == frame['wholePartnerCount'] == 30
snapshot = load(entry['currentWhole479ExactInactiveSnapshot']['path'])
assert len(snapshot['goals']) == 479
by_id = {g['id']:g for g in snapshot['goals']}
assert all(e['wholeCurrentGoal'] == by_id[e['goalId']] for e in new['entries'])
live_binding = verify(frame['currentCanonicalBinding'])
assert live_binding['sha256'] == entry['currentWhole479ExactInactiveSnapshot']['sha256']
old_kind = load(original_entry['wholeCurrentKinds394']['path'])
new_kind = load(entry['wholeKinds394UnchangedCandidate']['path'])
assert new_kind['counts']['curricularAtomic'] == 394
kind_deltas = diffs(old_kind, new_kind)
assert len(kind_deltas) == 1 and kind_deltas[0]['pointer'] == '/sourceLandscapePath'
assert new_kind['sourceLandscapePath'] == entry['currentWhole479ExactInactiveSnapshot']['path']

old_candidates = load(original_entry['normalCandidateSet']['path'])
new_candidates = load(entry['wholePositiveCandidateSet18']['path'])
old_records = [json.loads(l) for l in Path(original_entry['normalP18Records']['path']).read_text().splitlines() if l.strip()]
new_record_lines = Path(entry['normalP18CandidateRecords']['path']).read_text().splitlines()
new_records = [json.loads(l) for l in new_record_lines if l.strip()]
assert len(new_candidates['goals']) == len(new_records) == len(old_records) == 18
assert [r['goalId'] for r in new_records] == frame['selectedGoalIds']
for i, (before, after, material) in enumerate(zip(old_records,new_records,new['entries'])):
    assert after['profile'] == material['wholeProfile'] == new_candidates['goals'][i]['profile']
    assert after['status'] == 'needs_human_review' and after['reviewAuthority'] == 'ai_candidate'
    assert after['evidenceLevel'] == 'E1' and after['maximumClaimScope'] == 'G1'
    assert after['reviewRunIds'] == []
    assert all(before[k] == after[k] for k in ['goalId','goalFingerprint','reviewInputFingerprint','reviewCriteriaFingerprint'])
    if i in unaffected:
        assert before['profile'] == after['profile'] and before['profileFingerprint'] == after['profileFingerprint']
        assert old_candidates['goals'][i] == new_candidates['goals'][i]
    else:
        assert before['profile'] != after['profile'] and before['profileFingerprint'] != after['profileFingerprint']
    masked_before = copy.deepcopy(before); masked_after = copy.deepcopy(after)
    administrative = ['reviewId','reviewedAt','reviewer']
    for k in administrative + (['profile','profileFingerprint'] if i not in unaffected else []):
        masked_before.pop(k); masked_after.pop(k)
    assert masked_before == masked_after

config = load(entry['normalP18Config']['path'])
assert config['requireApproved'] is False and config['reviewedResourceTypes'] == [] and config['reviewRunManifestPaths'] == []
scoped = copy.deepcopy(config)
scoped['scope'] = {'label': 'Two targeted material corrections after independent-A scientific FIRST; exact author AI candidates, no native/source/current V approval', 'goalIds': TARGETS}
scoped['reviewPath'] = (BASE / 'two-material-corrections.normal-P2.exact-author-candidate-records.jsonl').as_posix()
record_path = Path(scoped['reviewPath'])
assert not record_path.exists()
selected_lines = [l for l in new_record_lines if l.strip() and json.loads(l)['goalId'] in TARGETS]
assert len(selected_lines) == 2
record_path.write_text('\n'.join(selected_lines) + '\n')
scoped_config_binding = write_new('two-material-corrections.normal-P2.config.json', scoped)

spec = importlib.util.spec_from_file_location('normal_schema_validator', ROOT / 'scripts/validate_schemas.py')
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
symlink_errors = validator.curriculum_symlink_errors(ROOT)
assert not symlink_errors, symlink_errors
json_checks = []
for p in sorted(BASE.glob('*.json')):
    data = load(p)
    is_landscape = validator.looks_like_runtime_landscape(p, data)
    assert not is_landscape, p
    json_checks.append({'path':p.as_posix(),'fullJsonParsed':True,'normalRuntimeLandscapeDiscovery':False})
portability_paths = [b['path'] for b in first_bindings + author_bindings + old_bindings]
portability_paths += [p.as_posix() for p in BASE.iterdir() if p.is_file()]
port = subprocess.run(['git','check-ignore','--no-index','--stdin'], input='\n'.join(portability_paths)+'\n', text=True, capture_output=True)
assert port.returncode == 1 and not port.stdout and not port.stderr, port
remaining = entry['remainingSourceAndCourseHoldsExact']
assert len(remaining) == 7
out = {
    'schemaVersion':1,'role':'independent-A actual technical equality and truthful-status check after own science FIRST',
    'createdAt':datetime.now(timezone.utc).isoformat(),'license':'CC-BY-4.0',
    'scienceFIRSTPreserved':first_bindings,'authorInputBindingsExact':author_bindings,'originalBindingsExact':old_bindings,
    'currentWhole479ExactLiveBinding':live_binding,
    'operativeChangedFieldCount':len(changes),'actualWholeChangedValues':changes,
    'allUnrelatedFieldsExactlyEqual':True,'otherFull16MaterialEntriesExactlyEqual':True,
    'other16ProfilesAndProfileFingerprintsExactlyEqual':True,
    'all18WholeGoalsAndGoalCriteriaReviewInputFingerprintsExactlyEqual':True,
    'remainingOrdinal14AtomarityWholeEntryExactlyEqual':True,
    'wholeGoals':18,'wholeCases':36,'wholeSourceDuties':35,'wholePartners':30,
    'wholeSnapshotNodes':479,'curricularAtomicDenominator':394,
    'kindLedgerChangeOnlyInactiveLandscapePath':kind_deltas,
    'normalP2Config':scoped_config_binding,'normalP2Records':digest(record_path),
    'recordSelectionPreservesAuthorRecordBytes':True,
    'all18Status':'needs_human_review','all18Authority':'ai_candidate','all18EvidenceLevel':'E1','all18MaximumClaimScope':'G1',
    'normalCurriculumSymlinkErrors':0,'ignoredOperativeInputs':0,'ownJsonParseChecks':json_checks,
    'remainingSourceAndCourseHoldsExact':remaining,'remainingAtomarityFindingExact':entry['remainingAtomarityFindingExact'],
    'normalValidationIsNotScientificApproval':True,'wholeSourceApproval':False,'wholeCourseApproval':False,
    'currentNativeDPApproval':False,'currentVApproval':False,'humanApproval':False,'humanTrial':False,
    'actualLearnerPerformance':False,'actualExperimentPerformed':False,'strictGain':0,'newStrictClosures':0,
    'restoredBindings':0,'activeWrites':[],'fullBuildOrCentralCheckRun':False,
}
receipt = write_new('two-material-corrections.scoped-bindings-frame-and-truthful-status.actual.json',out)
print(json.dumps({'receipt':receipt,'normalP2Config':scoped_config_binding,'changedFields':12,'wholeFrame':'18 goals / 36 cases / 35 source duties / 30 partners','unrelatedProfilesExact':16,'normalCurriculumSymlinkErrors':0,'strictGain':0},indent=2))
