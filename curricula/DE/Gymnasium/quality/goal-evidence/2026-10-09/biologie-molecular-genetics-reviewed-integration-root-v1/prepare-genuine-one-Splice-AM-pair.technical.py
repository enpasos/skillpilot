# SPDX-License-Identifier: Apache-2.0
"""Retain 393 exact records and adopt one actual independent semantic pair."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
BASE = OWN.parent
A = BASE / 'biology-molecular-genetics-twenty-three-native-independent-a-v1'
B = BASE / 'biologie-molecular-genetics-twenty-three-native-independent-b-v1'
GID = '0eddd781-90aa-5120-a24f-c7e38327162c'

def read(path):
    return json.loads(path.read_text())

def bind(path):
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def verify(binding):
    path = ROOT / binding['path']
    actual = bind(path)
    assert actual['sha256'].removeprefix('sha256:') == binding['sha256'].removeprefix('sha256:')
    assert 'bytes' not in binding or actual['bytes'] == binding['bytes']
    return path

def put(path, value):
    assert not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

a_entry = A / 'neutral-completed-current-native23-D-P-and-one-Splice-AM.independent-A.review.entry.json'
b_entry = B / 'completed-native23-independent-b.normal-current-D-P-and-splice-AM.entry.json'
ae, be = read(a_entry), read(b_entry)
verify(ae['ownSpliceKindAMFirst'])
verify(ae['ownSpliceKindAMFirstSeal'])
verify(be['normalSpliceKindAM']['semanticFirstVerdict'])
pairs = []
for label, component, a_key, b_key, expected in [
    ('A394', 'semantic-atomicity', 'normalSpliceA1Records', 'ARecord', 'atomic'),
    ('M394', 'memory-card-review', 'normalSpliceM1Records', 'MRecord', 'no_memory_needed'),
]:
    ap = verify(ae[a_key])
    bp = verify(be['normalSpliceKindAM'][b_key])
    ar, br = read(ap), read(bp)
    assert ar['goalId'] == br['goalId'] == GID
    for field in ['ruleVersion', 'landscapeId', 'fingerprint', 'status']:
        assert ar[field] == br[field]
    assert ar['status'] == expected and ar['reviewer'] != br['reviewer']
    assert ar['reason'] and br['reason']
    config_path = ROOT / 'curricula/DE/Gymnasium/quality' / component / 'canonical-biology-full.config.json'
    config = read(config_path)
    original_path = ROOT / config['reviewPath']
    original_lines = original_path.read_text().splitlines(keepends=True)
    matches = [n for n, line in enumerate(original_lines) if json.loads(line)['goalId'] == GID]
    assert len(original_lines) == 394 and len(matches) == 1
    amended = list(original_lines)
    amended[matches[0]] = ap.read_text()
    destination = OWN / 'atomicity-memory' / f'{label}.original393-plus-genuine-Splice1.jsonl'
    destination.parent.mkdir(parents=True, exist_ok=True)
    assert not destination.exists()
    destination.write_text(''.join(amended))
    assert all(old == new for n, (old, new) in enumerate(zip(original_lines, amended)) if n not in matches)
    future_config = dict(config)
    future_config['reviewPath'] = destination.relative_to(ROOT).as_posix()
    future_path = OWN / 'candidate' / f'{label}.genuine-Splice1.future-active.config.json'
    put(future_path, future_config)
    pairs.append({'label': label, 'original': bind(original_path), 'adopted': bind(destination), 'independentA': bind(ap), 'independentB': bind(bp), 'originalConfig': bind(config_path), 'futureConfig': bind(future_path), 'sameGenuineSemanticDecision': True, 'other393RowsByteExact': True})
put(OWN / 'checks/one-current-Splice-genuine-independent-AM-pair.actual.json', {
    'schemaVersion': 1, 'pairedAt': datetime.now(timezone.utc).isoformat(),
    'role': 'Technical pairing of actual independent first judgments; no new semantic or human approval',
    'independentAEntry': bind(a_entry), 'independentBEntry': bind(b_entry),
    'wholeCurrentSpliceJudgmentsActuallyRead': True, 'pairs': pairs,
    'kindDecision': 'curricularAtomic', 'atomicityDecision': 'atomic',
    'memoryDecision': 'no_memory_needed', 'newCardsOrDecksRequired': False,
    'other393GoalMemoryOrAtomicityJudgmentsRepeated': False,
    'existingCardsAndVisibilityScopeConfigurationChanged': False,
    'activeWrites': 0, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False,
})
print(json.dumps({'genuineTargetedSpliceAMPairs': 1, 'other393RowsByteExact': True, 'activeWrites': 0, 'strictGain': 0}))
