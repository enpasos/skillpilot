from pathlib import Path
import json, hashlib

root=Path(__file__).resolve().parents[1]
repo=next(p for p in root.parents if (p/'AGENTS.md').exists())
manifest=json.loads((root/'FIRST-SCIENCE-SEAL.manifest.json').read_text())
names=set()
for entry in manifest['files']:
    path=root/entry['path']; names.add(entry['path'])
    assert path.is_file(),entry['path']
    assert path.stat().st_size==entry['bytes'],entry['path']
    assert 'sha256:'+hashlib.sha256(path.read_bytes()).hexdigest()==entry['sha256'],entry['path']
    if path.suffix=='.json':json.loads(path.read_text())
actual={str(p.relative_to(root)) for p in root.rglob('*') if p.is_file() and p.name!='FIRST-SCIENCE-SEAL.manifest.json'}
assert actual==names,(actual-names,names-actual)
n=json.loads((root/'inputs/neutral-selector-and-exact-bindings.only.json').read_text())
for entry in n['exactInputBindingsVerified']:
    path=repo/entry['path']
    assert 'sha256:'+hashlib.sha256(path.read_bytes()).hexdigest()==entry['sha256'],entry['path']
r=json.loads((root/'REVIEW.first34-whole-goal-source-and-course-scope.independent-b.actual.json').read_text())
canonical=json.loads((repo/r['wholeCanonicalBinding']['path']).read_text())
by={g['id']:g for g in canonical['goals']}
expected={tuple(t) for t in n['exactTupleSelector']}
assert len(expected)==34
seen=set()
for row in r['records']:
    pair=(row['tuple']['goalId'],row['tuple']['jurisdiction'])
    assert pair not in seen;seen.add(pair)
    assert row['wholeBeforeGoal']==by[pair[0]],pair
    assert row['currentDirectAuthoredTargets'],pair
    for ref in row['currentDirectAuthoredTargets']:
        assert ref['scope']['jurisdiction']==pair[1]
        assert ref['reference']['goalId']==pair[0]
        assert ref['effectiveAuthoredRoleAtDirectReference']=='target'
    for partner in row['preserveWholeGoalPartners']:assert partner in by
    assert row['sourceClosureGranted'] is False and row['strictM7Claim'] is False
assert seen==expected
assert r['distinctWholeGoals']==18 and len({g for g,j in seen})==18
assert r['beforeVerdictSource34AuthorCandidateAOrRootVerdictsRead'] is False
assert r['canonicalBodiesOrIdsChanged'] is False and r['activeWrites'] is False
assert r['strictGainClaim']==0
print(json.dumps({'status':'PASS','scope':'first scientific B artifact/input integrity only','tuples':34,'wholeGoals':18,'sealedFiles':len(names),'exactExternalBindings':len(n['exactInputBindingsVerified']),'sealSHA256':'sha256:'+hashlib.sha256((root/'FIRST-SCIENCE-SEAL.manifest.json').read_bytes()).hexdigest()}))
