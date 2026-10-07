#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Complete an inert reviewed integration plan; no active file is written."""
import copy, hashlib, json, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[7]
OWN = pathlib.Path(__file__).resolve().parent
REG = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
def read(p): return json.loads(p.read_text())
def rel(p): return str(p.relative_to(ROOT))
def bind(p): return {'path': rel(p), 'sha256': 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}
def write(p, x):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes((json.dumps(x, ensure_ascii=False, indent=2)+'\n').encode()) if not p.exists() else (_ for _ in ()).throw(AssertionError('Already exists: '+str(p)))
before = read(OWN/'before'/REG)
old = next(s for s in before['subjects'] if s['subject']=='chemie')
live = next(s for s in read(ROOT/REG)['subjects'] if s['subject']=='chemie')
assert old == live, 'Chemie changed during preparation; no overwrite is permitted.'
subject = read(OWN/'candidate/chemie.registry-subject.partial.json')
memory = read(OWN/'memory/current378.future-active.config.json')
old_memory = read(ROOT/old['memoryReviewConfigPath'])
assert len(memory['visibilityScopes']) == len(old_memory['visibilityScopes']) == 7
proof = []
for proposed, actual in zip(memory['visibilityScopes'], old_memory['visibilityScopes']):
    assert proposed['label'] == actual['label']
    snapshot, live_view = ROOT/proposed['viewPath'], ROOT/actual['viewPath']
    assert snapshot.read_bytes() == live_view.read_bytes(), 'A live view differs from its reviewed snapshot.'
    proof.append({'label': actual['label'], 'reviewedSnapshot': bind(snapshot), 'actualCurrentView': bind(live_view), 'exactBytes': True})
memory['visibilityScopes'] = copy.deepcopy(old_memory['visibilityScopes'])
assert memory['visibilityScopeCoverageRequired'] is True
memory['reportPath'] = rel(OWN/'checks/memory-current378-real-views.future.report.md')
write(OWN/'memory/current378.real-views.future-active.config.json', memory)
write(OWN/'memory/current378.real-views.inert.config.json', {**memory, 'landscapePath': rel(OWN/'candidate/canonical.json'), 'reportPath': rel(OWN/'checks/memory-current378-real-views.inert.report.md')})
subject['memoryReviewConfigPath'] = rel(OWN/'memory/current378.real-views.future-active.config.json')
indices = [rel(OWN/'native-d-four/resolution-index.json'), rel(OWN/'native-d-context/resolution-index.json')]
assert all(p not in subject['resolutionIndexPaths'] for p in indices)
subject['resolutionIndexPaths'].extend(indices)
d2 = 'd2ccd1d5-56f7-583f-9724-e97441367f91'
owners = []
for p in old['resolutionIndexPaths']:
    if any(r['goalId'] == d2 for r in read(ROOT/p)['resolutions']): owners.append(p)
assert len(owners) == 1
assert not any(x['goalId'] == d2 for x in old.get('resolutionSupersessions', []))
assert not any(x['goalId'] == d2 for x in old.get('resolutionWithdrawals', []))
subject.setdefault('resolutionSupersessions', []).append({'goalId': d2, 'supersededIndexPath': owners[0], 'replacementIndexPath': indices[1], 'reason': 'The exact reviewed Arrhenius recall support introduces one actual reverse memory prerequisite on the protected d2cc page. Genuine new targeted independent A/B current native page/context KEEP judgments replace this binding only. Its whole text, source, image and positive cases remain unchanged; no new fachlicher Abschluss or human approval.'})
subject['positiveEvidenceConfigPaths'].append(rel(OWN/'positive/current-four.future-active.config.json'))
write(OWN/'candidate/chemie.registry-subject.final.json', subject)
for i, configured in enumerate(subject['positiveEvidenceConfigPaths'][:-1]):
    c = read(ROOT/configured)
    write(OWN/'positive/inert-protected-current-configs'/f'{i:03d}.json', {**c, 'landscapePath': rel(OWN/'candidate/canonical.json'), 'semanticKindLedgerPath': rel(OWN/'candidate/semantic-kinds.json')})
for i, configured in enumerate(subject['semanticAtomicityConfigPaths']):
    c = read(ROOT/configured)
    write(OWN/'atomicity/inert-all-current-configs'/f'{i:03d}.json', {**c, 'landscapePath': rel(OWN/'candidate/canonical.json')})
write(OWN/'checks/seven-exact-current-visibility-bindings.actual.json', {'views': proof, 'liveViewsUsedForFutureActiveMemoryCheck': True, 'visibilityScopeCoverageRequired': True, 'sourceSnapshotChanges': False, 'activeWrites': 0})
print('Registered inert final Chemie subject with D4 + D1, exact P4, all current A inputs and seven real Memory visibility scopes; no active writes.')
