# SPDX-License-Identifier: Apache-2.0
# Inactive reviewed package assembly; not a scientific review or active integration.
from pathlib import Path
import json,hashlib,copy,datetime
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent
REL=lambda p:str(Path(p).relative_to(ROOT))
def digest(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def bind(p):return {'path':REL(p),'sha256':digest(p),'bytes':Path(p).stat().st_size}
def read(p):return json.loads(Path(p).read_text())
def write(p,o):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);data=(json.dumps(o,ensure_ascii=False,indent=2)+'\n').encode()
 if p.exists():assert p.read_bytes()==data, f'Existing inactive artifact differs: {p}'
 else:
  with p.open('xb') as f:f.write(data)
 return bind(p)
plan=read(OWN/'candidate/twelve-exact-resource-link-patches.guarded.json');ready=read(OWN/'checks/ready-native-current12-profile-visual-and-whole391-bindings.technical.json');seals=ready['seals'];ids=plan['selectedGoalIds'];selected=set(ids)
for k in ['canonical','kinds','qa']:
 b=plan['beforeBindings'][k];assert digest(ROOT/b['path'])==b['sha256']
reg=read(OWN/'before/registry.json');bio=next(s for s in reg['subjects'] if s['subject']=='biologie');original=copy.deepcopy(bio)
for p in bio['resolutionIndexPaths']:
 old=read(ROOT/p);covered=set(old.get('batchGoalIds',[]))|{r['goalId'] for r in old.get('resolutions',[])};assert not selected & covered, f'Previously reviewed D requires targeted supersession {p}'
index=OWN/'native-d-twelve/resolution-index.json';assert set(read(index)['batchGoalIds'])==selected
bio['resolutionIndexPaths'].append(REL(index));bio['positiveEvidenceConfigPaths'].append(REL(OWN/'positive/current12.future-active.config.json'))
assert bio.get('resolutionSupersessions')==original.get('resolutionSupersessions')
for k in original:
 if k not in ['resolutionIndexPaths','positiveEvidenceConfigPaths']:assert bio[k]==original[k]
write(OWN/'candidate/registry-biologie.future-entry.json',bio)
manifest=ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-ecology20b-current391-image-author-root-20261007-v1/selected-twelve-raster-inputs.author-handoff.frozen.json';images=read(manifest)['images'];assert len(images)==12
operations=[]
for i in images:
 gid=i['goalId'];rows=next(r for r in plan['rows'] if r['goalId']==gid);png=ROOT/i['path'];prompt=ROOT/i['promptPath'];genprov=ROOT/i['provenancePath']
 assert digest(png)=='sha256:'+i['sha256'].removeprefix('sha256:');assert digest(prompt)=='sha256:'+i['promptSha256'].removeprefix('sha256:');assert digest(genprov)=='sha256:'+i['provenanceSha256'].removeprefix('sha256:')
 prov={'status':'exact selected raster with two genuine independent current machine approvals; no human approval or trial','goalId':gid,'provider':i['provider'],'selectedRasterPath':i['path'],'selectedRasterSha256':digest(png),'selectedExactPromptPath':i['promptPath'],'selectedExactPromptSha256':digest(prompt),'originalGenerationProvenance':bind(genprov),'originalGenerationMetadata':read(genprov),'canonicalAssetPath':rows['futureCanonicalPNG'],'publicAssetPath':rows['futureAppPNG'],'backendAssetPath':rows['futureBackendPNG'],'independentScientificMachineSeals':seals,'actualBothIndependentViews':['full','360','680','native-PDF-page'],'width':i['width'],'height':i['height'],'format':'PNG','selectedCandidateVersion':i['selectedCandidateVersion'],'altDe':i['altDe'],'altEn':i['altEn'],'license':'CC-BY-4.0','attribution':'SkillPilot — own didactic content, AI-generated and SkillPilot-curated','humanApproval':False,'humanTrial':False,'actualSourceScopeLocatorPrecision':{'ordinal13':'Bayern B12 GA Lernbereich 4 Verhaltensökologie; the original generation prompt is retained even where it used obsolete 4.2 shorthand','ordinal14':'BY13 GA/EA 4.2 explicitly includes greenhouse effects in costs/management; EA 4.3 adds biome/climate/biodiversity; GA 4.3 global investigation/values. Course roles are distinct; no universal EA demand.'}.get('ordinal'+str(i['ordinal']))}
 provpath=OWN/'asset-provenance'/f'{gid}.generation.provenance.json';write(provpath,prov)
 for target in [rows['futureCanonicalPNG'],rows['futureAppPNG'],rows['futureBackendPNG']]:operations.append({'action':'copy_exact','source':REL(png),'sourceSha256':digest(png),'target':target})
 for src,target in [(prompt,str(Path(rows['futureCanonicalPNG']).parent/'prompt.de.md')),(provpath,str(Path(rows['futureCanonicalPNG']).parent/'generation.provenance.json'))]:operations.append({'action':'copy_exact','source':REL(src),'sourceSha256':digest(src),'target':target})
assert len(operations)==60;assert len({op['target'] for op in operations})==60
for op in operations:assert not (ROOT/op['target']).exists(),'Newly added assets unexpectedly exist; rebase needed'
ledger=read(OWN/'before/ledger.json');assert len(ledger['activeBatchConfigPaths'])==7
ledgerplan={'role':'retain exact latest unrelated Chemistry in-flight packages; remove this Bio12 claim only if Root registered it and actual central integration completes','ledgerPath':plan['beforeBindings']['ledger']['path'],'seenLedgerDigest':plan['beforeBindings']['ledger']['sha256'],'removeOnlyActiveBatchConfigPaths':[REL(OWN.parent/'biologie-ecology20b-current391-author-v1/native12.source-bounded.neutral.batch.config.json')],'expectedRemovedBatchGoalIds':sorted(ids),'allOtherPathsMustBePreservedFromLatestLedger':True,'existingSevenChemistryClaimsRetained':ledger['activeBatchConfigPaths'],'preparedFullLedgerReplacement':False,'activeWrites':0}
write(OWN/'candidate/ledger-ecology20b-twelve-only-removal.partial-plan.json',ledgerplan)
sourceboundary={'role':'durable source references and actual read receipts; full third-party primary captures remain local review cache','actualWholeSourceReadingReceipt':bind(OWN.parent/'biologie-ecology20b-current391-author-v1/nine-actual-primary-bounded-reading-and-eight-source-HOLD.author.receipt.json'),'operationalSourceRoleV3Seal':bind(OWN.parent/'biologie-ecology20b-current391-author-v1/source-locator-precision-v3/source-role-only.followup.freeze.json'),'fullOfficialRawTextIsRuntimePResource':False,'fullOfficialRawTextIsPublicationInput':False,'eightExcludedSourceHoldsRemainOpen':True,'licensedOwnModelMaterialsOnly':True,'historicalReviewSealsUnchanged':True}
write(OWN/'checks/portable-source-cache-boundary.technical.json',sourceboundary)
result={'role':'inactive exact reviewed Ecology20b twelve Root-only integration plan','subject':'biologie','beforeCanonicalSha256':plan['beforeBindings']['canonical']['sha256'],'futureCanonicalSource':REL(OWN/'candidate/canonical.future-active.json'),'futureCanonicalSha256':digest(OWN/'candidate/canonical.future-active.json'),'replaceQaFrom':REL(OWN/'candidate/visualization-qa.future-active.json'),'mergeOnlyBiologyRegistryEntryFrom':REL(OWN/'candidate/registry-biologie.future-entry.json'),'registryMergeInstruction':'Append only the one new D12 index and one P12 config to the latest Biology entry; preserve every unrelated subject, property, old index, supersession and concurrent addition. No supersession of previously unreviewed selected12.','ledgerPartialPatch':REL(OWN/'candidate/ledger-ecology20b-twelve-only-removal.partial-plan.json'),'assetOperations':operations,'beforeBindings':plan['beforeBindings'],'protectedStrictGoalIds':plan['protectedStrictGoalIds'],'strictBaselineReport':plan['strictBaselineReport'],'exactOtherWholeGoals':462,'exactOtherCurrentPages':379,'semanticKindsUnchanged':True,'atomicityRowsUnchanged':True,'memoryRowsAndCardsAndVisibilityUnchanged':True,'expectedPotentialNewCurricularClosures':12,'eightSourceHoldsRemainOpen':True,'newScientificClosureClaimBeforeCentralCheck':0,'restoredBindingGainClaimBeforeCentralCheck':0,'mustRunAfterApply':['targeted native P12 public-file validation','targeted native D12 current-canonical validation','goal-visualization-assets exact canonical/frontend/backend/prompt/provenance check','central current strict five-gate check and protected maturity floors'],'separateHumanApprovalAndTrial':'remain open and never implied','sourceCacheBoundary':REL(OWN/'checks/portable-source-cache-boundary.technical.json'),'activeWrites':0}
write(OWN/'ready-root-reviewed-guarded-integration-plan.technical.json',result)
files=[]
for p in sorted(OWN.rglob('*')):
 if p.is_file() and p.name!='technical-preparation.final.freeze.json':files.append(bind(p))
write(OWN/'technical-preparation.final.freeze.json',{'artifactKind':'inactive Root-only exact reviewed Ecology20b twelve technical integration preparation','frozenFiles':files,'currentCanonicalGuard':plan['beforeBindings']['canonical'],'futureCanonicalDigest':digest(OWN/'candidate/canonical.future-active.json'),'realOriginalIndependentSeals':seals,'nativeD12P12V12Current391':'PASS','actualCopyOperations':60,'exactOther462WholeGoals':True,'exactOther379Pages':True,'retained122StrictGoals':plan['protectedStrictGoalIds'],'newReviewerRunClaimed':False,'historicalArtifactsChanged':False,'activeWrites':0,'strictClosuresClaimed':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'finalTechnicalSeal':bind(OWN/'technical-preparation.final.freeze.json'),'actualCopyOperations':60,'nativeD12P12V12Current391':'PASS','activeWrites':0}))
