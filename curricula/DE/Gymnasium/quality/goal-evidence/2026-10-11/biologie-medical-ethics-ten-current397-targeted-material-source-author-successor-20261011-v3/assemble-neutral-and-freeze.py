# SPDX-License-Identifier: Apache-2.0
"""Whole current neutral author inputs. Captures and bindings do not create review votes."""
import copy, datetime, hashlib, json, shutil, subprocess
from pathlib import Path
R=Path.cwd();P=Path(__file__).resolve().parent;PR=P.relative_to(R)
E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11'
OLD=E/'biologie-medical-ethics-ten-current397-author-successor-20261011-v2'
BASE=E/'biologie-nature-eight-current397-targeted-material-source-author-successor-root-20261011-v2'
C=R/'tmp/medical10-current397-v3-normal-private-capsule'
NOW=datetime.datetime.now(datetime.timezone.utc).isoformat()
def load(p):return json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def ref(p):return {'path':str(p.relative_to(R)),'bytes':p.stat().st_size,'sha256':sha(p)}
def put(name,x):
 p=P/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return ref(p)
def cp(src,name):
 p=P/name;p.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,p);assert sha(p)==sha(src);return ref(p)
ids=load(P/'FIRST.actual-neutral-medical10-continuation-author-inputs.json')['goalIds']
land=load(P/'candidate/whole484-current397-medical10.author.inactive.json');goals={g['id']:g for g in land['goals']}
model=load(P/'native/whole397-medical10.normal-model.actual.json');pages={g['goalId']:g for g in model['pages']}
delta=load(P/'checks/current397-whole-normal-page-deltas.actual.json');union=delta['affectedNativeUnion'];assert len(union)==11
assert set(union)-set(ids)=={'440854be-7f06-5678-91cb-ba8dcab56959'}
atlas=load(P/'sources/normal397-medical10.author.inputs.json')
pairrows=[];materials=[]
for i,mpath in enumerate(atlas['mappingPaths']):
 mp=R/mpath;m=load(mp);ep=R/m['sourceExtractionPath'];ex=load(ep);sg={s['id']:s for s in ex['sourceGoals']}
 pairrows.append({'ordinal':i,'wholeMapping':ref(mp),'wholeExtraction':ref(ep),'changedFromRoot8v2':i in [3,6]})
 for dec in m['decisions']:
  targets=set(dec.get('canonicalGoalIds',[])); hit=targets&set(union)
  if not hit and dec['sourceGoalId']!='550a30ba-48e0-5822-8733-38683473e37e':continue
  sid=dec['sourceGoalId'];s=sg[sid]
  partners=set(targets)
  for edge in m['mappings']:
   if edge.get('legacyGoalId')==sid:partners.add(edge['canonicalGoalId'])
  materials.append({'ordinal':i,'mappingPath':mpath,'sourceExtractionPath':m['sourceExtractionPath'],'wholeDecision':dec,'wholeSourceRow':s,'wholeSourceDocument':ex['sourceDocument'],'wholeSourceDocuments':ex.get('sourceDocuments',[]),'nativeAffectedGoalIds':sorted(hit),'allPartnerGoalIds':sorted(partners),'allWholeCanonicalPartners':[goals[g] for g in sorted(partners) if g in goals],'sourceUnionApproval':False})
put('sources/whole31-exact-source-carriers-and62-bindings.neutral.json',{'role':'Complete current31 source pairs; only bounded HE8 source rows newly authored','wholePairs':pairrows,'fullFileBindings':62,'allOtherTwentyNineMappingExtractionPairsExactToRoot8v2':True,'BY550ActualObligationStillNeedsCanonicalMapping':True,'sourceUnionApproval':False})
put('sources/whole-source-decisions-targets-and-partners.neutral.json',{'role':'Complete raw current source operators and partner goals for actual Medical native11; no reviewer or author conclusions','records':materials,'recordCount':len(materials),'uniqueWholePartnerCount':len({g for x in materials for g in x['allPartnerGoalIds']}),'sourceUnionApproval':False})

# Preserve the 379 earlier input products and add exact Root8 products; only two of Medical10
# authored material bodies differ from v2. Product presence is not strict completion.
oldproducts=load(OLD/'inputs/whole-current397-machine-profile-products389.neutral.json')['records']
records=[copy.deepcopy(x) for x in oldproducts if x['goalId'] not in ids];assert len(records)==379
rootrows=[json.loads(s) for s in (BASE/'positive/P8.author-candidates.normal.records.jsonl').read_text().splitlines()]
medical=[json.loads(s) for s in (P/'positive/P10-medical.author-pending.review.jsonl').read_text().splitlines()]
assert len(rootrows)==8 and len(medical)==10
root_assets=[]
for row in rootrows:
 gid=row['goalId'];url=pages[gid]['visualization']['url'];public=R/'app/public'/url.lstrip('/')
 root_assets.append({'goalId':gid,'storedCandidateImageDigest':pages[gid]['visualization']['originalDigest'],'publicPath':str(public.relative_to(R)),'publicPresentAtCheckpoint':public.is_file()})
assert all(not r['publicPresentAtCheckpoint'] for r in root_assets)
put('checks/current-checkpoint-public-candidate-boundary.actual.json',{'role':'Current filesystem observation after inactive Root8 public orphan removal; no new model run or review vote','records':root_assets,'inactiveRoot8PublicImagesAbsent':8,'publicAssetsRestored':False,'retainedNormalCheckReceipts':'Successful preparation and native captures before public cleanup; stored immutable products remain available. This is not a claim that a new whole397 model run can resolve absent public Root8 images.','currentWhole397RuntimeReproduction':'HOLD until candidate-only Root8 image resolution is prepared in an isolated scratch capsule; do not restore inactive images to app/public.','Medical11PortableOriginalsAndCapturesRetained':True,'activeRepositoryModelScopeUnaffectedByInactiveCandidate':True,'strictGainClaimed':0})
def product(r,path):
 return {'goalId':r['goalId'],'goalFingerprint':r['goalFingerprint'],'profileFingerprint':r['profileFingerprint'],'reviewInputFingerprint':r['reviewInputFingerprint'],'wholeCurrentProfile':r['profile'],'operativeRecordPath':str(path.relative_to(R)),'status':r['status'],'reviewAuthority':r['reviewAuthority'],'evidenceLevel':r['evidenceLevel'],'maximumClaimScope':r['maximumClaimScope']}
records += [product(r,BASE/'positive/P8.author-candidates.normal.records.jsonl') for r in rootrows]
records += [product(r,P/'positive/P10-medical.author-pending.review.jsonl') for r in medical]
assert len(records)==len({r['goalId'] for r in records})==397
assert all((r['status'],r['reviewAuthority'],r['evidenceLevel'],r['maximumClaimScope'])==('needs_human_review','ai_candidate','E1','G1') for r in medical)
put('inputs/whole-current397-machine-profile-products397.neutral.json',{'role':'Whole current profiles; this inventory asserts no D/P/A/M/V completion','records':records,'currentProfileProductCount':397,'original379PriorProductsExact':True,'retainedRoot8WholeP8Exact':True,'medicalAuthoredProducts':10,'newProfileBodyDeltasFromMedicalv2':2,'independentMedicalApproval':False,'Root8Source5AndPZRemainSeparateOpenCandidates':True,'noProfileMaterialFoundForGoalIds':[]})

sources=load(P/'sources/whole397.normal-original-sources.actual.json');ev={r['id']:r for r in sources['evidence']};docs={r['id']:r for r in sources['documents']};receipt=load(P/'sources/normal397-atlas.receipt.whole.actual.json')
context=[]
for gid in union:
 src=[]
 for x in sources['goals'].get(gid,[]):
  y=copy.deepcopy(x);y['evidence']=[dict(ev[i],document=docs[ev[i]['documentId']]) for i in x['evidenceIds']];src.append(y)
 context.append({'goalId':gid,'wholeCurrentGoal':goals[gid],'normalCurrentWholeSourcePage':pages[gid],'normalSourcePayload':src,'directWholeMappingSourcePartners':[x for x in materials if gid in x['nativeAffectedGoalIds']],'normalCurrentSourceScopes':[dict(s,goalIds=[gid],witnesses=[w for w in s['witnesses'] if w['goalId']==gid]) for s in receipt['scopes'] if gid in s['goalIds']]})
put('inputs/current397-medical10-and-actual-affected-union.whole-source-context.neutral.json',{'role':'Whole actual normal current11 source and canonical contexts; no review vote','normalModelDigest':model['digest'],'normalCounts':receipt['counts'],'goals':context})
neighbours=set(union)
for gid in union:
 neighbours.update(goals[gid].get('requires',[]));neighbours.update(g for g,row in goals.items() if gid in row.get('requires',[]))
byproduct={r['goalId']:r for r in records}
put('inputs/whole11-prerequisite-and-reverse-UUID-unions.neutral.json',{'role':'Complete current UUID neighbours and actual whole pages; protected440 goal/profile/image is unchanged','nativeUnionIds':union,'wholeNeighbourGoalCount':len(neighbours),'wholeCanonicalNeighbours':[goals[g] for g in sorted(neighbours)],'wholeCurrentPagesWhenPublished':[pages[g] for g in sorted(neighbours) if g in pages],'wholeProfileProductsWhenPresent':[byproduct[g] for g in sorted(neighbours) if g in byproduct],'extraProtectedPage':'440854be-7f06-5678-91cb-ba8dcab56959','extraProtectedPageChangedFields':['reverseRequires'],'extraProtectedGoalAndProfileUnmodified':True})

# Original scientific and curricular primaries are retained byte for byte. All eleven original
# images and existing22 exact display-size samples are rebound, without asserting a new V vote.
for name in ['primary/whole-actual-curricular-primary-bindings.neutral.json','primary/scientific-background/actual-primary-bindings.neutral.json']:
 cp(OLD/name,name)
for f in (OLD/'primary/scientific-background').iterdir():
 if f.is_file() and f.name!='actual-primary-bindings.neutral.json':cp(f,'primary/scientific-background/'+f.name)
views=load(OLD/'checks/actual-original11-and-360-680-views.neutral.json')
for row in views['records']:
 gid=row['goalId'];src=P/'native/portable-current397-medical-native11/bundle/asset-copies'/(gid+'.png')
 assert sha(src)==row['original']['sha256'];row['original'].update(ref(src))
 for q in row['QAViews']:
  src=R/q['path'];dst='inspection-only/'+gid+'/actual-'+str(q['width'])+'.png';bound=cp(src,dst);q.update(bound)
views['role']='Exact unchanged original11 and inspection-only360/680 samples; no new V approval'
put('checks/actual-original11-and-360-680-views.neutral.json',views)

put('inputs/HE06-separate-author-forks-and-required-future-join.neutral.json',{'role':'Future integration boundary, no review clearance','medicalForkWholeMapping':ref(P/'sources/mappings/06-HE.whole-eight-medical-raw-primary-successor.author.review.json'),'medicalForkWholeExtraction':ref(P/'sources/extractions/06-HE.whole-eight-medical-raw-primary-successor.author.json'),'medicalChangedSourceGoalIds':[x['sourceGoalId'] for x in load(P/'sources/HE-eight-medical-actual-raw-primary-deltas.author.json')['changes']],'Root8Source5AndPZRemainSeparateOpenCandidates':True,'requiredFutureJoin':'Use exact original HE06 base and join only independently reviewed disjoint Medical8 and Root8 source5 changes. Preserve all unaffected rows/partners; do not copy either whole fork over the other. Recompute affected native source/context/page bindings and inspect actual deltas before adoption. No automatic approval by rebinding.','activeIntegration':False,'historicalArtifactsUnmodified':True})

# Raw substantive deltas allow independent reviewers to continue their original scope without
# reopening unchanged science, while new normal fingerprints remain available when necessary.
old_profiles={r['goalId']:r for r in load(OLD/'profiles/ten-complete-positive-candidates.author.json')['goals']}
profiles=load(P/'profiles/ten-complete-positive-candidates.author.json')['goals']
modified=[{'goalId':r['goalId'],'oldWholeProfile':old_profiles[r['goalId']]['profile'],'newWholeProfile':r['profile']} for r in profiles if old_profiles[r['goalId']]['profile']!=r['profile']]
assert len(modified)==2
v2pages={r['goalId']:r for r in load(OLD/'native/whole397-medical10.normal-model.actual.json')['pages']}
medical_page_deltas=[{'goalId':g,'actualChangedFields':[k for k in pages[g] if pages[g][k]!=v2pages[g].get(k)],'oldWholePage':v2pages[g],'newWholePage':pages[g]} for g in union if pages[g]!=v2pages[g]]
put('inputs/targeted-v3-vs-v2-whole-P-source-page-deltas.neutral.json',{'role':'Substantive raw scope deltas for independent continuation; contains no A/B peer verdicts','oldNeutral':ref(OLD/'FINAL.neutral-medical10-current397-author.join.json'),'newProfileDeltas':modified,'source8Deltas':ref(P/'sources/HE-eight-medical-actual-raw-primary-deltas.author.json'),'BY550FalseEdgeDelta':ref(P/'sources/BY550-false-pedigree-edge-removal.actual-author-delta.json'),'BY550NeedsCanonicalGoalRemainsOpen':True,'wholeNative11InputsRemainProvided':True,'wholePageDeltas':medical_page_deltas,'goalsAndImagesUnchangedFromMedicalv2':True,'Root8CurrentTitleAndPBindingsRetainedOnly':True,'Root8Source5AndPZUnresolvedOutsideMedicalApproval':True})
put('independent-QA-plan.neutral.json',{'role':'Independent review routing, no author or peer verdict','reviewerMustNotHaveAuthoredMedicalInputs':True,'originalJudgmentBeforePeerVerdicts':True,'requiredScope':{'D':11,'PWhole':10,'targetedNewPBodies':2,'wholeCases':20,'newMaterialCases':4,'A':10,'M':10,'V':11,'wholeNativeHTML':11,'wholeNativePDF':11,'rawSourcePairs':31,'newRawHEOperationalizations':8,'BY550FalsePedigreeEdgeRemoval':1,'BY550RemainingSourceMappingDebt':1},'unchangedPriorIndependentScienceMayBeRetained':'Only with exact valid bindings and own sealed review; actual changed source/P/page/context inputs need targeted continuation.','Root8Source5AndPZRemainSeparate':True,'humanApproval':False,'humanTrial':False,'activeIntegration':False})
put('after-FIRST/author-targeted-remedies-and-retention.json',{'role':'AUTHOR remedy record, not independent review','materialCorrections':{'96547':'new retinal/skin target-tissue premises and actual fictional functional data/response','10a8':'supplied fictional ruleR with three conditions and consent-withdrawal transfer'},'sourceCorrections':'Eight bounded HE authoredOperationalization+actual official raw/span+partial mappings. BY550 false440 edge removed, source obligation remains needsCanonicalGoal. Correct BYf368→440 and all other source decisions remain exact.','normsPreserved':['501 Q1.2 LK GMO example','965 Q1.3 LK procedure example; GK gene therapy principle','PID Q1.4 GK method and ethical challenges','7f Q1.5 GK cancer/tumor/metastasis','HE PND only bounded authored Gentest/Beratung application, not fictional full PND norm'],'actualRasterChange':False,'oldAuthorVisualInspectionRetainedAsHistory':ref(OLD/'after-FIRST/author-A10-M10-and-V10-KEEP.decisions.json'),'actualNewAuthorWholeHTMLAndPDFInspectedGoalIds':['96547bdb-554d-5266-a28c-fc16e708216d','10a8dac7-65c8-5f85-a944-3e2a7d2c6028'],'newAuthorWholePageFinding':'These two current whole HTML/PDF pages show the unchanged procedural cue and current descriptions, applicability, prerequisite/reverse context without clipping; native pages are not case execution or clinical/legal approval.','allOtherNewWholeCapturesAreNotInspection':True,'newCards':0,'independentScientificApproval':False,'sourceUnionApproval':False,'strictClosuresClaimed':0,'Root8OpenSource5AndPZRemainSeparate':True})

external={}
def ext(path):
 p=Path(path);p=p if p.is_absolute() else R/p
 if not p.is_relative_to(P):external[str(p.relative_to(R))]=ref(p)
for pair in pairrows:
 ext(pair['wholeMapping']['path']);ext(pair['wholeExtraction']['path'])
for r in records:ext(r['operativeRecordPath'])
for n in ['FINAL.neutral-medical10-current397-author.join.json','FINAL.author-package.freeze.json','native/whole397-medical10.normal-model.actual.json','profiles/ten-complete-positive-candidates.author.json','cases/whole20-complete-bilingual-author-case-inputs.json']:
 ext(OLD/n)
for n in ['FINAL.neutral-root8-current397-author.join.json','FINAL.author-package.freeze.json','candidate/whole484-current397.author.inactive.json','native/whole397.author.normal-model.actual.json','positive/P8.author-candidates.normal.records.jsonl']:
 ext(BASE/n)
for n in ['primary/whole-actual-curricular-primary-bindings.neutral.json','primary/scientific-background/actual-primary-bindings.neutral.json']:
 def scan(v):
  if isinstance(v,dict):
   if all(k in v for k in ['path','bytes','sha256']):ext(v['path'])
   for x in v.values():scan(x)
  elif isinstance(v,list):
   for x in v:scan(x)
 scan(load(P/n))
for r in load(P/'checks/private-normal-capsule.exact-input-aliases.actual.json')['regularFileInputs']:
 path=r['originalRegularFile'];p=R/path
 if not p.is_relative_to(P) and not (path.startswith('app/public/assets/goal-visualizations/') or path.startswith('curricula/DE/Gymnasium/visualizations/biologie/')):ext(path)
for f in [R/'app/scripts'/n for n in ['goalBookModel.ts','goalBookOriginalSources.ts','goalBookSourceAtlasInputs.ts','materializeGoalDescriptionRolloutBatch.ts','materializePositiveGoalEvidenceCandidates.ts','goalEvidenceReview.ts']]:
 if f.is_file():ext(f)
put('inputs/full-external-source-profile-and-normal-contract-bindings.neutral.json',{'role':'Whole exact external scientific/context/primary and normal contract bindings; no review vote','records':list(external.values()),'bindingsVerified':len(external),'activeWrites':False})

checks=[]
for filename in ['normal-P10-materialization','normal-positive-P10-check','normal31-source-atlas','normal397-model','normal-native-union-preparation','normal-native-union-check']:
 d=load(P/'checks'/(filename+'.actual-command.json'));assert d['exitCode']==0;checks.append(ref(P/'checks'/(filename+'.actual-command.json')))
assert len(load(P/'checks/current397-native11-HTML-whole-page-captures.actual.json')['wholePages'])==11
assert len(load(P/'checks/current397-native11-PDF-whole-page-captures.actual.json')['wholePages'])==11
checks.append(ref(P/'checks/current397-native11-HTML-whole-page-captures.actual.json'));checks.append(ref(P/'checks/current397-native11-PDF-whole-page-captures.actual.json'))
put('checks/FINAL.targeted-normal-contract-and-binding-checks.actual.json',{'role':'Technical preparation checks, not scientific review','normalD11PreparedInputPass':True,'normalP10AuthoredCandidatesPass':True,'normalAtlas397Pass':True,'currentWhole397RuntimeReproduction':'HOLD absent inactive Root8 public assets; no current rerun claimed','wholeHTML11AndPDF11ActualCaptures':True,'all474NonMedicalCurrentRoot8GoalsExact':True,'all10MedicalGoalBodiesExactToV2':True,'all10MedicalImagesExactToV2':True,'protected440GoalImageAndPExact':True,'unaffectedTwentyNineSourcePairsExact':True,'BY550FalseFamilyPedigreeEdgeRemoved':True,'BY550SourceObligationRemainsOpenNeedsCanonicalGoal':True,'onlyEightMedicalRawSourceRowsChanged':True,'additionalBYMappingEdgeDeltas':1,'newCanonicalPhylogenyPartnerStarted':False,'actualChangedProfiles':2,'fullReferences':checks,'independentVerdictsCreated':0,'strictGainClaimed':0,'humanApproval':False})
raw_names={
 'candidateCanonical':'candidate/whole484-current397-medical10.author.inactive.json','currentSemanticClassification':'candidate/kinds484-current397.author-classification-only.json','wholeNewP10Bodies':'profiles/ten-complete-positive-candidates.author.json','normalP10AuthorConfig':'positive/P10-medical.author-pending.config.json','normalP10Records':'positive/P10-medical.author-pending.review.jsonl','wholeCurrent397ProfileProducts':'inputs/whole-current397-machine-profile-products397.neutral.json','wholeCases20':'cases/whole20-complete-bilingual-author-case-inputs.json','whole397NormalModel':'native/whole397-medical10.normal-model.actual.json','normalD11BatchConfig':'native/current397-medical-native-union.author.batch.config.json','normalD11BatchManifest':'native/current397-medical-native-union/batch-manifest.json','normalD11RawReviewInput':'native/current397-medical-native-union/bundle/review-input.json','normalD11RoundA':'native/current397-medical-native-union/round-a/description-review-input.json','normalD11RoundB':'native/current397-medical-native-union/round-b/description-review-input.json','wholeNativeHTML':'native/current397-medical-native-union/bundle/book.html','wholeNativePDF':'native/current397-medical-native-union/bundle/book.pdf','portableWholeNativeHTML':'native/portable-current397-medical-native11/bundle/book.html','actualHTMLCaptures':'checks/current397-native11-HTML-whole-page-captures.actual.json','actualPDFCaptures':'checks/current397-native11-PDF-whole-page-captures.actual.json','originalImages11And360680':'checks/actual-original11-and-360-680-views.neutral.json','whole11SourceContext':'inputs/current397-medical10-and-actual-affected-union.whole-source-context.neutral.json','whole11ReverseNeighbours':'inputs/whole11-prerequisite-and-reverse-UUID-unions.neutral.json','whole31SourcePairs':'sources/whole31-exact-source-carriers-and62-bindings.neutral.json','wholeSourceTargetsAndPartners':'sources/whole-source-decisions-targets-and-partners.neutral.json','actualFullCurricularPrimaries':'primary/whole-actual-curricular-primary-bindings.neutral.json','actualScientificPrimaries':'primary/scientific-background/actual-primary-bindings.neutral.json','whole397OriginalSources':'sources/whole397.normal-original-sources.actual.json','whole397AtlasReceipt':'sources/normal397-atlas.receipt.whole.actual.json','sourceHEWholeSuccessorMapping':'sources/mappings/06-HE.whole-eight-medical-raw-primary-successor.author.review.json','sourceHEWholeSuccessorExtraction':'sources/extractions/06-HE.whole-eight-medical-raw-primary-successor.author.json','rawV3V2ScopeDeltas':'inputs/targeted-v3-vs-v2-whole-P-source-page-deltas.neutral.json','sourceBYWholeFalsePedigreeEdgeRemoval':'sources/mappings/03-BY.whole-false-cladogram-pedigree-edge-removal.author.review.json','sourceBY550ActualRemovalDelta':'sources/BY550-false-pedigree-edge-removal.actual-author-delta.json','HE06ForkIntegrationBoundary':'inputs/HE06-separate-author-forks-and-required-future-join.neutral.json','actualWhole397PageDeltas':'checks/current397-whole-normal-page-deltas.actual.json','fullExternalBindings':'inputs/full-external-source-profile-and-normal-contract-bindings.neutral.json'}
raw={k:ref(P/n) for k,n in raw_names.items()}
raw['currentCheckpointCandidateAssetBoundary']=ref(P/'checks/current-checkpoint-public-candidate-boundary.actual.json')
first=put('RAW-FIRST.neutral-current397-medical10-targeted-v3-complete-input-manifest.json',{'role':'Raw Medical10 v3 author material/source successor. Read before any author or peer verdict.','createdAtUTC':NOW,'authorAgent':'/root/bio8_v6_genuine_independent_b','authorIsNotIndependentMedicalReviewer':True,'medicalGoalIds':ids,'nativeAffectedUnion11':union,'wholeCanonicalCount':484,'currentCurricularAtomicCount':397,'newP10':10,'materialDeltaProfiles':2,'newRawMedicalHERows':8,'BY550False440SourceEdgeRemoved':True,'BY550NeedsCanonicalGoalRemainsOpen':True,'newPhylogenyPartnerNotStarted':True,'completeBilingualCases':20,'wholeCurrentProfileProducts':397,'rawInputs':raw,'normalPreparedInputsPassAtRecordedCapture':True,'currentWhole397RuntimeReproduction':'HOLD absent inactive Root8 public assets; candidate-only isolated reproduction remains pending','independentA':'pending','independentB':'pending','captureIsNotInspection':True,'Root8Source5AndPZRemainSeparateOpenCandidates':True,'newStrictClosuresClaimed':0,'sourceUnionApproval':False,'humanApproval':False,'humanTrial':False,'activeWrites':False,'GitWrites':False})
join=put('FINAL.neutral-medical10-current397-targeted-v3-author.join.json',{'schemaVersion':1,'role':'Complete inactive Medical10 AUTHOR targeted successor, not an independent vote','FIRST':first,'rawInputs':raw,'targetedTechnicalChecks':ref(P/'checks/FINAL.targeted-normal-contract-and-binding-checks.actual.json'),'independentQAPlan':ref(P/'independent-QA-plan.neutral.json'),'inputFreezePath':str(PR/'FINAL.author-package.freeze.json'),'wholeCurrentGoals':484,'curricularAtomic':397,'nativeUnion':11,'Root8OpenSource5AndPZNotApprovedHere':True,'BY550SourceObligationNeedsCanonicalMapping':True,'currentWhole397RuntimeReproduction':'HOLD absent inactive Root8 public assets; stored normal receipts precede public cleanup','sourceUnionApproval':False,'humanApproval':False,'strictGainClaimed':0,'activeWrites':False,'GitWrites':False})
readme=P/'README.md';readme.write_text('# Medical10 targeted author successor v3\n\nTwo complete bilingual material profiles and eight HE source bindings are substantively corrected. One erroneous BY cladogram-to-family-pedigree edge is removed; the literal cladogram obligation remains openly needsCanonicalGoal and no new phylogeny partner is started. Current484/397 includes the exact Root8v2 candidate plus the exact Medicalv2 goal/image bodies. Root8 source5 and PZ remain separate unresolved candidates.\n\nThe normal native union is eleven whole pages (ten Medical goals plus protected440 reverse context);386 other current pages remain identical to the Root8v2 normal model. Original11 PNGs and22 display-size samples are unchanged; current whole11 HTML/PDF pages are captured. Capture and byte binding are not visual or scientific approval.\n\nAll P records remain E1/G1 AI candidates needs_human_review. No human approval/trial, actual experiment/clinical result, source-union clearance or strict M7 gain is asserted. The normal atlas/model preparation can pass with that openly unassigned source row; this is not its scientific resolution. Reviewers start at the neutral FINAL/FIRST; author remedy notes stay separate.\n\nThe recorded normal preparation/capture PASS results preceded removal of eight inactive Root8 public image orphans. Their images stay in the Root8 candidate package; Medical11 portable originals and captures are retained here. A fresh whole397 runtime reproduction is HOLD until isolated candidate-only image resolution is prepared. No inactive image is restored to public for this checkpoint; these stored PASS receipts are not a current runtime or integration approval.\n')
files=[ref(f) for f in sorted(P.rglob('*')) if f.is_file() and f.name!='FINAL.author-package.freeze.json']
for r in files+list(external.values()):
 assert ref(R/r['path'])==r
freeze=put('FINAL.author-package.freeze.json',{'schemaVersion':1,'role':'Immutable complete AUTHOR input freeze; no independent review','neutralJoin':join,'neutralFIRST':first,'localFiles':files,'fullExternalBindings':list(external.values()),'localCount':len(files),'externalCount':len(external),'actualFullCASVerified':True,'activeWrites':False,'GitWrites':False,'independentScientificApproval':False,'sourceUnionApproval':False,'humanApproval':False,'strictGainClaimed':0})
print(json.dumps({'neutralFINAL':join,'FIRST':first,'authorFreeze':freeze,'local':len(files),'external':len(external),'nativeD11':True,'HE8':True,'P2ActualMaterialDeltas':True,'newImages':0,'strictGain':0},ensure_ascii=False),flush=True)
