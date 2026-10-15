# SPDX-License-Identifier: Apache-2.0
"""Endliche technische P/A/M/V-Bindungen; keine neue Wissenschaft, kein Native-Lauf."""
from pathlib import Path
import copy,datetime,hashlib,json
R=Path.cwd();O=Path(__file__).resolve().parents[1];E=O.parent
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(a):
 p=R/a['path'];now=ref(p);assert now['sha256']==a['sha256'],p
 if 'bytes' in a:assert now['bytes']==a['bytes'],p
 return p
def put(p,v):
 assert not p.exists(),p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
raw=load(O/'PREPARED.raw-five-PA-two-texts-awaiting-genuine-context-and-final-bindings.json');f=load(O/'INPUTS.final-P5-A5-M2-V2-before-targeted-stock-checks.json');h=load(verify(f['stockHostPlan']));H=R/h['executionHost'];old=load(verify(raw['baseNative8Selector']));basemap=load(verify(h['sourceMap']))
canonical=load(verify(f['canonical']));by={g['id']:g for g in canonical['goals']};before={g['id']:g for g in load(verify(old['canonical']))['goals']};changed={g for g in by if by[g]!=before[g]};assert changed=={'96d33fb6-ed14-50ab-b5c7-5ce0559d518a','0b5342b9-512d-573f-90d5-7522aee35efa'};assert len(by)==570
sp=R/h['pendingFinalSemanticPath'];semantic=load(sp);olds=load(verify(f['baselineSemantic']));assert semantic['counts']==olds['counts'] and semantic['counts']['curricularAtomic']==426;semchanged=[]
for a,b in zip(olds['decisions'],semantic['decisions']):
 assert {k:v for k,v in a.items() if k!='sourceFingerprint'}=={k:v for k,v in b.items() if k!='sourceFingerprint'}
 if a!=b:semchanged.append(b['goalId'])
assert set(semchanged)==changed
qp=R/h['pendingFinalQAPath'];qa=load(qp);oldq=load(verify(f['baselineQA']));q={x['goalId']:x for x in qa['records']};oq={x['goalId']:x for x in oldq['records']};assert len(q)==443 and all(x['visualizationState']=='available' for x in q.values());assert {g for g in q if q[g]!=oq[g]}==changed
hist=lambda x:{k:v for k,v in x.items() if k.startswith(('human','chatGpt')) or k in ['umlautsCorrectChatGpt','contentApprovedChatGpt']}
assert all(hist(q[g])==hist(oq[g]) for g in q)
assert ref(H/h['normalCanonicalPath'])['sha256']==f['canonical']['sha256'];assert ref(H/h['normalSemanticPath'])['sha256']==ref(sp)['sha256'];assert ref(H/h['normalQAPath'])['sha256']==ref(qp)['sha256']
source_seals=[];sources=[s['selector'] for s in raw['genuineScientificSources'].values()]+[raw['localTextAuthorSelector'],f['twoTextContextSelector'],f['final96VSelector']]
for a in sources:
 s=load(verify(a));sealpath=s.get('finalSealPath',s.get('sealPath',s.get('seal')));assert sealpath,a
 seal=verify(sealpath) if isinstance(sealpath,dict) else R/sealpath
 for b in load(seal)['files']:verify(b)
 source_seals.append({'selector':a,'seal':ref(seal),'allOriginalPayloadsStillExact':True})
vs=load(verify(f['final96VSelector']));va=load(verify(vs['authorSelector']));assert load(verify(va['wholeGoal']))==by['96d33fb6-ed14-50ab-b5c7-5ce0559d518a'];verify(f['new96Image'])
oldprep=load(E/'chemie-current426-q2-three-current-context-native-and-P077-technical-20261015-v1/PREPARED.exact-six-body-composition-and-current-binding-inventory.awaiting-b47.json');v8=load(verify(oldprep['V8Selector']));v8inputs=load(verify(v8['frozenInputs']));snapshot=v8inputs['stockModelAndComponentSnapshot']
for a in snapshot:verify(a)
for a in h['stockPhysicalModules']:
 verify(a);assert ref(H/a['path'])['sha256']==a['sha256']
for s in v8inputs['sourceReviews']:
 for a in [s['selector'],s['first'],s['seal']]+s['sealPayloads']:verify(a)
Pp=O/'positive/P5.genuine-informed-current-E1G1.valid-lowercase-review-id.normal.jsonl';P=[json.loads(l) for l in Pp.read_text().splitlines()];seed={x['goalId']:x for x in load(verify(f['P5OriginalScienceSeed']))};transport=load(O/'TRANSPORT.genuine-informed-P5-A5-context-sources.no-new-science.json');mapping={x['goalId']:x for x in transport['records']}
Ap=O/'atomicity/A5.original-genuine-atomic-decisions.before-stock-FP.jsonl';A=[json.loads(l) for l in Ap.read_text().splitlines()];assert len(P)==len(A)==5
for p in P:
 s=seed[p['goalId']];assert p['profile']==s['profile'];assert p['reason']=='\n\n'.join(mapping[p['goalId']]['normalPReasonOriginalParagraphs']);assert p['reviewer']==s['reviewer'] and p['reviewedAt']==s['reviewedAt'];assert p['reviewRunIds']==[] and p['reviewAuthority']=='ai_candidate' and p['status']=='needs_human_review' and p['evidenceLevel']=='E1' and p['maximumClaimScope']=='G1'
for a in A:assert a['reason']=='\n\n'.join(mapping[a['goalId']]['normalAReasonOriginalParagraphs']) and a['status']=='atomic' and a['semanticAtomic'] is True
mem=load(O/'inputs/M2.exact-original-decisions-and-explicit-local-text-deltas.no-new-memory-science.json');orig=verify(mem['originalWholeRecordFile']).read_text().splitlines();mp=O/'memory/M426.original424-whole-lines-plus-two-text-FP-bindings.jsonl';new=mp.read_text().splitlines();assert len(orig)==len(new)==426 and sum(a==b for a,b in zip(orig,new))==424
for a,b in zip(orig,new):
 if a!=b:
  x,y=json.loads(a),json.loads(b);assert x['goalId'] in changed;assert {k:v for k,v in x.items() if k!='fingerprint'}=={k:v for k,v in y.items() if k!='fingerprint'}
assert (O/'memory/cards75.original-whole-bytes.working-copy.jsonl').read_bytes()==verify(mem['originalCardsReview']).read_bytes()
checks=[]
for p in sorted((O/'checks').glob('*.receipt.json')):
 d=load(p);verify(d['stdout']);verify(d['stderr']);checks.append({'receipt':ref(p),'exitCode':d['exitCode']})
run=load(O/'checks/RUN.targeted-P5-A5-M2-V2.actual-completion.json');assert run['allRequiredChecksPassed'] is True
for a in run['actualPassingActions']:assert load(verify(a))['exitCode']==0
aliases={a['normalHostAlias']:copy.deepcopy(a) for a in h['inheritedFinalAliases']}
for alias,src,physical in [(h['normalCanonicalPath'],f['canonical'],True),(h['normalSemanticPath'],ref(sp),False),(h['normalQAPath'],ref(qp),True)]:aliases[alias]={'normalHostAlias':alias,'physicalRepositorySource':src,'physicalWithinHost':physical,'materialization':'Private regular JSON' if physical else 'Read-only repository reference'}
assets=copy.deepcopy(h['selectedCurrentAssetRows']);r96=next(x for x in assets if x['goalId']=='96d33fb6-ed14-50ab-b5c7-5ce0559d518a');r96.update(physicalRepositorySource=f['new96Image'],normalPublicDestination=f['new96PublicAlias'],normalCanonicalDestination=f['new96CanonicalAlias'],publicMustBePhysicalWithinHostPublicRoot=True,publicMaterialization='Read-only private hardlink')
hardlinks=[]
for a in h['selectedReadOnlyImageHardlinks']:
 a=copy.deepcopy(a)
 if a['goalId']==r96['goalId']:a.update(normalPublicAlias=f['new96PublicAlias'],originalRepositorySource=f['new96Image'])
 src=verify(a['originalRepositorySource']);dst=H/a['normalPublicAlias'];assert not dst.is_symlink();assert src.stat().st_ino==dst.stat().st_ino and src.stat().st_dev==dst.stat().st_dev;assert ref(dst)['sha256']==a['originalRepositorySource']['sha256'];hardlinks.append(a)
assert len(hardlinks)==8
mapfile=O/'REBUILD.current426-five-informed-PA-two-MV-bindings.physical-map.json';put(mapfile,{'schemaVersion':1,'role':'Aktueller privater Stockhost nach echten P5/A5 und technischen M2/V2-Bindungen; noch kein finaler Native-Lauf','executionHost':h['executionHost'],'sourceBaselineMap':h['sourceMap'],'aliases':list(aliases.values()),'stockPhysicalModules':h['stockPhysicalModules'],'stockModelAndComponentSnapshot':snapshot,'selectedCurrentAssetRows':assets,'selectedReadOnlyPublicImageHardlinks':hardlinks,'legacyQaDispositionDiscoveryInput':basemap['legacyQaDispositionDiscoveryInput'],'canonicalDiscoveryRegularJsonFiles':1,'canonical':f['canonical'],'semantic':ref(sp),'finalQA':ref(qp),'P5Config':ref(O/'config/P5.genuine-informed-current.valid-lowercase.normal.config.json'),'A5Config':f['A5Config'],'M2ScopedConfig':ref(O/'config/M2.current-two-FPs-with-exact-card-origin-closure.config.json'),'M426IntegrationConfig':ref(O/'config/M426.only-two-text-FP-bindings.integration-only.config.json'),'oneNewHost':True,'sourceRasterByteCopies':0,'selectedHardlinks':8,'oldHostWrites':0,'sourceImageWritesOrChmod':0,'activeWrites':0,'replayRule':'Alle verzeichneten finalen Normaladressen installieren; Stockmodule unverändert physisch, ausgewählte öffentliche Bilder nur privat hart verlinkt. Keine Writes durch Quellaliase.'})
audit=O/'checks/FINAL.finite-P5-A5-M2-V2-original-source-and-whole-object.audit.json';put(audit,{'schemaVersion':1,'checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'wholeGoals':570,'curricularAtomic':426,'other568WholeGoalsExactToPriorNative8':True,'all570SemanticDecisionsUnchangedExceptTwoSourceFPs':True,'semanticSourceFPChangedGoalIds':semchanged,'QARecords':443,'QAAvailable':443,'other441WholeQAObjectsExact':True,'all443HumanAndLegacyChatGptHistoriesExact':True,'P5WholeProfilesExactToGenuineSourceComposition':True,'P5AndA5RationalesLiteralOriginalParagraphs':True,'originalReviewerTimesPreserved':True,'normalRunClaims':0,'PAuthority':'ai_candidate / needs_human_review / E1 / G1','allOther424MemoryLinesByteExact':True,'memoryScientificDecisionsUnchanged':426,'all75CardReviewBytesExact':True,'memoryOriginCheckSidecarsByteExact':3,'exactGenuineSourceSealsAfter':source_seals,'eightPriorGenuineVisualFIRSTsAndSealsExact':True,'stockModelRendererGoalCardCssSnapshotsExact':True,'allActualCommandReceipts':checks,'preservedFailuresTruthfullyRetained':4,'newNativeRenders':0,'newScientificVotes':0,'newDescriptionRecords':0,'centralRuns':0,'HumanApproval':False,'HumanTrial':False,'M7Granted':False,'finalNative8WaitingForNeighborP2':True})
selector=O/'OUTPUTS.finite-current426-five-genuine-informed-PA-two-MV-bindings.technical-selector.json';seal=O/'FILES.finite-current426-five-genuine-informed-PA-two-MV-bindings.seal.json';put(selector,{'schemaVersion':1,'role':'Endliche inaktive informierte technische Synthese aus echten P/A-FIRSTs; getrennte aktuelle Text-/V-Kontextquellen, keine neue Wissenschaft','canonical':f['canonical'],'semantic':ref(sp),'visualizationQA':ref(qp),'positiveGoalEvidenceConfig':ref(O/'config/P5.genuine-informed-current.valid-lowercase.normal.config.json'),'positiveGoalEvidenceRecords':ref(Pp),'semanticAtomicityConfig':f['A5Config'],'semanticAtomicityRecords':ref(Ap),'memoryTwoChangedBindingRecords':ref(O/'memory/M2.exact-original-decisions.before-stock-FP.jsonl'),'memoryScopedCurrentConfig':ref(O/'config/M2.current-two-FPs-with-exact-card-origin-closure.config.json'),'memoryFullIntegrationConfig':ref(O/'config/M426.only-two-text-FP-bindings.integration-only.config.json'),'memoryFullIntegrationRecords':ref(mp),'memoryOriginalCards75':mem['originalCardsReview'],'actualCurrentV2':ref(O/'checks/V2.actual-unchanged-stock-predicate-current-text-image-bindings.json'),'genuineScienceTransport':ref(O/'TRANSPORT.genuine-informed-P5-A5-context-sources.no-new-science.json'),'genuineSourcesAndSeals':source_seals,'actualStockChecks':run['actualPassingActions'],'preservedFailureReceipts':run['preservedEarlierFailureActions'],'finiteTechnicalAudit':ref(audit),'exactRebuildRecipe':ref(mapfile),'wholeGoals':570,'curricularAtomic':426,'P5CurrentDesignBindings':5,'A5CurrentAtomicBindings':5,'M2CurrentTextFingerprintBindings':2,'MUnchangedOriginCheckSidecars':3,'V2CurrentGenuineAssetBindings':2,'QA443FreshnessAndApprovalCoveragePass':True,'readyForFinalNative8AfterNeighborP2':True,'finalNative8StillWaitingForNeighborP2':True,'readyForCentral':False,'newScientificVotes':0,'newDescriptionRecords':0,'normalRunClaims':0,'HumanApproval':False,'HumanTrial':False,'M7Granted':False,'newNativeRenders':0,'newFullModelFiles':0,'activeRegistryWrites':0,'runtimeWrites':0,'gitWrites':0,'sourceRasterByteCopies':0,'oldEvidenceWrites':0,'finalSealPath':seal.relative_to(R).as_posix()})
files=[ref(p) for p in sorted(O.rglob('*')) if p.is_file() and p!=seal and '__pycache__' not in p.parts];put(seal,{'schemaVersion':1,'role':'Endliche Versiegelung der P5/A5/M2/V2-Bindungen vor einem separat autorisierten finalen Native8-Folger; spätere Dateien sind kein Teil dieses Siegels','files':files,'sealedFileCount':len(files),'originalSourcesReadOnly':True,'priorRootsImmutable':True});print(json.dumps({'selector':ref(selector),'seal':ref(seal),'P5':5,'A5':5,'M2':2,'V2':2,'allRequiredScopedChecksPass':True,'finalNative8WaitingForNeighborP2':True},ensure_ascii=False))
