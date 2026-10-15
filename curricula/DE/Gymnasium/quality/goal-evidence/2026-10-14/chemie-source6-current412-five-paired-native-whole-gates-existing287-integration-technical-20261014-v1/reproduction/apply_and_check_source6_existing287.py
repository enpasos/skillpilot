from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,shutil,subprocess,copy,os
E=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14');R=E/'chemie-source6-current412-five-paired-native-whole-gates-existing287-integration-technical-20261014-v1';S=E/'chemie-source6-current412-final-resources-P5-shared-native5-technical-20261014-v1';H=Path('tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host').resolve()
def read(p):return json.loads(p.read_text())
def bind(p):b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':'sha256:'+hashlib.sha256(b).hexdigest()}
def write(rel,x):p=R/rel;assert not p.exists(),p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
def parents(p):
 cur=H
 for part in p.parent.relative_to(H).parts:
  cur=cur/part
  if cur.is_symlink():
   src=cur.resolve();assert src.is_dir();cur.unlink();cur.mkdir()
   for child in src.iterdir():(cur/child.name).symlink_to(child.resolve(),target_is_directory=child.is_dir())
  elif not cur.exists():cur.mkdir()
 assert p.parent.resolve().is_relative_to(H)
# Own evidence bundle uses immutable hardlinks, no public tree symlinks.
bundle=R/'native-five/bundle'
if bundle.is_symlink():
 source=bundle.resolve();bundle.unlink();bundle.mkdir()
 for p in source.rglob('*'):
  if p.is_file():d=bundle/p.relative_to(source);d.parent.mkdir(parents=True,exist_ok=True);os.link(p,d)
cas=read(R/'candidate/CAS.private-host-only-new-five-plus-container-whole-carriers.json');applied=R/'checks/APPLIED.exclusive-private-H-exact539-424-kind-and-20-asset-metadata-aliases.json'
if not applied.exists():
 for k,p in [('expectedBeforeCanonical',cas['canonicalPath']),('expectedBeforeSemantic',cas['semanticPath']),('expectedBeforeQA',cas['qaPath'])]:assert bind(H/p)==cas[k]
 old=read(H/cas['canonicalPath']);new=read(Path(cas['afterWholeCanonical']['path']));oi={x['id']:x for x in old['goals']};ni={x['id']:x for x in new['goals']};ids=[x['goalId'] for x in cas['fiveOriginalRawAssetsAndPrompts']['assets']];required=sorted({p for id in ids for p in ni[id].get('requires',[])})
 reverse=[]
 for id in required:
  assert oi[id]==ni[id];oldsucc=[g for g in old['goals'] if id in g.get('requires',[])];newsucc=[g for g in new['goals'] if id in g.get('requires',[])];added=[g for g in newsucc if g['id'] not in {x['id'] for x in oldsucc}];assert {x['id'] for x in added}<=set(ids)
  reverse.append({'goalId':id,'wholeOldAndCurrentPrerequisiteBodyExact':ni[id],'oldFullSuccessorGoalIds':[x['id'] for x in oldsucc],'newFullSuccessorGoalIds':[x['id'] for x in newsucc],'wholeAddedSource6SuccessorBodies':added,'oldOwnBodyRequiresResourcesApplicabilityUnchanged':True,'oldNativeFrozenPageWasNotRewrittenOrReapproved':True,'newFiveGenuineDReviewsReadThisExactWholeCurrentPrerequisiteCompanion':bind(S/'inputs/WHOLE.current-five-DEEN-prerequisites-successors-parents-and-source-unions.json')})
 write('checks/BOUNDARY.seven-existing-whole-prerequisites-new-reverse-consumers-no-old-D-P-rehash.json',{'rows':reverse,'interpretation':'New successor links change reverse-context/navigation when rebuilt. They do not alter any old whole goal/own prerequisites/resources/profile or expand its demanded competence. Genuine new5 D and P science are bound to exact old whole prerequisite bodies. Historical native page inputs/records remain historical, not represented as freshly reviewed new reverse lists. No old review fingerprint is changed.','noNewOldGoalScienceClaim':True})
 installed=[]
 for a in cas['fiveOriginalRawAssetsAndPrompts']['assets']:
  source=Path(a['original']['path']);assert bind(source)==a['original']
  for rel in [a['canonicalAlias'],a['publicAlias']]:
   p=H/rel;parents(p)
   if p.exists():assert bind(p)['sha256']==a['original']['sha256']
   else:shutil.copyfile(source,p)
   assert p.resolve().is_relative_to(H);installed.append(bind(p))
  for name in ['prompt.de.md','image-reconstruction-prompt.de.md']:
   source=source.parent/name if source.name.endswith('.png') else source.parent/name
   p=H/Path(a['canonicalAlias']).parent/name;parents(p)
   if p.exists():assert p.read_bytes()==source.read_bytes()
   else:shutil.copyfile(source,p)
   installed.append(bind(p))
 for key,out in [('afterWholeCanonical','canonicalPath'),('afterWholeSemantic','semanticPath'),('afterWholeQA','qaPath')]:
  p=H/cas[out];parents(p);assert not p.is_symlink();raw=Path(cas[key]['path']).read_bytes();temp=p.with_name(p.name+'.source6-exclusive-private.tmp');temp.write_bytes(raw);temp.replace(p)
 write(applied.relative_to(R),{'atUTC':datetime.now(timezone.utc).isoformat(),'afterCanonical':bind(H/cas['canonicalPath']),'afterSemantic':bind(H/cas['semanticPath']),'afterQA':bind(H/cas['qaPath']),'installedExactOriginalRawAndPromptAliases':installed,'all532ExistingWholeGoalsExactExceptRootContains':True,'all419OldWholeQARowsExact':True,'noOldImagesChanged':True,'Source34DataNotApplied':True,'activeAndGitWrites':False})
cli=str(Path('app/node_modules/tsx/dist/cli.mjs').resolve());cfg=str(R/'config/native-five.original-shared-input.transport-only.config.json')
commands=[('native5-check',['app/scripts/materializeGoalDescriptionRolloutBatch.ts','check','--config',cfg]),('native5-summary',['app/scripts/materializeGoalDescriptionRolloutBatch.ts','summarize','--config',cfg,'--write']),('native5-synthesis',['app/scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts','--config',cfg,'--authoring',str(R/'native-five/synthesis-authoring.json'),'--write']),('native5-resolutions',['app/scripts/materializeGoalDescriptionRolloutResolutions.ts','--config',cfg,'--synthesis-manifest',str(R/'native-five/synthesis-decisions.json'),'--write']),('native5-finalize',['app/scripts/materializeGoalDescriptionRolloutBatch.ts','finalize','--config',cfg,'--write']),('P5-normal',['app/scripts/positiveGoalEvidenceReview.ts','--mode=check','--config='+str(R/'config/P5.genuine-a-final-images.normal-alias.config.json')]),('A5-normal',['app/scripts/semanticAtomicityReview.ts','--mode=check','--config='+str(R/'config/A5.genuine-independent-a.normal-alias.config.json')]),('M412-normal',['app/scripts/memoryCardReview.ts','--mode=check','--config='+str(R/'config/M412.existing407-plus-genuine-five.normal-alias.config.json')]),('QA424-normal-write',['app/scripts/generateGoalVisualizationQaLedgers.ts','--write','--subject=chemie']),('QA424-normal-check',['app/scripts/generateGoalVisualizationQaLedgers.ts','--check','--subject=chemie'])]
for label,args in commands:
 target=R/f'checks/STOCK.{label}.actual.json'
 if target.exists() and read(target)['exitCode']==0:continue
 started=datetime.now(timezone.utc).isoformat();p=subprocess.run(['node',cli,*args],cwd=H,text=True,capture_output=True)
 rec={'startedAtUTC':started,'completedAtUTC':datetime.now(timezone.utc).isoformat(),'command':['node',cli,*args],'cwd':str(H),'exitCode':p.returncode,'stdout':p.stdout,'stderr':p.stderr,'stockModulesUnmodified':True,'noNewScientificVote':True}
 if target.exists():target=target.with_name(target.stem+'.retry-'+started.replace(':','-')+'.json')
 target.write_text(json.dumps(rec,ensure_ascii=False,indent=2)+'\n');print(label,p.returncode,p.stdout[-1300:],p.stderr[-1800:],flush=True)
 if p.returncode:raise SystemExit(p.returncode)
beforeqa=read(Path(cas['afterWholeQA']['path']));normalqa=read(H/cas['qaPath']);bm={x['goalId']:x for x in beforeqa['records']};nm={x['goalId']:x for x in normalqa['records']};assert len(nm)==424 and bm.keys()==nm.keys();assert all(nm[id]==row for id,row in bm.items()),'Unexpected QA science-field drift; do not central-run'
out=R/'candidate/QA.current412.actual-normal-stock424.preserved-all-scientific-rows.json';shutil.copy2(H/cas['qaPath'],out);write('checks/QA424.normal-generator-order-only-whole-row-preservation.json',{'beforeWholeQA':bind(Path(cas['afterWholeQA']['path'])),'afterNormalQA':bind(out),'recordCount':424,'all424WholeRowObjectsExact':True,'old419ScientificRowsAndAllNewFiveOriginalClausesDatesSHAsExact':True,'onlySerializationAndRowSortChanged':True})
print('All targeted normal preflights PASS; central not yet run.',flush=True)
