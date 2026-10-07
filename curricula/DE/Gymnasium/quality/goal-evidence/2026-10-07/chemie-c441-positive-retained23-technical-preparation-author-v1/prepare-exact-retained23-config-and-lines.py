#!/usr/bin/env python3
"""Technical subtraction of c441 only; keep original lines and run references."""
from pathlib import Path
import copy,datetime,hashlib,json,subprocess
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[6];EXCLUDED='c441d9e8-d9d9-5e55-a189-a37345541321'
old_config_path=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next25-reviewed-integration-preparation-root-v1/positive24.future-active.config.json';old_config=json.loads(old_config_path.read_text());old_lines_path=ROOT/old_config['reviewPath'];old_lines=old_lines_path.read_bytes().splitlines(keepends=True)
def bind(p):
    d=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(d).hexdigest(),'bytes':len(d)}
def value_hash(v):return hashlib.sha256(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def write(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
rows=[(i+1,l,json.loads(l)) for i,l in enumerate(old_lines) if l.strip()];assert len(rows)==24 and len(old_config['scope']['goalIds'])==24
assert len([r for _,_,r in rows if r['goalId']==EXCLUDED])==1
retained=[(i,l,r) for i,l,r in rows if r['goalId']!=EXCLUDED];assert len(retained)==23
ids=[g for g in old_config['scope']['goalIds'] if g!=EXCLUDED];assert len(ids)==23 and {r['goalId'] for _,_,r in retained}==set(ids)
assert all(r['status']=='needs_human_review' and r['reviewAuthority']=='ai_candidate' for _,_,r in retained)
subset_path=OUT/'positive23.exact-retained-independent-b.review.jsonl';subset_path.write_bytes(b''.join(l for _,l,_ in retained))
assert subset_path.read_bytes()==b''.join(l for _,l,_ in rows if json.loads(l)['goalId']!=EXCLUDED)
config=copy.deepcopy(old_config);config['reviewPath']=str(subset_path.relative_to(ROOT));config['scope']['goalIds']=ids;config['scope']['label']='23 current unchanged whole independent P-B record lines retained exactly from the prior24; only c441 image correction is separately rebound. Original reviewId/run/time/reviewer unchanged; no new scientific review or Human Approval.'
config_path=OUT/'positive23.retained.current.config.json';write(config_path,config)
before_compare=copy.deepcopy(old_config);after_compare=copy.deepcopy(config)
for x in (before_compare,after_compare):x.pop('reviewPath');x['scope'].pop('goalIds');x['scope'].pop('label')
assert before_compare==after_compare and config['reviewId']==old_config['reviewId'] and config['reviewRunManifestPaths']==old_config['reviewRunManifestPaths']
external=[old_config_path,old_lines_path]+[ROOT/p for p in old_config['reviewRunManifestPaths']]+[ROOT/old_config[k] for k in ['landscapePath','semanticKindLedgerPath','reviewCriteriaPath']]+[ROOT/'app/scripts/positiveGoalEvidenceReview.ts',ROOT/'app/scripts/goalEvidence.ts',ROOT/'app/package.json']
external=[p for p in external if p.is_file()];guards=[bind(p) for p in external]
args=['npm','--prefix','app','run','quality:positive-goal-evidence','--','--config='+str(config_path.relative_to(ROOT)),'--mode=check'];start=datetime.datetime.now(datetime.timezone.utc).isoformat();r=subprocess.run(args,cwd=ROOT,capture_output=True,text=True);finish=datetime.datetime.now(datetime.timezone.utc).isoformat();stdout=OUT/'native-positive-retained23-check.actual.stdout.txt';stderr=OUT/'native-positive-retained23-check.actual.stderr.txt';stdout.write_text(r.stdout);stderr.write_text(r.stderr)
write(OUT/'native-positive-retained23-check.actual.terminal.receipt.json',{'role':'technical retained-line scope check; no new science review','argv':args,'cwd':str(ROOT),'startedAt':start,'finishedAt':finish,'exitCode':r.returncode,'stdout':bind(stdout),'stderr':bind(stderr)})
assert r.returncode==0,r.stdout+r.stderr
for b in guards:assert bind(ROOT/b['path'])==b
proof=[]
actual_rows=subset_path.read_bytes().splitlines(keepends=True)
for (old_index,old_line,old_record),new_line in zip(retained,actual_rows):
    assert old_line==new_line;new_record=json.loads(new_line);assert new_record==old_record
    proof.append({'goalId':old_record['goalId'],'originalLineNumber':old_index,'wholeOriginalLineSha256':hashlib.sha256(old_line).hexdigest(),'wholeRetainedLineSha256':hashlib.sha256(new_line).hexdigest(),'wholeLineBytes':len(old_line),'wholeLineBytesExact':True,'wholeRecordObjectExact':True,'wholeProfileNormalizedSha256Before':value_hash(old_record['profile']),'wholeProfileNormalizedSha256After':value_hash(new_record['profile']),'originalProfileFingerprintRetainedExact':old_record['profileFingerprint'],'reviewId':old_record['reviewId'],'reviewedAtExact':old_record['reviewedAt'],'reviewerExact':old_record['reviewer'],'reviewRunIdsExact':old_record['reviewRunIds'],'statusExact':old_record['status'],'reviewAuthorityExact':old_record['reviewAuthority']})
obj={'role':'technical current retained P23 subset and config, not an independent science review','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'original24Config':bind(old_config_path),'original24Records':bind(old_lines_path),'originalRunsUnchanged':[bind(ROOT/p) for p in old_config['reviewRunManifestPaths']],'retained23Config':bind(config_path),'retained23ExactLines':bind(subset_path),'onlyExcludedGoalId':EXCLUDED,'originalScopeCount':24,'retainedScopeCount':23,'oldReviewIdRetained':True,'oldRunReferencesRetained':True,'configChangedFieldsOnly':['reviewPath','scope.goalIds','scope.label'],'rows':proof,'all23WholeLinesAndProfilesExact':True,'allDatesReviewersAndRunIdsExact':True,'nativeProductionCheck':bind(OUT/'native-positive-retained23-check.actual.terminal.receipt.json'),'expectedNeedsHumanReview':23,'expectedApproved':0,'actualNativeExitCode':r.returncode,'inputGuardsExactAfter':guards,'activeWrites':False,'newP1Written':False,'newScientificReview':False,'newReviewRunWritten':False,'humanApproval':False,'newStrictCompletion':0,'rootMustRegisterRetained23PlusFreshCurrentC441P1Separately':True}
write(OUT/'retained23-whole-lines-profiles-config-and-native-check.actual.proof.json',obj)
print(json.dumps({'retainedCount':23,'wholeLinesExact':23,'wholeProfilesExact':23,'originalReviewIdAndRunRefsExact':True,'nativePositiveCheckExit0':r.returncode==0,'activeWrites':False,'newScience':False}))
