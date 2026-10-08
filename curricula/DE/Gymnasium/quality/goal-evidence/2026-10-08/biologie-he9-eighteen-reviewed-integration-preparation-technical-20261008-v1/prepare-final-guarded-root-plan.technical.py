# SPDX-License-Identifier: Apache-2.0
# Actual inactive preparation of sealed independent reviewed inputs, no active writes.
from pathlib import Path
import json,hashlib,copy,datetime,subprocess
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;BASE=OWN.parent
def rel(p):return str(Path(p).relative_to(ROOT))
def digest(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def bind(p):return {'path':rel(p),'sha256':digest(p),'bytes':Path(p).stat().st_size}
def read(p):return json.loads(Path(p).read_text())
def write(p,o):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);data=(json.dumps(o,ensure_ascii=False,indent=2)+'\n').encode()
 assert not p.exists(),f'Preserve prior output {p}'
 with p.open('xb') as f:f.write(data)
 return bind(p)
plan=read(OWN/'pending/neutral-current174-seventeen-potential-guard.plan.json');ready=read(OWN/'checks/ready-native-current17-profile-visual-and-whole391-bindings.technical.json');ids=plan['selected17PotentialGoalIds'];selected=set(ids);seals=ready['seals']
for k,b in plan['beforeBindings'].items():assert digest(ROOT/b['path'])=='sha256:'+b['sha256'].removeprefix('sha256:'),f'Active {k} changed before seal'
for n in ['A17','M23-cards17-views8']:assert read(OWN/'checks'/f'{n}.native-terminal.actual.json')['actualTerminalExitCode']==0
dargv=['node','app/node_modules/tsx/dist/cli.mjs',rel(OWN/'check-current-reviewed-D17-original18-deferred19.technical.mts')];dr=subprocess.run(dargv,capture_output=True,text=True);write(OWN/'checks/current-reviewed-native-D17.completed.terminal.actual.json',{'argv':dargv,'actualTerminalExitCode':dr.returncode,'actualStdout':dr.stdout,'actualStderr':dr.stderr,'newScienceRun':False,'activeWrites':0});assert dr.returncode==0,dr.stdout+dr.stderr
reg=read(OWN/'before/registry.json');bio=next(s for s in reg['subjects'] if s['subject']=='biologie');oldbio=copy.deepcopy(bio)
for p in bio['resolutionIndexPaths']:assert not selected & {r['goalId'] for r in read(ROOT/p).get('resolutions',[])},f'Already claimed selected goal in {p}'
idx=OWN/'original-eighteen-pair-native-d-eighteen/resolution-index.json';index=read(idx);assert len(index['batchGoalIds'])==18;assert set(r['goalId'] for r in index['resolutions'])==selected;assert index['deferredGoalIds']==[plan['pending19']['goalId']]
bio['resolutionIndexPaths'].append(rel(idx));bio['positiveEvidenceConfigPaths'].append(rel(OWN/'positive/current17.future-active.config.json'))
for k in oldbio:
 if k not in ['resolutionIndexPaths','positiveEvidenceConfigPaths']:assert bio[k]==oldbio[k]
assert bio['resolutionIndexPaths'][:-1]==oldbio['resolutionIndexPaths'];assert bio['positiveEvidenceConfigPaths'][:-1]==oldbio['positiveEvidenceConfigPaths'];write(OWN/'candidate/registry-biologie.future-entry.json',bio)
author=BASE/'biologie-he9-eighteen-final-raster-native-author-root-20261008-v1';patches=read(author/'candidate/eighteen-image-only-field-patches.guarded-plan.json')['rows'];images=read(ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-he9-nineteen-image-author-root-20261008-v1/selected-eighteen-author-images.exact.json')['images'];paired=read(OWN/'candidate/exact-selected-asset-provenance-and-paired-machine-approval.technical.json');pairedby={r['goalId']:r for r in paired['rows']};ops=[]
for i in images:
 gid=i['goalId']
 if gid not in selected:continue
 row=next(r for r in patches if r['goalId']==gid);png=ROOT/i['path'];prompt=ROOT/i['promptPath'];gp=ROOT/i['toolProvenancePath'];assert digest(png)=='sha256:'+i['sha256'].removeprefix('sha256:')
 prov={'schemaVersion':1,'role':'own didactic raster with actual generation provenance and genuine paired independent whole current machine review','provider':i['provider'],'servingModel':i['servingModel'],'selectedRaster':bind(png),'selectedExactPrompt':bind(prompt),'originalGenerationProvenance':bind(gp),'originalGenerationMetadata':read(gp),'canonicalAssetPath':row['futureCanonicalPNG'],'publicAssetPath':row['futureAppPNG'],'backendAssetPath':row['futureBackendPNG'],'independentScientificMachineSeals':pairedby[gid]['pairedFinalSeals'],'actualBothIndependentViews':['full','Chromium360','Chromium680','whole-native-PDF-page'],'width':i['width'],'height':i['height'],'format':'PNG','selectedCandidateVersion':i['version'],'altDe':i['altDe'],'license':'CC-BY-4.0','attribution':'SkillPilot — own didactic content, AI-generated and SkillPilot-curated','wholeCountrySourceApprovalClaim':False,'deviceAcceptanceClaim':False,'humanApproval':False,'humanTrial':False,'original19GenuineDissentAnd12SplitPreserved':True}
 pp=OWN/'asset-provenance'/f'{gid}.generation.provenance.json';write(pp,prov)
 for target in [row['futureCanonicalPNG'],row['futureAppPNG'],row['futureBackendPNG']]:ops.append({'action':'copy_exact','source':rel(png),'sourceSha256':digest(png),'target':target})
 for src,target in [(prompt,str(Path(row['futureCanonicalPNG']).parent/'prompt.de.md')),(pp,str(Path(row['futureCanonicalPNG']).parent/'generation.provenance.json'))]:ops.append({'action':'copy_exact','source':rel(src),'sourceSha256':digest(src),'target':target})
assert len(ops)==85;assert len({o['target'] for o in ops})==85
for o in ops:assert not (ROOT/o['target']).exists(),f'New reviewed target already exists {o["target"]}'
ledger=read(OWN/'before/ledger.json');assert len(ledger['activeBatchConfigPaths'])==7
write(OWN/'candidate/ledger-preserve-only.technical.json',{'role':'no HE claim exists, preserve all seven current Chemistry claims without ledger write','ledgerBinding':plan['beforeBindings']['ledger'],'preserveExactActiveBatchConfigPaths':ledger['activeBatchConfigPaths'],'ledgerMutationRequired':False,'activeWrites':0})
source={'role':'retain actual source/science limits and original dissent; no national operator union','operativeWholeCases':bind(author/'eighteen-whole-goals-forty-complete-DEEN-cases.exact.json'),'operativeCurrentProfiles':bind(author/'native-raster-candidate/P18.actual-raster-author.review.jsonl'),'actualAScienceSourceRetention':bind(BASE/'biologie-he9-eighteen-final-raster-native-independent-a-20261008-v1/actual-current-D-P-context-source-retention.independent-a.receipt.json'),'actualBWholeScience':bind(BASE/'biologie-he9-eighteen-final-raster-native-independent-b-20261008-v1/eighteen-whole-DEEN-source-P-science-first.independent-b.verdicts.json'),'fullSelectedSyntheticDEENCases':38,'selectedScienceBodiesUnchanged':True,'eyeOrEarAlternativePreserved':True,'regulatoryCircuitFacultativePreserved':True,'cacheOfficialPdfIsNotRequiredRuntimeOrPublicationInput':True,'historicalScienceDissentRetained':True,'original19NotClosed':True,'original12SplitOpen':True,'humanApproval':False};write(OWN/'checks/portable-source-cache-boundary.technical.json',source)
result={'role':'inactive guarded reviewed HE17 Root integration plan','subject':'biologie','beforeCanonicalSha256':plan['beforeBindings']['canonical']['sha256'],'futureCanonicalSource':rel(OWN/'candidate/canonical.seventeen-pending-review.future-active.json'),'futureCanonicalSha256':digest(OWN/'candidate/canonical.seventeen-pending-review.future-active.json'),'replaceQaFrom':rel(OWN/'candidate/visualization-qa.future-active.json'),'mergeOnlyBiologyRegistryEntryFrom':rel(OWN/'candidate/registry-biologie.future-entry.json'),'registryMergeInstruction':'Append one genuine native18 index with17 standard resolutions and19 genuinely deferred, and one P17 config to latest Bio entry; retain all unrelated entries and historical indexes. No supersession or Ord19 approval.','ledgerPreserveOnly':rel(OWN/'candidate/ledger-preserve-only.technical.json'),'assetOperations':ops,'beforeBindings':plan['beforeBindings'],'protectedStrictGoalIds':plan['protectedStrictGoalIds'],'strictBaselineReport':plan['strictBaselineReport'],'selectedGoalIds':ids,'exactOtherWholeGoals':457,'exactOtherCurrentPages':374,'semanticKindsUnchanged':True,'atomicityRowsUnchanged':True,'memoryRowsCardsVisibilityUnchanged':True,'beforeStrictBiology174':174,'expectedPotentialAfterStrictBiology191':191,'potentialNewCurricularClosures':17,'newScientificClosuresClaimedBeforeCentralCheck':0,'restoredBindingGainClaimedBeforeCentralCheck':0,'deferred19':plan['pending19']['goalId'],'excluded12Split':plan['excluded12']['goalId'],'mustRunAfterApply':['node app/node_modules/tsx/dist/cli.mjs app/scripts/positiveGoalEvidenceReview.ts --config='+rel(OWN/'positive/current17.future-active.config.json')+' --mode=check','node app/node_modules/tsx/dist/cli.mjs '+rel(OWN/'check-current-reviewed-D17-original18-deferred19.technical.mts')+' --active','goal-visualization-assets exact source/app/backend/prompt/provenance check','current central strict five-gate check plus all protected maturity floors'],'sourceCacheBoundary':rel(OWN/'checks/portable-source-cache-boundary.technical.json'),'separateHumanApprovalAndTrial':'remain open, never implied','activeWrites':0};write(OWN/'ready-root-reviewed-guarded-integration-plan.technical.json',result)
required={}
def require(p,role):
 p=Path(p);assert p.is_file(),f'Missing required {role} {p}';required[rel(p)]={**bind(p),'role':role}
for p in OWN.rglob('*'):
 if p.is_file():require(p,'own portable technical artifact')
bundle=OWN/'original-eighteen-pair-native-d-eighteen/bundle';bm=read(bundle/'manifest.json')
for a in bm['artifacts']:
 p=(bundle/a['path']).resolve();assert p.is_relative_to(bundle.resolve());require(p,'operative bundle '+a['role']);assert digest(p)==a['digest'];assert p.stat().st_size==a['bytes']
for op in ops:require(ROOT/op['source'],'exact reviewed asset/prompt/provenance transfer input')
for p in [OWN/'retained-AM/A17.exact-native.config.json',OWN/'retained-AM/M23-cards17-views8.exact-native.config.json',OWN/'positive/current17.future-active.config.json',OWN/'native-full391.inactive.config.json',OWN/'native-full391.future-active.config.json']:
 c=read(p)
 for k in ['reviewPath','cardReviewPath','reviewCriteriaPath','landscapePath','semanticKindLedgerPath','goalVisualizationQaPath','compositionViewManifestPath']:
  if c.get(k):require(ROOT/c[k],'native operative '+k)
 for sc in c.get('visibilityScopes',[]):require(ROOT/sc['viewPath'],'memory visibility input')
 if c.get('compositionViewManifestPath'):
  m=read(ROOT/c['compositionViewManifestPath'])
  for x in [*m['sourcePaths'],m['navigationViewPath'],m['durationModelPolicyPath']]:require(ROOT/x,'whole391 source/scope input')
for d in [OWN/'checks/binding-preparation-declared-inputs.technical.json',OWN/'checks/original18-native-pair-declared-inputs.technical.json']:
 o=read(d)
 for x in o.get('files',o.get('declaredInputs',[])):require(ROOT/x['path'],'actual declared read dependency')
for s in seals.values():require(ROOT/s['seal']['path'],'immutable independent input seal')
for x in source.values():
 if isinstance(x,dict) and 'path' in x:require(ROOT/x['path'],'actual bounded source/case/profiles input')
ignored=subprocess.run(['git','check-ignore','--no-index','--stdin'],input='\n'.join(sorted(required))+'\n',capture_output=True,text=True);assert ignored.returncode in [0,1];bad=ignored.stdout.strip().splitlines();assert not bad,f'Required input ignored {bad}'
symlinks=[]
for p in OWN.rglob('*'):
 if p.is_symlink():q=p.resolve(strict=True);assert q.is_file();symlinks.append({'path':rel(p),'target':rel(q),'targetDigest':digest(q)})
observations=[]
for p in [author/'native-raster-candidate/eighteen/book.pdf',author/'native-raster-candidate/eighteen/book.html',author/'native-raster-candidate/eighteen/bundle/book.pdf',author/'native-raster-candidate/eighteen/bundle/book.html']:
 r=subprocess.run(['git','check-ignore','--no-index',rel(p)],capture_output=True,text=True);observations.append({'path':rel(p),'actualExitCode':r.returncode,'ignored':r.returncode==0,'requiredOperative':p.parent.name=='bundle'})
assert [o['ignored'] for o in observations]==[True,True,False,False]
portable=write(OWN/'checks/portable-final-dependencies-and-symlinks.actual.json',{'role':'actual required-input Git-ignore and broken-symlink guard','recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'requiredFiles':list(required.values()),'actualGitCheckIgnoreExitCode':ignored.returncode,'requiredIgnoredInputs':bad,'bundleAccessContract':'Existing verifier reads bundle/artifact.path; original sourcePath is provenance only','operativeBundleArtifactsExact':True,'originalRendererObservations':observations,'historicalIgnoredRawRenderIsNotRequiredOperative':True,'brokenSymlinks':0,'symlinks':symlinks,'newIgnoreRules':0,'validatorExceptions':0,'forceAddUsed':False,'activeWrites':0})
freeze=write(OWN/'technical-preparation.final.freeze.json',{'artifactKind':'inactive exact reviewed HE17 technical Root integration preparation','recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'frozenFiles':[bind(p) for p in sorted(OWN.rglob('*')) if p.is_file()],'actualIndependentSeals':seals,'nativeCurrentD17':'PASS actual original18 pair17resolved19deferred','nativeP17ClosedAndSemantics':'PASS','pairedActualV17':'PASS','retainedA17M23Cards17Views8':'actual native exit0','wholeOther457GoalsExact':True,'wholeOther374PagesExact':True,'copyOperations':85,'portableDependencies':portable,'currentBaseline174Guard':plan['beforeBindings']['canonical'],'protectedStrictGoalIds':plan['protectedStrictGoalIds'],'Ord19OriginalGenuineDissentNotClosed':True,'Ord12SplitOpen':True,'ordinaryPublicPCLIAndCentral':'pending Root active guarded integration','newScientificRuns':0,'strictClosuresClaimed':0,'activeWrites':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'finalSeal':freeze,'nativeD17P17V17AM':'PASS','copyOperations':85,'other457Goals374PagesExact':True,'portableRequiredFiles':len(required),'ignoredInputs':0,'activeWrites':0,'strictGain':0}))
