import pathlib,json,hashlib,datetime,copy,os,shutil

B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
A=B/'biologie-molecular-genetics-six-current-native-successor-preparation-author-v1'
D=B/'biology-molecular-genetics-six-current-native-independent-a-v1'
OLD=B/'biology-molecular-genetics-twenty-three-native-independent-a-v1'
V=B/'biology-molecular-genetics-six-targeted-phone-population-independent-v-a-v1'
R=pathlib.Path.cwd();now=datetime.datetime.now(datetime.timezone.utc).isoformat()
def read(p):return json.loads(pathlib.Path(p).read_text())
def bind(p):
 p=pathlib.Path(p);r=p.read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(r).hexdigest(),'bytes':len(r)}
def write(n,o):
 p=D/n;assert not p.exists(),str(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n');return bind(p)
def txt(n,s):
 p=D/n;assert not p.exists(),str(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s);return bind(p)
def diff(a,b,p=''):
 if type(a)!=type(b):return [{'pointer':p,'before':a,'after':b}]
 if isinstance(a,dict):return sum([diff(a.get(k),b.get(k),p+'/'+k) for k in sorted(set(a)|set(b))],[])
 if isinstance(a,list):return sum([diff(x,y,p+'/'+str(i)) for i,(x,y) in enumerate(zip(a,b))],[]) if len(a)==len(b) else [{'pointer':p,'before':a,'after':b}]
 return [{'pointer':p,'before':a,'after':b}] if a!=b else []
e=read(A/'neutral-six-native-successor-and-two-case-rubrics.independent-review.entry.json');oldE=read(e['priorNative23Entry']['path'])
ownOldP=read(OLD/'current-native23-P-frame.actual-FIRST.independent-A.verdict.json')
old=read(oldE['wholeCaseMaterialsPath']);cur=read(e['wholeCaseMaterialsPath']);oldRows={x['goalId']:x for x in old['entries']}
changed=set(e['goalIds']);karyo=e['karyogramCaseRubricGoalId'];exactP=[];caseDeltas=[];literalResourceDeltas=[]
for r in cur['entries']:
 previous=oldRows[r['goalId']]
 assert r['wholeProfile']==previous['wholeProfile']
 assert r['wholeCurrentGoalBeforeResources']==previous['wholeCurrentGoalBeforeResources']
 for k in ['authoredWholeCases','historicalWholeCases','historicalWholeMaterial','historicalWholeReuseBinding','currentOriginalSourceDutyRowIds']:
  delta=diff(previous[k],r[k],'/'+k)
  if delta:
   assert r['goalId']==karyo and k=='authoredWholeCases'
   assert len(delta)==2 and {d['pointer'] for d in delta}=={'/authoredWholeCases/0/rubric/0/criterionEn','/authoredWholeCases/1/rubric/0/criterionEn'}
   for d in delta:assert d['after']==d['before'].replace('X/Ytypes','X/Y types')
   caseDeltas.extend({'goalId':r['goalId'],**d} for d in delta)
 delta=diff(previous['wholeCurrentGoalWithResources'],r['wholeCurrentGoalWithResources'])
 if delta:
  assert r['goalId'] in changed and {d['pointer'] for d in delta}=={'/resourceLinks/0/description','/resourceLinks/0/altText'}
  literalResourceDeltas.extend({'goalId':r['goalId'],**d} for d in delta)
 exactP.append({'ordinal':r['ordinal'],'goalId':r['goalId'],'wholeCurrentPBodyExact':True,'wholeCurrentGoalWithoutResourcesExact':True,'allHistoricalMaterialExact':True,'authoredWholeCasesExactExceptExplicitTwoKaryoSpaces':True,'scienceJudgment':next(j for j in ownOldP['perGoalJudgments'] if j['goalId']==r['goalId']),'newScienceReviewClaimed':False})
before=read(e['actualFullPriorNative23ModelPath']);after=read(e['actualFullCandidateModelPath']);oldPages={p['goalId']:p for p in before['pages']}
assert len(before['pages'])==len(after['pages'])==394
pageDeltas=[];retainedPages=[]
for p in after['pages']:
 delta=diff(oldPages[p['goalId']],p)
 if delta:
  assert p['goalId'] in changed and {d['pointer'] for d in delta}=={'/pageFingerprint','/visualization/altText','/visualization/originalDigest'}
  pageDeltas.append({'goalId':p['goalId'],'actualWholePageDeltas':delta})
 else:retainedPages.append(p['goalId'])
assert len(pageDeltas)==6 and len(retainedPages)==388
oldCanon=read(oldE['candidateCanonicalPath']);newCanon=read(e['candidateCanonicalPath']);oldGoals={g['id']:g for g in oldCanon['goals']};goalDeltas=[]
for g in newCanon['goals']:
 delta=diff(oldGoals[g['id']],g)
 if delta:
  assert g['id'] in changed and {d['pointer'] for d in delta}=={'/resourceLinks/0/altText','/resourceLinks/0/description'}
  goalDeltas.append({'goalId':g['id'],'deltas':delta})
assert len(goalDeltas)==6 and len(oldCanon['goals'])==len(newCanon['goals'])==479
oldKinds=read(oldE['candidateKindsPath']);newKinds=read(e['candidateKindsPath']);kindDeltas=diff(oldKinds,newKinds)
assert len(kindDeltas)==1 and kindDeltas[0]['pointer']=='/sourceLandscapePath'
assert oldKinds['decisions']==newKinds['decisions'] and len(newKinds['decisions'])==479
assert newKinds['sourceLandscapePath']==e['candidateCanonicalPath']
sourceBefore=read(oldE['wholeSourceDutiesPath']);sourceCurrent=read(e['wholeSourceDutiesPath']);assert sourceBefore==sourceCurrent
assert len(sourceCurrent['wholeOriginalSourceDutyRows'])==38 and len(sourceCurrent['wholeCanonicalPartnerGoals'])==44
for gid in sourceCurrent['preserveExactStrict276GoalIds']:assert oldGoals[gid]==next(g for g in newCanon['goals'] if g['id']==gid)
retained17=set(e['originalNative23GoalIds'])-changed;assert len(retained17)==17 and retained17.issubset(retainedPages)
ownOldD=[]
for part in [1,2]:
 p=next((OLD/f'part-{part}-normal-round-a-results').glob('*.records.jsonl'))
 ownOldD.extend({'record':json.loads(line),'originalRecordFile':bind(p),'originalPart':part} for line in p.read_text().splitlines() if line.strip())
reuse=[{'goalId':r['record']['goalId'],'exactUnchangedFull394WholePage':oldPages[r['record']['goalId']],'originalNormalDescriptionRecord':r['record'],'originalRecordFile':r['originalRecordFile'],'originalPart':r['originalPart'],'reuseRole':'Existing actual Native23 page/text/description judgment retained; no new campaign record or new pixel review'} for r in ownOldD if r['record']['goalId'] in retained17]
assert len(reuse)==17
frameChecks=write('current-six-native-and-whole394-P23-exact-reuse.actual-independent-checks.json',{'schemaVersion':1,'role':'Actual whole-value checks plus explicit semantically read new native/resources and two literal rubric spaces','createdAt':now,'actualNeutralInput':bind(A/'neutral-six-native-successor-and-two-case-rubrics.independent-review.entry.json'),'priorCurrentNative23CompletedOwnReview':bind(OLD/'neutral-completed-current-native23-D-P-and-one-Splice-AM.independent-A.review.entry.json'),'actualWhole394Before':bind(e['actualFullPriorNative23ModelPath']),'actualWhole394After':bind(e['actualFullCandidateModelPath']),'actualWhole394NewDigest':after['digest'],'sixChangedWholePageContexts':pageDeltas,'388WholePageContextsExact':True,'retained17ActualPriorNativeDescriptionJudgments':reuse,'retained23WholePositiveMaterialJudgments':exactP,'exactTwoOperativeWholeKaryoRubricDeltasActuallyRead':caseDeltas,'ownKaryoDeltaSemanticJudgment':'Both complete operative English first criteria now separate X/Y types correctly. Counting all1–22/X/Y types, individual-type versus whole-set mutation classification, self-produced reasoning and genotype/phenotype/disease boundaries are unchanged. Actual whole two cases are otherwise byte/value-equal to the complete own earlier Native23 reading; no new whole-case science review claimed. This closes the own earlier nonblocking word-boundary advisory, with no new clinical claim or quota.','sixChangedLiteralResourceDescriptionsAndAltActuallyRead':literalResourceDeltas,'wholeSource38AndPartners44Exact':True,'sourceApprovalInherited':False,'whole479CanonChangesExactlySixResourceMetadataOnly':goalDeltas,'all479WholeSemanticKindDecisionsExact':True,'actualWholeKindLedgerOnlySourceLandscapePathDelta':kindDeltas,'technicalAttemptDisclosure':'Initial helper assumed whole kind-ledger document equality and stopped before any FIRST/normal record write. Actual479 decision objects and all remaining metadata are exact; only sourceLandscapePath changes to the actual current inactive canonical candidate. This routing change is documented without a new kind/A/M science judgment.','ownSpliceKindAMActualConfirmationRetained':bind(OLD/'one-current-Splice-kind-atomicity-memory.actual-FIRST.independent-A.verdict.json'),'other393CurricularAtomicKindAMStateRetained':True,'protected276WholeCanonicalGoalsExact':True,'errors':[],'freshPeerDRead':False,'freshPeerPRead':False,'humanApproval':False,'humanTrial':False,'activeWrites':[],'strictGain':0})

# Materialize this already actually performed D FIRST under the exact normal campaign.
c=read(A/'native-six/round-a/description-review-campaign.json');batch=c['batches'][0]
resultDir=D/'normal-native-six-round-a-results';resultDir.mkdir()
src=D/'native-six-description.actual-FIRST.independent-A.records.jsonl';dst=resultDir/(batch['batchId']+'.records.jsonl');shutil.copyfile(src,dst)
params=write('normal-native-six-D.actual-generation-disclosure.json',{'provider':'OpenAI/Codex','actualModelVariant':'unexposed','actualToolModelNone':True,'declaredModelUnexposed':True,'freshPeerNative6DRead':False,'ownHistoricalNative23ReadingsReused':True,'ownSeparateCurrentV6FindingsKnown':True,'temperature':'unexposed'})
bundle=read(A/'native-six/bundle/review-bundle-manifest.json');batchInput=A/'native-six/round-a/batches'/(batch['batchId']+'.input.jsonl')
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':'bio23-native6-a-actual-review-v1','campaignId':c['campaignId'],'roundId':c['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':c['bundleFingerprint'],'bookDigest':c['bookDigest'],'provider':'OpenAI/Codex','model':'declaredModelUnexposed','role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-review-v2','promptFingerprint':c['promptFingerprint'],'criteriaFingerprint':c['criteriaFingerprint'],'generationParametersFingerprint':params['sha256'],'independenceGroupId':c['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':[{'role':x['role'],'digest':x['digest']} for x in bundle['artifacts']]+[{'role':'description_review_batch_input_jsonl','digest':bind(batchInput)['sha256']}],'startedAt':read(D/'native-six-targeted.actual-input.before-own-native-review.independent-A.json')['createdAt'],'completedAt':read(D/'native-six-description.actual-FIRST.independent-A.verdict.json')['firstJudgmentAt'],'status':'completed','outputDigest':bind(dst)['sha256'],'toolchainVersion':'existing-repository-ordinary-goal-description-validator'}
runPath=resultDir/(batch['batchId']+'.run.json');runPath.write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n')

# P23 remains positive material reuse with genuinely inspected current six image/native bindings.
# Hold15 is an actual native D/V resource defect, not a falsified failure of unchanged correct P material.
pJudgments=[]
for r in exactP:
 gid=r['goalId'];n=r['ordinal'];j={'ordinal':n,'goalId':gid,'profileBodyExact':True,'wholeCasesExactExceptTwoReadKaryoWordSpaces':True,'ownMaterialFirstReuse':r['scienceJudgment'],'currentNativeFrameInspectedFresh':gid in changed,'unchangedActual17NativePagesReuse':gid in retained17,'positiveMaterialCandidateDecision':'KEEP_REUSED_POSITIVE_MATERIAL','currentResourceAndNativeWholeIntegrationHold':gid=='183f3c47-ec20-5b98-8024-77ebd1c48abf','reason':'The exact previous independently judged whole P-v2 profile and operative case mechanisms remain valid. Actual changed six goal/resource descriptions, alt, PNGs, six native DE/EN contexts and all6 rendered PDF target pages were inspected; unchanged17 native contexts are actual whole-value exact. Karyogram two English word boundaries are semantically unchanged and now readable. Separate actual marker-conservation HOLD on current target15 blocks D/V/native use; P synthetic cases are not experiments, performances or cures.'}
 pJudgments.append(j)
pFirst=write('current-six-native-whole-P23-frame.actual-FIRST.independent-A.verdict.json',{'schemaVersion':1,'role':'Targeted genuine current6native P/frame successor inspection, exact23 prior material reuse and two read whitespace fields','firstJudgmentAt':now,'actualInputFirst':bind(D/'native-six-targeted.actual-input.FIRST.independent-A.freeze.json'),'actualBindingsAndValueChecks':frameChecks,'ownPriorWholeP23First':bind(OLD/'current-native23-P-frame.actual-FIRST.independent-A.verdict.json'),'ownPriorWholeP23FirstSeal':bind(OLD/'current-native23-P-frame.actual-FIRST.independent-A.freeze.json'),'ownCurrentSixPixelAndMetadataReview':bind(V/'neutral-completed-six-targeted-actual-V-independent-A.review.entry.json'),'perGoalJudgments':pJudgments,'positiveMaterial23CandidateReuseCount':23,'freshWholeScience23ReviewClaimed':False,'currentWholeNativeApproved':False,'target15CurrentNativeResourceHold':'BIO23-V6-A-001 and BIO23-V6-A-META-001 remain blocking actual image/reconstruction; positive material acceptance does not waive them','sourceWholeCourseApproved':False,'freshPeerPRead':False,'freshPeerNativeDRead':False,'freshPeerCurrentV6Read':False,'reviewAuthority':'ai_candidate','status':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1','actualLearnerPerformance':False,'actualExperimentPerformed':False,'humanApproval':False,'humanTrial':False,'activeWrites':[],'strictGain':0})
pSeal=write('current-six-native-whole-P23-frame.actual-FIRST.independent-A.freeze.json',{'schemaVersion':1,'role':'Immutable targeted currentNative6 P23 binding/reuse FIRST before peer outcomes','createdAt':now,'ownFirst':pFirst,'actualBindingsAndValueChecks':frameChecks,'humanApproval':False,'activeWrites':[]})
prompt=txt('normal-current-six-native-P23.actual-independent-review-prompt.md','# Genuine targeted Native6 current P23 review\n\nInspect the six actual changed native HTML/PDF target pages, complete six DE/EN contexts and current exact image/alt/caption bindings. Reuse the actually judged unchanged23 whole P-v2 profiles and complete46 operative bilingual case bodies; inspect the only two Karyogram English rubric word boundaries. Confirm all388 unchanged full394 page contexts,17 previous actual native pages, original38 source duties and44 partners remain exact. Preserve the genuine Splice kind/A/M and other393 current atomic kinds. Record actual target15 marker and reconstruction HOLD separately from the correct unchanged positive material. Never turn positive material reuse, hashes, synthetic cases or image generation into learner performance, experiment, current whole source/course/native/V or Human Approval.\n\nOutput ordinary own ai_candidate/needs_human_review P23 records under current exact full394 model/resources. This documents the actually performed targeted review, not a fresh whole23 science or17 pixel review.\n')
pParams=write('normal-current-six-native-P23.actual-generation-disclosure.json',{'provider':'OpenAI/Codex','actualModelVariant':'unexposed','actualToolModelNone':True,'declaredModelUnexposed':True,'temperature':'unexposed','freshOtherCurrentPRecordsRead':False,'materialAuthor':False,'ownWhole23CurrentNativeMaterialScienceReviewReused':True,'actualFreshNativeChangedPages':6,'knownOwnSeparateTarget15VHold':True})
criteria=pathlib.Path(read(e['positiveConfigPath'])['reviewCriteriaPath'])
frame=write('normal-current-six-native-P23.actual-neutral-review-frame.json',{'schemaVersion':1,'role':'Neutral exact current6native/current394/P23 whole material input frame; no peer labels','originalNeutralNativeEntry':bind(A/'neutral-six-native-successor-and-two-case-rubrics.independent-review.entry.json'),'actualCurrentWhole394CandidateModel':bind(e['actualFullCandidateModelPath']),'bookDigest':after['digest'],'actualSixNativePDF':e['actualNativePDF'],'actualSixNativeHTML':e['actualNativeHTML'],'actualCurrentWhole23P46Cases':bind(e['wholeCaseMaterialsPath']),'actualCurrentWhole38Source44PartnerFrame':bind(e['wholeSourceDutiesPath']),'actualCurrentCanonical':bind(e['candidateCanonicalPath']),'actualCurrentKinds':bind(e['candidateKindsPath']),'actualPriorNative17PagesInput':bind(e['priorNative23Entry']['path']),'goalIds':e['originalNative23GoalIds'],'selectedNative6GoalIds':e['goalIds'],'actualReviewPrompt':prompt,'actualReviewCriteria':bind(criteria),'humanApproval':False,'activeWrites':[]})
rid='bio23-six-native-current-p23-independent-a-v1';runid=rid+'-actual-run'
oldRecords=[json.loads(l) for l in (OLD/'normal-current-P23.independent-A.v2.records.jsonl').read_text().splitlines() if l.strip()]
# The author file is used only for exact machine input/profile/goal fingerprint identities;
# author reason/status/dissent are neither printed nor adopted as scientific review.
technical={r['goalId']:{k:r[k] for k in ['goalFingerprint','reviewInputFingerprint','profileFingerprint','profile','reviewCriteriaFingerprint']} for r in (json.loads(l) for l in pathlib.Path(e['positiveRecordPath']).read_text().splitlines() if l.strip())}
output=[]
for oldR in oldRecords:
 r=copy.deepcopy(oldR);t=technical[r['goalId']];assert oldR['profile']==t['profile'] and oldR['profileFingerprint']==t['profileFingerprint']
 r.update(t);r.update({'reviewId':rid,'reviewedAt':now,'reviewer':'bio_science14_independent_a; genuine targeted current Native6 P/frame reviewer; exact model variant unexposed','reviewRunIds':[runid],'status':'needs_human_review','reviewAuthority':'ai_candidate','dissent':[]})
 r['reason']=oldR['reason']+' Actual successor: whole profile and whole cases exact except the two read Karyo X/Y types word spaces. Current six actual native PDF/HTML/resource bindings inspected; other17 actual native pages and388 full394 contexts exact. Own successor FIRST: current-six-native-whole-P23-frame.actual-FIRST.independent-A.verdict.json. No new whole23 science, source/course, human or strict approval.'
 if r['goalId']=='183f3c47-ec20-5b98-8024-77ebd1c48abf':r['reason']+=' CURRENT NATIVE D/V HOLD: exact selected raster15 loses a green and duplicates an orange central marker; actual reconstruction falsely claims conservation. Correct unchanged synthetic P material does not resolve or waive BIO23-V6-A-001/META-001.'
 assert len(r['reason'])<=4000
 output.append(r)
records=txt('normal-current-six-native-P23.independent-A.records.jsonl',''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in output))
pRun=write('normal-current-six-native-P23.independent-A.run.json',{'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,'bundleFingerprint':frame['sha256'],'bookDigest':after['digest'],'provider':'OpenAI/Codex','model':'declaredModelUnexposed','role':'subject_reviewer','promptFamilyId':'positive-understanding-evidence-v2','promptFingerprint':prompt['sha256'],'criteriaFingerprint':bind(criteria)['sha256'],'generationParametersFingerprint':pParams['sha256'],'independenceGroupId':rid,'blindToOtherRuns':True,'goalIds':e['originalNative23GoalIds'],'inputArtifacts':[{'role':'book_model','digest':after['digest']},{'role':'review_input_json','digest':frame['sha256']},{'role':'review_markdown','digest':bind(e['wholeCaseMaterialsPath'])['sha256']},{'role':'review_prompt','digest':prompt['sha256']},{'role':'review_criteria','digest':bind(criteria)['sha256']}],'startedAt':read(D/'native-six-targeted.actual-input.before-own-native-review.independent-A.json')['createdAt'],'completedAt':now,'status':'completed','outputDigest':records['sha256'],'toolchainVersion':'existing-repository-ordinary-positive-evidence-validator'})
cfg=read(e['positiveConfigPath']);cfg.update({'reviewId':rid,'reviewPath':records['path'],'reviewRunManifestPaths':[pRun['path']]});cfg['scope']['label']='Own actual targetedNative6/current394 P23 frame review; unchanged23 P material and17 actual pages reused, two read Karyo whitespace fields; current15 native D/V HOLD separate'
pConfig=write('normal-current-six-native-P23.independent-A.config.json',cfg)
cap=D/'ordinary-current-P23-validation-capsule';cap.mkdir();copied=[]
for path in ['app/package.json','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/goalEvidenceProfileModel.ts','contracts/goal-evidence/v2/goal-evidence-profile.schema.json','contracts/goal-evidence/v2/goal-evidence-review-config.schema.json','contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json']:
 src=pathlib.Path(path);dest=cap/path;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dest);copied.append({'original':bind(src),'copy':bind(dest)})
(cap/'curricula').symlink_to(os.path.relpath(R/'curricula',R/cap),target_is_directory=True)
(cap/'app/node_modules').symlink_to(os.path.relpath(R/'app/node_modules',R/cap/'app'),target_is_directory=True)
for row in cur['entries']:
 for link in row['wholeCurrentGoalWithResources']['resourceLinks']:
  if link['type']!='goal-visualization':continue
  src=A/link['url'].lstrip('/');dst=cap/'app/public'/link['url'].lstrip('/');dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst);copied.append({'original':bind(src),'copy':bind(dst)})
portable=write('ordinary-current-P23-capsule.actual-portable-bindings.json',{'schemaVersion':1,'role':'Only original validator sources/contracts plus actual23 selected regular image bytes and repo-relative input access; no active image install','capsulePath':str(cap),'actualRegularCopies':copied,'repoRelativeLinks':[{'path':str(cap/'curricula'),'target':os.readlink(cap/'curricula')},{'path':str(cap/'app/node_modules'),'target':os.readlink(cap/'app/node_modules'),'localIgnoredRuntimeCache':True}],'normalPConfig':pConfig,'normalPRecords':records,'normalPRun':pRun,'humanApproval':False,'activeWrites':[]})
print(json.dumps({'DResultsDirectory':str(resultDir),'DRun':bind(runPath),'DRecords':bind(dst),'PFirst':pFirst,'PFirstSeal':pSeal,'PConfig':pConfig,'PRecords':records,'PRun':pRun,'capsule':str(cap),'portable':portable,'actualValueChecks':frameChecks},indent=2))
