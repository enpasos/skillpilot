import json,hashlib,datetime
from pathlib import Path
from read_terms import J,C,P,IDX,ONLY,ROOT,INP
OUT=Path(__file__).resolve().parent
canon=lambda x:json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
sha=lambda b:hashlib.sha256(b).hexdigest()
pins=[]
for pin in [*J['centralInputs'].values(),J['sourceInventoryPin'],J['originalPrimaryPin']]:
 raw=(ROOT/pin['path']).read_bytes();actual=sha(raw);assert actual==pin['sha256'],pin;assert len(raw)==pin['bytes'],pin;pins.append({**pin,'actualSHA256':actual,'unchanged':True})
selector=INP.parent/'SELECTOR.HB-remaining162-term27.clean-input.sealed.json';assert sha(selector.read_bytes())=='92604716b8c580d0722681acdd2afc870196b83c768c469e60a39768485145ac'
lines=(ROOT/J['centralInputs']['P439']['path']).read_bytes().splitlines(keepends=True)
cseq=json.loads((ROOT/J['centralInputs']['C54']['path']).read_text())['goals']
checks=[]
for i,x in IDX.items():
 assert cseq[x['canonicalGoalIndex1Based']-1]['id']==i
 assert sha(canon(C[i]))==x['wholeGoalBodySHA256']
 assert sha(canon(P[i]['profile']))==x['wholeProfileBodySHA256']
 assert sha(lines[x['PRecordLine1Based']-1])==x['PRecordLineSHA256']
 checks.append({'goalId':i,'wholeGoalProfileAndRawLineMatch':True})
priorp=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-HB-first70-clean-binding-review-input-20261017-v1/INPUT.HB-first70.whole-current-bindings.json'
prior=json.loads(priorp.read_text())['wholeSelectedCanonicalAndP'];pr={r['goal']['id']:r for r in prior};reuse=[]
for i in ['e5aefd51-2de4-590c-903f-286d043a8c30','3fb7dea4-f832-5e23-b518-68b13a655b92','02634fdd-c8ba-591a-b240-77129b1bebb8']:
 r=pr[i];wp=r['wholeP'];profile=wp['profile'] if 'profile' in wp else wp
 assert canon(r['goal'])==canon(C[i]),i
 assert canon(profile)==canon(P[i]['profile']),i
 reuse.append({'goalId':i,'earlierReadAuthority':'parent B actual full reading inherited by this task','earlierInput':str(priorp.relative_to(ROOT)),'wholeGoalEqualityReverified':True,'wholeScientificProfileEqualityReverified':True,'goalSHA256':sha(canon(C[i])),'profileSHA256':sha(canon(P[i]['profile']))})
full=[*ONLY,'72236f2c-771e-4ab6-933a-e549ee49d15b','bbe038e9-86ed-5ec6-ab33-316758ddb16d','363c5740-8a3c-50b8-8c3a-5548c80c36ea','85342c52-9722-54b0-8fbb-513d9d648363']
fullset=set(full)
# All below were actually displayed and read as targeted term fields; this is not a whole-profile claim.
prefixes='e9d7 747c 2353 4488 7a36 5abc 91cd 1dc1 e45c 8a2a f1ed dd58 536b 7990 e14a 3d32 ebfa c21a 0278 6eb1 9b94 1c14 88ee fd30 c224 d2cc 2213 efa2 8137 20f9 5a24 545a c046 8826 0787 28c9 e094 a449 56bc 9e3f 3ce8 a4ba 684f 6829 7b47 dfae b92b 9dec 1d2e f4d5 197b e9d3 065d 058d d124 d8ee 5c8f 2f3c 7371 04fa 16da f093 7dc8 ac1b 4811 7c0b 5611 1383 4928 8017 3e43 4663 4a08 5169 dcba fd79 8be1 b781 c884 27e4 6b82 b752 2fdd b8c8 3ead 1051 c0f1 0503 0959 4d9d a76a 4dab a0e8 3e9e 2652 8721 4597 dfbc 6413 54bc 87d8 c8f5 f0ba d72c 9812 53db f0f6 40f2 93a7'.split()
targetids={next(i for i in C if i.startswith(pre)) for pre in prefixes}-fullset
read=[]
for i in full:
 x=IDX.get(i,{});read.append({'goalId':i,'readAuthority':'term subreview B actual new reading','readLevel':'Complete displayed German P scientific profile (expectations, coverage, variation axes, all application cases including task/expected/focus); C id/title/description/tags/requires/dimensionTags/applicability read. English duplicate fields and P administrative wrapper not claimed read. 72236f2c additionally read complete English profile and whole C.','profileSHA256':sha(canon(P[i]['profile'])),'wholeGoalSHA256':sha(canon(C[i])),'providedBodyIndex':x or None,'termOnlyCarrier':i in ONLY,'supplementalCarrierOutside207':i not in IDX})
for i in sorted(targetids):
 read.append({'goalId':i,'readAuthority':'term subreview B actual targeted semantic field reading, also parent B current witness where supplied','readLevel':'Relevant current German essentialUnderstandingDe/observablePerformanceDe fields and displayed case text/IDs read for term semantics. Several tasks were displayed as at most260-character excerpts; no whole-profile or universal full-task-read claim. Truncated multi-carrier outputs were followed up for decision-relevant missing portions.','wholeGoalSHA256':sha(canon(C[i])),'profileSHA256':sha(canon(P[i]['profile'])),'providedBodyIndex':IDX.get(i)})
parentp=OUT.parent/'PARENT-READ-WITNESSES.binding-contracts.jsonl';parentrows=list(map(json.loads,parentp.read_text().splitlines()));assert len(parentrows)==184
parentids={r['goalId'] for r in parentrows}
review=json.loads((OUT/'REVIEW.27-termsets.247-terms.independent-b.json').read_text())
used={t['carrierId'] for s in review['termSets'] for t in s['terms'] if t['decision']=='ACCEPT'}
assert used<=set(C)
assert used<=fullset|targetids|{r['goalId'] for r in reuse}|parentids
ledger={'role':'Actual read ledger, levels explicitly bounded','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'newGermanFullScientificProfiles':len(full),'newTermOnlyGermanFullScientificProfiles':22,'completeEnglishPlusWholeGoalExtraRead':['72236f2c-771e-4ab6-933a-e549ee49d15b'],'targetedSemanticProfileFieldReads':len(targetids),'exactInheritedBodyReuse':reuse,'reads':read,'parentCurrentReadWitnessPin':{'path':str(parentp.relative_to(ROOT)),'sha256':sha(parentp.read_bytes()),'bytes':parentp.stat().st_size,'carrierCount':184,'authority':'same independent B parent; actual fields rather than verdicts','readLimit':'Only term-relevant records/fields were semantically considered; not claiming a second full read of184 parent profiles.'},'discoveryOnly':['Bounded string-pattern scan of current C650 descriptions and P439 scientific profiles located candidates for empty term proposals. Search hits or absence were never treated as sufficient coverage evidence.','bbe038 and363c were then read in complete displayed German scientific form to test hydrated-cation coordinate bonding;8534 was read likewise to test Keilstrich/R-S.'],'unreadByDesign':['Independent A or any foreign remaining judgments','Whole P439 copy','New science, D or source-inventory review','Learner performance, Human Approval or Human Trial']}
(OUT/'READLEDGER.actual-term-fields.independent-b.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n')
validation={'role':'Technical pin and finite roster check only','selectorUnchanged':True,'neutralInputSHA256':sha(INP.read_bytes()),'inputPins':pins,'all207ProvidedBodyIndicesReverified':True,'bodyIndexChecks':checks,'all247TermsExactlyOnce':review['termEntryCount']==247,'all27TermsetsExactlyOnce':review['termSetCount']==27,'allAcceptedExpectationAndCaseIDsExistInCurrentPinnedP':True,'acceptCarrierCount':len(used),'sourceCourseAndOptionalityPreserved':True,'activeInputOrGitWrites':False,'nativeOrGlobalApproval':False}
(OUT/'CHECKS.pins-roster-and-field-identities.json').write_text(json.dumps(validation,ensure_ascii=False,indent=2)+'\n')
files=[]
for p in sorted(OUT.iterdir()):
 if p.is_file() and not p.name.startswith('SEAL.'):
  raw=p.read_bytes();files.append({'path':str(p.relative_to(ROOT)),'sha256':sha(raw),'bytes':len(raw)})
seal={'role':'Output seal for independent B terms subreview; technical hashes only','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'outputs':files,'inputSHA256':sha(INP.read_bytes()),'selectorSHA256':sha(selector.read_bytes()),'result':{k:review[k] for k in ['termSetCount','termEntryCount','termSetAccepted','termSetHeld','termAccepted','termHeld']},'scientificFullProfileOrGlobalAcceptanceClaimed':False,'activeInputOrGitWrites':False}
(OUT/'SEAL.terms-subreview.independent-b.json').write_text(json.dumps(seal,ensure_ascii=False,indent=2)+'\n')
for x in files:assert sha((ROOT/x['path']).read_bytes())==x['sha256']
print(json.dumps({'sealOutputCount':len(files),'fullDEProfiles':len(full),'targetedProfiles':len(targetids),'parentRecords':len(parentrows),'hashesAnd247RowsVerified':True}))
