from pathlib import Path
import json,gzip,functools,hashlib
F=Path(__file__).resolve().parent;R=F.parents[2];H=F.parent;ids=['fa0b6b69-ce54-4711-90e6-26f27249cd71','58fda9b4-4336-5594-99ce-722c4a453372','27b63e2e-6a34-483e-8e5a-fe0f49670d1d'];canon=json.loads((R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json').read_text());g={x['id']:x for x in canon['goals']};parents={i:set() for i in g}
for i,v in g.items():
 for c in v.get('contains',[]):parents[c].add(i)
@functools.cache
def anc(i):return parents[i].union(*(anc(p) for p in parents[i]))
@functools.cache
def inherited(i):return set(g[i].get('requires',[])).union(*(inherited(p) for p in parents[i]))
@functools.cache
def atoms(i):return set().union(*(atoms(c) for c in g[i]['contains'])) if g[i].get('contains') else {i}
@functools.cache
def direct(i):return set().union(*(atoms(r) for r in inherited(i)))
def reach(roots):
 s=set();q=list(roots)
 while q:
  i=q.pop()
  if i in s:continue
  s.add(i);q.extend(direct(i))
 return s
native=json.load(gzip.open(H/'statistics-pyramid-existing-route-native-20261104-v1/candidate.json.gz','rt'));scopes={s['scope']:s for s in native['scopes']};cands=json.loads((F/'mechanical-candidates.selected.json').read_text());out=[]
for id in ids:
 context=reach([id])-{id};data={'wholeGoal':g[id],'rawDirectRequires':{i:g[i] for i in g[id].get('requires',[])},'ancestorObjects':{i:g[i] for i in sorted(anc(id))},'normalizedDirectRequires':sorted(direct(id)),'wholeNormalizedContextObjects':{i:g[i] for i in sorted(context)},'normalizedContextEdges':{i:sorted(direct(i)) for i in sorted(context|{id})}};(F/(id+'.whole-context.json')).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
 print('\n',id,g[id]['title'],'FULL_R',len(context),'DIRECT',len(direct(id)))
 for i in sorted(direct(id)):print('DIRECT',i,g[i]['title'],g[i]['description'])
 print('FULL CONTEXT')
 for i in sorted(context):print(i,g[i]['title'],'|',g[i]['description'])
 c=next(x for x in cands if x['examId']==id);rows=[]
 for row in c['rows']:
  s=scopes[row['scope']];assert not context-set(s['contextGoalIds']); assert set(row['newContextPreparation'])==set()
  for i in context:assert set(s['effectiveDirectPrerequisitesByContextGoalId'][i])==direct(i)
  closed=context&set(s['uncoveredTargetGoalIds']);end=context&set(s['uncoveredEndpointGoalIds']);assert closed==set(row['uncoveredTargets']);assert end==set(row['uncoveredEndpoints'])
  rows.append({'scope':s['scope'],'compositionViewIds':s['compositionViewIds'],'examTargetBefore':id in s['targetGoalIds'],'examContextBefore':id in s['contextGoalIds'],'allDirectRInTarget':direct(id)<=set(s['targetGoalIds']),'directROutsideTarget':sorted(direct(id)-set(s['targetGoalIds'])),'fullROutsideTarget':sorted(context-set(s['targetGoalIds'])),'fullRContextAlreadyPresent':True,'closedPreparationTargetsOnly':sorted(closed),'closedPreparationEndpointsOnly':sorted(end)})
 existing=[s['scope'] for s in scopes.values() if id in s['targetGoalIds']];out.append({'examId':id,'candidateRows':rows,'existingTargetScopes':existing,'normalizedDirectRequires':sorted(direct(id)),'fullContextGoalCount':len(context)})
 print('CURRENT TARGET SCOPES',existing);print('DIRECT OUTSIDE T GROUPS',sorted({tuple(x['directROutsideTarget']) for x in rows}))
(F/'independent-scope-context-comparison.actual.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
