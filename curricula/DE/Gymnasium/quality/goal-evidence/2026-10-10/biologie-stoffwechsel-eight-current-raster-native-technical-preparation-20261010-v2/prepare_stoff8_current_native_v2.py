# SPDX-License-Identifier: Apache-2.0
import pathlib,json,hashlib,shutil,datetime,subprocess
R=pathlib.Path('/home/enpasos/projects/skillpilot')
B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
A=B/'biologie-stoffwechsel-eight-whole-material-and-raster-author-candidate-v1'
O=B/'biologie-stoffwechsel-eight-current335-native-preparation-pending-technical-20261010-v1'
P=B/'biologie-stoffwechsel-eight-current-raster-native-technical-preparation-20261010-v2'
C=pathlib.Path((R/'tmp/m7-resumption-20261010/biologie-four-native-technical/capsule.actual.path.txt').read_text().strip())
def read(p): return json.loads((R/p).read_text())
def ref(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,x):
 f=R/P/p;f.parent.mkdir(parents=True,exist_ok=True);assert not f.exists(),f
 f.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return ref(P/p)
def cp(src,dst):
 f=R/P/dst;f.parent.mkdir(parents=True,exist_ok=True);assert not f.exists(),f
 shutil.copyfile(R/src,f);return ref(P/dst)
def verify(x):assert ref(pathlib.Path(x['path']))==x,x['path']
assert not (R/P).exists()
assert ref(A/'neutral-eight-whole-science-and-current-rasters.author-checkpoint.entry.json')['sha256']=='sha256:9ceb15e6ad120ca85e8727c73c5ff30a2edfbedbaba3632af1eff7aed9fc7766'
assert ref(A/'author.checkpoint.final.freeze.json')['sha256']=='sha256:5b656d1714f2523f53815c3046f6f5e799aff060c460da54613919ac238bff20'
af=read(A/'author.checkpoint.final.freeze.json');assert len(af['ownCurrentRegularFileBindings'])==140;assert len(af['currentRegularTechnicalInputBindings'])==10
for x in af['ownCurrentRegularFileBindings']+af['currentRegularTechnicalInputBindings']:verify(x)
assert ref(O/'FINAL.current335-before-only-Stoffwechsel8-pending.technical.freeze.json')['sha256']=='sha256:06a28681f6bd908baa1ff56f6f55dba4129cc873ba8e0656a149304982f6d254'
of=read(O/'FINAL.current335-before-only-Stoffwechsel8-pending.technical.freeze.json');prior_count=len(of['ownFiles'])
for x in of['ownFiles']+of['requiredExternalFiles']:verify(x)
entry=read(A/'neutral-eight-whole-science-and-current-rasters.author-checkpoint.entry.json');ids=entry['goalIds'];assert len(ids)==8
old=read(O/'normal-Stoffwechsel8-pending-neutral-entry.json');assert len(old['actualExistingProtected335GoalIds'])==335;assert not set(ids)&set(old['actualExistingProtected335GoalIds'])
before=read(pathlib.Path(entry['current335Before479']['path']));after=read(pathlib.Path(entry['inactiveOnlyEightResourceLinksWhole479']['path']))
assert len(before['goals'])==len(after['goals'])==479
bg={g['id']:g for g in before['goals']};ag={g['id']:g for g in after['goals']};assert list(bg)==list(ag)
delta=[i for i in bg if bg[i]!=ag[i]];assert set(delta)==set(ids)
for i in ids:assert dict(bg[i],resourceLinks=ag[i]['resourceLinks'])==ag[i]
for i in bg:
 if i not in ids:assert bg[i]==ag[i]
for src,dst in [
 (pathlib.Path(entry['current335Before479']['path']),'inputs/current479-protected335.before.exact.json'),
 (pathlib.Path(entry['inactiveOnlyEightResourceLinksWhole479']['path']),'candidate/current479-only-eight-resourceLinks.inactive.exact.json'),
 (pathlib.Path(entry['wholeKindsCurrent394']['path']),'inputs/current479-kinds394.exact.json'),
 (O/'inputs/current394-QA.before.exact.json','inputs/current394-QA.before.exact.json'),
 (O/'inputs/current335-exact-ID-authority.exact.json','inputs/current335-exact-ID-authority.exact.json'),
 (O/'native/current394-before-only.actual-normal-model.json','native/current394-before.actual-normal-model.exact.json'),
 (O/'native/current394-before-only.normal-review.view.exact.json','native/current394-normal-review.view.exact.json'),
 (pathlib.Path(entry['wholeScience']['path']),'science/eight-whole-profiles-sixteen-cases.exact.json'),
 (pathlib.Path(entry['wholeGoals']['path']),'science/eight-whole-DE-EN-goals.exact.json'),
 (pathlib.Path(entry['wholeSourceObjectsAnd50Witnesses']['path']),'sources/eight-source-objects-fifty-witnesses.exact.json'),
 (pathlib.Path(entry['P8ScientificCandidateSet']['path']),'positive/eight-scientific-P.candidates.exact.json'),
 (pathlib.Path(entry['P8BeforeRasterRecords']['path']),'positive/eight-before-raster.original-records.exact.jsonl'),
 (A/'inputs/positive-criteria.exact.md','inputs/positive-criteria.exact.md')]:cp(src,dst)
science=read(P/'science/eight-whole-profiles-sixteen-cases.exact.json');assert len(science['records'])==8;assert sum(len(x['cases']) for x in science['records'])==16
idx=read(pathlib.Path(entry['actualCurrentSelectedEightRasters']['path']));neutral=[]
for row in idx['records']:
 assert row['goalId'] in ids
 for x in [row['actualCurrentPNG'],*row['actualProportionalViews'],row['actualProviderProvenance'],row['actualPrompt']]:verify(x)
 assert ag[row['goalId']]['resourceLinks']==[row['inactiveResourceLink']]
 dest=C/row['futurePublicPath'];dest.parent.mkdir(parents=True,exist_ok=True)
 assert not dest.exists(),dest
 shutil.copyfile(R/row['actualCurrentPNG']['path'],dest)
 assert hashlib.sha256(dest.read_bytes()).hexdigest()==row['actualCurrentPNG']['sha256'][7:]
 neutral.append({k:row[k] for k in ['goalId','actualCurrentPNG','nativeDimensions','actualProportionalViews','actualProvider','actualProviderProvenance','actualPrompt','futurePublicURL','inactiveResourceLink']})
put('inputs/eight-current-raster-bindings.neutral.json',{'schemaVersion':1,'role':'Exact current selected raster inputs; no author judgments or independent approval','goalIds':ids,'records':neutral,'independentApproval':False,'humanApproval':False})
kp=read(P/'inputs/current479-kinds394.exact.json');kp['sourceLandscapePath']=str(P/'candidate/current479-only-eight-resourceLinks.inactive.exact.json');put('candidate/current394-kinds.path-only.json',kp)
qa=read(P/'inputs/current394-QA.before.exact.json')
for row in qa['records']:
 if row['goalId'] not in ids:continue
 rr=next(x for x in neutral if x['goalId']==row['goalId'])
 assert row['visualizationState']=='missing'
 row.update({'landscapePath':str(P/'candidate/current479-only-eight-resourceLinks.inactive.exact.json'),'visualizationState':'available','missingReason':'','imageUrl':rr['futurePublicURL'],'publicAssetPath':'app/public'+rr['futurePublicURL'],'canonicalAssetPath':rr['actualCurrentPNG']['path'],'assetSha256':rr['actualCurrentPNG']['sha256'],'umlautsCorrectChatGpt':'no','contentApprovedChatGpt':'no','chatGptReviewedAt':None,'chatGptReviewer':'','chatGptNotes':'Technical raster binding only; independent V A/B pending.'})
put('candidate/current394-QA-plus-eight-pending.inactive.json',qa)
pc=read(pathlib.Path(entry['P8BeforeRasterConfig']['path']));pc.update({'landscapePath':str(P/'candidate/current479-only-eight-resourceLinks.inactive.exact.json'),'semanticKindLedgerPath':str(P/'candidate/current394-kinds.path-only.json'),'reviewCriteriaPath':str(P/'inputs/positive-criteria.exact.md'),'reviewPath':str(P/'positive/eight-current-raster.P.pending.review.jsonl'),'reviewedResourceTypes':['goal-visualization']});pc['scope']['label']='Current-raster bound whole scientific eight candidates; independent D/P/V pending; technical preparation only';put('positive/eight-current-raster.P.pending.config.json',pc)
cfg=read(O/'native/current394-before-only.normal.config.json');cfg.update({'landscapePath':str(P/'candidate/current479-only-eight-resourceLinks.inactive.exact.json'),'compositionViewPath':str(P/'native/current394-normal-review.view.exact.json'),'semanticKindLedgerPath':str(P/'candidate/current394-kinds.path-only.json'),'goalVisualizationQaPath':str(P/'candidate/current394-QA-plus-eight-pending.inactive.json'),'outputPath':str(P/'native/current394-after.actual-normal-model.json'),'evidenceReviewPaths':cfg['evidenceReviewPaths']+[str(P/'positive/eight-current-raster.P.pending.review.jsonl')]});put('native/current394-after.normal.config.json',cfg)
atlas=read(pathlib.Path('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'));assert len(atlas['mappingPaths'])==31
put('sources/current-operative-atlas.exact.json',atlas)
for label,land,kinds in [('before','inputs/current479-protected335.before.exact.json','inputs/current479-kinds394.exact.json'),('after','candidate/current479-only-eight-resourceLinks.inactive.exact.json','candidate/current394-kinds.path-only.json')]:
 ac=dict(atlas,landscapePath=str(P/land),semanticKindLedgerPath=str(P/kinds));put('sources/'+label+'394-atlas.normal.config.json',ac)
put('checks/frozen-inputs-and-inactive-candidate.actual.json',{'schemaVersion':1,'authorOwnBindingsVerified':140,'authorTechnicalInputBindingsVerified':10,'priorNativeOwnBindingsVerified':prior_count,'protected335Ids':old['actualExistingProtected335GoalIds'],'whole479GoalDelta':delta,'unaffectedWholeGoalsExact':471,'wholeProfiles':8,'wholeCases':16,'fiftySourceWitnessesExact':True,'semanticKindsAMUnchanged':True,'source31PairsUnchanged':True,'approval':'PENDING','activeWrites':[],'strictGain':0})
put('inputs/required-current-bindings.exact.json',{'schemaVersion':1,'bindings':of['requiredExternalFiles']+af['currentRegularTechnicalInputBindings']})
shutil.copytree(R/P,C/P,dirs_exist_ok=False)
shutil.copyfile(pathlib.Path(__file__),R/P/'prepare_stoff8_current_native_v2.py')
print(json.dumps({'namespace':str(P),'capsule':str(C),'checkedAuthorOwn':140,'checkedAuthorInputs':10,'checkedPriorNativeOwn':prior_count,'resourceOnlyGoalDelta':delta,'profiles':8,'cases':16,'publicCopiesIgnoredOnly':8,'activeWrites':[]}))
