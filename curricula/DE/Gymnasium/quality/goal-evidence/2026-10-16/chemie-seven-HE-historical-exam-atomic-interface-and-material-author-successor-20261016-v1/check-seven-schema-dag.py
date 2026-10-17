from pathlib import Path
import json,jsonschema,hashlib,copy,re
R=Path.cwd();O=Path(__file__).resolve().parent;L=R/'tmp/chemie-m7-resumed-20261016/chemie-combined639-current-native-review-capsule-v1';C=L/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
def read(p):return json.loads(p.read_text())
def pin(p):return {'path':str(p.relative_to(R)),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
can=read(C);before=read(O/'INPUT.seven-WHOLE-exams.current639.exact.json');after=read(O/'CANDIDATE.seven-WHOLE-exams.AUTHOR.inactive.json');gb={g['id']:g for g in can['goals']};ids={g['id'] for g in after};assert len(ids)==7
sp=R/'docs/landscape-runtime.schema.json';schema=read(sp);goalSchema={'$ref':'#/$defs/goal','$defs':schema['$defs']};validator=jsonschema.Draft202012Validator(goalSchema);rows=[]
for old,new in zip(before,after):
 assert old==gb[old['id']]
 errors=[e.message for e in validator.iter_errors(new)];assert not errors,(new['id'],errors)
 assert old['applicability']==new['applicability'] and old['tags']==new['tags']
 assert new['examData']['reviewStatus']=='draft'
 assert new['examData']['scoring']['maxPoints']==old['examData']['scoring']['maxPoints']==30
 assert new['examData']['scoring']['passingPoints']==old['examData']['scoring']['passingPoints']==18
 assert sum(s['points'] for s in new['examData']['scoring']['steps'])==30
 assert [s['points'] for s in new['examData']['scoring']['steps']]==[s['points'] for s in old['examData']['scoring']['steps']]
 assert len(new['requires'])==len(set(new['requires'])) and new['requires']
 assert all(i in gb for i in new['requires'])
 assert not set(new['requires'])&{'633f4fd4-1c36-5377-8fe6-44d8eeac3c56','ae683d59-06a5-59be-87b5-b8648fd138c8','f4fa58e7-5c6c-58dd-82db-19e7e0abe822','0c9fe376-0fbd-5dc1-b8d4-d56d658a00e3'}
 assert not new['extendedData'].get('applicabilityFromRequires',False)
 assert all('LK' not in gb[i].get('tags',[]) or 'GK' in gb[i].get('tags',[]) for i in new['requires'])
 rows.append({'goalId':new['id'],'schemaErrors':errors,'newRequires':new['requires'],'maxPassPoints':[30,18],'fourStepWeightsExact':[s['points'] for s in new['examData']['scoring']['steps']],'oldSourceProvenanceExact':old['extendedData']['provenance']==new['extendedData']['provenance'],'rawCourseAndJurisdictionApplicabilityExact':True,'draftReviewGateExplicit':True,'noAppFromRequiresScopeUnion':True})
newBy={**gb,**{g['id']:g for g in after}};dag={}
for edge in ['requires','contains']:
 visiting=set();done=set();cycles=[]
 def visit(i,path):
  if i in visiting:cycles.append(path+[i]);return
  if i in done:return
  visiting.add(i)
  for n in newBy[i].get(edge,[]):
   assert n in newBy,(i,n);visit(n,path+[i])
  visiting.remove(i);done.add(i)
 for i in newBy:visit(i,[])
 assert not cycles;dag[edge]={'nodes':len(newBy),'cycles':cycles}
assert all(newBy[i]==gb[i] for i in gb if i not in ids)
# Exact independent source fingerprint evidence and released predecessor remain immutable.
first=O/'FIRST.finite-seven-whole-exam-author-science-and-source-scope.frozen.json';assert pin(first)['sha256']=='sha256:fa0c3075b484417bb78fc884298229da0be63c03ba75c2992568ae557dd5e8a6'
out={'recordKind':'Finite seven-goal schema/DAG/interface checks of inactive AUTHOR proposals; not independent science','baseCanonical':pin(C),'schema':pin(sp),'sevenGoals':rows,'DAG':dag,'unchangedOtherWholeGoals':632,'ordinaryMemoryAndViewMutations':0,'frozenAuthorScienceFirstExact':True,'newIndependentVotes':0,'normalWrites':0,'HumanApproval':False,'HumanTrial':False}
p=O/'CHECKS.actual-seven-raw-schemas-DAG-and-632-whole-body-invariance.json';p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'schemas':len(rows),'schemaErrors':0,'DAGcycles':0,'other632GoalsExact':True,'scoreBarEveryGoal':[30,18]}))
