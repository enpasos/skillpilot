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
plan=read(OWN/'candidate/twenty-exact-resource-link-patches.guarded.json');ready=read(OWN/'checks/ready-native-current20-profile-visual-and-whole391-bindings.technical.json');seals=ready['seals'];ids=plan['selectedGoalIds'];selected=set(ids)
for k in ['canonical','kinds','qa']:
 b=plan['beforeBindings'][k];assert digest(ROOT/b['path'])==b['sha256']
reg=read(OWN/'before/registry.json');bio=next(s for s in reg['subjects'] if s['subject']=='biologie');original=copy.deepcopy(bio)
for p in bio['resolutionIndexPaths']:
 old=read(ROOT/p);covered=set(old.get('batchGoalIds',[]))|{r['goalId'] for r in old.get('resolutions',[])};assert not selected & covered, f'Previously reviewed D requires targeted supersession {p}'
index=OWN/'native-d-twenty/resolution-index.json';assert set(read(index)['batchGoalIds'])==selected
bio['resolutionIndexPaths'].append(REL(index));bio['positiveEvidenceConfigPaths'].append(REL(OWN/'positive/current20.future-active.config.json'))
assert bio.get('resolutionSupersessions')==original.get('resolutionSupersessions')
for k in original:
 if k not in ['resolutionIndexPaths','positiveEvidenceConfigPaths']:assert bio[k]==original[k]
write(OWN/'candidate/registry-biologie.future-entry.json',bio)
manifest=ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-human20-image-author-continuation-root-20261007-v2/selected-twenty-author-images.exact.json';images=read(manifest)['images'];assert len(images)==20
operations=[]
for i in images:
 gid=i['goalId'];rows=next(r for r in plan['rows'] if r['goalId']==gid);png=ROOT/i['path'];prompt=ROOT/i['promptPath'];genprov=ROOT/i['toolProvenancePath']
 assert digest(png)=='sha256:'+i['sha256'].removeprefix('sha256:')
 b=next(r for r in read(OWN/'candidate/exact-selected-asset-provenance-and-paired-machine-approval.technical.json')['rows'] if r['goalId']==gid)['sourceIndependentBAssetRow']
 assert digest(prompt)=='sha256:'+b['selectedOriginalPNG'].get('promptSha256',digest(prompt).removeprefix('sha256:'))
 width=b['actualWidthCaptures'][0]['measured']['naturalWidth'];height=b['actualWidthCaptures'][0]['measured']['naturalHeight']
 prov={'status':'exact selected raster with two genuine independent current machine judgments; no human approval or trial','goalId':gid,'provider':i['provider'],'servingModel':i['servingModel'],'selectedRasterPath':i['path'],'selectedRasterSha256':digest(png),'selectedExactPrompt':bind(prompt),'originalGenerationProvenance':bind(genprov),'originalGenerationMetadata':read(genprov),'canonicalAssetPath':rows['futureCanonicalPNG'],'publicAssetPath':rows['futureAppPNG'],'backendAssetPath':rows['futureBackendPNG'],'independentScientificMachineSeals':seals,'actualBothIndependentViews':['full','Chromium360','Chromium680','native-PDF-page'],'width':width,'height':height,'format':'PNG','selectedCandidateVersion':i['version'],'altDe':i['altDe'],'license':'CC-BY-4.0','attribution':'SkillPilot — own didactic content, AI-generated and SkillPilot-curated','originalScienceWholeProfiles':'author/science-correction-v2, forty whole bilingual model cases unchanged','historicalCarbonylFirstHOLDPreserved':True,'sameUnchangedPixelCarbonylFollowup':True,'deviceAcceptanceClaim':False,'humanApproval':False,'humanTrial':False}

 provpath=OWN/'asset-provenance'/f'{gid}.generation.provenance.json';write(provpath,prov)
 for target in [rows['futureCanonicalPNG'],rows['futureAppPNG'],rows['futureBackendPNG']]:operations.append({'action':'copy_exact','source':REL(png),'sourceSha256':digest(png),'target':target})
 for src,target in [(prompt,str(Path(rows['futureCanonicalPNG']).parent/'prompt.de.md')),(provpath,str(Path(rows['futureCanonicalPNG']).parent/'generation.provenance.json'))]:operations.append({'action':'copy_exact','source':REL(src),'sourceSha256':digest(src),'target':target})
assert len(operations)==100;assert len({op['target'] for op in operations})==100
for op in operations:assert not (ROOT/op['target']).exists(),'Newly added assets unexpectedly exist; rebase needed'
ledger=read(OWN/'before/ledger.json');assert len(ledger['activeBatchConfigPaths'])==7
ledgerplan={'role':'retain exact latest unrelated Chemistry in-flight packages; remove this Bio12 claim only if Root registered it and actual central integration completes','ledgerPath':plan['beforeBindings']['ledger']['path'],'seenLedgerDigest':plan['beforeBindings']['ledger']['sha256'],'removeOnlyActiveBatchConfigPaths':[REL(OWN.parent/'biologie-human20-current391-author-v1/native20.neutral.batch.config.json')],'expectedRemovedBatchGoalIds':sorted(ids),'activeHuman20ClaimCurrentlyExists':False,'allOtherPathsMustBePreservedFromLatestLedger':True,'existingSevenChemistryClaimsRetained':ledger['activeBatchConfigPaths'],'preparedFullLedgerReplacement':False,'activeWrites':0}
write(OWN/'candidate/ledger-human20-only-removal.partial-plan.json',ledgerplan)
sourceboundary={'role':'durable source references and real independent bounded science judgments retained; own model cases do not claim all-country source closure','operativeWholeAuthorScienceV2':bind(OWN.parent/'biologie-human20-current391-author-v1/science-correction-v2/P20.current-text-preimage.author-targeted-v2.review.jsonl'),'actualSourceAndContextRetentionReceiptA':bind(OWN.parent/'biologie-human20-final-raster-native-independent-a-20261007-v1/actual-current-D-P-context-source-retention.independent-a.receipt.json'),'exactAFirstSeal':seals['AFirst']['seal'],'exactBFirstSeal':seals['B']['seal'],'ordinaryUninstalledPublicCLIDiagnosticPreserved':bind(OWN.parent/'biologie-human20-final-raster-native-independent-a-20261007-v1/P20.uninstalled-public-CLI-diagnosis.independent-a.actual.json'),'fullOfficialRawTextIsRuntimePResource':False,'fullOfficialRawTextIsPublicationInput':False,'noNewSourceApprovalOrCoverageClaim':True,'wholeFortyBilingualOwnModelCasesUnchanged':True,'allScientificDissentAndPerformanceLimitsRetained':True,'historicalReviewSealsUnchanged':True,'humanApproval':False}
write(OWN/'checks/portable-source-cache-boundary.technical.json',sourceboundary)

result={'role':'inactive exact reviewed Human20 Root-only integration plan','subject':'biologie','beforeCanonicalSha256':plan['beforeBindings']['canonical']['sha256'],'futureCanonicalSource':REL(OWN/'candidate/canonical.future-active.json'),'futureCanonicalSha256':digest(OWN/'candidate/canonical.future-active.json'),'replaceQaFrom':REL(OWN/'candidate/visualization-qa.future-active.json'),'mergeOnlyBiologyRegistryEntryFrom':REL(OWN/'candidate/registry-biologie.future-entry.json'),'registryMergeInstruction':'Append only the one new D20 index and one P20 config to the latest Biology entry; preserve every unrelated subject, property, old index, supersession and concurrent addition. No supersession of previously unreviewed selected20.','ledgerPartialPatch':REL(OWN/'candidate/ledger-human20-only-removal.partial-plan.json'),'assetOperations':operations,'beforeBindings':plan['beforeBindings'],'protectedStrictGoalIds':plan['protectedStrictGoalIds'],'strictBaselineReport':plan['strictBaselineReport'],'exactOtherWholeGoals':454,'exactOtherCurrentPages':371,'semanticKindsUnchanged':True,'atomicityRowsUnchanged':True,'memoryRowsAndCardsAndVisibilityUnchanged':True,'expectedPotentialNewCurricularClosures':20,'wholeCountrySourceClosureClaimed':False,'newScientificClosureClaimBeforeCentralCheck':0,'restoredBindingGainClaimBeforeCentralCheck':0,'mustRunAfterApply':['node app/node_modules/tsx/dist/cli.mjs app/scripts/positiveGoalEvidenceReview.ts --config='+REL(OWN/'positive/current20.future-active.config.json')+' --mode=check','node app/node_modules/tsx/dist/cli.mjs '+REL(OWN/'check-current-active-D20-after-root-apply.technical.mts'),'goal-visualization-assets exact canonical/frontend/backend/prompt/provenance check','central current strict five-gate check and all nine protected maturity floors'],'separateHumanApprovalAndTrial':'remain open and never implied','sourceCacheBoundary':REL(OWN/'checks/portable-source-cache-boundary.technical.json'),'activeWrites':0}
write(OWN/'ready-root-reviewed-guarded-integration-plan.technical.json',result)
files=[]
for p in sorted(OWN.rglob('*')):
 if p.is_file() and p.name!='technical-preparation.final.freeze.json':files.append(bind(p))
write(OWN/'technical-preparation.final.freeze.json',{'artifactKind':'inactive Root-only exact reviewed Human20 technical integration preparation','frozenFiles':files,'currentCanonicalGuard':plan['beforeBindings']['canonical'],'futureCanonicalDigest':digest(OWN/'candidate/canonical.future-active.json'),'realOriginalIndependentSeals':seals,'nativeD20P20V20Current391':'PASS','actualRetainedA20M20':bind(OWN/'checks/retained-current-A20-M20.inactive-native.actual.json'),'actualCopyOperations':100,'exactOther454WholeGoals':True,'exactOther371Pages':True,'retained134StrictGoals':plan['protectedStrictGoalIds'],'newReviewerRunClaimed':False,'historicalArtifactsChanged':False,'activeWrites':0,'strictClosuresClaimed':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'finalTechnicalSeal':bind(OWN/'technical-preparation.final.freeze.json'),'actualCopyOperations':100,'nativeD20P20V20Current391':'PASS','actualRetainedA20M20':bind(OWN/'checks/retained-current-A20-M20.inactive-native.actual.json'),'activeWrites':0}))
