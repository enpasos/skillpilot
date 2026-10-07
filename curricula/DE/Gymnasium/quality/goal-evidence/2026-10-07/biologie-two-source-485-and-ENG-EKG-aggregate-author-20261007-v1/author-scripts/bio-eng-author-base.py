# SPDX-License-Identifier: Apache-2.0
exec(open('/tmp/bio-eng-author-write.py').read().split("s=rd(R/")[0])
B=O/'native-isolated-repository';C='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json';L='curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json';bio='08a43a1b-d97e-522c-9dfa-c950a493364e'
def cp(src,dst):dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst)
def sh(p):return hashlib.sha256(p.read_bytes()).hexdigest()
current=rd(R/C); canon=copy.deepcopy(current); gmap={g['id']:g for g in canon['goals']};guard=rd(OLD/'guarded-inert-apply-manifest.actual.json'); changes=[]
for row in guard['canonical']['wholeGoalDiffs']:
 g=gmap[row['goalId']];before=copy.deepcopy(g)
 for f in row['changedFields']:
  assert g.get(f)==row['beforeWholeGoal'].get(f),(g['id'],f)
  g[f]=copy.deepcopy(row['afterWholeGoal'][f])
 changes.append({'goalId':g['id'],'fieldPaths':row['changedFields'],'beforeWholeGoal':before,'afterWholeGoal':copy.deepcopy(g)})
new=rd(O/'candidate/new-ENG-EKG.whole-goal.DE-EN.author.json');assert new['id'] not in gmap
parent=gmap[P];before=copy.deepcopy(parent);parent['contains'].append(N);changes.append({'goalId':P,'fieldPaths':['contains'],'beforeWholeGoal':before,'afterWholeGoal':copy.deepcopy(parent),'containsOperation':'append exactly one new bounded EA goal; every existing child and order remains exact'})
canon['goals'].append(new);wr(B/C,canon);cp(R/C,O/'original-archives/current-live-after-Bio4.canonical.exact.json');cp(R/L,O/'original-archives/current-live-after-Bio4.semantic-ledger.exact.json');cp(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json',B/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json')
oldfields=['8832a55d-988a-5848-81d4-1dc529f7b6e9','9112f03c-86f5-5f64-b8d6-4ec1d687d7ed','e026e617-09d5-53d1-aa11-9cdb8f3d6b00','8c6774a3-2a98-5b76-9ecd-8ad97f97440c']; routes={oldfields[0]:('9b966664-906b-5a5d-8008-cae18de043aa','GA/EA bounded SSRI-mediated synaptic transmitter availability component only. Current LK model does not establish complete GA course coverage. Depression symptoms, multifactorial causes, psychosocial/therapy duties beyond this supplied model remain HOLD.'),oldfields[1]:('9b966664-906b-5a5d-8008-cae18de043aa','Legacy GA Depression route: supplied SSRI/synapse mechanism component only, not complete GA coverage or symptoms/therapy/psychosocial duty.'),oldfields[2]:(N,'EA only: supplied surface aggregate electrical recordings explain recording possibility and bounded medical function information for ENG peripheral nerves and EKG cardiac tissue. Full clinical method/individual diagnostic assessment remains HOLD; no GA or HE source scope asserted.'),oldfields[3]:(F,'EA only: supplied neuronal structure/signalling disturbance explains function change partially. Full named MS/Parkinson symptoms duty remains HOLD; BY Alzheimer is not asserted.')};mfiles=[];allmaps=[];sourcepaths=set()
for p in sorted((R/'curricula/DE/Gymnasium/mapping').rglob('*.json')):
 d=rd(p)
 if d.get('targetLandscapeId')!=bio:continue
 rel=p.relative_to(R);allmaps.append(str(rel));orig=copy.deepcopy(d);hit=False
 for m in d.get('mappings',[]):
  sid=m.get('legacyGoalId')
  if sid in routes and m.get('canonicalGoalId') in [F,'afde0001-d7d7-5ed3-8a60-383e8da5620e']:
   m['canonicalGoalId']=routes[sid][0];m['matchType']='partial';hit=True
 for x in d.get('decisions',[]):
  sid=x.get('sourceGoalId')
  if sid in routes and set(x.get('canonicalGoalIds',[]))<=set([F,'afde0001-d7d7-5ed3-8a60-383e8da5620e']):
   x.update(decision='mapped',canonicalGoalIds=[routes[sid][0]],matchType='partial',rationale=routes[sid][1]);hit=True
 if hit:
  if 'summary' in d and all(k in d['summary'] for k in ['exactMappings','partialMappings']):
   d['summary']['exactMappings']=sum(x.get('matchType')=='exact' for x in d['mappings']);d['summary']['partialMappings']=sum(x.get('matchType')=='partial' for x in d['mappings'])
  cp(p,O/'original-archives'/rel);mfiles.append({'path':str(rel),'beforeSha256':sh(p),'beforeSelectedMappings':[x for x in orig.get('mappings',[]) if x.get('legacyGoalId') in routes],'afterSelectedMappings':[x for x in d.get('mappings',[]) if x.get('legacyGoalId') in routes],'beforeSelectedDecisions':[x for x in orig.get('decisions',[]) if x.get('sourceGoalId') in routes],'afterSelectedDecisions':[x for x in d.get('decisions',[]) if x.get('sourceGoalId') in routes],'candidatePath':str((B/rel).relative_to(R)),'candidateSha256':None,'sourceOnlyNoClinicalApproval':True})
 wr(B/rel,d)
 if d.get('sourceExtractionPath'):sourcepaths.add(d['sourceExtractionPath'])
for rel in sourcepaths:cp(R/rel,B/rel)
# Exact source registries and minimal native source landscapes, no other canonical subjects.
for p in (R/'curricula/DE/Gymnasium/provenance').glob('*.json'):cp(p,B/p.relative_to(R))
sourceids={rd(B/rel).get('sourceLandscapeId') for rel in allmaps}
for d in current['goals']:
 prov=d.get('extendedData',{}).get('provenance',{});sourceids.add(prov.get('sourceLandscapeId'));sourceids.update(prov.get('additionalSourceLandscapeIds',[]))
sourceids.discard(None)
for path,dirs,files in os.walk(R/'curricula/DE/Gymnasium/input'):
 for name in files:
  if not name.endswith('.json'):continue
  p=Path(path)/name
  try:v=rd(p)
  except Exception:continue
  if isinstance(v,dict) and v.get('landscapeId') in sourceids:cp(p,B/p.relative_to(R))
(B/'curricula/DE/Gymnasium/quality/memory-card-review').mkdir(parents=True,exist_ok=True)
for p in (R/'curricula/DE/Gymnasium/quality/memory-card-review').glob('*.config.json'):
 d=rd(p)
 if d.get('landscapeId')==bio:
  cp(p,B/p.relative_to(R));cp(R/d['reviewPath'],B/d['reviewPath'])
# Native copied helpers retain exact bytes; root-sensitive P/compile use this own isolated repository.
for name in ['applicabilityCompiler.ts','positiveGoalEvidenceProfileModel.ts','positiveGoalEvidenceReview.ts','materializePositiveGoalEvidenceCandidates.ts']:cp(R/'app/scripts'/name,B/'app/scripts'/name)
for dest,target in [(B/'app/src',R/'app/src'),(B/'app/node_modules',R/'app/node_modules'),(B/'contracts',R/'contracts')]:
 dest.parent.mkdir(parents=True,exist_ok=True)
 if not dest.exists():dest.symlink_to(os.path.relpath(target,dest.parent),target_is_directory=True)
# Public image roots are portable links to existing unchanged image folders, plus the new owned candidate bytes.
asset=B/'app/public/assets/goal-visualizations/biologie';asset.mkdir(parents=True,exist_ok=True)
for target in (R/'app/public/assets/goal-visualizations/biologie').iterdir():
 if target.is_dir() and not (asset/target.name).exists():(asset/target.name).symlink_to(os.path.relpath(target,asset),target_is_directory=True)
cp(O/'candidate/assets/goal-visualizations/biologie'/N/(N+'.png'),asset/N/(N+'.png'))
prior=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-neuro21-final-reviewed-images-native-preparation-20261007-v1/isolated-repository'
cp(prior/'inputs/current390.composition-view.exact.json',B/'inputs/current391.composition-view.author.json')
qa=rd(R/'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json');q=copy.deepcopy(next(x for x in qa['records'] if x['goalId']==F));q.update(goalId=N,title=new['title'],description=new['description'],imageUrl=new['resourceLinks'][0]['url'],publicAssetPath='app/public'+new['resourceLinks'][0]['url'],canonicalAssetPath='curricula/DE/Gymnasium/visualizations/biologie/'+N+'/'+N+'.png',assetSha256='sha256:'+sh(asset/N/(N+'.png')),aiApproved='no',aiApprovedAssetSha256='',aiReviewedAt=None,aiReviewer='',aiNotes='Author candidate only; independent actual raster review pending.',chatGptNotes='Author candidate only; no quality approval.',humanApproved='no');qa['records'].append(q);wr(B/'inputs/visualization-qa.author.json',qa)
cfg=rd(prior/'config/full-final390.book.config.json');cfg.update(bookId='bio-two-source-clinical-author-current391',title='Biologie – aktueller Quellenbaustein ENG/EKG',compositionViewPath='inputs/current391.composition-view.author.json',goalVisualizationQaPath='inputs/visualization-qa.author.json',semanticKindLedgerPath='inputs/semantic-kinds.author.json',outputPath='outputs/full-current391.book-model.json');wr(B/'config/current391.book.config.json',cfg)
wr(O/'guarded-author-candidate.current-Bio4-base.manifest.json',{'liveCanonicalBaseSha256':sh(R/C),'liveBaseHasIntegratedBio4':True,'canonicalPath':C,'fieldPatches':changes,'newGoal':new,'mappingPatches':mfiles,'semanticLedgerPath':L,'nativeIsolatedRepository':str(B.relative_to(R)),'allExistingRequiresAndExamDataExact':True,'wholeCloneOverwriteForbidden':True,'humanApproval':False,'activeWrites':False,'otherClinicalSourceDutiesRemainHOLD':True})
wr(O/'native-input-routes.author.json',{'allBioMappingPaths':allmaps,'sourceExtractionPaths':sorted(sourcepaths),'newGoalId':N,'sourceRoutes':routes,'copiedNativeHelpers':[{ 'path':'app/scripts/'+name,'sha256':sh(R/'app/scripts'/name)} for name in ['applicabilityCompiler.ts','positiveGoalEvidenceProfileModel.ts','positiveGoalEvidenceReview.ts','materializePositiveGoalEvidenceCandidates.ts']],'portableRelativeLinksOnly':True})
print('candidate live rebase prepared',len(canon['goals']),len(allmaps),len(mfiles))
