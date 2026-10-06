# SPDX-License-Identifier: Apache-2.0
import collections,datetime,hashlib,json,pathlib,shutil
OWN=pathlib.Path(__file__).resolve().parent
ROOT=OWN.parents[6]
BASE=OWN.parent/'biologie-q1-three-current383-author-continuation-v2'
ISO=ROOT/'tmp/biologie-q1-source-scope-remediation-native-20261006-v3'
def read(p):return json.loads(pathlib.Path(p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def write(p,v):pathlib.Path(p).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def bind(p):return {'path':str(pathlib.Path(p).relative_to(ROOT)),'sha256':sha(p),'bytes':pathlib.Path(p).stat().st_size}
assert (OWN/'prospective-canonical.unchanged.snapshot.json').read_bytes()==(BASE/'prospective-canonical.snapshot.json').read_bytes()
canonical=read(OWN/'prospective-canonical.unchanged.snapshot.json');goals={g['id']:g for g in canonical['goals']}
for name in ['positive-four.native-candidate-records.json','visualization-final-candidate-inputs.v3.json','prospective-four.semantic-kinds.snapshot.json','prospective-qa.no-approval.snapshot.json']:
 assert (OWN/name).read_bytes()==(BASE/name).read_bytes(),name
patch=read(OWN/'47-source-relations.before-after.author-candidate.json');assert len(patch['sourceRelations'])==47
for m in patch['mappingOverlays']:
 candidate=read(ROOT/m['candidatePath']);old=read(ROOT/m['replacesPath'])
 assert sha(ROOT/m['replacesPath'])==m['beforeSha256']
 assert sha(ROOT/m['candidatePath'])==m['candidateSha256']
 assert all(r['canonicalGoalId'] in goals for r in candidate['mappings'])
 source=read(ROOT/candidate['sourceExtractionPath']);ids={g['id'] for g in source['sourceGoals']}
 assert len(ids)==len(source['sourceGoals'])
 assert all(d['sourceGoalId'] in ids for d in candidate['decisions'])
 affected={r['sourceGoalId'] for r in patch['sourceRelations'] if r['jurisdiction'] in m['replacesPath']}
 for d in candidate['decisions']:
  if d.get('decision')=='mapped' and (d['sourceGoalId'] in affected or d['sourceGoalId'].endswith('component-v3')):
   assert set(d['canonicalGoalIds'])=={r['canonicalGoalId'] for r in candidate['mappings'] if r['legacyGoalId']==d['sourceGoalId']}
 # Preserve every source goal, including unrelated official duties.
 prior=read(ROOT/old['sourceExtractionPath']);assert {g['id'] for g in prior['sourceGoals']}<=ids
atlas=read(OWN/'source-atlas.native-technical.actual.json')
for b in atlas['inputBindings']:assert sha(ISO/b['path'])==b['sha256'],b['path']
scope={s['key']:set(s['goalIds']) for s in atlas['scopes']}
gid=lambda pre:next(g for g in goals if g.startswith(pre))
assert gid('e70d8a85') in scope['DE-BW/SekI/']
assert gid('0263fb84') in scope['DE-BY/SekI/']
for profile in ['GK','LK']:
 assert gid('e349d8c4') in scope['DE-HE/SekII/'+profile]
 assert gid('1ec4e3c2') in scope['DE-HE/SekII/'+profile]
for region in ['DE-BB','DE-BE','DE-HH','DE-NW','DE-SH']:
 assert gid('e70d8a85') not in scope[region+'/SekI/']
 assert gid('1d2b1038') in scope[region+'/SekI/']
for region in ['DE-MV','DE-SH','DE-SN','DE-ST','DE-TH']:
 assert gid('ffef97e3') not in scope[region+'/SekI/']
 assert gid('3417bb28') in scope[region+'/SekI/']
assert gid('ffef97e3') not in scope['DE-RP/SekI/']
assert gid('475eebb4') not in scope['DE-SH/SekI/']
assert gid('0263fb84') in scope['DE-NI/SekI/']
assert gid('3417bb28') in scope['DE-NI/SekI/']
pages=read(OWN/'native-visibility-and-book-footprint.actual.json')
assert len(pages['pageDeltas'])==7
assert all(r['changedPageFields']==['applicability','pageFingerprint'] for r in pages['pageDeltas'])
strict=set(next(s for s in read(BASE/'central-before.actual.json')['subjects'] if s['subject']=='biologie')['strictCompleteGoalIds'])
strict_deltas=[r['goalId'] for r in pages['pageDeltas'] if r['goalId'] in strict]
ni_map=next(b for b in atlas['inputBindings'] if b['path'].endswith('/NI.current-reviewed.mapping.snapshot.json'))
assert sha(ROOT/ni_map['path'])==ni_map['sha256']
primary=read(OWN.parent/'biologie-q1-four-current383-independent-description-p-source-b-resumed-v2/source-scope-component-findings.actual.json')['primaryDocumentsRead']
document_bindings=[]
for d in primary:
 p=ROOT/d['path'];assert sha(p)==d['actualSha256'];document_bindings.append({**d,'authorReusedFrozenPrimaryInput':True,'claimLimit':'Page ranges belong to frozen independent review. Author read scoped primary texts and personally viewed BW physical24; no new independent source approval.'})
inspection=OWN.parent/'biologie-q1-four-current383-independent-description-p-source-a-resumed-v2/primary-and-page-inspection'
textbindings=[bind(p) for p in sorted(inspection.glob('*txt')) if not p.name.startswith('native')]
write(OWN/'primary-binding-and-preservation.actual.json',{'officialDocuments':document_bindings,'frozenActualPrimaryTextsRead':textbindings,'BWOriginalP24PersonallyViewed':bind(inspection/'BW-physical-page-24.png'),'NCBILiveStandardCodeUrl':'https://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi#SG1','liveNCBICheckDate':'2026-10-06','64StandardCodonsAnd7TaskCodonsChecked':True,'canonicalGoalObjectsAllExact':len(goals),'NIOriginalMappingExact':ni_map,'NIOriginal0263And3417ScopeRetained':True,'allSourceGoalIdsPreserved':True,'actualMappingInputCount':len(atlas['inputBindings']),'native383PagesActual':True,'changed7PageFieldsOnly':['applicability','pageFingerprint'],'strictBeforePageGoalIdsRequiringTargetedContextRecheck':strict_deltas,'existingNIWholeGoalAndPPayloadsDoNotCertifyNewScope':True,'remainingOpenObligations':patch['openObligations'],'newAdditionalScopeCheck':'3417 requires existing NI recombination goals; expanded regional prerequisite closure is not approved here.','activeWrites':0,'humanApproval':False})
if pathlib.Path('/tmp/bio-v3-code-sun-preview.png').exists():shutil.copyfile('/tmp/bio-v3-code-sun-preview.png',OWN/'standard-code-sun.author-render.preview.png')
write(OWN/'meaningful-checks.actual.json',{'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'canonicalSnapshotByteExact':True,'allCanonicalWholeGoalsExact':True,'fourGoodDEENAndEightPAndFourFinalImageInputsExact':True,'original47RelationshipsTraced':True,'sourceGoalIdsNeverDropped':True,'actualNativeSourceInputsVerified':len(atlas['inputBindings']),'actualNativeSourceViews':20,'actualNativeBookPages':383,'actualChangedPageCount':7,'affectedPriorStrictContextGoalIds':strict_deltas,'liveM7Checked':False,'nativeDRecordsProduced':0,'fullCQRRun':False,'unresolvedAuthorObligations':len(patch['openObligations']),'authorSVGRender':'Chromium full channel succeeded and author visually inspected; headless_shell SIGSEGV attempt excluded','independentAuthorMaterialApproval':False,'activeWrites':0,'humanApproval':False})
files=[bind(p) for p in sorted(OWN.rglob('*')) if p.is_file() and p.name!='author-source-scope.final.freeze.json']
freeze={'schemaVersion':1,'frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Biology Q1 source-scope author v3; exact partial, remaining obligations open; inactive','baseAuthorFreezeSha256':sha(BASE/'author-current-four.final.freeze.json'),'files':files,'fileCount':len(files),'sourceRelations':47,'mappingLanes':13,'canonicalWholeGoalsChanged':0,'newCanonicalGoalIds':[],'nativeDRecords':0,'independentReview':'pending, author cannot approve own packet','humanApproval':False,'activeWrites':0}
write(OWN/'author-source-scope.final.freeze.json',freeze)
assert all(sha(ROOT/f['path'])==f['sha256'] for f in files)
print(json.dumps({'files':len(files),'freeze':sha(OWN/'author-source-scope.final.freeze.json'),'affectedPriorStrictPages':strict_deltas,'openObligations':len(patch['openObligations']),'activeWrites':0}))
