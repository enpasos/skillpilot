# SPDX-License-Identifier: Apache-2.0
"""Finite P3 candidate preparation with original owner namespaces; no normal mutation."""
import copy, hashlib, json
from pathlib import Path
from datetime import datetime, timezone
R=Path.cwd();O=Path(__file__).resolve().parent.parent;OP=str(O.relative_to(R));N='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/'
A=N+'chemie-current450-NI-SL-three-conditional-profile-source-author-successor-20261018-v2/'
B=N+'chemie-current450-NI-SL-three-conditional-contexts-informed-independent-b-20261018-v1/'
C='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
def load(p):return json.loads(Path(p).read_text())
def H(b):return hashlib.sha256(b).hexdigest()
def digest(x):return H(json.dumps(x,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode())
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p.relative_to(R) if p.is_absolute() else p),'sha256':H(b),'bytes':len(b)}
def put(p,x):p=O/p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return pin(p)
def verify(f):assert pin(f['path'])==f
assert not (O/'PLAN.actual-inactive-P3-original-namespaces-and-residuals.json').exists()
for path,want in [(A+'SEAL.inactive-three-conditional-profile-source-author-successor.json','f91d6767885d8cd0ce69616713b513299c6708e51003ae1a60e59ca9cb24d09e'),(B+'SEAL.own-informed-three-conditional-context-review.json','781699b5c0e34db486f5bc8a988ef18761213d42c63351117035f2ce3827e17a')]:
 assert pin(path)['sha256']==want
 for f in load(path)['files']:verify(f)
d=load(A+'AUTHOR.three-whole-current-profile-source-successors.inactive.json');science=load(B+'FIRST.actual-v2-three-conditional-whole-P-atomicity-and-source.informed-independent-b.json');assert len(science['records'])==3 and all(x['wholePVerdict']=='ACCEPT' for x in science['records'])
central=load(C);si=next(i for i,s in enumerate(central['subjects']) if s['subject']=='chemie');subject=central['subjects'][si];paths=subject['positiveEvidenceConfigPaths'];can=load(subject['landscapePath']);goals={g['id']:g for g in can['goals']};targets=[x['goalId'] for x in d['records']];owners={};old_records={};inventory=[];protected={C:pin(C),subject['landscapePath']:pin(subject['landscapePath']),subject['semanticKindLedgerPath']:pin(subject['semanticKindLedgerPath']),A+'MATERIAL.three-complete-bilingual-source-context-cases.json':pin(A+'MATERIAL.three-complete-bilingual-source-context-cases.json')}
for ci,path in enumerate(paths):
 cfg=load(path);rows=Path(cfg['reviewPath']).read_bytes().splitlines(keepends=True);rs=[(li,json.loads(line)) for li,line in enumerate(rows) if line.strip()];assert [r['goalId'] for _,r in rs]==cfg['scope']['goalIds']
 inv={'config':pin(path),'reviewFile':pin(cfg['reviewPath']),'records':[]}
 for li,r in rs:
  gid=r['goalId'];assert gid not in old_records;old_records[gid]=r;inv['records'].append({'goalId':gid,'wholeRecordSHA256':digest(r),'wholeProfileSHA256':digest(r['profile']),'wholeLineBytesSHA256':H(rows[li])})
  if gid in targets:owners[gid]={'index':ci,'path':path,'config':cfg,'record':r,'lines':rows,'line':li+1}
 inventory.append(inv)
assert len(old_records)==450 and len(owners)==3
post=paths[:];ops=[];plans=[]
for i,r in enumerate(d['records']):
 gid=r['goalId'];x=owners[gid];old=x['record'];expected=r['wholeCurrentPositiveOwner'];assert x['path']==expected['config']['path'];assert old==expected['wholeRecord'];assert goals[gid]==r['wholeCurrentGoal'];new=r['wholeCandidateProfile'];applied=copy.deepcopy(old['profile'])
 for op in r['appendOperationsExactly']:
  cur=applied
  for k in op['pointer'].split('/')[1:-1]:cur=cur[k]
  cur.append(copy.deepcopy(op['value']))
 assert new==applied
 prefix=f'P{i+1:02d}';cfg=copy.deepcopy(x['config']);cfg['reviewPath']=OP+f'/native/{prefix}.whole-profile.inactive.review.jsonl';cfg['scope']={'label':'Inactive original-owner namespace successor for one whole Root v2 profile accepted by actual informed B science; no second review invented, no human or actual performance claim','goalIds':[gid]};cfg['reviewRunManifestPaths']=[];assert cfg['requireApproved'] is False
 newconfig=put(f'config/{prefix}.original-namespace.inactive.config.json',cfg)
 candidate={'schemaVersion':1,'authoringContract':'positive-understanding-evidence-candidates-v1','reviewId':cfg['reviewId'],'reviewedAt':datetime.now(timezone.utc).isoformat(),'reviewer':'Codex B technical serialization of exact foreign Root v2 profile after own genuine informed FIRST; not another scientific vote or fabricated peer pair','goals':[{'goalId':gid,'reason':'Technical native current-input candidate of the exact whole v2 body independently read and accepted in '+B+'FIRST.actual-v2-three-conditional-whole-P-atomicity-and-source.informed-independent-b.json. All old profile obligations and coverage thresholds retained; country-conditional supplied paper context only. No new D, M/V, whole-source, observed learner work, human approval or second review is claimed.','evidenceLevel':old['evidenceLevel'],'maximumClaimScope':old['maximumClaimScope'],'dissent':old.get('dissent',[])+['Inactive only: current normal owners remain active until Root authorization.','Only this reviewer own genuine informed B FIRST is consumed as science; Root author is not counted as an independent peer.','Source partial acceptance and profile design are not actual learner execution, whole-source completion or new native D/Human evidence.'],'profile':new}]}
 candpin=put(f'INPUT.{prefix}.stock-candidate-set.json',candidate)
 residual=copy.deepcopy(x['config']);residual['scope']['goalIds']=[z for z in residual['scope']['goalIds'] if z!=gid];assert residual['scope']['goalIds'];residual['reviewPath']=OP+f'/residual/{prefix}.exact-other-records.review.jsonl';residualpath=put(f'residual/{prefix}.exact-other-scope.config.json',residual)
 raw=b''.join(z for z in x['lines'] if not z.strip() or json.loads(z)['goalId']!=gid);Path(residual['reviewPath']).write_bytes(raw);retained=[json.loads(z) for z in raw.splitlines() if z.strip()];assert [z['goalId'] for z in retained]==residual['scope']['goalIds'];assert all(z==old_records[z['goalId']] for z in retained)
 ptr=f'/subjects/{si}/positiveEvidenceConfigPaths/{x["index"]}';ops.extend([{'op':'test','path':ptr,'value':x['path']},{'op':'replace','path':ptr,'value':residualpath['path']}]);post[x['index']]=residualpath['path']
 plans.append({'goalId':gid,'wholeGoalSHA256':digest(goals[gid]),'oldProfileSHA256':digest(old['profile']),'newWholeProfileSHA256':digest(new),'oldOwnerConfig':pin(x['path']),'oldReview':pin(x['config']['reviewPath']),'oldLineOneBased':x['line'],'newNativeConfig':newconfig,'newCandidateSet':candpin,'newNativeReviewPath':cfg['reviewPath'],'residualConfig':residualpath,'residualReview':pin(residual['reviewPath']),'residualWholeRowsExact':len(retained),'retainedReviewId':cfg['reviewId'],'retainedCriteriaPath':cfg['reviewCriteriaPath'],'retainedEvidenceLevel':old['evidenceLevel'],'retainedMaximumClaimScope':old['maximumClaimScope']})
 for p in [x['path'],x['config']['reviewPath'],cfg['reviewCriteriaPath']]:protected[p]=pin(p)
 for link in goals[gid].get('resourceLinks',[]):
  if link.get('type')=='goal-visualization':p='app/public'+link['url'];protected[p]=pin(p)
for plan in plans:
 ops.append({'op':'add','path':f'/subjects/{si}/positiveEvidenceConfigPaths/-','value':plan['newNativeConfig']['path']});post.append(plan['newNativeConfig']['path'])
ids=[gid for p in post for gid in load(p)['scope']['goalIds']];assert len(ids)==450 and len(set(ids))==450 and set(ids)==set(old_records)
patch=put('PATCH.actual-current-positive-owners.INACTIVE.json',{'schemaVersion':1,'active':False,'normalWrites':0,'centralBefore':pin(C),'beforeConfigCount':len(paths),'afterConfigCount':len(post),'beforeWholePArraySHA256':digest(paths),'actualSubjectIndex':si,'actualOldPConfigArray':paths,'candidatePConfigArray':post,'operations':ops,'guard':'Require current central pin and full old P-array equality, every selected old native owner and exact whole profile, then apply only tested selected owner substitutions and three adds. If MV or another namespace is activated first, rebase selected-array CAS against actual current array; do not overwrite unrelated paths.','otherSubjectAndNonPFieldsDelta':[]})
put('INPUT.current450-owner-record-retention-hashes.technical-only.json',{'role':'Whole native record/profile/line hashes for exact structural retention, no new review of447 other bodies','currentCentral':pin(C),'configCount':len(paths),'uniqueOrdinaryGoalCount':len(old_records),'ownerInventory':inventory})
put('BEFORE.protected-normal-and-own-science-pins.json',{'normalWritesAllowed':False,'files':[protected[k] for k in sorted(protected)]+[pin(B+'FIRST.actual-v2-three-conditional-whole-P-atomicity-and-source.informed-independent-b.json'),pin(B+'SEAL.own-informed-three-conditional-context-review.json')],'allOtherChemistryAndSubjectFieldsPreservedInPatch':True,'newDDecisions':0})
plan=put('PLAN.actual-inactive-P3-original-namespaces-and-residuals.json',{'role':'INACTIVE_TECHNICAL_NATIVE_PREPARATION_ONLY','targets':plans,'oldPConfigCount':len(paths),'candidatePConfigCount':len(post),'uniqueOrdinaryPGoals':450,'unchangedOtherWholePRecords':447,'currentCentral':pin(C),'selectedCentralPatch':patch,'ownActualScienceFIRST':pin(B+'FIRST.actual-v2-three-conditional-whole-P-atomicity-and-source.informed-independent-b.json'),'rootAuthorIsNotIndependentPeer':True,'MVP1ActivityAssumed':False,'normalWrites':0,'newScientificVotes':0,'newDDecisions':0,'APCompilerBuildRuns':0})
(O/'native').mkdir(exist_ok=True)
print(json.dumps({'status':'INACTIVE_INPUTS_READY','plan':plan,'configsBeforeAfter':[len(paths),len(post)],'residualRows':[x['residualWholeRowsExact'] for x in plans],'materializerCommands':['./app/node_modules/.bin/tsx app/scripts/materializePositiveGoalEvidenceCandidates.ts --config '+x['newNativeConfig']['path']+' --candidates '+x['newCandidateSet']['path']+' --write' for x in plans]},indent=2))
