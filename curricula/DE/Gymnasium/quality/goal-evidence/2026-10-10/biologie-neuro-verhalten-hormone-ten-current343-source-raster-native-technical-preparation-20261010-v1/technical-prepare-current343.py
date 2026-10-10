# SPDX-License-Identifier: Apache-2.0
import pathlib,json,hashlib,shutil,datetime,copy,subprocess
R=pathlib.Path('/home/enpasos/projects/skillpilot');B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10');A=B/'biologie-neuro-verhalten-hormone-ten-whole-material-and-raster-author-candidate-v1';I=B/'biologie-stoffwechsel-eight-current335-inactive-integration-technical-20261010-v1';V=B/'biologie-stoffwechsel-eight-current-raster-native-technical-preparation-20261010-v2';P=B/'biologie-neuro-verhalten-hormone-ten-current343-source-raster-native-technical-preparation-20261010-v1';C=pathlib.Path((R/'tmp/m7-resumption-20261010/biologie-four-native-technical/capsule.actual.path.txt').read_text().strip())
CAN=pathlib.Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json');KIN=pathlib.Path('curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json');QA=pathlib.Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json');REG=pathlib.Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
def read(p):return json.loads((R/p).read_text())
def ref(p):b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(x):b=ref(pathlib.Path(x['path']));assert all(b[k]==x[k] for k in b),x['path']
def put(p,x):f=R/P/p;f.parent.mkdir(parents=True,exist_ok=True);assert not f.exists(),f;f.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return ref(P/p)
def cp(src,dst):f=R/P/dst;f.parent.mkdir(parents=True,exist_ok=True);assert not f.exists(),f;shutil.copyfile(R/src,f);return ref(P/dst)
assert not (R/P).exists()
assert ref(A/'neutral-ten-whole-science-rasters-sourcefix.author-checkpoint.entry.json')['sha256']=='sha256:f0dcf9cc88526d342777320e17bb44ae0a548dfa86811617b028f7e1a2a6f1b0';assert ref(A/'FINAL.ten-whole-science-and-rasters.author.freeze.json')['sha256']=='sha256:78a65f34f61e9856d2079691afa99dc1ef67b5d210221e76ad8219845fffd956'
af=read(A/'FINAL.ten-whole-science-and-rasters.author.freeze.json');assert len(af['files'])==89
for x in af['files']:verify(x)
assert ref(CAN)['sha256']=='sha256:8726e38f052e70b56bd4f550f3d607df7eb8cb5c99a1003d5fd1cef25b928728'
for p in [CAN,KIN,QA]:assert (R/p).read_bytes()==(C/p).read_bytes()
a=read(A/'neutral-ten-whole-science-rasters-sourcefix.author-checkpoint.entry.json');ids=a['goalIds'];assert len(ids)==10
before=read(CAN);after=copy.deepcopy(before);bg={g['id']:g for g in before['goals']};ag={g['id']:g for g in after['goals']};assert len(bg)==479
props=read(A/'science/ten-only-current-goal-and-picture-link-proposals.json')['records'];rasters=read(A/'assets/ten-selected-current-rasters.author-decisions.json')['records'];neutral=[]
for r in props:
 i=r['goalId'];assert r['wholeCurrentGoal']==bg[i],i;assert 'resourceLinks' not in bg[i];ag[i]['resourceLinks']=[r['proposedGoalVisualizationLink']]
 rr=next(x for x in rasters if x['goalId']==i);assert rr['selectedRaster']==r['selectedRaster'];original=rr['selectedRaster'];views=rr['actualSelectedInspectionRasters']
 for x in [original,*views]:verify(x)
 neutral.append({'goalId':i,'actualCurrentPNG':original,'nativeDimensions':[original['width'],original['height']],'actualProportionalViews':views,'futurePublicURL':r['proposedGoalVisualizationLink']['url'],'inactiveResourceLink':r['proposedGoalVisualizationLink'],'provider':'OpenAI builtin imagegen','provenance':ref(A/('prompts/six.v2.actual-imagegen-edit-provenance.json' if rr['selectedVersion']=='v2' else 'prompts/ten.actual-imagegen-prompts-and-output-provenance.json')),'independentApproval':False})
 dest=C/('app/public'+r['proposedGoalVisualizationLink']['url']);dest.parent.mkdir(parents=True,exist_ok=True);assert not dest.exists();shutil.copyfile(R/original['path'],dest)
assert set(g['id'] for g in before['goals'] if g!=ag[g['id']])==set(ids)
for i in ids:assert {k:v for k,v in ag[i].items() if k!='resourceLinks'}==bg[i]
protected335=read(V/'checks/frozen-inputs-and-inactive-candidate.actual.json')['protected335Ids'];eight=read(I/'neutral-current335-Bio8-inactive-integration.completed.entry.json')['goalIds'];protected343=protected335+eight;assert len(set(protected343))==343;assert not set(ids)&set(protected343)
cp(CAN,'inputs/current479-protected343.before.exact.json');cp(KIN,'inputs/current479-kinds394.exact.json');cp(QA,'inputs/current394-QA.before.exact.json');cp(REG,'inputs/current-registry.technical-baseline.exact.json');put('candidate/current479-only-ten-resourceLinks.inactive.json',after)
put('inputs/current343-exact-protected-IDs.json',{'schemaVersion':1,'current343':protected343,'inherited335':protected335,'adoptedEight':eight,'technicalBindingOnly':True})
for src,dst in [(A/'science/ten-whole-profiles-and-twenty-cases.author.json','science/ten-whole-profiles-twenty-cases.exact.json'),(A/'inputs/ten-whole-current-DE-EN-goals.neutral.json','science/ten-whole-DE-EN-goals.exact.json'),(A/'inputs/ten-whole-current-direct-source-witnesses.neutral.json','sources/ten-original41-whole-direct-source-witnesses.history.exact.json'),(A/'positive/ten-scientific-P.candidate-set.json','positive/ten-scientific-P.candidates.exact.json'),(A/'positive/ten-before-raster.author.review.jsonl','positive/ten-before-raster.original-records.exact.jsonl'),(A/'inputs/positive-criteria.exact.md','inputs/positive-criteria.exact.md'),(I/'native/current394-final-inactive.normal-model.actual.json','native/current394-protected343-before.actual-normal-model.exact.json'),(V/'native/current394-normal-review.view.exact.json','native/current394-normal-review.view.exact.json'),(A/'sourcefix/six-exact-primary-source-precision-deltas.author.json','sources/six-exact-primary-source-precision-deltas.author.exact.json')]:cp(src,dst)
put('inputs/ten-current-raster-bindings.neutral.json',{'schemaVersion':1,'role':'Exact ten current raster inputs; technical generation is not independent approval','goalIds':ids,'records':neutral,'humanApproval':False})
k=read(KIN);k['sourceLandscapePath']=str(P/'candidate/current479-only-ten-resourceLinks.inactive.json');put('candidate/current394-kinds.path-only.json',k)
q=read(QA)
for row in q['records']:
 if row['goalId'] not in ids:continue
 rr=next(x for x in neutral if x['goalId']==row['goalId']);assert row['visualizationState']=='missing'
 row.update({'landscapePath':str(P/'candidate/current479-only-ten-resourceLinks.inactive.json'),'visualizationState':'available','missingReason':'','imageUrl':rr['futurePublicURL'],'publicAssetPath':'app/public'+rr['futurePublicURL'],'canonicalAssetPath':rr['actualCurrentPNG']['path'],'assetSha256':rr['actualCurrentPNG']['sha256'],'umlautsCorrectChatGpt':'no','contentApprovedChatGpt':'no','chatGptReviewedAt':None,'chatGptReviewer':'','chatGptNotes':'Technical current raster binding; actual independent A/B reviews pending.','aiApproved':'no','aiReviewedAt':None,'aiReviewer':'','aiNotes':'No independent review supplied by technical owner.'})
put('candidate/current394-QA-plus-ten-pending.inactive.json',q)
pc=read(A/'positive/ten-before-raster.author.config.json');pc.update({'landscapePath':str(P/'candidate/current479-only-ten-resourceLinks.inactive.json'),'semanticKindLedgerPath':str(P/'candidate/current394-kinds.path-only.json'),'reviewCriteriaPath':str(P/'inputs/positive-criteria.exact.md'),'reviewPath':str(P/'positive/ten-current-raster.P.pending.review.jsonl'),'reviewedResourceTypes':['goal-visualization']});pc['scope']['label']='Current343-base ten whole profiles, current PNG and six bounded source changes; independent D/P/V/source pending; technical preparation';put('positive/ten-current-raster.P.pending.config.json',pc)
cfg=read(I/'native/current394-final-inactive.normal-model.config.json');cfg.update({'landscapePath':str(P/'candidate/current479-only-ten-resourceLinks.inactive.json'),'compositionViewPath':str(P/'native/current394-normal-review.view.exact.json'),'semanticKindLedgerPath':str(P/'candidate/current394-kinds.path-only.json'),'goalVisualizationQaPath':str(P/'candidate/current394-QA-plus-ten-pending.inactive.json'),'outputPath':str(P/'native/current394-after.actual-normal-model.json'),'evidenceReviewPaths':cfg['evidenceReviewPaths']+[str(P/'positive/ten-current-raster.P.pending.review.jsonl')]});put('native/current394-after.normal.config.json',cfg)
atlas=read(pathlib.Path('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'));assert len(atlas['mappingPaths'])==31;hemap=atlas['mappingPaths'][6];heex=read(pathlib.Path(hemap))['sourceExtractionPath'];assert (R/hemap).read_bytes()==(R/A/'inputs/HE-whole157-144-before-six-source-precision.exact.json').read_bytes();assert (R/heex).read_bytes()==(R/A/'inputs/HE-whole144-before-six-source-precision.exact.json').read_bytes()
cp(pathlib.Path(heex),'sources/HE-whole144.current-before.exact.json');cp(pathlib.Path(hemap),'sources/HE-whole157-144.current-before.exact.json');cp(A/'sourcefix/HE-whole144-six-precision-authored-operationalization.candidate.json','sources/HE-whole144-six-precision.inactive.exact.json')
mp=read(A/'sourcefix/HE-whole157-144-six-partial-edges.candidate.json');mp['sourceExtractionPath']=str(P/'sources/HE-whole144-six-precision.inactive.exact.json');put('sources/HE-whole157-144-six-partial.inactive.path-only.json',mp)
ex=read(P/'sources/HE-whole144-six-precision.inactive.exact.json');ox=read(pathlib.Path(heex));changed=[g['id'] for g in ex['sourceGoals'] if g!=next(o for o in ox['sourceGoals'] if o['id']==g['id'])];assert len(changed)==6
for g in ex['sourceGoals']:
 if g['id'] not in changed:assert g==next(o for o in ox['sourceGoals'] if o['id']==g['id'])
impact=[]
for d in read(pathlib.Path(hemap))['decisions']:
 if d['sourceGoalId'] in changed:impact.extend(d['canonicalGoalIds'])
assert set(i.split(':')[-1] for i in impact)<=set(ids)
put('checks/current343-and-six-source-goals.actual-base-check.json',{'schemaVersion':1,'authorOwnBindingsVerified':89,'currentWhole479SHA256':ref(CAN)['sha256'],'whole479ChangesOnlyTenResourceLinks':ids,'all469OtherWholeGoalsExact':True,'current343WholeGoalsExact':True,'currentHEBeforeExactAuthorBefore':True,'onlySixSourceGoalObjectsChanged':changed,'all138OtherSourceGoalObjectsExact':True,'old41WitnessHistoryByteExact':True,'changedSourceDirectCanonicalTargets':impact,'protected343DirectChangedSourceIntersection':sorted(set(i.split(':')[-1] for i in impact)&set(protected343)),'noSourceCourseApproval':True,'approval':'PENDING','activeWrites':[]})
put('sources/current-operative-atlas.exact.json',atlas)
# Keep normal snapshot alias semantics; exact committable evidence copies are current inputs. Original cached spellings are explicitly historical/local-only, not portable files.
primary_paths={s['path'] for s in atlas['sourceDocumentSnapshots']}
required=[]
for path in atlas['mappingPaths']:
 m=read(pathlib.Path(path));e=read(pathlib.Path(m['sourceExtractionPath']));required.extend([ref(pathlib.Path(path)),ref(pathlib.Path(m['sourceExtractionPath']))]);docs=e.get('sourceDocuments') or [e['sourceDocument']]
 for d in docs:primary_paths.add(d['path'])
portable=[]
for path in sorted(primary_paths):
 f=R/path;assert f.is_file(),path;b=ref(pathlib.Path(path));ext='.pdf' if '.pdf' in path.lower() else '.html';dst='primary/'+b['sha256'][7:19]+'/bundle/book'+ext
 if not (R/P/dst).exists():cp(pathlib.Path(path),dst)
 portable.append({'originalCachedSpellingDiagnosticOnly':path,'exactCurrentPortableCopy':ref(P/dst),'officialReferences':[s['url'] for s in atlas['sourceDocumentSnapshots'] if s['path']==path],'normalOfflineSnapshotAliasSupported':path in {s['path'] for s in atlas['sourceDocumentSnapshots']}})
put('sources/all-actual-current-primary-portable-copies.json',{'schemaVersion':1,'records':portable,'cacheSpellingsAreNotPortableClaims':True,'normalValidatorOrFilenameExceptionsChanged':False})
for label,land,kinds in [('before','inputs/current479-protected343.before.exact.json','inputs/current479-kinds394.exact.json'),('after','candidate/current479-only-ten-resourceLinks.inactive.json','candidate/current394-kinds.path-only.json')]:
 ac=copy.deepcopy(atlas);ac['landscapePath']=str(P/land);ac['semanticKindLedgerPath']=str(P/kinds)
 if label=='after':
  ac['mappingPaths'][6]=str(P/'sources/HE-whole157-144-six-partial.inactive.path-only.json');ac['sourceDocumentSnapshots']=[s for s in ac['sourceDocumentSnapshots'] if s['path']!=ox['sourceDocument']['path']]
 put('sources/'+label+'394-atlas.normal.config.json',ac)
# Current successor witnesses bind real objects, while the original41 witness file remains exact history.
ws=read(A/'inputs/ten-whole-current-direct-source-witnesses.neutral.json');changes=read(P/'sources/six-exact-primary-source-precision-deltas.author.exact.json')['changes'];newws=copy.deepcopy(ws)
for row in newws['rows']:
 for w in row['wholeDirectSourceWitnesses']:
  if w['extraction']['path']!=heex:continue
  sid=w['wholeCurrentSourceGoal']['id'];w['wholeCurrentSourceGoal']=next(x for x in ex['sourceGoals'] if x['id']==sid);w['wholeCurrentMappingRecord']=next(x for x in mp['mappings'] if x['legacyGoalId']==sid and x['canonicalGoalId']==row['goalId']);w['wholeCurrentSourceDecisions']=[x for x in mp['decisions'] if x['sourceGoalId']==sid];w['mapping']=ref(P/'sources/HE-whole157-144-six-partial.inactive.path-only.json');w['extraction']=ref(P/'sources/HE-whole144-six-precision.inactive.exact.json');w['sourceDocument']=ex['sourceDocument'];w['newSourceApproval']=False
newws['role']='Current ten whole direct source witnesses after only six bounded AUTHOR source corrections; technical rebinding, independent source/course review pending';newws['newSourceApproval']=False;put('sources/ten-current41-whole-direct-source-witnesses.neutral.json',newws)
put('inputs/required-current-normal-binding-inputs.exact.json',{'schemaVersion':1,'bindings':required+[ref(CAN),ref(KIN),ref(QA),ref(REG),ref(pathlib.Path(atlas['durationModelPolicyPath']))],'originalPrimaryAliasesDiagnosticOnly':True,'allActualCurrentPrimaryCopies':ref(P/'sources/all-actual-current-primary-portable-copies.json')})
shutil.copytree(R/P,C/P)
for p in [A/'primary/HE-KC2024-biologie.whole-current.pdf.snapshot',A/'primary/HE-physical-page043.actual.txt',A/'primary/HE-physical-page043.actual.png']:
 dest=C/p;dest.parent.mkdir(parents=True,exist_ok=True)
 if dest.exists():assert dest.read_bytes()==(R/p).read_bytes()
 else:shutil.copyfile(R/p,dest)
for p in required:
 dest=C/p['path'];dest.parent.mkdir(parents=True,exist_ok=True)
 if dest.exists():assert dest.read_bytes()==(R/p['path']).read_bytes(),dest
 else:shutil.copyfile(R/p['path'],dest)
shutil.copyfile(pathlib.Path(__file__),R/P/'technical-prepare-current343.py')
print(json.dumps({'namespace':str(P),'capsule':str(C),'authorFiles':89,'tenResourceLinksOnly':True,'sixSourceGoalsOnly':True,'preservedSourceGoals':138,'currentPrimaryAliases':len(portable),'portableDistinctPrimaryBytes':len(set(x['exactCurrentPortableCopy']['path'] for x in portable)),'strictGain':0,'activeWrites':[]}))
