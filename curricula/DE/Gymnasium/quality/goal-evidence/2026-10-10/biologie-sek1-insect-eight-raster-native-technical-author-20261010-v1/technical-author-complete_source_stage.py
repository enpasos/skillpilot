exec(open('tmp/m7-resumption-20261010/biologie-insect-eight-native-technical/prepare.py').read().split('sourceRefs=[]')[0].replace("assert not p.exists(),str(p)","\n if p.exists():return str(p.relative_to(R))"))
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
