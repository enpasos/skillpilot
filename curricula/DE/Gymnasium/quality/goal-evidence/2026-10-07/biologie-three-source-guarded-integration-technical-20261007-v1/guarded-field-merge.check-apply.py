# SPDX-License-Identifier: Apache-2.0
import argparse,json,hashlib,os,copy
from pathlib import Path
R=Path(__file__).resolve().parents[7];AUTHOR=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-three-source-485-ENG-EKG-and-e70-BW-author-20261007-v2';T=Path(__file__).resolve().parent;N='11675f1a-5de2-5926-be78-1e8275f19f5b';FROZEN='9056fca6021e5174b970aac17ddb444c40f0716ba70ba0d94307f6ed5015b45b'
CORRECT_BIO4='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-q1-four-reviewed-active-integration-root-20261007-v1/positive.current4.correct-biology-criteria.config.json'
NEURO21='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-neuro21-reviewed-active-integration-root-v1/positive21.current-image-bound.config.json'
BIO_CRITERIA='curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md'
BOUNDED_P={NEURO21:['485ef1c3-8997-52b7-91f5-b1ddf179013d'],CORRECT_BIO4:['e70d8a85-2dea-5165-919b-200fee9f4db4']}
FIRST_SCIENCE={'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-three-current-fresh-blind-a-20261007-v2/scientific-first-pass.sealed.json':'53988717760f3f42133cf5da4612aaf57c73227914c58bf6005eebe1e1b9b82c','curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-two-current-native-fresh-independent-b-20261007-v1/own.first-pass.freeze.json':'d8bf2ed56fbbc4ca7009efac43f081b5635219b2ea56fa1fd133afa08070937f'}
def rd(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def jbytes(x):return (json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode()
def bounded_p_replacements(cap,oldbio,newbio):
 rows=cap.get('boundedPConfigReplacements',[])
 assert len(rows)==2 and {x['oldConfigPath'] for x in rows}==set(BOUNDED_P),'exactly two bounded P config replacements required'
 oldpaths=oldbio['positiveEvidenceConfigPaths'];newpaths=newbio['positiveEvidenceConfigPaths'];assert len(newpaths)==len(set(newpaths))
 assert set(oldpaths)-set(BOUNDED_P)<=set(newpaths),'unaffected positive config removed'
 assert sha(R/BIO_CRITERIA)=='0044fd2e91cc0058cff1e2399ea2b88844027651f7542a77051af90a2ca03aa8'
 for x in rows:
  oldpath=x['oldConfigPath'];newpath=x['replacementConfigPath'];removed=BOUNDED_P[oldpath]
  assert x['removedGoalIds']==removed and oldpath in oldpaths and oldpath not in newpaths and newpath in newpaths
  assert newpath not in oldpaths and newpath.startswith('curricula/DE/Gymnasium/quality/goal-evidence/')
  for pk,hk in [('oldConfigPath','oldConfigSha256'),('replacementConfigPath','replacementConfigSha256'),('oldReviewPath','oldReviewSha256'),('retainedReviewPath','retainedReviewSha256')]:
   q=R/x[pk];assert q.resolve().is_relative_to(R) and sha(q)==x[hk],('bounded P input drift',x[pk])
  old=rd(R/oldpath);new=rd(R/newpath)
  assert old['reviewPath']==x['oldReviewPath'] and new['reviewPath']==x['retainedReviewPath']
  assert old['reviewCriteriaPath']==new['reviewCriteriaPath']==BIO_CRITERIA
  assert {k:v for k,v in old.items() if k not in {'reviewId','reviewPath','scope'}}=={k:v for k,v in new.items() if k not in {'reviewId','reviewPath','scope'}},'bounded P changed non-scope configuration'
  assert {k:v for k,v in old['scope'].items() if k not in {'label','goalIds'}}=={k:v for k,v in new['scope'].items() if k not in {'label','goalIds'}}
  expected=[id for id in old['scope']['goalIds'] if id not in removed]
  assert all(id in old['scope']['goalIds'] for id in removed) and expected==x['retainedGoalIds']==new['scope']['goalIds']
  original=(R/x['oldReviewPath']).read_bytes().splitlines(keepends=True)
  parsed=[json.loads(line) for line in original];assert [r['goalId'] for r in parsed]==old['scope']['goalIds'],'original P rows do not match scope order'
  retained=b''.join(line for line,r in zip(original,parsed) if r['goalId'] not in removed)
  assert (R/x['retainedReviewPath']).read_bytes()==retained,'retained P rows changed bytes or order'
 return rows
def verifyfreeze(p,wanted):
 assert sha(p)==wanted,(str(p),'freeze drift')
 f=rd(p)
 bindings=f.get('payloads',f.get('inputAndActualVisualBindings'))
 assert isinstance(bindings,list) and bindings,('seal has no supported bindings',str(p))
 base=p.parent if p==AUTHOR/'author.final.freeze.json' else R
 for x in bindings:
  q=base/x['path'];assert q.resolve().is_relative_to(R) and sha(q)==x['sha256'],str(q)
 return f
p=argparse.ArgumentParser();g=p.add_mutually_exclusive_group(required=True);g.add_argument('--check',action='store_true');g.add_argument('--apply',action='store_true');p.add_argument('--review-capsule');p.add_argument('--receipt');a=p.parse_args();verifyfreeze(AUTHOR/'author.final.freeze.json',FROZEN)
man=rd(AUTHOR/'guarded-author-candidate.current-Bio4-base.manifest.json');live=rd(R/man['canonicalPath']);before=copy.deepcopy(live);by={g['id']:g for g in live['goals']};changes=[]
for row in man['fieldPatches']:
 g=by[row['goalId']];assert g==row['beforeWholeGoal'],('whole goal guard drift',g['id'])
 for f in row['fieldPaths']:g[f]=copy.deepcopy(row['afterWholeGoal'][f])
 assert g==row['afterWholeGoal'];changes.append({'goalId':g['id'],'fields':row['fieldPaths']})
assert N not in by;live['goals'].append(copy.deepcopy(man['newGoal']));afterby={g['id']:g for g in live['goals']}
for old in before['goals']:
 new=afterby[old['id']];assert old.get('requires')==new.get('requires') and old.get('examData')==new.get('examData');
 if old['id']!='02f8a5a3-9c44-50ec-b9b8-a0b7f402aaa8':assert old.get('contains')==new.get('contains')
 else:assert new['contains']==old['contains']+[N]
replacements=[(R/man['canonicalPath'],jbytes(live))]
# Full source files are guarded, preserving current Bio4 overlays and every other row.
for x in man['mappingPatches']:
 active=R/x['path'];assert sha(active)==x['beforeSha256'],('source file drift',x['path']);original=R/x['candidatePath'];assert sha(original)==x['candidateSha256'];follow=rd(T/'source-decision-current-metadata-follow-up.actual.json');row=next(r for r in follow['mappingFiles'] if r['path']==x['path']);candidate=R/row['candidatePath'];assert sha(candidate)==row['candidateSha256']
 expected=rd(original);metadata={z['sourceGoalId']:z for z in row['selectedDecisionMetadataChanges']};seen=set()
 for decision in expected.get('decisions',[]):
  if decision['sourceGoalId'] in metadata:
   change=metadata[decision['sourceGoalId']];assert decision==change['before']
   assert {k:v for k,v in change['before'].items() if k not in {'reviewedAt','reviewer'}}=={k:v for k,v in change['after'].items() if k not in {'reviewedAt','reviewer'}}
   assert change['after']['reviewedAt']=='2026-10-07';decision.update(change['after']);seen.add(decision['sourceGoalId'])
 assert seen==set(metadata) and expected==rd(candidate),'source follow-up changed fields beyond selected date/provenance'
 replacements.append((active,candidate.read_bytes()))
ledgerpath=R/man['semanticLedgerPath'];ledger=rd(ledgerpath);candidate=rd(R/man['candidateSemanticLedgerPath']);oldledger={x['goalId']:x for x in ledger['decisions']};newledger={x['goalId']:x for x in candidate['decisions']}
assert len(newledger)==len(oldledger)+1 and N in newledger
for id,old in oldledger.items():
 new=newledger[id];assert {k:v for k,v in old.items() if k!='sourceFingerprint'}=={k:v for k,v in new.items() if k!='sourceFingerprint'},('classification changed',id)
replacements.append((ledgerpath,jbytes(candidate)))
img=AUTHOR/'selected-existing-images'/f'{N}.png';assert sha(img)=='b640848fb6ab0a0616e62ee2b99e5b59880232e25607efda0833c523e0161923'
for rel in [f'curricula/DE/Gymnasium/visualizations/biologie/{N}/{N}.png',f'app/public/assets/goal-visualizations/biologie/{N}/{N}.png',f'backend/src/main/resources/static/assets/goal-visualizations/biologie/{N}/{N}.png']:
 assert not (R/rel).exists(),('new image already exists',rel);replacements.append((R/rel,img.read_bytes()))
atlasPath='app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
atlas=rd(R/atlasPath);assert atlas['expectedCurricularAtomicGoalCount']==390
atlas['expectedCurricularAtomicGoalCount']=391;replacements.append((R/atlasPath,jbytes(atlas)))
protected=rd(T/'protected-current-assets-and-configs.snapshot.json')
for x in protected['files']:assert sha(R/x['path'])==x['sha256'],('protected current file drift',x['path'])
# Root may supply a separate, exact reviewed quality capsule after both real scientists seal.
# No readiness/approval boolean is accepted as evidence. Verify exact seals, actual native receipts,
# and each guarded quality replacement. This script does not manufacture scientific records.
if a.review_capsule:
 cap=rd(R/a.review_capsule);assert cap['authorFreezeSha256']==FROZEN
 assert len(cap['independentReviewerSeals'])==2
 assert {x['path']:x['sha256'] for x in cap['independentReviewerSeals']}==FIRST_SCIENCE,'exact two current independent first scientific seals required'
 seals=[]
 for x in cap['independentReviewerSeals']:
  seals.append(verifyfreeze(R/x['path'],x['sha256']))
 assert cap['independenceGroupIds'][0]!=cap['independenceGroupIds'][1]
 for x in cap['nativeChecks']:
  q=R/x['path'];assert sha(q)==x['sha256'];rec=rd(q);assert rec.get('exitCode',rec.get('exit_code'))==0,('native check failed',x['path'])
 assert {'D3','P3','A391','M391','Vnew'}<=set(x['gate'] for x in cap['nativeChecks'])
 for x in cap.get('additionalFileReplacements',[]):
  rel=x['path'];assert rel.startswith('curricula/DE/Gymnasium/quality/') or rel=='docs/legal/ai-transparency-inventory.json'
  assert rel!=CORRECT_BIO4
  protectedPaths={z['path'] for z in protected['files']}
  central='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
  assert rel not in protectedPaths or rel==central,('protected capsule destination',rel)
  assert rel not in [man['canonicalPath'],man['semanticLedgerPath']]
  dst=R/rel;assert sha(dst)==x['beforeSha256'] if dst.exists() else x['beforeSha256'] is None
  src=R/x['candidatePath'];assert src.resolve().is_relative_to(R) and sha(src)==x['candidateSha256'];
  if rel==central:
   current=rd(dst);future=rd(src)
   assert {z['subject']:z for z in current['subjects'] if z['subject']!='biologie'}=={z['subject']:z for z in future['subjects'] if z['subject']!='biologie'}
   oldbio=next(z for z in current['subjects'] if z['subject']=='biologie');newbio=next(z for z in future['subjects'] if z['subject']=='biologie')
   bounded_p_replacements(cap,oldbio,newbio)
  replacements.append((dst,src.read_bytes()))
 # Bio4's corrected Biology criteria route is protected separately from the central registry.
 status='review-capsule-exactly-bound'
else:
 assert not a.apply,'--apply requires the two sealed independent judgments and actual native gate receipts in Root review capsule'
 status='mechanical-preflight-only; independent review capsule pending'
if a.apply:
 for dst,data in replacements:
  dst.parent.mkdir(parents=True,exist_ok=True);tmp=dst.with_name(dst.name+'.bio-source-stage');assert not tmp.exists();tmp.write_bytes(data);os.replace(tmp,dst)
result={'mode':'apply' if a.apply else 'check','status':status,'authorFreezeSha256':FROZEN,'canonicalBeforeGoals':len(before['goals']),'canonicalAfterGoals':len(live['goals']),'existingRequiresAndExamDataExact':True,'metadataFieldPatches':changes,'newGoalId':N,'sourceFiles':len(man['mappingPatches']),'plannedWrites':[str(p.relative_to(R)) for p,_ in replacements],'protectedFileCount':len(protected['files']),'humanApproval':False}
if a.receipt:(R/a.receipt).write_bytes(jbytes(result))
print(json.dumps(result,ensure_ascii=False))
