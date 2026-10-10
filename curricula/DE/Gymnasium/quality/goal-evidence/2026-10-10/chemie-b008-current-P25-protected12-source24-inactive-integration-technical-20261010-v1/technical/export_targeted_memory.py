# SPDX-License-Identifier: Apache-2.0
import pathlib,json,shutil
helper=pathlib.Path(__file__).with_name('run_normal_checks.py').read_text();exec(helper.split('\nqa=run(')[0])
T=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-manganometry-current-EN-SN-targeted-memory-review-20261010-v1')
r=run('normal-2fdd-actual-Memory-fingerprint-export','app/scripts/memoryCardReview.ts',['--config='+str(T/'current-one.normal.config.json'),'--write-fingerprints']);assert r.returncode==0,r.stderr
for n in ['current-one.normal.review.jsonl','no-new-cards.scoped-empty.jsonl']:shutil.copyfile(C/T/n,R/T/n)
r=run('normal-2fdd-actual-current-Memory-check','app/scripts/memoryCardReview.ts',['--config='+str(T/'current-one.normal.config.json'),'--mode=check']);assert r.returncode==0,r.stdout+r.stderr
old=(R/P/'memory/current398.exact-selected.review.jsonl').read_bytes().splitlines(keepends=True);new=(R/T/'current-one.normal.review.jsonl').read_bytes().splitlines(keepends=True);assert len(new)==1
id=json.loads(new[0])['goalId'];hits=[l for l in old if json.loads(l)['goalId']==id];assert len(hits)==1
f=R/P/'memory/current398-with-actual-2fdd-Memory-successor.review.jsonl';f.write_bytes(b''.join(new[0] if json.loads(l)['goalId']==id else l for l in old));assert len(f.read_bytes().splitlines())==398
cfg=json.loads((R/P/'memory/current398.future-active.config.json').read_text());cfg['reviewPath']=str(f.relative_to(R));cf=R/P/'memory/current398-with-actual-2fdd-Memory-successor.future-active.config.json';cf.write_text(json.dumps(cfg,ensure_ascii=False,indent=2)+'\n')
for n in ['registry/chemie-subject.future-active.inactive.json','registry/five-subject-future-active.inactive.config.json','registry/chemie-only-normal-check.config.json']:
 d=json.loads((R/P/n).read_text());ss=d['subjects'] if 'subjects' in d else [d]
 for s in ss:
  if s['subject']=='chemie':s['memoryReviewConfigPath']=str(cf.relative_to(R))
 (R/P/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
for f in [f,cf,*[(R/P/n) for n in ['registry/chemie-subject.future-active.inactive.json','registry/five-subject-future-active.inactive.config.json','registry/chemie-only-normal-check.config.json']]]:
 d=C/f.relative_to(R);d.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(f,d)
r=run('normal-whole398-Memory-with-actual-2fdd-successor-check','app/scripts/memoryCardReview.ts',['--config='+str(cf.relative_to(R)),'--mode=check']);assert r.returncode==0,r.stdout+r.stderr
put('checks/exact398-Memory-one-meaningful-targeted-successor.actual.json',{'schemaVersion':1,'rowCount':398,'historicalRowsUnchanged':397,'targetedGoalId':id,'oldRowPreserved':str(T/'input/old-stale-Memory-row.exact.jsonl'),'actualFIRST':str(T/'Memory-FIRST.actual.bounded-decision.json'),'ordinaryActualCurrentRow':str(T/'current-one.normal.review.jsonl'),'sameExistingReviewId':True,'wholeVisibilityCoverageRequired':cfg['visibilityScopeCoverageRequired'],'visibilityScopesPreserved':len(cfg['visibilityScopes']),'activeWrites':[]})
