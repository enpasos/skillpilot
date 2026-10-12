import json,hashlib,copy,difflib
from pathlib import Path
from datetime import datetime,timezone
ROOT=Path('/home/enpasos/projects/skillpilot')
OUT=Path(__file__).resolve().parent
E12=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
PLAN=E12/'chemie-q4-eleven-final-frozen-V-source-native-root-20261012-v10/ROOT.future-active-adoption.plan.json'
AUTHOR=E12/'chemie-q4-four-bounded-source-rows-author-successor-root-20261012-v6/FOUR.remaining-independent-source-deltas.author.json'
sha=lambda b:'sha256:'+hashlib.sha256(b).hexdigest()
enc=lambda x:(json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode()
plan=json.loads(PLAN.read_bytes());author=json.loads(AUTHOR.read_bytes())
gibbs='dcbad4e4-e954-51d7-97ca-3bacb6f0d8d5';hess='4a08f31f-204c-5339-9d9f-5d2af28d5d5c'
receipt={'schemaVersion':1,'role':'Technical flat mapping transport only; reuse exactly four accepted current decisions; no new scientific review or approval','createdAt':datetime.now(timezone.utc).isoformat(),'inputs':[{'path':str(p.relative_to(ROOT)),'sha256':sha(p.read_bytes())} for p in [PLAN,AUTHOR]],'adoptions':[],'operations':[],'allDecisionsByteExact':True,'allOtherTopLevelDataByteExact':True,'allUnrelatedFlatRowsAndOrderExact':True,'scientificApprovalsCreated':False,'humanApproval':False,'humanTrial':False,'activeWrites':False,'gitWrites':False,'fullPublicationTestClaimed':False}
for spec in plan['boundedSourceMappingAdoptions']:
 target=ROOT/spec['target'];before=target.read_bytes();assert sha(before)==spec['sha256']
 old=json.loads(before);assert enc(old)==before
 new=copy.deepcopy(old)
 ds=[d for d in author['deltas'] if d['mappingPath']==spec['before']]
 modified=[];added=[]
 for d in ds:
  sid=d['sourceGoalId'];dec=[r for r in old['decisions'] if r.get('sourceGoalId')==sid];assert len(dec)==1 and dec[0]==d['after']
  flats=[(i,r) for i,r in enumerate(old['mappings']) if r.get('legacyGoalId')==sid]
  assert {r['canonicalGoalId'] for _,r in flats}==set(d['before']['canonicalGoalIds'])
  if 'DE-HE' in spec['target']:
   assert len(flats)==1 and flats[0][1]['canonicalGoalId']==hess and flats[0][1]['matchType']=='exact'
   idx,row=flats[0];new['mappings'][idx]['canonicalGoalId']=gibbs;modified.append(idx)
   operation={'kind':'replace','index':idx,'before':row,'after':new['mappings'][idx]}
  else:
   addids=[g for g in d['after']['canonicalGoalIds'] if g not in d['before']['canonicalGoalIds']];assert len(addids)==1
   assert all(r['matchType']=='partial' and r['reviewDecisionId']==sid for _,r in flats)
   row={'legacyGoalId':sid,'canonicalGoalId':addids[0],'matchType':'partial','reviewDecisionId':sid}
   idx=len(new['mappings']);new['mappings'].append(row);added.append(idx)
   operation={'kind':'append','index':idx,'before':None,'after':row}
  operation.update({'targetPath':spec['target'],'sourceGoalId':sid,'unchangedDecisionDigest':sha(enc(dec[0])),'boundedContributionOnly':True,'wholeSourceClearanceGranted':False})
  receipt['operations'].append(operation)
  assert {r['canonicalGoalId'] for r in new['mappings'] if r['legacyGoalId']==sid}==set(d['after']['canonicalGoalIds'])
 assert old['decisions']==new['decisions']
 assert {k:v for k,v in old.items() if k!='mappings'}=={k:v for k,v in new.items() if k!='mappings'}
 assert all(old['mappings'][i]==new['mappings'][i] for i in range(len(old['mappings'])) if i not in modified)
 if 'DE-NW' in spec['target']:
  fifth=author['deferredOriginalFifth'];sid=fifth['sourceGoalId']
  assert [r for r in new['decisions'] if r['sourceGoalId']==sid]==[fifth['before']]
  assert [r for r in old['mappings'] if r['legacyGoalId']==sid]==[r for r in new['mappings'] if r['legacyGoalId']==sid]
  assert not any(r['legacyGoalId']==sid and r['canonicalGoalId']==gibbs for r in new['mappings'])
  receipt['deferredFifth']={'sourceGoalId':sid,'decisionAndAllFlatRowsExact':True,'gibbsPairAbsent':True}
 candidate=OUT/'candidates'/target.name;assert not candidate.exists();after=enc(new);candidate.write_bytes(after)
 diff=''.join(difflib.unified_diff(before.decode().splitlines(True),after.decode().splitlines(True),fromfile=spec['target'],tofile=str(candidate.relative_to(ROOT))))
 (OUT/(target.name+'.diff')).write_text(diff)
 # Whole serialized decisions suffix remains byte-for-byte identical, including all historical metadata.
 marker=b'  "decisions": '
 assert before[before.index(marker):]==after[after.index(marker):]
 receipt['adoptions'].append({'targetPath':spec['target'],'expectedCurrentSha256':sha(before),'candidatePath':str(candidate.relative_to(ROOT)),'candidateSha256':sha(after),'beforeFlatRows':len(old['mappings']),'afterFlatRows':len(new['mappings']),'retargetedOriginalIndices':modified,'appendedIndices':added,'allDecisionsSerializedSuffixByteExact':True,'allOtherTopLevelFieldsExact':True,'unchangedOriginalFlatRows':len(old['mappings'])-len(modified)})
assert len(receipt['operations'])==4 and len(receipt['adoptions'])==3
canonical=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
c=json.loads(canonical.read_bytes())
receipt['currentCanonicalDependency']={'path':str(canonical.relative_to(ROOT)),'sha256':sha(canonical.read_bytes()),'selectedObjectives':[{'id':g['id'],'title':g['title'],'description':g['description']} for g in c['goals'] if g['id'] in [hess,gibbs]]}
(OUT/'FOUR.flat-projection-diff-and-CAS.receipt.json').write_bytes(enc(receipt))
print(json.dumps({'outputDirectory':str(OUT.relative_to(ROOT)),'adoptions':receipt['adoptions'],'operations':len(receipt['operations']),'deferredFifth':receipt['deferredFifth']},ensure_ascii=False,indent=2))
