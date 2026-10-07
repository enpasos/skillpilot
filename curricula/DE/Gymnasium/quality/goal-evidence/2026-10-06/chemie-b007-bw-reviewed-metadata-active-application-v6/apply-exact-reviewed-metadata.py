"""Apply the independently reviewed 21 metadata scalars; no science verdicts.

Apache-2.0. Each complete replacement is guarded against the current bytes and
the exact reviewed scalar diff. Historical candidates and reviews are read only.
"""
from pathlib import Path
import hashlib
import json
import shutil
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[7]
HERE = Path(__file__).resolve().parent
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
AUTHOR = BASE / 'chemie-b007-bw-reviewed-metadata-native-binding-preparation-author-v6'
AUDIT = BASE / 'chemie-b007-bw-metadata-native-binding-independent-technical-audit-v6'

def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def verify_freeze(p, expected):
    assert digest(p) == expected, str(p)
    d = json.loads(p.read_text())
    rows = d.get('files', d.get('payloadFiles'))
    assert isinstance(rows, list)
    for row in rows:
        q = ROOT / row['path'] if row['path'].startswith('curricula/') else p.parent / row['path']
        assert q.is_file(), str(q)
        assert digest(q) == row['sha256'].removeprefix('sha256:'), str(q)
        assert q.stat().st_size == row['bytes'], str(q)
    return {'path': str(p.relative_to(ROOT)), 'sha256': digest(p), 'payloadFilesVerified': len(rows)}

def changes(a, b, pointer=''):
    if type(a) != type(b):
        return [{'pointer': pointer, 'before': a, 'after': b}]
    if isinstance(a, dict):
        assert set(a) == set(b), pointer
        return [d for k in a for d in changes(a[k], b[k], pointer + '/' + k.replace('~', '~0').replace('/', '~1'))]
    if isinstance(a, list):
        assert len(a) == len(b), pointer
        return [d for i, (x, y) in enumerate(zip(a, b)) for d in changes(x, y, pointer + '/' + str(i))]
    return [] if a == b else [{'pointer': pointer, 'before': a, 'after': b}]

assert (ROOT / 'AGENTS.md').is_file(), str(ROOT)
assert not (HERE / 'application.actual.receipt.json').exists(), 'one-shot application already recorded'
verified = [
    verify_freeze(AUTHOR / 'bw-reviewed-metadata-native-binding-preparation-author-v6.final.freeze.json', '937690cba6db1b649e5262fa4fd44f1717875d9c748c05e4f4002c7390bb116b'),
    verify_freeze(AUDIT / 'independent-technical-audit-v6.final.freeze.json', 'a193f3af941071e2a9433b2db9cd850c3bf8cc82aa4fe7544a7fe72a38c5b47d'),
]
plan = json.loads((AUTHOR / 'exact-selected-five-file-metadata-application-and-native-derivative-candidates.json').read_text())
operations = plan['actual21ScalarOperationsAcrossFiveCurrentFiles']
assert len(operations) == 5
assert sum(len(x['exactFieldDeltas']) for x in operations) == 21
prepared = []
for op in operations:
    dst = ROOT / op['intendedFutureActivePath']
    src = ROOT / op['actualFrozenAfter']['path']
    assert digest(dst) == op['exactCurrentActiveBinding']['sha256'].removeprefix('sha256:'), str(dst)
    assert digest(src) == op['actualFrozenAfter']['sha256'].removeprefix('sha256:'), str(src)
    delta = changes(json.loads(dst.read_text()), json.loads(src.read_text()))
    assert sorted(delta, key=lambda r:r['pointer']) == sorted(op['exactFieldDeltas'], key=lambda r:r['pointer']), str(dst)
    prepared.append((dst, src, delta))

report = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-current-fifteen-reviewed-active-integration-v1/current-central-five-gate.actual.report.json'
assert digest(report) == '68e580303aaad8dd49dbb1d32c67979ce430c20c96bcce048e121cd48c82a576'
canon = prepared[0][0]
before = json.loads(canon.read_text())
after = json.loads(prepared[0][1].read_text())
assert len(before['goals']) == len(after['goals']) == 479
for x,y in zip(before['goals'],after['goals']):
    assert x['id'] == y['id']
    for key in ['title','titleEn','description','descriptionEn','requires','contains','resourceLinks']:
        assert x.get(key) == y.get(key), (x['id'], key)

applied = []
for dst, src, delta in prepared:
    backup = HERE / 'before' / dst.relative_to(ROOT)
    backup.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(dst, backup)
    shutil.copyfile(src, dst)
    assert digest(dst) == digest(src)
    applied.append({'path': str(dst.relative_to(ROOT)), 'beforeSha256': digest(backup), 'afterSha256': digest(dst), 'actualExactDeltas': delta})

derived = plan['requiredDerivedNativeSourceReceipt']
dst = ROOT / derived['activePath']
src = AUTHOR / derived['actualFutureCandidate']
backup = HERE / 'before' / dst.relative_to(ROOT)
backup.parent.mkdir(parents=True, exist_ok=True)
shutil.copyfile(dst, backup)
shutil.copyfile(src, dst)
applied.append({'path': str(dst.relative_to(ROOT)), 'beforeSha256': digest(backup), 'afterSha256': digest(dst), 'role': 'reviewed candidate of native source derivation; must pass actual active native --check'})

receipt = {
    'schemaVersion': 1, 'documentType': 'exact reviewed BW metadata active application; no new scientific closure',
    'appliedAtUTC': datetime.now(timezone.utc).isoformat(), 'verifiedInputs': verified,
    'actualFiveFiles21Scalars': applied[:-1], 'actualDerivedReceipt': applied[-1],
    'canonicalWhole479IdsAndDEENEdgesImagesExact': True,
    'changedSourceAttributions': 186, 'changedProtectedSourceAttributions': 68,
    'newScientificClosures': 0, 'restoredStrictClosures': 0, 'strictNetGain': 0,
    'wholeSourceHoldsCleared': 0, 'humanApproval': False, 'humanTrial': False,
    'nativeActiveCheckPending': True, 'newCentralRunClaim': False,
}
(HERE / 'application.actual.receipt.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'files': len(applied), 'scalars': 21, 'canonicalAfter': digest(canon), 'newScientificClosures': 0}))
