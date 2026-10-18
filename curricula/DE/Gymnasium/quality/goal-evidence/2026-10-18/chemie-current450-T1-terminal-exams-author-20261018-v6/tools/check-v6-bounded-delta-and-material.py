import json,pathlib,hashlib,datetime
r=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18');o=r/'chemie-current450-T1-terminal-exams-author-20261018-v5';n=r/'chemie-current450-T1-terminal-exams-author-20261018-v6';gid='d7abdeb3-5b69-5744-b7fd-8149fd92b0d5'
def read(p):return json.loads(p.read_text())
def gs(p):
 x=read(p);return x['newGoals'] if isinstance(x,dict) else x
def sh(p):return hashlib.sha256(p.read_bytes()).hexdigest()
a={g['id']:g for g in gs(o/'AUTHOR.new-goals.full.draft.json')};b={g['id']:g for g in gs(n/'AUTHOR.new-goals.full.draft.json')};assert a.keys()==b.keys();changed=[i for i in a if a[i]!=b[i]];assert changed==[gid],changed
assert (o/'INPUT.ordinary-goals.selected-only.json').read_bytes()==(n/'INPUT.ordinary-goals.selected-only.json').read_bytes()
assert all(p.read_bytes()==(n/'inputs'/p.name).read_bytes() for p in (o/'inputs').iterdir())
g=b[gid];e=g['examData'];assert g['requires']==e['coveredGoalIds']==['8edee6b6-9ead-515e-93f5-feada64522b2'];assert e['scoring']['maxPoints']==e['scoring']['passingPoints']==sum(x['points'] for x in e['scoring']['steps'])==18
for f,suffix in [('taskContent','task.de'),('taskContentEn','task.en'),('solutionContent','solution.de'),('solutionContentEn','solution.en')]:
 assert (n/'tasks'/f'{gid}.{suffix}.md').read_text()==e[f]+'\n'
for f in ['taskContent','taskContentEn']:
 assert 'curricular AI QA' not in e[f];assert 'curricula/' not in e[f];assert e[f].count('https://www.juniorlabor.de/file_download/59/OS_Skript_Grignard_Zm.pdf')==1
 assert all(t in e[f] for t in ['__________','10.8' if f.endswith('En') else '10,8','20 mL','80 mL'])
assert [x['id'] for x in e['scoring']['steps']][-3:]==['s3a','s3b','s3c']
for x in (n/'tasks').iterdir():
 if not x.name.startswith(gid):assert x.read_bytes()==(o/'tasks'/x.name).read_bytes()
h=read(n/'AUTHOR.unresolved-holds.json');assert h[0]['holds']==['CURRENT_ORDINARY_TARGET_VIEW_PLACEMENT_UNRESOLVED'];assert not any(gid in x['appendContainsGoalIds'] for x in read(n/'AUTHOR.sparse-contains-placement.proposals.json')['containsPlacements'])
report={'artifactRole':'AUTHOR_BOUNDED_EXACT_DELTA_AND_MATERIAL_COMPLETENESS_CHECK_NOT_SCIENCE_REVIEW','checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'wholeExamCount':len(b),'changedWholeExamIds':changed,'unchangedWholeExamCount':11,'allFourTaskSolutionFilesMatchEmbeddedDEEN':True,'wholeOrdinaryInputAndWholePInputBytesUnchanged':True,'actualPerformanceRubricSeparate':True,'pointSumMaxPassing':18,'remainingTargetHoldPreserved':True,'heldContainsAppendRemoved':True,'otherExamFileBytesUnchanged':True,'normalFileWrites':0,'learnerExecuted':False,'humanApproved':False,'independentReviewClaimed':False}
(n/'CHECK.v6-bounded-delta-and-material.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False))
