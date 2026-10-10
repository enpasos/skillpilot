"""Bind immutable independent judgments to the SOURCE-only technical successor."""
from pathlib import Path
import json,hashlib,datetime,subprocess
ROOT=Path('/home/enpasos/projects/skillpilot');OWN=Path(__file__).parent;B=OWN.parent;BASE=B.parent
T=BASE/'biologie-neuro-ten-BY-eight-primary-current343-source-native-technical-successor-root-20261010-v3'
def read(p):return json.loads(p.read_text())
def ref(p):return {'path':str(p.relative_to(ROOT)),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def check(r):assert ref(ROOT/r['path'])=={k:r[k] for k in ['path','sha256','bytes']},r['path']
ep=T/'neutral-current343-source-only-eight-BY-primary.entry.json';fp=T/'FINAL.current343-eight-BY-primary-source-only-normal.technical.freeze.json'
assert ref(ep)['sha256']=='sha256:623d3c3815f339d2473300b591db971fb6ef6c2edffdb76b15af7fcb561ed8c8'
assert ref(fp)['sha256']=='sha256:356479fc6ff5409ef96e3c8e8e3cea2dde2e8ea7f565e30aadba789eff9b69c9'
entry=read(ep);core=entry['coreInputs'];check(entry['priorNativeV3Entry']);check(entry['priorNativeV3Freeze']);prior=read(ROOT/entry['priorNativeV3Entry']['path'])
v3seal=read(B/'FIRST.current-v3.independent-b.seal.json');v3freeze=read(B/'FINAL.current-v3-independent-b.freeze.json')
v5dir=B/'source-v5-targeted-independent-b';v5seal=read(v5dir/'FIRST.SOURCE-v5-targeted-independent-b.seal.json');v5freeze=read(v5dir/'FINAL.SOURCE-v5-targeted-independent-B.freeze.json')
for seal in [v3seal,v3freeze,v5seal,v5freeze]:
 for r in seal['files']:check(r)
v5report=read(v5dir/'SOURCE-v5.eight-real-operators-and-partial.independent-b.json')
assert entry['sourceAuthorV5Entry']==v5report['selectedSourceAuthorV5Entry'];check(entry['sourceAuthorV5Entry']);check(entry['sourceAuthorV5Freeze'])
same_core=['whole479After','kinds394','QA394Pending','whole394After','wholeScience10Cases20','wholeDEENGoals','P10Current','P10CandidateSetExact','native10Model','native10HTML','native10PortableHTML','native10PDF','native10Bundle','native10Batch']
for key in same_core:assert core[key]==prior['coreInputs'][key],key;check(core[key])
assert entry['currentRastersAndNativeCaptures']==prior['actualCurrentRastersAndNativeCaptures']
for refs in entry['currentRastersAndNativeCaptures'].values():
 for r in refs.values():check(r)
assert entry['ordinaryIndependentCampaigns']['b']==prior['ordinaryIndependentCampaigns']['b']
for key in ['input','campaign']:check(entry['ordinaryIndependentCampaigns']['b'][key])
for r in entry['ordinaryIndependentCampaigns']['b']['batches']:check(r)
own_manifest=next((B/'results').glob('*.run.json'));own_records=next((B/'results').glob('*.records.jsonl'));run=read(own_manifest)
assert run['outputDigest']==ref(own_records)['sha256'];campaign=read(ROOT/entry['ordinaryIndependentCampaigns']['b']['campaign']['path']);review_input=read(ROOT/entry['ordinaryIndependentCampaigns']['b']['input']['path']);bundle=read(ROOT/core['native10Bundle']['path'])
assert run['campaignId']==campaign['campaignId'] and run['bundleFingerprint']==bundle['bundleFingerprint']
assert run['bookDigest']==review_input['bookDigest']==bundle['bookModelDigest']
assert len([json.loads(line) for line in own_records.read_text().splitlines() if line])==10

check(core['source41CurrentWholeObjects']);check(prior['coreInputs']['source41CurrentWholeObjects'])
old41=read(ROOT/prior['coreInputs']['source41CurrentWholeObjects']['path']);new41=read(ROOT/core['source41CurrentWholeObjects']['path'])
oldpairs={(r['goalId'],w['wholeCurrentSourceGoal']['id']):w for r in old41['rows'] for w in r['wholeDirectSourceWitnesses']}
newpairs={(r['goalId'],w['wholeCurrentSourceGoal']['id']):w for r in new41['rows'] for w in r['wholeDirectSourceWitnesses']}
assert oldpairs.keys()==newpairs.keys() and len(newpairs)==41
source_eight={r['sourceGoalId']:r for r in v5report['eightIndependentOperatorJudgments']};assert len(source_eight)==8
eight_bound=[];exact33=0
for key,w in newpairs.items():
 sid=key[1]
 if sid not in source_eight:assert w==oldpairs[key];exact33+=1;continue
 judgment=source_eight[sid];assert w['wholeCurrentSourceGoal']==judgment['wholeCurrentSourceGoal']
 assert w['wholeCurrentMappingRecord'] in judgment['wholeMappingRows'];assert w['wholeCurrentSourceDecisions']==judgment['wholeCurrentDecision']
 assert w['extraction']==v5report['selectedWholeExtraction'];assert w['mapping']==v5report['selectedWholeMapping'];check(w['extraction']);check(w['mapping'])
 year=w['wholeCurrentSourceGoal']['actualPrimaryLocator']['year'];f=next(f for f in entry['actualPrimaryFetches'] if f['year']==year)
 assert w['currentActualPrimaryBytes']==f['actualRawPrimary'];check(w['currentActualPrimaryBytes']);assert w['sourceDocument']['path']==w['currentActualPrimaryBytes']['path']
 assert w['sourceDocument']['url']==f['url'];assert w['sourceDocument']['official'] is True
 assert w['historicalDerivedArtifactNotOfficialPrimaryBytes']==oldpairs[key]['currentActualPrimaryBytes'];check(w['historicalDerivedArtifactNotOfficialPrimaryBytes'])
 eight_bound.append({'canonicalGoalId':key[0],'sourceGoalId':sid,'wholeCurrentWitness':w,'independentActualOperatorJudgment':judgment['independentJudgment'],'wholeGoalOrCourseApproval':False})
assert len(eight_bound)==8 and exact33==33
assert next(w for (gid,sid),w in newpairs.items() if sid=='ad855269-70c3-526c-951b-cc2d54106f36')['wholeCurrentMappingRecord']['matchType']=='partial'

check(core['currentAtlasConfig']);check(core['currentAtlasReceipt']);check(prior['coreInputs']['currentAtlasReceipt'])
atlas=read(ROOT/core['currentAtlasReceipt']['path']);old_atlas=read(ROOT/prior['coreInputs']['currentAtlasReceipt']['path'])
assert atlas['counts']=={'canonicalCurricularAtomicGoals':394,'publishedCurricularAtomicGoals':394,'sourceViews':24,'unresolvedSourceScopeDecisions':0,'omittedGoals':0}
assert {s['key']:s['goalIds'] for s in atlas['scopes']}=={s['key']:s['goalIds'] for s in old_atlas['scopes']}
for binding in atlas['inputBindings']:
 p=ROOT/binding['path'];assert 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()==binding['sha256']
by_old_mapping=next(w['mapping']['path'] for (_,sid),w in oldpairs.items() if sid in source_eight)
by_old_extract=next(w['extraction']['path'] for (_,sid),w in oldpairs.items() if sid in source_eight)
by_new_mapping=v5report['selectedWholeMapping']['path'];by_new_extract=v5report['selectedWholeExtraction']['path']
def decode(a):
 groups=[]
 for raw in a['witnessGroups']:
  w=dict(raw)
  for k in ['mappingInput','extractionInput']:
   path=a['inputBindings'][w.pop(k)]['path'];w[k.replace('Input','Path')]={by_old_mapping:by_new_mapping,by_old_extract:by_new_extract}.get(path,path)
  groups.append(json.dumps(w,ensure_ascii=False,separators=(',',':'),sort_keys=True))
 return sorted(groups)
assert decode(atlas)==decode(old_atlas)
assert all('matchType' not in w for w in atlas['witnessGroups'])
assert atlas['claims']['newSourceReview'] is False and atlas['claims']['humanApproval'] is False
root_terminals=[]
for r in entry['actualNormalTerminals']:
 check(r);terminal=read(ROOT/r['path']);assert terminal['exitCode']==0;root_terminals.append({'binding':r,'actualNormalTerminal':terminal,'observation':'Hash-checked real technical execution receipt. This agent did not rerun a whole build or central gate.'})
for key in ['currentBYSourceScopeAnd343Impact','normalCurrent394AndPExact']:check(core[key])
native=read(ROOT/core['normalCurrent394AndPExact']['path']);assert native['all394WholePageBodiesAndDigestExact'] is True and native['protected343WholePageBodiesExact'] is True
preservation=read(ROOT/core['currentBYSourceScopeAnd343Impact']['path']);assert preservation['all24FullScopeGoalSetsExact'] is True and preservation['all33OtherWholeCurrentDirectWitnessesExact'] is True
all_refs=[f['actualRawPrimary']['path'] for f in entry['actualPrimaryFetches']]
git=subprocess.run(['git','check-ignore','--stdin'],cwd=ROOT,input='\n'.join(all_refs)+'\n',capture_output=True,text=True);assert git.returncode==1 and git.stdout==''
out={'schemaVersion':1,'reviewId':B.name+'.source-current-binding-v3','completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reviewerAgent':'/root/biology_neuro_ten_blind_b',
 'chosenCurrentTechnicalEntry':ref(ep),'chosenCurrentTechnicalFreeze':ref(fp),'originalIndependentV3FIRST':ref(B/'FIRST.current-v3.independent-b.seal.json'),'originalIndependentV3Freeze':ref(B/'FINAL.current-v3-independent-b.freeze.json'),
 'independentSourceV5FIRST':ref(v5dir/'FIRST.SOURCE-v5-targeted-independent-b.seal.json'),'independentSourceV5Freeze':ref(v5dir/'FINAL.SOURCE-v5-targeted-independent-B.freeze.json'),
 'current41Inventory':core['source41CurrentWholeObjects'],'eightCurrentRealPrimaryBindingsAndJudgments':eight_bound,
 'currentSourceAtlas':{'config':core['currentAtlasConfig'],'receipt':core['currentAtlasReceipt'],'counts':atlas['counts'],'all24FullScopeOrderedGoalSetsExact':True,'allWitnessSemanticsExactAfterDeclaredWholeBYPairPathSubstitution':True,'coverageDirectInheritedIsNotMappingMatchType':True,'newSourceOrCourseClearance':False},
 'normalSourceNativeActualTerminalReceipts':root_terminals,'ownIndependentBindingCheckerTerminalExitCode':0,
 'normalD10':{'runManifest':ref(own_manifest),'records':ref(own_records),'campaign':entry['ordinaryIndependentCampaigns']['b']['campaign'],'input':entry['ordinaryIndependentCampaigns']['b']['input'],'wholeTenCurrentInputAndBundleExact':True,'sealedWholeBatchValidatorTerminalExitCode':0,'noScienceRestartNeeded':'Whole goal/page/P/image/context inputs and native PDF/HTML bytes are unchanged; only source witness inventory/Atlas input bindings differ, adjudicated above.'},
 'exactPreservation':{'other33WholeDirectWitnessesExact':True,'all394NormalWholePageBodiesAndDigestExact':True,'all343ProtectedWholePageBodiesExact':True,'allTenPNativeDescriptionsImagesAndCampaignInputsExact':True,'allHistoricalIndependentSealsAndFilesExact':True},
 'finalIndependentDisposition':'KEEP current bound D10/P10/V10 and A10 atomic/M10 no_memory_needed; accept targeted SOURCE corrections as AI candidate. The two concrete initial source findings are resolved in this chosen input. Partial partners remain partial; no entire-course clearance or human authority follows.',
 'remainingScopeLimits':['No new full-source review of214 historical BY goals or unrelated protected343.','Optional ggf human/organism comparison is an authored extension, not a universal official Bavarian compulsory claim.','No learner performance, actual experiment, trial, client acceptance or human approval.'],
 'status':'needs_human_review','reviewAuthority':'ai_candidate','currentPeerVerdictsRead':False,'approved':0,'activeGain':0,'operativeWrites':False,'GitOrGitHubWrites':False}
OWN.mkdir(parents=True,exist_ok=True);p=OWN/'current-source-native-binding.independent-B.check.json';p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'terminalExitCode':0,'correctedCurrentWitnesses':8,'otherWholeWitnessesExact':33,'currentAtlasCounts':atlas['counts'],'all24ScopeAndWitnessSemanticsExact':True,'allTenNormalDInputsStillExact':True,'SOURCE_findings':'resolved in chosen input; AI candidate only','approved':0,'activeGain':0,'check':ref(p)}))
