# SPDX-License-Identifier: Apache-2.0
"""Bind genuine current A23 to disjoint genuine B22 plus targeted B1, preserving records."""
import copy
import hashlib
import json
import shutil
from pathlib import Path

import jsonschema

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
BASE = OWN.parent
checked = {}


def read(path):
    return json.loads(path.read_text())


def bind(path):
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def verify(value):
    path = ROOT / value['path']
    actual = checked.get(str(path))
    if actual is None:
        actual = checked[str(path)] = bind(path)
    assert actual['sha256'].removeprefix('sha256:') == value['sha256'].removeprefix('sha256:'), path
    assert 'bytes' not in value or actual['bytes'] == value['bytes'], path
    return path


def verify_tree(value):
    if isinstance(value, dict):
        if isinstance(value.get('path'), str) and isinstance(value.get('sha256'), str):
            verify(value)
        for child in value.values():
            verify_tree(child)
    elif isinstance(value, list):
        for child in value:
            verify_tree(child)


def rows(path):
    return [json.loads(line) for line in path.read_text().splitlines() if line]


def put(path, value):
    assert not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


ap = BASE / 'biology-molecular-genetics-one-crossing-over-native-independent-a-v1/neutral-completed-native-one15-D-current-P23-and-retained-AM.independent-A.review.entry.json'
bp = BASE / 'biologie-molecular-genetics-one-crossing-over-native-successor-independent-b-v1/completed-one15-current-native-independent-b.normal-D1-P1-and-literal22.entry.json'
a, b = read(ap), read(bp)
verify_tree(a)
verify_tree(b)
aseal = ap.parent / 'native-one15-completed-independent-A.final.freeze.json'
bseal = ROOT / b['finalSealPath']
verify_tree(read(aseal))
verify_tree(read(bseal))
aconfig = read(verify(a['normalP23Config']))
arecords = verify(a['normalP23Records'])
ar = {row['goalId']: row for row in rows(arecords)}
br, bsources = {}, {}
for partition in b['normalCurrentP1AndLiteralP22Partitions']:
    path = verify(partition['records'])
    actual = rows(path)
    assert {r['goalId'] for r in actual} == set(partition['goalIds'])
    for row in actual:
        assert row['goalId'] not in br
        br[row['goalId']] = row
        bsources[row['goalId']] = bind(path)
planpath = OWN / 'current-twenty-three-ordinary-import-plan-one15.pending-final-independent-pairs.json'
plan = read(planpath)
ids = {op['goalId'] for op in plan['imageOperations']}
assert len(ar) == len(br) == len(ids) == 23 and ar.keys() == br.keys() == ids
schema = jsonschema.Draft202012Validator(read(ROOT / 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
pairs = []
for gid in aconfig['scope']['goalIds']:
    left, right = ar[gid], br[gid]
    for row in (left, right):
        schema.validate(row)
        assert row['status'] == 'needs_human_review' and row['reviewAuthority'] == 'ai_candidate'
        assert row['evidenceLevel'] == 'E1' and row['maximumClaimScope'] == 'G1'
        assert row['dissent'] == []
    for key in ('goalFingerprint', 'reviewInputFingerprint', 'profileFingerprint', 'reviewCriteriaFingerprint', 'profile'):
        assert left[key] == right[key], (gid, key)
    assert set(left['reviewRunIds']).isdisjoint(right['reviewRunIds']), gid
    pairs.append({'goalId': gid, 'genuineCurrentIndependentA': bind(arecords),
                  'genuineCurrentIndependentB': bsources[gid],
                  'goalFingerprint': left['goalFingerprint'],
                  'reviewInputFingerprint': left['reviewInputFingerprint'],
                  'profileFingerprint': left['profileFingerprint'],
                  'reviewCriteriaFingerprint': left['reviewCriteriaFingerprint'],
                  'wholeProfileValueExact': True, 'status': 'needs_human_review',
                  'reviewAuthority': 'ai_candidate', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
                  'unchangedMaterialScienceNotRechecked': gid != '183f3c47-ec20-5b98-8024-77ebd1c48abf'})
destination = OWN / 'positive/P23.exact-current-independent-A.review.jsonl'
destination.parent.mkdir(exist_ok=True)
assert not destination.exists()
shutil.copyfile(arecords, destination)
assert destination.read_bytes() == arecords.read_bytes()
config = copy.deepcopy(aconfig)
config.update(landscapePath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',
              semanticKindLedgerPath='curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json',
              reviewPath=destination.relative_to(ROOT).as_posix())
jsonschema.Draft202012Validator(read(ROOT / 'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json')).validate(config)
future = OWN / 'positive/P23.paired-current.future-active.config.json'
put(future, config)
put(OWN / 'checks/current23-genuine-P-pair.actual.json', {
    'schemaVersion': 1, 'role': 'Technical synthesis of actual independent current profiles and targeted resource bindings',
    'plan': bind(planpath), 'genuineAEntry': bind(ap), 'genuineBEntry': bind(bp),
    'genuineASeal': bind(aseal), 'genuineBSeal': bind(bseal),
    'positivePairs': pairs, 'currentPositiveConfigs': [bind(future)],
    'genuineRecordBytesPreserved': True, 'actualIndependentBindingsVerified': list(checked.values()),
    'wholeSourceCourseAndMachineVApprovalClaimedByP': False,
    'ordinaryActiveP23CurrentAssetChecksPendingApplication': True,
    'activeWrites': 0, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False,
})
print(json.dumps({'genuineCurrentPositivePairs': len(pairs), 'wholeProfileAndFingerprintsExact': True,
                  'futureOrdinaryConfigs': 1, 'status': 'needs_human_review', 'activeWrites': 0, 'strictGain': 0}))
