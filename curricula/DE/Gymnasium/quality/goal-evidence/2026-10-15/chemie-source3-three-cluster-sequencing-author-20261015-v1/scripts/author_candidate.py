#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Bounded data-only author CAS; never overwrites sealed or active inputs."""
import copy,hashlib,json
from pathlib import Path
ROOT=Path.cwd();OUT=Path(__file__).resolve().parents[1];REL=OUT.relative_to(ROOT).as_posix()
PREP='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-source3-six-contexts-current422-native-preparation-root-20261015-v1'
ACQ='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-three-source-duty-acquisition-routes-author-20261015-v1'
REPORT='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-acid10-current419-paired-native-inactive-integration-root-20261015-v1/checks/CENTRAL.current419-P10-A7-D3.stock-report.actual.json'
def read(p):return json.loads((ROOT/p).read_text())
def bind(p):
 b=(ROOT/p).read_bytes();return {'path':p,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,x):(OUT/p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
n=read(PREP+'/NEUTRAL.native-nine-physical-inputs.json');old=read(n['wholeCanonical']['path']);new=copy.deepcopy(old)
G={g['id']:g for g in old['goals']};NG={g['id']:g for g in new['goals']}
def gid(p):return next(i for i in G if i.startswith(p))
clusterids=list(map(gid,['a00d302b','fb3bdf39','1e803ef8']));salt=gid('c441d9e8');exo=gid('1286f2fe')
for i in clusterids:NG[i]['requires']=[]
assert exo not in NG[salt]['requires'];NG[salt]['requires'].append(exo)
changed=[i for i in G if G[i]!=NG[i]];assert set(changed)==set(clusterids+[salt])
assert all(all(k=='requires' or G[i].get(k)==NG[i].get(k) for k in set(G[i])|set(NG[i])) for i in changed)
write('candidate/canonical554.prospective422.three-clusters-one-atomic-edge.author.json',new)
write('CAS.four-whole-object-sequencing-deltas.author.json',{
 'schemaVersion':1,'role':'Informed author migration of non-universal cluster sequencing to existing atomic routes plus one necessary energy prerequisite',
 'before':n['wholeCanonical'],'after':bind(REL+'/candidate/canonical554.prospective422.three-clusters-one-atomic-edge.author.json'),
 'rows':[{'goalId':i,'wholeBefore':G[i],'wholeAfter':NG[i],
          'changedFields':['requires'],'atomicEdgeAdded':i==salt,
          'authorRationale':'The universal cluster prerequisite is broader than its children need; their specific atomic routes remain.' if i!=salt else 'Salt formation explicitly explains an exothermic result. Preserve general exo/endo classification as an explicit1286 prerequisite after removing its indirect broad cluster supply.'} for i in changed],
 'otherWholeObjectsUnchanged':550,'allOriginalAtomicRequiresPreserved':True,'addedAtomicRequires':[{'goalId':salt,'requires':exo}],
 'containsChanges':0,'textChanges':0,'scopeChanges':0,'resourceChanges':0,'newGateVotes':0})
closure=set(clusterids+[salt]);todo=list(closure)
while todo:
 g=G[todo.pop()]
 for i in g.get('requires',[])+g.get('contains',[]):
  if i not in closure:closure.add(i);todo.append(i)
write('source-context/whole-three-clusters-all-children-and-prerequisites.exact.json',{
 'base':n['wholeCanonical'],'clusterIds':clusterids,'wholeGoals':[G[i] for i in sorted(closure)],
 'scope':'Whole original source objects, not truncated competency labels. Original atomic and retained narrower-cluster routes are preserved.'})
subject=read(REPORT)['subjects'][0];ids=subject['strictCompleteGoalIds'];assert len(ids)==315
write('source-context/current315.exact-goal-ids.bound.json',{'source':bind(REPORT),'strictComplete':315,'denominator':419,'goalIds':ids,
 'meaning':'Historical/current bound checkpoint subset for re-review radius; not a new completion measurement.'})
sel=read(ACQ+'/INPUTS.physical-exact-selector.json')
sel['role']='Finite inactive data-only sequencing author candidate, no scientific approval'
sel['canonical']=bind(REL+'/candidate/canonical554.prospective422.three-clusters-one-atomic-edge.author.json')
sel['semanticLedger']={'path':REL+'/candidate/semantic554.same-classifications-four-source-fingerprints.author.json'}
sel['baseCanonical']=n['wholeCanonical'];sel['baseSemanticLedger']=n['kindLedger']
sel['acquisitionWholeViewCAS']=sel['viewCAS'];sel['current315Source']=bind(REPORT)
sel['sourceHypothesisPolicy']='Root temporary hypothesis was routing evidence only. Final candidate contains one separately justified atomic replacement edge in addition to three cluster deletions; no ignored diagnostic path is an executable input.'
write('INPUTS.physical-exact-selector.json',sel)
# Exact reused route-check code, acquired materials and whole-view CAS; no prior output is edited.
for name in ['scripts/check_routes.mts','materials/ten-complete-acquisition-opportunities.DE-EN.author.json','CAS.two-whole-LK-views-and-two-exact-GK-controls.author.json']:
 q=OUT/name;q.parent.mkdir(parents=True,exist_ok=True);q.write_bytes((ROOT/ACQ/name).read_bytes())
write('source-context/unchanged-acquisition-check-and-materials.reuse.json',{
 'items':[{'source':bind(ACQ+'/'+p),'copy':bind(REL+'/'+p)} for p in ['scripts/check_routes.mts','materials/ten-complete-acquisition-opportunities.DE-EN.author.json','CAS.two-whole-LK-views-and-two-exact-GK-controls.author.json']],
 'wholeViewsRemainAtOriginalSealedAcquisitionPaths':True,'newReviewVotes':0})
print(json.dumps({'goals':554,'clusterRequiresCleared':3,'atomicEdgesAdded':1,'otherWholeObjectsUnchanged':550,'wholeReadContextGoals':len(closure)}))
