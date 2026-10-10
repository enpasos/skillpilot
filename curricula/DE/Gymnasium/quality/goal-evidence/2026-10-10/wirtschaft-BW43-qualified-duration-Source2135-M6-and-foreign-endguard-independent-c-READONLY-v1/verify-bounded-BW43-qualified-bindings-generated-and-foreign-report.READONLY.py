import pathlib,json,hashlib,re,datetime,copy
P=pathlib.Path
q=P('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
o=q/'wirtschaft-BW43-qualified-duration-Source2135-M6-and-foreign-endguard-independent-c-READONLY-v1'
load=lambda p:json.loads(P(p).read_text())
sha=lambda b:hashlib.sha256(b).hexdigest()
bind=lambda p:{'path':str(p),'sha256':sha(P(p).read_bytes()),'bytes':P(p).stat().st_size}
canonicalSha=lambda v:sha(json.dumps(v,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode())
checks={}
def ck(k,v):
 checks[k]=bool(v)
 if not v:raise AssertionError(k)
def verify(b,k):ck(k,bind(b['path'])=={**b,'sha256':b['sha256'].replace('sha256:','')})
author=q/'wirtschaft-BW43-BP2016-source-bound-G8-duration-policy-and-exact-QAalias-AUTHOR-INERT-v1'
authorseal=author/'SEALED-source43-whole-exact-G8-edition-policy-and-one-QAalias.AUTHOR-INERT.json'
ck('authorSealExact',bind(authorseal)['sha256']=='0ac32d93a92197c5f76839c7ae39e4786ea525e620ea089a8871b4a4520a9d1b')
for i,b in enumerate(load(authorseal)['artifacts']):verify(b,'authorArtifactExact:'+str(i))
a=q/'wirtschaft-BW43-source-bound-duration-policy-and-QAalias-independent-a-READONLY-v1'
aseal=a/'SEALED-independent-BW43-source-policy-exact-alias.READONLY.json';ck('independentAScienceSealExact',bind(aseal)['sha256']=='430d4ccfabdde39630ff0eee61eece3212c47db92c37887a4a5118410aa20449')
for i,b in enumerate(load(aseal)['artifacts']):verify(b,'independentAScienceArtifactExact:'+str(i))
pairs=load(author/'ROOT-ready-three-BW43-source-duration-QAalias-only-pairs.GUARDED.handoff.json')['pairs']
for i,p in enumerate(pairs):
 ck('activeQualifiedThreePairExact:'+str(i),P(p['activePath']).read_bytes()==P(p['candidatePath']).read_bytes())
 beforeNames=['whole-source43-before.EXACT.json','whole-duration-policy-before.EXACT.json','whole-QA-report-generator-before.EXACT.ts']
 ck('actualBeforeCopyBinding:'+str(i),bind(author/beforeNames[i])['sha256']==p['before']['sha256'])
bs=load(author/'whole-source43-before.EXACT.json');cs=load(pairs[0]['activePath']);sourceRest=copy.deepcopy(cs);sourceRest.pop('durationModels')
ck('rootG8MetadataOnlyWholeSourceExact',sourceRest==bs and cs['durationModels']==['G8'])
ck('source43GoalsAnd5PassagesWholeExact',cs['sourceGoals']==bs['sourceGoals'] and cs['passages']==bs['passages'] and len(cs['sourceGoals'])==43 and len(cs['passages'])==5)
bp=load(author/'whole-duration-policy-before.EXACT.json');cp=load(pairs[1]['activePath'])
ck('all154HistoricPolicyDecisionsWholeExact',len(bp['decisions'])==154 and len(cp['decisions'])==155 and cp['decisions'][:154]==bp['decisions'])
newPolicy=cp['decisions'][154]
ck('QAexact80ByteAliasOnly',len(P(pairs[2]['activePath']).read_bytes())-len((author/'whole-QA-report-generator-before.EXACT.ts').read_bytes())==80 and P(pairs[2]['activePath']).read_bytes()==(q/'wirtschaft-BW43-readiness-exact-header-alias-proposal-AUTHOR-INERT-c-v1/candidate-report-generator-one-exact-BW43-alias.AUTHOR-INERT.ts').read_bytes() if (q/'wirtschaft-BW43-readiness-exact-header-alias-proposal-AUTHOR-INERT-c-v1/candidate-report-generator-one-exact-BW43-alias.AUTHOR-INERT.ts').exists() else len(P(pairs[2]['activePath']).read_bytes())-len((author/'whole-QA-report-generator-before.EXACT.ts').read_bytes())==80 and bind(pairs[2]['activePath'])['sha256']=='be6fb83e12fc223f7586c31c11c9fb840cf18a8215e5de6fcd34153864aa6738')
old=(o/'preserved-qualified-generated14-before.EXACT.ts').read_text();current=P('app/src/generated/gymnasiumDurationOfferings.ts').read_text()
ck('priorGenerated14QualifiedCopyExact',sha(old.encode())=='4c4981f2d46cb9c5aab1c4893cd687b1a4ae186e7d745e1f064a58a02786163b')
def extract(s):
 out=[];off=0
 while (i:=s.find("  '605bdaf6-32d5-56fd-8d92-5a80c2fd2901': {",off))>=0:
  start=s.index('{',i);depth=0;end=None
  for z in range(start,len(s)):
   if s[z]=='{':depth+=1
   elif s[z]=='}':
    depth-=1
    if depth==0:end=z+1;break
  obj=json.loads(re.sub(r',(\s*[}\]])',r'\1',s[start:end].replace("'",'"')));out.append((i,end,obj));off=end
 return out
before=extract(old);after=extract(current);ck('twoExactEconomicsGeneratedBlocks',len(before)==len(after)==2)
strip=lambda s,ex:s[:ex[0][0]]+s[ex[0][1]:ex[1][0]]+s[ex[1][1]:]
ck('allForeignGeneratedFieldsAndScaffoldingWholeByteExact',strip(old,before)==strip(current,after))
ck('actualDuration15Content16Countries',len(before[0][2])==14 and len(after[0][2])==15 and len(before[1][2])==len(after[1][2])==16)
rd=copy.deepcopy(after[0][2]);addedBW=rd.pop('DE-BW');rc=copy.deepcopy(after[1][2]);newBW=rc['DE-BW'];rc['DE-BW']=before[1][2]['DE-BW']
ck('onlyQualifiedBWG8DurationAndSekIContentMetadata',addedBW==['G8'] and newBW=={'stages':['SekI','CrossStage'],'durationModels':['G8']} and rd==before[0][2] and rc==before[1][2])
ck('nativeRuntimeGeneratorWholeUnchanged',bind('app/scripts/generateGymnasiumDurationOfferings.ts')['sha256']=='86ca96531dd41c5448d945f043eda8281d389ffec079bd2de29482e42baceeee')
bmd=(o/'preserved-qualified-readiness29-before.EXACT.md').read_text();amd=P('docs/qa-ci/status/gymnasium-duration-model-readiness.md').read_text()
ck('priorReadiness29QualifiedCopyExact',sha(bmd.encode())=='9b4a9dd4fb7a109af4270781cb815022243e83b9cbe56f35e4250ec604545da2')
foreignReport=lambda s:''.join(l for l in s.splitlines(keepends=True) if not l.startswith('| Wirtschaftswissenschaften |'))
ck('allForeignReadinessReportTextWholeExact',foreignReport(bmd)==foreignReport(amd))
ck('nativeIndependentlyVerifiedPositiveReportBytesExact',sha(amd.encode())=='fe0b12e2dbe6835688aad181e29bb0bf7869977f12c33a89d8cf467180b75f27')
rows=[l.split('|')[1:-1] for l in amd.splitlines() if l.startswith('| Wirtschaftswissenschaften |') and '.source-extraction.json' in l]
ck('all30EconomicsSourcesAnd2135ReadinessGoalsActual',len(rows)==30 and sum(int(r[6].strip()) for r in rows)==2135)
bwrows=[r for r in rows if r[1].strip()=='`DE-BW`' and r[2].strip()=='SekI']
ck('BW43ReadinessExactlyOneG8SourceBinding',len(bwrows)==1 and int(bwrows[0][6].strip())==43 and bwrows[0][3].strip()=='single-duration-source (G8)' and bwrows[0][4].strip()=='G8')
reportp=P('docs/qa-ci/status/curriculum-quality-status.json');report=load(reportp);by={c['landscapeId']:c for c in report['curricula']}
fb=load(o/'preserved-qualified-pre-BW-M6-twenty-foreign-report-whole-object-digests.EXACT.json');fieldFollowers=[]
for b in fb['allTwentyForeignWholeObjectDigests']:
 c=by[b['landscapeId']]
 if canonicalSha(c)==b['wholeCanonicalJsonSha256']:ck('foreignCurrentReportWholeObjectExact:'+b['subject'],True);continue
 ck('oneSharedBWSourceMetadataFollowerOnly',b['subject']=='Politik und Wirtschaft' and not fieldFollowers)
 copyc=copy.deepcopy(c);found=[row for row in copyc['mappingPipeline']['sources'] if row['sourceLandscapeId']=='4137eeb1-2c30-57a4-8390-d27971381e86']
 ck('sharedBW43OnlyOneExistingPipelineRow',len(found)==1 and found[0]['durationModels']==['G8'])
 row=found[0];del row['durationModels']
 ck('removeExactQualifiedSourceDurationFieldRestoresForeignWholeReport',canonicalSha(copyc)==b['wholeCanonicalJsonSha256'])
 fieldFollowers.append({'subject':b['subject'],'sourceLandscapeId':'4137eeb1-2c30-57a4-8390-d27971381e86','field':'mappingPipeline.sources[sourceLandscapeId].durationModels','before':'absent','after':['G8'],'allRemainingWholeFieldsRestoredExact':True,'cause':'Same unchanged BW-WBS43 source already participates in the existing Politics/Economics mapping pipeline; the root source-duration metadata is copied by the unchanged native global generator. No goal, source facet, mapping edge, course/scope role, rule status or maturity change.'})
ck('all20ForeignReportsExactExceptOneExplicitSharedSourceMetadataFollower',len(fb['allTwentyForeignWholeObjectDigests'])==20 and len(fieldFollowers)==1)
end=load(o/'actual-current702-346-BW43-M6-Source2135-and-protected-foreign-endguard.READONLY.json');ck('full1266M6SourceScopeAndForeignInputEndguardPASS',end['allChecksPassed'] and len(end['checks'])==1266 and all(end['checks'].values()))
ck('boundFinalActualReportExactToFullEndguard',end['report']['sha256'].replace('sha256:','')==bind(reportp)['sha256'])
native=load(o/'actual-native-qualified-three-overlay-Source2135-exact-coverage.READONLY.json');ck('actualOriginalNative2135BeforeAfterCoverageWholeExact',native['source2135WholeCoverageExact'] and native['baseline']['coverage']==native['candidate']['coverage'] and all(g['exact'] for g in native['endGuards']))
ck('priorSealedC702HistoricalEndguardImmutable',bind(q/'wirtschaft-final702-current346-M6-source-scope-and-foreign-floor-independent-c-READONLY-v1/SEALED-actual-M6-source-scope-and-protected-foreign-floor-independent-KEEP.READONLY.json')['sha256']=='1384bf75504f39cd26d81cc57cf19e341944630f7383910cdbe209b4a928f8b8')
receipt={'status':'KEEP_independent_bounded_source2135_currentM6_foreignFloors_and_generatedBW_G8_metadata','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reviewer':'/root/economics_common_source_course_independent_c','checks':checks,'fullCurrentM6Endguard':bind(o/'actual-current702-346-BW43-M6-Source2135-and-protected-foreign-endguard.READONLY.json'),'originalNativeBeforeAfter2135':bind(o/'actual-native-qualified-three-overlay-Source2135-exact-coverage.READONLY.json'),'independentASourcePolicyAndExactAliasScience':bind(aseal),'qualifiedRootActiveThreePairs':bind(q/'wirtschaft-final702-qualified-active-integration-ROOT-v1/actual-three-qualified-BW43-source-bound-policy-and-QAalias.ROOT.receipt.json'),'exactActivePairs':pairs,'currentReport':bind(reportp),'currentMaturity':'M6','currentOrdinary':346,'currentCore':end['core'],'currentSEM':end['currentSemanticLedger'],'nativeSourceGoals':2135,'fullySourceCovered':2135,'unsupported':0,'unmapped':0,'foreignInputAndQualityBodies806Exact':True,'allForeignMaturityFloors20Preserved':True,'foreignCurrentGlobalReportExactExceptQualifiedSharedSourceDurationMetadata':fieldFollowers,'currentGeneratedFile':bind('app/src/generated/gymnasiumDurationOfferings.ts'),'currentReadinessReport':bind('docs/qa-ci/status/gymnasium-duration-model-readiness.md'),'actualReadinessEconomicsSources':30,'actualReadinessSourceGoals':2135,'generatedDurationCountries':15,'generatedContentCountries':16,'actualReadOnlyPositiveCommands':[{'command':'native generateGymnasiumDurationOfferings.ts --check','exitCode':0,'stdout':''},{'command':'native reportGymnasiumDurationModelReadiness.ts --check --require-reviewed-subject=Wirtschaftswissenschaften --require-reviewed-m6','exitCode':0,'stdout':'ok docs/qa-ci/status/gymnasium-duration-model-readiness.md\nM6 subjects: 10; source scopes touching Sek I: 155; all source scopes: 295'}],'firstProbe':'A concurrent Root activation changed three active inputs and was correctly rejected by its endguard; no PASS or scientific qualification was counted. The successful probe uses sealed before/after candidates and stable active inputs.','firstWholeViewGuard':'The original 35-view guard stopped at 15 independently qualified later navigation-only successors. It was continued only with the precise sealed Plan/A/Root successor bindings, never with blind hash replacement.','currentG9FidelityClaim':False,'runtimeGeneratorAuthoredChanges':0,'activeWrites':0,'newHistoricalSourceScienceClaim':False,'ownAliasSelfApproval':False,'globalGeneratorOrBuildInvoked':False,'fullCIClaim':False,'M7Claim':False,'M7StillSeparate':end['strictM7CurrentReportSeparate'],'humanReviewOrReleaseApprovalClaim':False}
p=o/'actual-independent-BW43-qualified-Source2135-M6-foreign-and-generated15-KEEP.SEALED.receipt.json';p.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'path':str(p),'sha256':bind(p)['sha256'],'boundedChecks':len(checks),'fullM6Checks':len(end['checks']),'source':2135,'M6':True,'durationCountries':15,'contentCountries':16}))
