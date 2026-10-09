# SPDX-License-Identifier: Apache-2.0
"""Prepare exact inactive QA/kind adoption from actual paired decisions."""
import copy
import hashlib
import json
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
NATIVE = OWN.parent / 'biologie-molecular-genetics-one-crossing-over-native-successor-preparation-author-v1'
SPLICE = '0eddd781-90aa-5120-a24f-c7e38327162c'


def read(path):
    return json.loads(path.read_text())


def bind(path):
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def put(path, value):
    assert not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


vpath = OWN / 'checks/current23-genuine-V-pair.actual.json'
ampath = OWN / 'checks/one-current-Splice-genuine-independent-AM-pair.actual.json'
vp, amp = read(vpath), read(ampath)
assert len(vp['visualPairs']) == 23
assert amp['wholeCurrentSpliceJudgmentsActuallyRead']
assert amp['kindDecision'] == 'curricularAtomic'
assert amp['atomicityDecision'] == 'atomic' and amp['memoryDecision'] == 'no_memory_needed'
patchpath = OWN / 'candidate/visualization-qa.twenty-three-actual-paired.future-active.patch.json'
patch = {row['goalId']: row for row in read(patchpath)['records']}
qapath = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'
oldqa = read(qapath)
qa = copy.deepcopy(oldqa)
assert len(oldqa['records']) == 394
for n, row in enumerate(oldqa['records']):
    if row['goalId'] in patch:
        qa['records'][n] = copy.deepcopy(patch[row['goalId']])
assert sum(a != b for a, b in zip(oldqa['records'], qa['records'])) == 23
assert all(a == b for a, b in zip(oldqa['records'], qa['records']) if a['goalId'] not in patch)
assert all({k: v for k, v in a.items() if k.startswith('human')} == {k: v for k, v in b.items() if k.startswith('human')}
           for a, b in zip(oldqa['records'], qa['records']))
futureqa = OWN / 'candidate/qa.current394.twenty-three-paired.future-active.json'
put(futureqa, qa)

kindpath = ROOT / 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
oldkinds = read(kindpath)
kinds = copy.deepcopy(oldkinds)
author = read(NATIVE / 'candidate/semantic-kinds.current394.exact-decisions.inactive.json')
target = next(row for row in author['decisions'] if row['goalId'] == SPLICE)
oldtarget = next(row for row in kinds['decisions'] if row['goalId'] == SPLICE)
assert {k for k in target if target[k] != oldtarget[k]} == {'sourceFingerprint'}
assert target['semanticKind'] == oldtarget['semanticKind'] == amp['kindDecision']
assert target['sourceFingerprint'] == 'sha256:3e3881c1ac453acb1dc94961eca29384d0f68b9f0dd2162b24414f4d36780d28'
oldtarget['sourceFingerprint'] = target['sourceFingerprint']
assert sum(a != b for a, b in zip(oldkinds['decisions'], kinds['decisions'])) == 1
assert all(a == b for a, b in zip(oldkinds['decisions'], kinds['decisions']) if a['goalId'] != SPLICE)
futurekind = OWN / 'candidate/kinds.current479.genuine-Splice1.future-active.json'
put(futurekind, kinds)
put(OWN / 'checks/current23-QA-and-genuine-Splice-kind.future-active.actual.json', {
    'schemaVersion': 1, 'technicalPreparationOnly': True,
    'actualVisualPair': bind(vpath), 'actualSemanticPair': bind(ampath),
    'originalQA': bind(qapath), 'futureQA': bind(futureqa),
    'originalKinds': bind(kindpath), 'futureKinds': bind(futurekind),
    'unchangedOther371QARows': True, 'unchangedAll394HumanQAFields': True,
    'onlyOneGenuinelyReviewedSourceFingerprintChange': SPLICE,
    'all479KindDecisionsUnchanged': True,
    'actualCurrentDPAndNormalIntegrationChecksRequiredBeforeCounting': True,
    'activeWrites': 0, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False})
print(json.dumps({'futureQA23': True, 'other371QAExact': True, 'allHumanFieldsExact': True,
                  'genuineKind1': True, 'activeWrites': 0, 'strictGain': 0}))
