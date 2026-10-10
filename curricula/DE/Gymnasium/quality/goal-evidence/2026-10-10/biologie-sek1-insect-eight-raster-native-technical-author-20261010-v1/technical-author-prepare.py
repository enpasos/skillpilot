import copy,datetime,hashlib,json,os,shutil,tempfile
from pathlib import Path
R=Path('/home/enpasos/projects/skillpilot')
B=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
P=B/'biologie-sek1-insect-eight-raster-native-technical-author-20261010-v1'
S=B/'biologie-sek1-insect-eight-whole-material-author-candidate-v1'
F=B/'biologie-q1-four-risk-ethics-current-native-technical-author-20261010-v1'
T=R/'tmp/m7-resumption-20261010/biologie-insect-eight-native-technical'
C=Path((R/'tmp/m7-resumption-20261010/biologie-four-native-technical/capsule.actual.path.txt').read_text().strip())
refs=[]
def read(p):return json.loads((R/p).read_text())
def ref(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(name,data):
 p=R/P/name;p.parent.mkdir(parents=True,exist_ok=True)
 assert not p.exists(),str(p)
 if not isinstance(data,bytes):data=(json.dumps(data,ensure_ascii=False,indent=2)+'\n').encode()
 with tempfile.NamedTemporaryFile(dir=T,delete=False) as f:f.write(data);stage=f.name
 os.replace(stage,p);return str(p.relative_to(R))
def exact(src,dest):refs.append(ref(src));return put(dest,(R/src).read_bytes())
ids=read(S/'author-stage-one.before-independent-and-raster.entry.json')['goalIds'];assert len(ids)==8
atlasPath=Path('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json');atlas=read(atlasPath)
base=Path(atlas['landscapePath']);kind=Path(atlas['semanticKindLedgerPath'])
beforePath=exact(base,'inputs/current479327-canonical.exact.json');kpath=exact(kind,'inputs/current479394-semantic-kinds.exact.json')
original=read(S/'inputs/whole479-current323.exact.json');current=read(base)
og={g['id']:g for g in original['goals']};cg={g['id']:g for g in current['goals']}
assert len(og)==len(cg)==479 and list(og)==list(cg)
baseChanges=[gid for gid in og if og[gid]!=cg[gid]]
assert len(baseChanges)==4
for gid in baseChanges:assert {**og[gid],'resourceLinks':cg[gid]['resourceLinks']}==cg[gid]
assert not set(ids)&set(baseChanges)
for gid in ids:assert og[gid]==cg[gid]
futurePath=put('candidate/whole479327-with-eight-raster-links.inactive.json',current)
kb=read(kind);ka=copy.deepcopy(kb);kb['sourceLandscapePath']=beforePath;ka['sourceLandscapePath']=futurePath
kbpath=put('candidate/before394-kinds.path-only.json',kb);kapath=put('candidate/after394-kinds.path-only.json',ka)
prot=exact(B/'biologie-q1-four-reviewed-active-adoption-technical-root-v1/current327-exact-strict-ID-gain-and-protected-subjects.actual.json','inputs/current327-exact-strict-ID-authority.exact.json')
protected=next(x for x in read(Path(prot))['subjects'] if x['subject']=='biologie')['strictCompleteGoalIds'];assert len(protected)==327 and not set(protected)&set(ids)
exact(S/'science/eight-whole-profiles-and-sixteen-cases.author.json','science/eight-whole-profiles-and-sixteen-cases.exact.json')
exact(S/'inputs/eight-whole-current-DE-EN-goals.exact.json','science/eight-whole-DE-EN-goals.before-raster.exact.json')
exact(S/'sources/eight-whole-BY-source-objects.exact.json','sources/eight-whole-BY-source-objects.exact.json')
criteria=exact(S/'inputs/positive-criteria.exact.md','inputs/positive-criteria.exact.md')
beforeP=exact(S/'positive/eight-before-raster.author.review.jsonl','positive/eight-before-raster.root-authored.exact.jsonl')
pcand=read(S/'positive/eight-scientific-P.candidate-set.json');pcand['reviewId']='biologie-sek1-insect-eight-current-raster-native-author-20261010-v1';pcand['reviewedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat();pcand['reviewer']='Codex technical/raster author; original root-authored full scientific profiles and sixteen bilingual cases unchanged; independent current Native D/P/V reviews pending'
for g in pcand['goals']:
 g['reason']='Exact original whole scientific profile and complete bilingual cases retained. Normal materializer binds actual newly authored raster bytes and current inputs. Technical/raster authoring is not independent scientific, learner or human approval.'
 g['dissent']=['Original full source objects and actual whole source/program obligations retained; legal clearance and Human approval remain separate.','Eight actual raster and Native candidates have no independent current D/P/V verdict yet.']
pcandidates=put('positive/eight-current-raster.P.technical-candidates.json',pcand)
pc=read(S/'positive/eight-before-raster.author.config.json');pc.update({'reviewId':pcand['reviewId'],'landscapePath':futurePath,'semanticKindLedgerPath':kapath,'reviewCriteriaPath':criteria,'reviewPath':str(P/'positive/eight-current-raster.P.author.review.jsonl')});pc['scope']['label']='Exactly8 original insect whole scientific profiles with current authored rasters; Native D/P/V independent reviews pending'
pcpath=put('positive/eight-current-raster.P.author.config.json',pc)
qaPath=Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json');qbefore=exact(qaPath,'inputs/current394-QA.exact.json');qafter=read(qaPath)
for row in qafter['records']:
 if row['goalId'] in ids:
  assert row['visualizationState']=='missing'
  gid=row['goalId'];png=ref(P/f'assets/biologie/{gid}/{gid}.png')
  row.update({'landscapePath':futurePath,'visualizationState':'available','missingReason':'','imageUrl':f'/assets/goal-visualizations/biologie/{gid}/{gid}.png','publicAssetPath':f'app/public/assets/goal-visualizations/biologie/{gid}/{gid}.png','canonicalAssetPath':png['path'],'assetSha256':png['sha256'],'aiApproved':'no','aiApprovedAssetSha256':'','aiReviewedAt':None,'aiReviewer':'','aiNotes':'New author candidate only. Actual original/360/680 author inspection is not independent V approval.','humanApproved':'no'})
qapath=put('candidate/whole394-eight-raster-QA.not-approved.json',qafter)
oldP8=exact(F/'positive/eight-reviewed-current-context-P.records.exact.jsonl','positive/previous-eight-regulation.exact.jsonl')
oldP4=exact(F/'positive/four-current-raster-P.author.review.jsonl','positive/previous-four-risk-ethics.exact.jsonl')
view=exact(F/'native/full394-normal-review.view.exact.json','native/full394-normal-review.view.exact.json')
cfg=read(F/'native/after394-current-four.normal.config.json');cfg.update({'bookId':'biologie-insect-eight-whole394-native-20261010-v1','title':'Biologie – ganze394-Ziele-Prüfsicht mit acht Insekten-Vergleichsbildern','landscapePath':beforePath,'semanticKindLedgerPath':kbpath,'goalVisualizationQaPath':qbefore,'evidenceReviewPaths':[oldP8,oldP4,beforeP],'compositionViewPath':view,'outputPath':str(P/'native/before394-insect-eight.normal-model.json')})
put('native/before394-insect-eight.normal.config.json',cfg)
afterCfg=copy.deepcopy(cfg);afterCfg.update({'landscapePath':futurePath,'semanticKindLedgerPath':kapath,'goalVisualizationQaPath':qapath,'evidenceReviewPaths':[oldP8,oldP4,pc['reviewPath']],'outputPath':str(P/'native/after394-insect-eight.normal-model.json')});put('native/after394-insect-eight.normal.config.json',afterCfg)
exact(atlasPath,'sources/current-operative-atlas-config.exact.json')
ab=copy.deepcopy(atlas);aa=copy.deepcopy(atlas);ab.update({'landscapePath':beforePath,'semanticKindLedgerPath':kbpath});aa.update({'landscapePath':futurePath,'semanticKindLedgerPath':kapath});put('sources/before394-operative-atlas.normal.config.json',ab);put('sources/after394-operative-atlas.normal.config.json',aa)
sourceRefs=[]
for m in atlas['mappingPaths']:
 s=read(Path(m))['sourceExtractionPath']
 sourceRefs.extend([ref(Path(m)),ref(Path(s))])
 for x in [m,s]:
  target=C/x;target.parent.mkdir(parents=True,exist_ok=True)
  if not target.exists() or target.read_bytes()!=(R/x).read_bytes():shutil.copy2(R/x,target)
for path in [Path(atlas['durationModelPolicyPath'])]:
 sourceRefs.append(ref(path));target=C/path;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(R/path,target)
put('sources/whole31-operative-source-pairs.exact.references.json',{'schemaVersion':1,'mappingSourcePairs':len(atlas['mappingPaths']),'inputs':sourceRefs,'noSourceJudgmentChanged':True,'current3312Bounded8229Contribution':'Only authored operationalization, partial contribution; no official simulation mandate or whole original source/course clearance.'})
for src in ['author-stage-one.before-independent-and-raster.entry.json','author-stage-two.normal-P8.actual.json']:refs.append(ref(S/src))
put('inputs/exact-original-material-base-and-protection.references.json',{'schemaVersion':1,'inputs':refs,'originalEightScientificBodiesAndCasesUnchanged':True,'stage323ToCurrent327ResourceOnlyIds':baseChanges,'futureCandidateDoesNotRemoveReviewedFourResources':True,'newStrictGain':0})
put('inputs/eight-ids-and-technical-current-base.json',{'schemaVersion':1,'goalIds':ids,'current479Base':ref(base),'current327Authority':ref(Path(prot)),'original479Current323':ref(S/'inputs/whole479-current323.exact.json'),'currentFourResourceAdoptionsPreserved':baseChanges,'newDOrPOrVApproval':False,'activeWrites':False,'strictGain':0})
shutil.copytree(R/P,C/P,dirs_exist_ok=True)
for name in ['scripts/prepare_goal_visualization.mjs','scripts/import_goal_visualization.mjs','scripts/goal_visualization_common.mjs','scripts/goal_visualization_scope.mjs','scripts/check_goal_visualization_assets.mjs']:
 p=C/name;p.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(R/name,p)
# Current original normal QS APIs reused; no rule or parser change.
for p in (R/'app/scripts').glob('*.ts'):shutil.copy2(p,C/'app/scripts'/p.name)
for p in (R/'app/scripts').glob('*.mts'):shutil.copy2(p,C/'app/scripts'/p.name)
for gid in ids:
 d=C/f'app/public/assets/goal-visualizations/biologie/{gid}'
 if d.is_symlink():d.unlink()
 d.mkdir(parents=True,exist_ok=True)
(T/'capsule.actual.path.txt').write_text(str(C)+'\n')
print(json.dumps({'newPackage':str(P),'reuseSelectiveExistingCapsuleDiagnosticOnly':str(C),'goalIds':ids,'currentBaseNodes':479,'curricularAtoms':394,'protectedCurrentStrictIds':327,'activeWrites':False,'strictGain':0},indent=2))
