# SPDX-License-Identifier: Apache-2.0
import pathlib,json,hashlib,jsonschema,datetime,copy
R=pathlib.Path.cwd();B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18';OLD=B/'chemie-current450-T5-terminal-exams-author-20261018-v2';O=B/'chemie-current450-T5-terminal-exams-author-20261018-v3'
def read(p):return json.loads(p.read_text())
def pin(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
old=read(OLD/'AUTHOR.eight-complete-exam-goals.draft.json');new=read(O/'AUTHOR.eight-complete-exam-goals.draft.json')
assert len(old)==len(new)==8
seal=read(OLD/'FREEZE.author.sha256.json')
for p in seal['files']:
 q=pin(OLD/p['path']);assert q['sha256']==p['sha256'] and q['bytes']==p['bytes'],p['path']
pins=read(O/'INPUT.sealed-predecessor-and-independent-FIRST.pins.json')
for p in [pins['predecessor'],pins['predecessorSeal'],pins['first']]+pins['inheritedExactFiles']:assert pin(R/p['path'])==p
schema=read(R/'docs/landscape-runtime.schema.json');v=jsonschema.Draft202012Validator({'$schema':schema['$schema'],'$defs':schema['$defs'],'$ref':'#/$defs/goal'})
changes=[];unchanged=[]
for a,b in zip(old,new):
 assert a['id']==b['id'];v.validate(b)
 if a==b:unchanged.append(a['id']);continue
 assert a['id'].startswith(('44af0','b2bd'))
 for k in set(a)|set(b):
  if k!='examData':assert a.get(k)==b.get(k),(a['id'],k)
 for k in set(a['examData'])|set(b['examData']):
  if k not in ['taskContent','taskContentEn']:assert a['examData'].get(k)==b['examData'].get(k),(a['id'],k)
 for k in ['taskContent','taskContentEn']:
  x=a['examData'][k];y=b['examData'][k];assert x!=y;assert 'curricula/' not in y;changes.append({'goalId':a['id'],'field':k})
  if a['id'].startswith('b2bd'):
   assert x.split('## 4.')[0]==y.split('## 4.')[0]
   h='### Arbeitsbedingungen und Schutz' if k=='taskContent' else '### Procedure and protection'
   x4=x.split('## 4.')[1];y4=y.split('## 4.')[1]
   assert x4.split(h)[0]==y4.split(h)[0]
   h2='### Messregel und Auswertung' if k=='taskContent' else '### Measurement and analysis rule'
   assert x4.split(h2)[1]==y4.split(h2)[1]
   assert ('höchstens10mm' if k=='taskContent' else 'at most10mm') in y4
  else:
   assert ('Reaktionsgleichung' if k=='taskContent' else 'reaction equation') in y
 assert read(O/'candidate-goals'/f'{b["id"]}.whole-goal.pending.json')==b
 for f,s in [('taskContent','de.task'),('taskContentEn','en.task'),('solutionContent','de.solution'),('solutionContentEn','en.solution')]:assert (O/'tasks'/f'{b["id"]}.{s}.md').read_text()==b['examData'][f]+'\n'
assert len(unchanged)==6 and len(changes)==4
# Current whole goal/P context is inspected without changing the inherited frozen science.
raw=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';current={g['id']:g for g in read(raw)['goals']};deltas=[]
for q in read(OLD/'INPUT.whole-current-fourteen-end-and-four-support-goals-and-P.json')['records']:
 a=q['goal'];b=current[a['id']];ks=[k for k in set(a)|set(b) if a.get(k)!=b.get(k)]
 assert all(k=='requires' for k in ks),(a['id'],ks)
 if ks:deltas.append({'goalId':a['id'],'changedFields':ks,'oldRequires':a.get('requires',[]),'currentRequires':b.get('requires',[]),'disposition':'Inherited narrow root-owned orientation prerequisite context; no new author approval of native bindings.'})
 assert pin(R/q['PConfig']['path'])==q['PConfig'];assert pin(R/q['PRecordFile']['path'])==q['PRecordFile']
 assert json.loads((R/q['PRecordFile']['path']).read_text().splitlines()[q['PLine']-1])==q['wholePRecord']
report={'status':'PASS_BOUNDED_FOUR_TASK_FIELD_DELTA_AND_EIGHT_SCHEMA','checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'changedFields':changes,'otherSixWholeObjectsExact':unchanged,'allSolutionsRubricsRequiresCoverageAndMethodsExact':True,'predecessorSealedFilesVerifiedUnchanged':len(seal['files']),'schemaObjects':8,'wholeNativePRecordsExact':18,'currentCanonical':pin(raw),'currentOrdinaryRequiresOnlyDeltas':deltas,'newScopeOrPlacementDelta':False,'runtimeAll41ProjectionReplay':'No structural changes; exact inherited v2 inputs and foreign A all41 result retained, no new global runtime acceptance claimed.','normalWrites':0,'actualLearnerExecution':False,'independentVotes':0,'humanApproval':False}
(O/'CHECK.bounded-task-only-successor.actual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':report['status'],'changedTaskFields':4,'otherWholeObjectsExact':6,'allSchemaObjects':8,'nativePExact':18,'currentRequiresOnlyDeltas':len(deltas)}))
