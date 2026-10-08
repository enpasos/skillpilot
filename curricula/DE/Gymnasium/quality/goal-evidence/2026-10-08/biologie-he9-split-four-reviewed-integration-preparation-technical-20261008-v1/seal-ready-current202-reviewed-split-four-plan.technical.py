# SPDX-License-Identifier: Apache-2.0
"""Concrete portable reviewed split integration; only inactive own paths written."""
from pathlib import Path
from datetime import datetime,timezone
import copy,hashlib,json,os,subprocess
R=Path.cwd();D=Path(__file__).resolve().parent;REQUIRED={}
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
rel=lambda p:str(Path(p).relative_to(R))
def bind(p):
 p=Path(p);b={'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size};REQUIRED[b['path']]=b;return b
def read(p):bind(p);return json.loads(Path(p).read_text())
def verify(b):
 p=R/b['path'];assert sha(p)==b['sha256'].removeprefix('sha256:'),(p,'digest drift')
 if 'bytes'in b:assert p.stat().st_size==b['bytes']
 return bind(p)
def put(name,value):
 p=D/name;p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x')as f:f.write((value if isinstance(value,str)else json.dumps(value,ensure_ascii=False,indent=2))+'\n')
 return bind(p)
g=read(D/'checks/genuine-current-four-pair-ready.technical.json');ids=g['selectedGoalIds'];children=g['newChildGoalIds'];companions=g['contextCompanionGoalIds'];old=g['oldStableParentId'];A=R/g['actualSourceAuthor']
for b in list(g['beforeBindings'].values())+g['protectedOtherFiles']:verify(b)
for name in ['initial-current202-genuine-pair-declared-inputs.technical.json','native-four-pair-D-declared-inputs.technical.json','paired-V4-P2-declared-inputs.technical.json','real-derived-atlas392-declared-inputs.v2.technical.json','actual-standard-derived-four-render-declared-inputs.technical.json']:
 for b in read(D/'checks'/name)['files']:verify(b)
for s in g['seals'].values():
 verify(s['seal']);j=read(R/s['seal']['path']);files=j.get('ownFiles',j.get('frozenFiles'));assert len(files)==s['actualExactFiles']
 for b in files:verify(b)
for b in g['independentFirstSeals'].values():verify(b)
t=read(D/'checks/affected-engineering-terminals.actual.json');assert t['allActualExit0']and len(t['terminals'])==6 and all(x['exitCode']==0 for x in t['terminals'])
assert read(D/'checks/actual-standard-derived-four-physical-render-scale1400.exit.actual.json')['exitCode']==0
pixel=read(D/'checks/actual-native-four-derived-vs-reviewed-whole-pixels.technical.json');assert pixel['onlyFooterTechnicalDigestPixelsDifferent']and len(pixel['pages'])==4
link=read(D/'checks/actual-standard-derived-four-native-render-links.technical.json');assert link['allLocalFragmentsResolve']and link['brokenLocalFragmentCount']==0
qaProof=read(D/'checks/paired-V4-P2-native-schema-current-raster.actual.technical.json');assert qaProof['oldQAWholeRowsKeptExact']==388 and qaProof['oldQAHumanRowsKeptExact']==390
scopes=read(D/'checks/real-derived-atlas392-31-reviewed-scopes-current-four-exact.technical.json');assert len(scopes['scopes'])==31 and sum(r['delta']==1 for r in scopes['scopes'])==23 and sum(r['delta']==0 for r in scopes['scopes'])==8
for p in [A/'checks/current-page-position-only-exact-historical-references-and-subset-proof.technical.json',A/'checks/current-child-legacy-readonly-conditioned-exact-adoption.actual.json']:bind(p)
# Author image publicRoot aliases are actual portable inputs, not absolute caches.
for gid in ids:
 p=A/f'assets/goal-visualizations/biologie/{gid}/{gid}.png';bind(p)
 for folder in ['curricula/DE/Gymnasium/visualizations','app/public/assets/goal-visualizations','backend/src/main/resources/static/assets/goal-visualizations']:
  q=R/f'{folder}/biologie/{gid}/{gid}.png'
  if gid in companions:assert q.exists()and sha(q)==sha(p);bind(q)
# Actual source generator inputs, with raw source download paths kept metadata-only.
atlasConfig=read(D/'before/atlasInputs.json');mapping_guards=[]
for path in atlasConfig['mappingPaths']:
 m=read(R/path);mapping_guards.append(bind(R/path));mapping_guards.append(bind(R/m['sourceExtractionPath']))
for path in [atlasConfig['durationModelPolicyPath'],'app/scripts/goalBookSourceAtlasInputs.ts','app/scripts/buildGoalBookSourceAtlasInputs.ts','app/scripts/goalVisualizationQaModel.ts','app/scripts/generateGoalVisualizationQaLedgers.ts','app/scripts/goalBookModel.ts','app/scripts/goalBookRenderer.ts','app/scripts/reportDeepUnderstandingRollout.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/validateGoalDescriptionDualRoundResolution.ts']:
 bind(R/path)
# Biology-only registry merge: actual previous context owner is superseded for
# exactly two genuine context companions; their existing P remains operative.
registry=read(D/'before/registry.json');bio=next(s for s in registry['subjects']if s['subject']=='biologie');oldbio=copy.deepcopy(bio)
Dpath=rel(D/'native-d-four/resolution-index.json');Ppath=rel(D/'positive/current2.future-active.config.json')
assert Dpath not in bio['resolutionIndexPaths']and Ppath not in bio['positiveEvidenceConfigPaths']
sup=[]
for gid in companions:
 operative=[]
 for path in bio['resolutionIndexPaths']:
  ix=read(R/path)
  resolutions=ix.get('resolutions',[])
  for row in resolutions:
   if row['goalId']!=gid:continue
   if any(s['goalId']==gid and s['supersededIndexPath']==path for s in bio.get('resolutionSupersessions',[])):continue
   if any(w['goalId']==gid and w['indexPath']==path for w in bio.get('resolutionWithdrawals',[])):continue
   operative.append(path)
 assert len(operative)==1,(gid,operative)
 expected='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-eighteen-reviewed-integration-preparation-technical-20261008-v1/original-eighteen-pair-native-d-eighteen/resolution-index.json'
 assert operative[0]==expected
 sup.append({'goalId':gid,'supersededIndexPath':operative[0],'replacementIndexPath':Dpath})
# The removed parent has no operative/deferred native owner to withdraw.
for path in bio['resolutionIndexPaths']:
 ix=read(R/path);assert old not in ix.get('batchGoalIds',[])and old not in ix.get('deferredGoalIds',[])and all(r.get('goalId')!=old for r in ix.get('resolutions',[]))
bio['resolutionIndexPaths'].append(Dpath);bio['positiveEvidenceConfigPaths'].append(Ppath);bio['resolutionSupersessions'].extend(sup)
assert all(bio[k]==v for k,v in oldbio.items()if k not in ['resolutionIndexPaths','positiveEvidenceConfigPaths','resolutionSupersessions'])
put('candidate/registry-biologie.future-entry.json',bio)
# Entire registry is a readable candidate only; Root must merge Biology entry.
put('candidate/registry.future-active.reviewable.json',registry)
put('candidate/ledger-preserve-only.technical.json',{'currentLedger':g['beforeBindings']['ledger'],'activeBatchConfigPaths':g['currentActualAllSevenChemistryClaims'],'action':'preserve_exact_no_write'})
# Real generated source views/nav are semantically the reviewed31 scopes.
# They intentionally use normal structure chapters/flat leaves. Do not install
# manual canonicalSubtree source-view previews and then call them generated.
B=R/'app/scripts/config/goal-books/inactive/biologie-he9-split-four-reviewed-20261008-v1';manifest=read(B/'atlas.sources.json');generated_ops=[];unchanged_generated=[]
pairs=[(B/'navigation.view.json',atlasConfig['navigationViewPath'])]+[(R/p,str(Path(atlasConfig['outputDirectory'])/Path(p).name))for p in manifest['sourcePaths']]
for src,target in pairs:
 current=bind(R/target);new=bind(src)
 if sha(src)==sha(R/target):unchanged_generated.append({'target':target,'binding':current});continue
 generated_ops.append({'target':target,'source':new,'expectedBefore':current,'origin':'Actual unchanged standard SourceAtlas generator392; technical chapter delta explicitly proven'})
assert len(generated_ops)==17 and len(unchanged_generated)==6
manual_ops=[v for v in g['views']if v['target'].startswith('curricula/')];assert len(manual_ops)==4
reviewed_view_ops=generated_ops+manual_ops;assert len(reviewed_view_ops)==21
future_manifest=copy.deepcopy(manifest);future_manifest['navigationViewPath']=atlasConfig['navigationViewPath'];future_manifest['sourcePaths']=[str(Path(atlasConfig['outputDirectory'])/Path(p).name)for p in manifest['sourcePaths']]
put('candidate/atlas.sources.current392-reviewed.future-active.json',future_manifest)
replacements=[{'target':g['beforeBindings'][key]['path'],'source':bind(D/source),'expectedBefore':g['beforeBindings'][key]}for key,source in [('canonical','candidate/canonical.current476-reviewed.future-active.json'),('kinds','candidate/semantic-kinds.current476-reviewed.future-active.json'),('qa','candidate/visualization-qa.current392-reviewed.future-active.json'),('atomicityConfig','candidate/A.current392-reviewed.future-active.config.json'),('memoryConfig','candidate/M.current392-reviewed.future-active.config.json'),('atlasInputs','candidate/atlas.inputs.current392-reviewed.future-active.json'),('atlasManifest','candidate/atlas.sources.current392-reviewed.future-active.json')]]
replacements+=reviewed_view_ops
assert len(replacements)==28
for item in replacements:verify(item['expectedBefore']);verify(item['source'])
assets=[]
for op in g['copies']:
 verify(op['source']);assert not(R/op['target']).exists();assets.append({'action':'copy_exact','source':op['source']['path'],'sourceSha256':'sha256:'+op['source']['sha256'],'target':op['target'],'expectedBefore':'missing'})
assert len(assets)==10
central=read(D/'before/current202-after-current-Chem-source-central.actual.json');subjects={s['subject']:s for s in central['subjects']}
assert [(subjects[s]['strictComplete'],subjects[s]['denominator'])for s in ['biologie','chemie','mathematik','physik']]==[(202,391),(173,378),(807,807),(478,478)]
assert not set(children).intersection(subjects['biologie']['currentGoalIds'])and set(companions)<=set(subjects['biologie']['strictCompleteGoalIds'])
plan={
 'schemaVersion':1,'role':'Inactive exact actual202/391-rebased genuine reviewed HE12 split-four integration; technical preparation only','subject':'biologie','selectedGoalIds':ids,'newChildGoalIds':children,'contextCompanionGoalIds':companions,'oldStableParentId':old,
 'beforeCanonicalSha256':g['beforeBindings']['canonical']['sha256'],'reviewedActiveReplacementFiles':replacements,'assetOperations':assets,'mergeOnlyBiologyRegistryEntryFrom':rel(D/'candidate/registry-biologie.future-entry.json'),'registryBefore':g['beforeBindings']['registry'],
 'registryMergeInstruction':'Append this exact D4 index and new-child P2 config to Biology only. Add exactly the two declared companion supersessions from HE17 current owner to D4. Preserve every existing index/positive config/withdrawal/other subject. Do not copy the whole candidate registry over current active registry. No parent historical resolution owner exists; no withdrawal invented.',
 'appendResolutionIndexPath':Dpath,'appendPositiveEvidenceConfigPath':Ppath,'appendResolutionSupersessions':sup,'genuineD4Index':bind(R/Dpath),'genuineP2Records':bind(D/'positive/current2.records.jsonl'),'genuineP2FutureActiveConfig':bind(R/Ppath),'P2ReviewedResourceTypes':['goal-visualization'],'P2HumanReviewRequired':True,
 'immutableAM392Versions':g['currentAMGuards'],'other390AMRowsByteExact':True,'priorActiveAMReviewPathsAreCurrentHE19Versions':True,'legacyHistoricalAMLedgersUnchanged':True,'newChildMemoryDecision':'Two genuine reviewed no_memory_needed rows, no new cards; existing17 cards and8 visibility scopes native check0',
 'beforeBindings':g['beforeBindings'],'protectedOtherFiles':g['protectedOtherFiles'],'mappingAndExtractionGuards':mapping_guards,'currentChemistryInFlightLedgerPreserve':rel(D/'candidate/ledger-preserve-only.technical.json'),'allSevenChemistryClaimsKeptExact':g['currentActualAllSevenChemistryClaims'],
 'protectedStrictGoalIds':{s:x['strictCompleteGoalIds']for s,x in subjects.items()},'protectedCurrentGoalIds':{s:x['currentGoalIds']for s,x in subjects.items()},'baselineCentralReport':bind(D/'before/current202-after-current-Chem-source-central.actual.json'),
 'currentStrictBiologyActual':202,'currentDenominatorBiologyActual':391,'potentialAfterRootAffectedCentral':'204/392','potentialNewScientificClosures':2,'potentialDenominatorDelta':1,'companionContextAdoptions':2,'newScienceOrRestoredStrictGainClaimedBeforeCentral':0,
 'other473WholeCanonicalBodiesExact':True,'classifierChangedOnlyParentAnd2Children':True,'other473SemanticKindRowsExact':True,'parentRetainsWholeDEENTextSourcesPrerequisitesAndStableId':True,'newLegacyMappingChildren':0,'canonicalSplitOriginGoalIdOnly':True,'splitFromCanonicalGoalIdIntroduced':False,'runtimeWrites':0,
 'other388WholeQARowsExact':True,'other390RetainedHumanRowsExact':True,'newChildHumanRowsUnapproved2':True,'pairedV4UsesOrdinaryAiNormalizerAndActualFinalDate':qaProof['reviewedAtFromActualFinalB'],'actualAandBSeals':g['seals'],'actualAandBFirstSeals':g['independentFirstSeals'],'actualReviewerRecordRunBytesExact':True,
 'actualSixAffectedChecks':t['terminals'],'actualSourceAtlas392Counts':{'published':392,'canonicalAtomic':392,'sourceViews':22,'unresolvedScopeDecisions':0,'omittedGoals':0},'realDerivedReviewedChangedViews21':reviewed_view_ops,'unchangedGeneratedViews6':unchanged_generated,
 'scopeProof31':bind(D/'checks/real-derived-atlas392-31-reviewed-scopes-current-four-exact.technical.json'),'positionOnlyCurrent81Proof':bind(A/'checks/current-page-position-only-exact-historical-references-and-subset-proof.technical.json'),'noHistoricalDRunOrPageHashRewritten':True,
 'technical2ChildChapterDelta':bind(D/'checks/real-derived-atlas392-exact-two-technical-chapter-deltas.v2.technical.json'),'actualFourNativeRenderLinks':bind(D/'checks/actual-standard-derived-four-native-render-links.technical.json'),'actualPixelBodies4':bind(D/'checks/actual-native-four-derived-vs-reviewed-whole-pixels.technical.json'),
 'rootBeforeApplyTechnicalAdoption':{'actualPagesToView':[rel(D/'actual-standard-derived-four/physical-pages-scale1400/actual-physical-page-4.png'),rel(D/'actual-standard-derived-four/physical-pages-scale1400/actual-physical-page-5.png')],'action':'Root must view the actual new full native pages and record exact title/breadcrumb/goal/chapter/href/relations/scope/image binding adoption. All four page bodies are pixel-exact; only book-digest footer pixels differ. This is technical binding adoption, not new science review or hash replacement. If any substantive didactic/context/source/image delta is found, keep affected targets HOLD for genuine targeted independent review.'},
 'mustRunAfterApply':[
  {'argv':['node','app/node_modules/tsx/dist/cli.mjs','app/scripts/buildGoalBookSourceAtlasInputs.ts','--config',g['beforeBindings']['atlasInputs']['path']],'purpose':'Actually regenerate active derived22 source views/navigation/manifest/source-projection.receipt at actual active476/kinds392; never copy the inactive receipt'},
  {'argv':['node','app/node_modules/tsx/dist/cli.mjs','app/scripts/buildGoalBookSourceAtlasInputs.ts','--config',g['beforeBindings']['atlasInputs']['path'],'--check'],'purpose':'Ordinary active SourceAtlas fresh receipt/output exact check'},
  {'argv':['node','app/node_modules/tsx/dist/cli.mjs','app/scripts/generateGoalVisualizationQaLedgers.ts','--subjects=biologie'],'purpose':'Ordinary actual installed392 QA normalization; assert other388 rows and390 human fields remain exact'},
  {'argv':['node','app/node_modules/tsx/dist/cli.mjs','app/scripts/generateGoalVisualizationQaLedgers.ts','--subjects=biologie','--check'],'purpose':'Ordinary QA freshness0 with actual reviewedAt/reviewer/hash bindings'},
  {'argv':['node','app/node_modules/tsx/dist/cli.mjs',rel(D/'check-current-reviewed-D4.technical.mts'),'--active'],'purpose':'Native actual current D4 schema/independent genuine campaign/resolution/current whole canonical0'},
  {'argv':['node','app/node_modules/tsx/dist/cli.mjs','app/scripts/positiveGoalEvidenceReview.ts','--mode=check','--config='+Ppath],'purpose':'Ordinary operative P2 CLI against actual active canonical/kinds/installed raster'},
  {'argv':['npm','--prefix','app','run','quality:semantic-atomicity:check','--','--config='+g['beforeBindings']['atomicityConfig']['path']],'purpose':'Native actual active immutable full392 atomicity0'},
  {'argv':['npm','--prefix','app','run','quality:memory-card-review:check','--','--config='+g['beforeBindings']['memoryConfig']['path']],'purpose':'Native actual active full392 memory/card/visibility0'},
  {'argv':['npm','--prefix','app','run','check:goal-visualization-assets'],'purpose':'Actual installed source/frontend/backend copies and public links'},
  {'argv':['npm','--prefix','app','run','quality:deep-understanding-rollout:check'],'purpose':'Terminal actual current strict D/P/A/M/V intersection and protected202+Chem173+Math807+Phys478 IDs; no count before actual0'}],
 'fullBuildAndLayerA':'Root must bundle complete required machine/build/dependentLayerA checks at stable integration; this preparation has not run full builds or claimed final M7.',
 'sourceScopeBoundary':'Original reviewed source mappings and whole official HE pages retained; children inherit reviewed parent applicability. No new direct all-country operator source approval or learner/practical performance claimed.',
 'portableNativeBundleContract':'Use native-d-four/bundle and actual-standard-derived-four/bundle committable whole PDF/HTML; old raw ignored renderer observations are nonoperative. Serve ordinary HTML /assets URLs under exact original AUTHOR publicRoot with4 contained portable aliases; standalone file:// relocation is not claimed.',
 'sourceDocumentDownloadPaths':'Declared sourceDocumentSnapshots bind official raw PDF/HTML digests as metadata. Offline generator needs committed mappings/extractions/snapshots, not ignored external/raw downloads. Actual present caches were checked where present; do not force-add caches.',
 'separateHumanApprovalAndTrial':True,'humanApprovalClaim':False,'humanTrialClaim':False,'activeWrites':0,'strictGainClaimed':0}
planbind=put('ready-root-reviewed-guarded-integration-plan.technical.json',plan)
put('TECHNICAL-READINESS.md', '# HE12: geprüfte Aufteilung mit zwei neuen Biologiezielen\n\nAktuelle tatsächliche Basis: Biologie202/391, Chemie173/378, Mathematik807/807 und Physik478/478 nach der integrierten Chem8-Quellenkorrektur. Zwei neue Ziele und zwei echte Kontextbegleiter besitzen eine vollständig erhaltene, unabhängig blind erstversiegelte A/B-Paarung für ganze D/P/V. Nur die neuen zwei Kinder erhalten operative P2; vorhandene Begleiter-P-Profile bleiben unverändert. AI-Kandidaten bleiben needs_human_review, E1/G1. Menschliche Freigabe und Erprobung bleiben offen.\n\nSechs betroffene echte Engineering-Checks sind0: nativeD4, ganze aktuelle P2/V4-PNG-Bindung, A392, M392, Standard-Atlas392 und31Scopeprüfungen. Der unveränderte Standardgenerator erzeugt392/392,22SourceViews,0ungeklärteScopes und0Omissions. Sein Navigationsbaum hat ausschließlich für die zwei neuen Kinder andere interne Kapitelkennungen/pageFingerprints als der tatsächlich geprüfte canonicalSubtree-Kandidat. Vier neue ganze native Seiten sind gerendert; ihre didaktischen Körper sind bei identischem scale-to1400 pixelgenau gleich. Alle lokalen HTML-Anker lösen auf. Nur technische Buch-Digest-Footerpixel unterscheiden sich. Root muss die neuen tatsächlichen Seiten4/5 und deren Bindungen ansehen und als technische Adoption dokumentieren; kein alter Reviewhash wird angepasst oder als neuer Fachreview ausgegeben.\n\nDer konkrete Plan enthält28 geprüfte Datei-Ersetzungen (7Konfig-/Datendateien,21Views),10exakte neue Asset/Prompt/Herkunft-Kopien und eine ausschließlich Biologie betreffende Registry-ErweiterungD4/P2 mit zwei eng begrenzten Begleiter-Supersessions. Aktuelle473andere WholeGoals und Klassifizierungsrows,390andere A/M-Zeilen,388andere ganze QA-Rows,390bestehende Human-Rows und die aktuelle Chemieintegration/7Claims bleiben geschützt. Neue immutable A/M392-Versionen lesen die tatsächlich aktive neue HE19-Version. Bestehende Bilder der beiden Begleiter bleiben bytegenau erhalten.\n\nDie erste strengere Atlas-Seitenidentitätsprüfung zeigte die echten2Kapitel-Deltas und bleibt als Diagnose erhalten. Der erste Renderhelper mit falschem Model-book-Feldnamen blieb ohne Ausgabe und wurde in einer separaten v2 korrekt auf book.id/title gebunden.110/120DPI waren unpassende Rastervergleichsparameter und erzeugten keine Gleichheitsbehauptung; die irrtümliche120DPI-Metadatenannahme ist ausdrücklich im finalen Pixelbeleg korrigiert. Der tatsächliche erfolgreiche Vergleich verwendet genau den ursprünglichen scale-to1400. Diagnosehistorie bleibt unverändert.\n\nKeine aktiven Dateien wurden verändert. Erwartete204/392 und möglicher+2fachlicher Nettozuwachs sind ausschließlich Potenzial bis zu Roots terminalem zentralem Check; es wird kein wiederhergestellter Abschluss behauptet. Vollständige Builds/LayerA bleiben Roots stabilem Integrationsstand vorbehalten.\n')
# Every own nonignored committable artifact and authorized inactive generator file.
nonoperative=[]
for base in [D,B]:
 for p in sorted(base.rglob('*')):
  if not p.is_file():continue
  if p.suffix=='.json':json.loads(p.read_text())
  elif p.suffix=='.jsonl':
   for line in p.read_text().splitlines():json.loads(line)
  ignored=subprocess.run(['git','check-ignore','--no-index',str(p.relative_to(R))],capture_output=True,text=True)
  assert ignored.returncode in [0,1]
  if ignored.returncode==0:
   assert p in [D/'actual-standard-derived-four/book.pdf',D/'actual-standard-derived-four/book.html'],p
   nonoperative.append({'path':rel(p),'role':'Ignored raw renderer observation; operative byte-exact bundle copies govern portability'})
  else:bind(p)
# Remove only old raw render observations from historic declared references.
for path in list(REQUIRED):
 p=R/path
 ignored=subprocess.run(['git','check-ignore','--no-index',path],capture_output=True,text=True)
 if ignored.returncode==0:
  # This is sourcePath provenance in render receipts, not artifactAccessPath.
  assert p.name in ['book.pdf','book.html']and '/bundle/'not in path,path
  nonoperative.append({'path':path,'role':'Historical raw renderer sourcePath provenance only; valid bundle artifactAccessPath exists'})
  del REQUIRED[path]
assert all((R/p).exists()for p in REQUIRED)
ignore=subprocess.run(['git','check-ignore','--no-index','--stdin'],input='\n'.join(REQUIRED)+'\n',capture_output=True,text=True);assert ignore.returncode in [0,1]and not ignore.stdout.strip(),ignore.stdout
links=[]
for path in list(REQUIRED):
 p=R/path
 if p.is_symlink():
  target=os.readlink(p);assert not os.path.isabs(target);q=p.resolve(strict=True);assert q.is_relative_to(R)and rel(q)in REQUIRED,p;links.append({'path':path,'relativeTarget':target,'target':bind(q),'broken':False})
portable=put('checks/final-required-input-portability-and-symlinks.actual.technical.json',{'checkedAt':datetime.now(timezone.utc).isoformat(),'requiredFiles':list(REQUIRED.values()),'nonoperativeRawRendererPaths':nonoperative,'sourceDownloadMetadataOnlyPaths':atlasConfig['sourceDocumentSnapshots'],'actualGitCheckIgnoreExit':ignore.returncode,'ignoredRequiredFiles':[],'actualContainedRelativeSymlinks':links,'brokenRequiredSymlinks':0,'allOwnAndAuthorizedInactiveJSONJSONLParse':True,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False})
ownfiles=[p for p in sorted(D.rglob('*'))if p.is_file()and rel(p)not in {n['path']for n in nonoperative}]
freeze=put('technical-reviewed-current202-split-four.final.freeze.json',{'schemaVersion':1,'sealedAt':datetime.now(timezone.utc).isoformat(),'kind':'Inactive exact202/391 current-Chem8 guarded genuine reviewed HE12 integration preparation','ownFiles':[bind(p)for p in ownfiles],'authorizedInactiveAtlasFiles':[bind(p)for p in sorted(B.rglob('*'))if p.is_file()],'readyPlan':planbind,'requiredPortableInputGuard':portable,'actualGenuineAandBSeals':g['seals'],'actualGenuineAandBFirstSeals':g['independentFirstSeals'],'nativeAffectedCheckCount6':True,'nativeActualExit0':True,'actualPixelBodies4SameAndLocalLinks0Broken':True,'rootActualNewPagesAndTechnicalAdoptionPending':True,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'readyPlan':planbind['path'],'finalSeal':freeze['path'],'finalSealSha256':freeze['sha256'],'requiredPortableFiles':len(REQUIRED),'ignoredRequired':0,'brokenSymlinks':0,'assetCopies':10,'replacementFiles':28,'trueD4andP2':'PASS actual0','potentialAfterRootCentral':'204/392','activeWrites':0,'strictGainClaimed':0}))
