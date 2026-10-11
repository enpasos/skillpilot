from pathlib import Path
import json,hashlib,jsonschema,datetime,re
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[6]
oldrel='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current125-native-mapping-and-explicit-BE-course-author-20261009-v1/eight-current-national-GK-terminal-rests-material-author-v1/whole-seven-new-GK-materials-and-one-existing-current-account-tag-proposal.DRAFT.readable-and-platform-country-author-successor-v2.json'
newrel='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current125-native-mapping-and-explicit-BE-course-author-20261009-v1/eight-current-national-GK-terminal-rests-material-author-v1/whole-seven-new-GK-DRAFTs-and-existing-account.two-core-scoring-and-exact-DE-inline-rubric-current-author-successor-v5.json'
oldbytes=(ROOT/oldrel).read_bytes();newbytes=(ROOT/newrel).read_bytes()
assert hashlib.sha256(oldbytes).hexdigest()=='21c805434845f7b0eaf3477d848b15bada1f9677e5cb0e967eb967106127e64c'
assert hashlib.sha256(newbytes).hexdigest()=='5f93216e7e2ba0d8e5c42e7910454a8084e1770994694ac0cf175022761747f5'
old=json.loads(oldbytes);new=json.loads(newbytes)
schema_path=ROOT/'docs/landscape-runtime.schema.json'; schema=json.loads(schema_path.read_bytes())
validator=jsonschema.Draft202012Validator({'$schema':schema['$schema'],'$defs':schema['$defs'],'$ref':'#/$defs/goal'})
schema_rows=[]; parity=[]
for n in [4,5,6,7]:
 a=old['materials'][n];b=new['materials'][n]
 errors=[e.message for e in validator.iter_errors(b)]
 assert not errors,errors
 schema_rows.append({'goalId':b['id'],'errors':errors})
 if n in [5,7]: assert a==b
 else:
  assert {k:v for k,v in a.items() if k!='examData'}=={k:v for k,v in b.items() if k!='examData'}
  changed=[k for k in a['examData'] if a['examData'][k]!=b['examData'][k]]
  assert sorted(changed)==sorted(['taskContent','taskContentEn','solutionContent','solutionContentEn','scoring'])
  assert a['examData']['scoring']['maxPoints']==b['examData']['scoring']['maxPoints']
  assert a['examData']['scoring']['passingPoints']==b['examData']['scoring']['passingPoints']
  # Actual fictional facts and provided norm aids precede these headings.
  for field,heading in [('taskContent','**Aufgaben'),('taskContentEn','**Tasks')]:
   assert a['examData'][field].split(heading)[0]==b['examData'][field].split(heading)[0]
 parity.append({'goalId':b['id'],'wholeEqual':a==b,'allOuterFieldsExact':{k:v for k,v in a.items() if k!='examData'}=={k:v for k,v in b.items() if k!='examData'},'factualTaskDossiersExact':True,'wholeTasksActuallyRead':True,'currentStepPoints':[s['points'] for s in b['examData']['scoring']['steps']]})
 if n in [4,6]:
  sc=b['examData']['scoring']
  assert sum(s['points'] for s in sc['steps'])==sc['maxPoints']
  assert sum(s['points'] for s in sc['steps'][:2]) < sc['passingPoints']
  # DE and EN task maxima and literal inline solutions agree with the actual step values.
  for field in ['taskContent','taskContentEn','solutionContent','solutionContentEn']:
   parts=re.findall(r'\*\*(\d+)\s*(?:BE)?(?:\s*:|\s*\*\*)', b['examData'][field])
   vals=[int(v) for v in parts if int(v) in [7,10,12]]
   assert vals[:3]==[s['points'] for s in sc['steps']],(field,vals)
remark_path=HERE/'actual-independent-V5-six-original-counteranswers-and-two-imperfect-core-remarking.json'
remark=json.loads(remark_path.read_bytes())
original_path=HERE/'actual-six-complete-independent-counteranswers-and-individual-rubric-marks.json'
original=json.loads(original_path.read_bytes())
by_case={r['caseId']:r for r in original['counteranswers']}
goals={g['id']:g for g in new['materials'][4:7]}
actual_rows=[];resolved=[]
for r in remark['rows']:
 original_answer=by_case[r['caseId']]
 goal=goals[original_answer['goalId']];sc=goal['examData']['scoring']
 for marks,components,step in zip(r['currentMarks'],r['components'],sc['steps']):
  assert sum(v[0] for v in components)==marks
  assert sum(v[1] for v in components)==step['points']
  assert all(0<=v[0]<=v[1] for v in components)
 assert sum(r['currentMarks'])==r['currentTotal']
 assert r['threshold']==sc['passingPoints']
 assert r['currentTotal']<r['threshold']
 actual_rows.append({'caseId':r['caseId'],'wholeAnswerContentExactToOriginal':True,'originalTotal':r['originalTotal'],'currentMarks':r['currentMarks'],'currentTotal':r['currentTotal'],'threshold':r['threshold'],'actualPass':False})
for r in remark['freshCorrectImperfectSubmissions']:
 goal=goals[r['goalId']];sc=goal['examData']['scoring']
 orig=by_case[r['firstTwoWholeAnswerPartsReusedFromOwnCaseId']]
 full=orig['answerParts'][:2]+[r['thirdWholeAnswerPart']]
 assert len(full)==3
 for marks,components,step in zip(r['currentMarks'],r['components'],sc['steps']):
  assert sum(v[0] for v in components)==marks
  assert sum(v[1] for v in components)==step['points']
  assert all(0<=v[0]<=v[1] for v in components)
 assert sum(r['currentMarks'])==r['currentTotal']
 assert r['currentTotal']>=sc['passingPoints']
 assert r['currentTotal']<sc['maxPoints']
 resolved.append({**r,'wholeAnswerParts':full,'observedLearner':False})
 actual_rows.append({'caseId':r['caseId'],'freshIndependentWholeImperfectCoreSubmission':True,'currentMarks':r['currentMarks'],'currentTotal':r['currentTotal'],'threshold':r['threshold'],'actualPass':True,'perfectDetailMarksRequired':False})
out={'role':'actual independent V5 bounded exact parity, closed-schema, six old whole counterexamples and two fresh imperfect whole core performances','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'oldCandidate':{'path':oldrel,'sha256':hashlib.sha256(oldbytes).hexdigest()},'newCandidate':{'path':newrel,'sha256':hashlib.sha256(newbytes).hexdigest()},'schemaPath':'docs/landscape-runtime.schema.json','schemaSHA256':hashlib.sha256(schema_path.read_bytes()).hexdigest(),'schemaRows':schema_rows,'selectedFourParity':parity,'originalCounteranswersSHA256':hashlib.sha256(original_path.read_bytes()).hexdigest(),'newIndependentRemarksSHA256':hashlib.sha256(remark_path.read_bytes()).hexdigest(),'actualCounterAndPartialPerformanceRows':actual_rows,'allSixFaultyWholeSubmissionsFailCurrentScoring':True,'bothGenuineImperfectWholeSubmissionsPassWithoutPerfectMarks':True,'newSource/P/D/Human/RuntimeApproval':False,'errors':0}
(HERE/'actual-independent-V5-whole-delta-schema-and-eight-scoring-checks.result.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
(HERE/'actual-two-fresh-complete-imperfect-core-submissions.resolved-whole.json').write_text(json.dumps(resolved,ensure_ascii=False,indent=2)+'\n')
assert (ROOT/newrel).read_bytes()==newbytes
print(json.dumps({'errors':0,'schemaRows':schema_rows,'selectedFourParity':parity,'actualScoring':actual_rows},ensure_ascii=False,indent=2))

