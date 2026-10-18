from pathlib import Path
import json,hashlib,datetime,difflib
r=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18');o=r/'chemie-current450-T2-terminal-exams-author-20261018-v4';n=r/'chemie-current450-T2-terminal-exams-author-20261018-v5';wanted={'8a281a5b-fa13-5873-a15a-a4a0c8d6cfa1','95cff878-b85e-53d8-84bc-132c8bf4cf71','987cebe4-9157-51f2-9939-f12bbb512c6e','37d2e2a5-736f-541d-a66f-0d467e8e9bc1','9fea3d6f-9c43-5380-a2bc-ba06bf23b70e','4cbc2b02-d8c9-510e-9f64-2bb98b7673ef'}
def read(p):return json.loads(p.read_text())
a={g['id']:g for g in read(o/'AUTHOR.new-goals.full.draft.json')['newGoals']};b={g['id']:g for g in read(n/'AUTHOR.new-goals.full.draft.json')['newGoals']};assert a.keys()==b.keys();assert set(i for i in a if a[i]!=b[i])==wanted
for p in (o/'inputs').iterdir():assert p.read_bytes()==(n/'inputs'/p.name).read_bytes()
for f in ['INPUT.ordinary-goals.selected-only.json','INPUT.whole-P-transport-manifest.json','INPUT.material-bindings.exact-selected.json','AUTHOR.exam-interfaces-and-scope.json','AUTHOR.sparse-contains-placement.proposals.json','AUTHOR.unresolved-holds.json']:
 assert (o/f).read_bytes()==(n/f).read_bytes()
records=[]
for i,g in b.items():
 e=g['examData'];old=a[i]['examData'];assert g['requires']==a[i]['requires'];assert e['coveredGoalIds']==old['coveredGoalIds'];assert e['scoring']['maxPoints']==old['scoring']['maxPoints'];assert e['scoring']['passingPoints']==old['scoring']['passingPoints'];assert sum(s['points'] for s in e['scoring']['steps'])==e['scoring']['maxPoints'];assert e['reviewStatus']=='draft'
 for f,s in [('taskContent','task.de'),('taskContentEn','task.en'),('solutionContent','solution.de'),('solutionContentEn','solution.en')]:
  assert (n/'tasks'/f'{i}.{s}.md').read_text()==e[f]+'\n'
 if i in wanted:
  for f in ['taskContent','taskContentEn']:assert 'curricula/' not in e[f];assert '.pdf12.1' not in e[f]
  for f in ['taskContent','taskContentEn','solutionContent','solutionContentEn']:
   if e[f]!=old[f]:
    name=f'{i}.{f}.diff.txt'; (n/'diffs').mkdir(exist_ok=True);(n/'diffs'/name).write_text(''.join(difflib.unified_diff(old[f].splitlines(True),e[f].splitlines(True),fromfile='frozenv4/'+f,tofile='candidatev5/'+f)))
  records.append({'goalId':i,'changedContentFields':[f for f in ['taskContent','taskContentEn','solutionContent','solutionContentEn'] if e[f]!=old[f]],'requiresCoveredGoalsPointTotalsThresholdsPreserved':True})
 else:
  assert a[i]==g
  for s in ['task.de','task.en','solution.de','solution.en']:assert (o/'tasks'/f'{i}.{s}.md').read_bytes()==(n/'tasks'/f'{i}.{s}.md').read_bytes()
fat=b['95cff878-b85e-53d8-84bc-132c8bf4cf71']['examData']
for f,sep in [('solutionContent','Aufgabe'),('solutionContentEn','Task')]:
 for num in [3,4]:
  segment=fat[f].split(f'### {sep} {num}\n\n')[1].split('\n\n')[0]
  row=next(s for s in fat['scoring']['steps'] if s['id']==f's{num}a');assert segment in row['descriptionEn' if f.endswith('En') else 'description']
finding=r/'chemie-current450-T2-terminal-exams-informed-independent-a-20261018-v2/FINDINGS.v4.first-independent-A.json'
report={'artifactRole':'AUTHOR_BOUNDED_DELTA_AND_BINDING_CHECK_NOT_INDEPENDENT_REVIEW','checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualPriorFindings':{'path':str(finding),'sha256':hashlib.sha256(finding.read_bytes()).hexdigest(),'addressedIds':['T2-A-01','T2-A-02','T2-A-03'],'nonblockingT2A04ScopeUnchanged':True},'totalWholeExams':19,'changedWholeExams':6,'unchangedWholeExamsExact':13,'changedRecords':records,'bothHydrogenationAnswersMatchTheirOwnScoringText':True,'allWholeOrdinaryPAndScopeInputBytesUnchanged':True,'allFourDEENTaskSolutionFilesPerExamMatchEmbeddedText':True,'allRequiresCoveredGoalIdsScoresAndThresholdsPreserved':True,'allReviewStatusesDraft':True,'normalWrites':0,'newScientificCompletionsClaimed':0,'humanApproval':False,'learnerExecuted':False};(n/'CHECK.v5-bounded-delta-and-findings.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False))
