# SPDX-License-Identifier: Apache-2.0
"""One unchanged inactive central report after genuine D15/D1 readiness."""
import datetime
import hashlib
import json
import subprocess
import sys
import time
from pathlib import Path

REPO = Path.cwd()
OWN = Path(__file__).resolve().parents[1]


def load(p):
    return json.loads(p.read_text())


def ref(p):
    b = p.read_bytes()
    return {'path': p.relative_to(REPO).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


def verify(r):
    p = REPO / r['path']
    a = ref(p)
    assert a['sha256'] == r['sha256'] and a['bytes'] == r['bytes'], p
    return p


def put(p, value):
    assert not p.exists(), p
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


assert len(sys.argv) == 2, 'Pass the exact finite D15/D1 technical result selector.'
selector = Path(sys.argv[1]).resolve()
paired = load(selector)
assert paired['readyForOneScopedCentral'] is True
index_refs = paired['descriptionResolutionIndices']
assert paired['descriptionResolutionIndexPaths'] == [r['path'] for r in index_refs]
assert len(index_refs) == 2 and all(isinstance(x, dict) for x in index_refs)
indices = [verify(r) for r in index_refs]
objects = [load(p) for p in indices]
assert sorted(len(o['resolutions']) for o in objects) == [1, 15]
assert all(r['strictDescriptionComplete'] and r['decision'] == 'keep_current' for o in objects for r in o['resolutions'])
assert len({r['goalId'] for o in objects for r in o['resolutions']}) == 16
e7 = 'e7c3d20e-4b13-560b-b8ee-c5abca8cc624'
one = next(p for p, o in zip(indices, objects) if len(o['resolutions']) == 1)
assert load(one)['resolutions'][0]['goalId'] == e7
prep_path = OWN / 'preparation/PREPARED.awaiting-two-fresh-D-FIRSTs.json'
prep = load(prep_path)
base = load(verify(prep['baseCentralConfig']))
subject = load(verify(prep['subjectFragment']))
assert len(subject['resolutionIndexPaths']) == 88
old_subject = base['subjects'][0]
assert subject['resolutionIndexPaths'] == old_subject['resolutionIndexPaths']
assert subject['resolutionSupersessions'] == old_subject['resolutionSupersessions']
assert subject['resolutionWithdrawals'] == old_subject['resolutionWithdrawals']
subject['resolutionIndexPaths'] += [p.relative_to(REPO).as_posix() for p in indices]
owner = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-lab2-current422-paired-and-inactive-integration-technical-20261015-v1/native-two/resolution-index.json'
assert owner in subject['resolutionIndexPaths']
assert not any(s['goalId'] == e7 and s['supersededIndexPath'] == owner for s in subject['resolutionSupersessions'])
subject['resolutionSupersessions'].append({'goalId': e7, 'supersededIndexPath': owner, 'replacementIndexPath': one.relative_to(REPO).as_posix()})
assert len(subject['resolutionIndexPaths']) == 90 and len(subject['resolutionSupersessions']) == 184
assert len(subject['positiveEvidenceConfigPaths']) == 87 and len(subject['semanticAtomicityConfigPaths']) == 60
base['reportId'] = 'chemie-bcp-current426-bounded-inactive-final-20261015-v1'
base['subjects'] = [subject]
config = OWN / 'central/config/central.current426.BcP-genuine-D15-D1.inactive.config.json'
put(config, base)
mp = load(verify(prep['privateHostRebuildMap']))
host = REPO / mp['executionHost']
assert host.is_dir() and not host.is_symlink()
assert (host / subject['landscapePath']).read_bytes() == verify(prep['canonical']).read_bytes()
assert (host / subject['semanticKindLedgerPath']).read_bytes() == verify(prep['semanticHeaderAddressOnly']).read_bytes()
assert (host / subject['visualizationQaPath']).read_bytes() == verify(prep['QA443']).read_bytes()
release = OWN / 'preparation/ROOT_RELEASE.genuine-D15-D1-normal-transport-pair-only.json'
for r in load(release)['actualScientificInputs'].values():
    verify(r)
put(OWN / 'central/READY.genuine-original-FIRSTs-and-stock-D15-D1.before-once-Central.json', {
    'role': 'Root-owned one scoped central readiness; no additional scientific vote or M7 grant',
    'ROOTREADY': True, 'allowedCentralRuns': 1, 'actualCentralRunsBefore': 0,
    'genuinePairSelector': ref(selector), 'centralConfig': ref(config),
    'normalAddressOnlyPreparation': ref(prep_path), 'privateHostRebuildMap': prep['privateHostRebuildMap'],
    'existingEightDContextsPreserved': True, 'existing371StrictMustRemain': True,
    'globalImageHoldsAndRPSourceHoldRemainOpen': True, 'activeWrites': 0,
})
argv = [str(REPO / 'app/node_modules/.bin/tsx'), str(host / 'app/scripts/reportDeepUnderstandingRollout.ts'), '--config=' + config.relative_to(REPO).as_posix(), '--format=json']
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
put(OWN / 'central/CENTRAL.once.started.actual.json', {'argv': argv, 'cwd': mp['executionHost'], 'startedAtUTC': started, 'allowedRuns': 1})
t = time.monotonic()
p = subprocess.run(argv, cwd=host, capture_output=True)
out = OWN / 'central/CENTRAL.current426.BcP.stock-report.actual.json'
err = OWN / 'central/CENTRAL.current426.BcP.stderr.actual.txt'
out.write_bytes(p.stdout)
err.write_bytes(p.stderr)
receipt = {'argv': argv, 'cwd': mp['executionHost'], 'startedAtUTC': started, 'completedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'elapsedSeconds': round(time.monotonic() - t, 3), 'exitCode': p.returncode, 'stdout': ref(out), 'stderr': ref(err), 'actualCentralRuns': 1, 'activeWrites': 0}
put(OWN / 'central/CENTRAL.current426.BcP.command.actual.json', receipt)
print(json.dumps(receipt))
if p.returncode:
    raise SystemExit(p.stdout.decode() + p.stderr.decode())
report = load(out)
s = report['subjects'][0]
previous = load(OWN.parent / 'chemie-source4-current422-bounded-inactive-integration-technical-20261015-v1/phase2/CENTRAL.current422.source4.stock-report.actual.json')['subjects'][0]
lost = sorted(set(previous['strictCompleteGoalIds']) - set(s['strictCompleteGoalIds']))
added = sorted(set(s['strictCompleteGoalIds']) - set(previous['strictCompleteGoalIds']))
proof = {'oldStrict': previous['strictComplete'], 'oldDenominator': previous['denominator'], 'strictComplete': s['strictComplete'], 'denominator': s['denominator'], 'remaining': s['remaining'], 'netStrictGain': s['strictComplete'] - previous['strictComplete'], 'newStrictGoalIds': added, 'lostOldStrictIds': lost, 'restoredOwnE7D1BindingAddsNoNetClosure': e7 in previous['strictCompleteGoalIds'] and e7 in s['strictCompleteGoalIds'], 'allOld371Preserved': not lost, 'gates': s['gates'], 'requiredChecks': s['requiredChecks'], 'issues': s['issues'], 'blockingIssueCount': report['blockingIssueCount'], 'M7Granted': False, 'activeWrites': 0}
put(OWN / 'central/DELTA.current371-to-current426.actual.json', proof)
assert not lost and report['blockingIssueCount'] == 0 and s['issues'] == []
assert all(c['status'] == 'pass' for c in s['requiredChecks'])
print(json.dumps(proof))
