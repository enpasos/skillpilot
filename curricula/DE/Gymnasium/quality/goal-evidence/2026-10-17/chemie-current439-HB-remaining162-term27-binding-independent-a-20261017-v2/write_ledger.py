import pathlib,json,hashlib,datetime
import write_review as w

oldp=w.BASE/'chemie-current439-HB-first70-clean-binding-review-input-20261017-v1/INPUT.HB-first70.whole-current-bindings.json'
fivep=w.BASE/'chemie-current439-HB-five-held-source-bindings-current-P5-clean-input-20261017-v2/INPUT.seven-source-bindings.whole-current-P5-and-material-pins.json'
old={r['goal']['id']:r for r in json.loads(oldp.read_text())['wholeSelectedCanonicalAndP']}
five={r['goal']['id']:r for r in json.loads(fivep.read_text())['wholeCurrentGoalAndP']}
lines=pathlib.Path(w.J['centralInputs']['P439']['path']).read_bytes().splitlines(keepends=True)
fullcaseprefixes={'72236f2c','536b48b2','3d3231f9','5a30273a','0278a515','a44af1fa','9e3fae29','4a08f31f','e0944fbb','3eada74b','c8844ac6','dfbccd62','2652caef','8721d943','61da9d34','e96771d3','9198b4cf','54bc6ca0','c8f51eac','64b03eff','87d8cc68','065d764c','8b98d8ba','3fb7dea4','85342c52','b98f89e2','f0939f88','fd7977bf','27e4fe9b','6b82f80e','92c99237','9decc36b','7371c82e','d72cbb62','22133f29','3eb2a06c'}
ledger=[];reuseN=0
for x in w.J['wholeBodyIndex']:
 g=x['goalId'];pr=w.P[g]['profile']
 assert w.objsha(w.G[g])==x['wholeGoalBodySHA256']
 assert w.objsha(pr)==x['wholeProfileBodySHA256']
 assert hashlib.sha256(lines[x['PRecordLine1Based']-1]).hexdigest()==x['PRecordLineSHA256']
 prior=[]
 for label,lookup,p in [('own previous54',old,oldp),('own final P5 followup',five,fivep)]:
  if g in lookup and lookup[g]['goal']==w.G[g] and lookup[g]['wholeP']['profile']==pr:
   prior.append({'source':label,'path':str(p),'sha256':w.sha(p),'wholeGoalAndScientificProfileExact':True})
 if prior:reuseN+=1
 ledger.append({'goalId':g,'title':w.G[g]['title'],'canonicalGoalIndex1Based':x['canonicalGoalIndex1Based'],'PRecordLine1Based':x['PRecordLine1Based'],'PRecordLineSHA256':x['PRecordLineSHA256'],'wholeGoalBodySHA256':x['wholeGoalBodySHA256'],'wholeProfileBodySHA256':x['wholeProfileBodySHA256'],'wholeBodyHashCheck':'PASS','ownExactPriorReadingReuse':prior,'bindingContractRead':True,'readParts':(['Own previous full operative reading reused after actual object equality'] if prior else ['Entire current goal description','All current German essentialUnderstandingDe and observablePerformanceDe values','Required expectation list and alternative groups; case identities']),'fullGermanCaseBriefReadingThisTurn':('yes' if g[:8] in fullcaseprefixes else 'not claimed'),'requiredExpectationWitnesses':[{'id':e['id'],'observablePerformanceDe':e['observablePerformanceDe']} for e in pr['expectations'] if e['id'] in pr['coverageExpectations']['requiredExpectationIds']],'sourceOrdinals':[r['ordinal'] for r in w.J['sourceClauses'] if g in r['proposedUnionCarrierIds']],'termSetOrdinals':[t['termSetOrdinal'] for t in w.J['mandatoryTermSets'] if any(g in a['proposedCarrierIds'] for a in t['unreviewedTermBindingProposals'])]})
priorFirst=w.BASE/'chemie-current439-HB-seven-source-bindings-current-P5-informed-independent-a-20261017-v2/FIRST.informed-A.seven-source-bindings.current-P5v2.json'
assert w.sha(priorFirst)=='50917103089a6c30bc19e56932b284661293b1ec45094a70fc81f607722d7465'
priorj=json.loads(priorFirst.read_text())
assert all(next(a for a in priorj['records'] if a['ordinal']==n)['decision']=='ACCEPT' for n in [147,149])
fg=next(a for a in five.values() if a['goal']['id'].startswith('f4d5a02d'))
assert fg['goal']==w.G[fg['goal']['id']] and fg['wholeP']['profile']==w.P[fg['goal']['id']]['profile']
for p in [*w.J['centralInputs'].values(),w.J['sourceInventoryPin'],w.J['originalPrimaryPin']]:assert w.sha(p['path'])==p['sha256']
readset={'role':'Actual independent A source-binding read witnesses, all207 deduplicated carriers','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'inputPin':w.FIRST['inputPin'],'counts':{'uniqueCarriers':len(ledger),'exactOwnPriorWholeGoalAndPReusable':reuseN,'newBindingContractReads':len(ledger)-reuseN,'wholeGoalHashesVerified':len(ledger),'wholeProfileHashesVerified':len(ledger),'wholePLineHashesVerified':len(ledger)},'method':'Expectation-based source binding, not a new overall P science judgment. Full German cases selectively read on operator/context questions. Hash verification never by itself asserts semantic reading, material completeness, observed execution or approval. English unchanged science remains an input, not freshly reread by this source reviewer.','own147149Reuse':{'path':str(priorFirst),'sha256':w.sha(priorFirst),'exactCurrentWholeGoalAndScientificProfile':True,'originalJudgmentsUnchanged':True},'primaryCache':{'pin':w.J['originalPrimaryPin'],'freshBindingTextPagesRead':[17,18,19,20,23,24,26,27,28,31,32,34,35,36],'ownEarlierPrimaryPagesRead':[9,12,15,26,37],'liveOfficialFetchClaimed':False,'noSourceExtractionRestart':True},'targetedMaterialRead':[{'path':'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-SH032-one-coherent-selected-theme-process-chain-author-successor-20261016-v1/materials/TWO.complete-nonisomorphic-DE-EN-cases-and-fresh-transfers.AUTHOR.inactive.json','sha256':'06b1933b21eb36c0ec4e5ae584dbd6032caf63238acbd11c702c096db3981f2f','bytes':47376,'partsActuallyRead':'Common German reading, both entire German material/task/solution/transfer bodies. Repeated rubric text partly output-truncated, not claimed newly full bilingual material science review. The material explicitly says it is not a historical real ASS-development account.'}],'unresolvedNecessaryMaterialWitnesses':[{'ordinal':134,'materialName':'PRACTICAL-PH-CURVES-P1','resolutionAttempt':'Exact current P case name read; Main source-requires checkpoint manifest files/aliases/reusedPreviousFiles searched for matching practical/pH/titration names. No unique full material alias resolved. No nonexistent material assumed.','consequence':'Bounded HOLD for exact digital-titration-curve duty until linked material establishes it or current P binds it.'}],'records':ledger}
assert w.sha(w.INPUT)=='f6f36d0125624f943b7b3ac3fe0bdfb1d26af07a86581f50be4122e0a454302a'
assert w.sha(w.INPUT.parent/'SELECTOR.HB-remaining162-term27.clean-input.sealed.json')=='92604716b8c580d0722681acdd2afc870196b83c768c469e60a39768485145ac'
for n in [147,149]:
 source=w.J['sourceClauses'][n-71]['originalSourceGoal']
 assert next(a for a in json.loads(fivep.read_text())['sourceGoals'] if a['id']==source['id'])==source
readset['own147149Reuse']['sourceGoalObjectsAlsoExact']=True
readset['unresolvedNecessaryMaterialWitnesses']=[]
readset['targetedMaterialRead'].append({'path':'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-acid-two-pairs-complete-cases-source-memory-author-successor-20261016-v1/materials/NINE.complete-additional-cases-and-practical-rubrics.author.json','sha256':'86069f0847c0c8f8658e7a9e80bd362fb722fb1ef24b1e587da2ef8e3e9128e2','bytes':68298,'caseActuallyRead':'PRACTICAL-PH-CURVES-P1','partsActuallyRead':'Entire German case: material, all task demands, worked model, full rubric, empty raw/observation fields and execution boundary. The other eight cases and all English are not claimed newly read.','resolution':'Initial Main manifest-name search was insufficient. Actual full C54 e0944fbb.extendedData.authorCandidate.origin identifies the existing Main author package; its materials/NINE file contains the exact current P case name. Material content was used, not author approval/status.','source134Conclusion':'Actual own curves and concentration evaluation present; drawing remains analog-compatible and no required digital titration-curve artifact/analysis found.'})
readset['metadataBoundary']='Current C54 native course tags, raw jurisdictions, applicability overrides, own-acquisition metadata and authorCandidate flags were treated as existing body context, not as authoritative HB source decisions or a normal compiler gate. The actual HB course/topic rules are preserved in each source/term row.'
print(w.put('READLEDGER207.independent-A.actual-binding-contracts.json',readset))
print(readset['counts'])
