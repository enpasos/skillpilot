from pathlib import Path
import json,copy,hashlib,tempfile,shutil,os
from jsonschema import Draft202012Validator
R=Path('/home/enpasos/projects/skillpilot');O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-seven-work-career-current532-qualified-status-nav-access-author-a-v1'
def h(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def b(p):return {'path':str(p.relative_to(R)) if p.is_relative_to(R) else str(p),'sha256':h(p),'bytes':p.stat().st_size}
def put(n,d):
 p=O/n;assert not p.exists();p.parent.mkdir(parents=True,exist_ok=True);assert p.resolve().is_relative_to(O.resolve());p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');return b(p)
ip=O/'actual-current532-seven-qualified-work-career-private-whole-input.AUTHOR-index-v1.json';idx=json.loads(ip.read_text());selp=O/'actual-current539-work-seven-whole-closure224-country-course-two-nav-native-selection.AUTHOR.json';sel=json.loads(selp.read_text());before=json.loads((R/idx['wholeFrozenBeforeCAN']['path']).read_text());candidate=json.loads((R/idx['wholeCurrent539ProvisionalCandidate']['path']).read_text());by={g['id']:g for g in candidate['goals']};navrows=[]
for navid in idx['navIds']:
 nav=by[navid];compiled=next(r for r in sel['wholeActualTwoNavChildUnionRows'] if r['goalId']==navid);nav['applicability']['jurisdiction']=compiled['compiledApplicability']['jurisdiction'];old=next(g for g in before['goals'] if g['id']==navid);undo=copy.deepcopy(nav);undo['contains']=old['contains'];undo['applicability']=old['applicability'];assert undo==old;navrows.append({'goalId':navid,'wholeBefore':old,'wholeAfter':nav,'actualNativeDerivedChildUnion':compiled,'changedFieldsOnly':['contains']+(['applicability.jurisdiction'] if old['applicability']['jurisdiction']!=nav['applicability']['jurisdiction'] else [])})
errors=[{'path':list(e.path),'message':e.message} for e in Draft202012Validator(json.loads((R/'docs/landscape-runtime.schema.json').read_text())).iter_errors(candidate)];assert not errors
canref=put('whole-current532-plus-seven-qualified-work-career-two-nav539.INERT.json',candidate);vs=Draft202012Validator(json.loads((R/'contracts/curriculum-package/v1/composition-view.schema.json').read_text()));rows=[];total=0
for vr in idx['whole35CurrentViews']:
 v=json.loads((R/vr['wholeBefore']['path']).read_text());selected=[r for r in sel['all224CountryCourseMaterialDecisions'] if r['activeViewPath']==vr['activePath'] and r['eligibleForNewTargetReference']];after=copy.deepcopy(v);refs=[]
 for r in selected:
  g=by[r['materialId']];ref={'kind':'goalEntry','goalId':g['id'],'displayLabel':g['title'],'projectionRole':'target'};assert not any(c.get('goalId')==g['id'] for c in after['rootNodes'][0]['children']);after['rootNodes'][0]['children'].append(ref);refs.append({'reference':ref,'actualWholeCompilerCourseAndPrerequisiteBinding':r,'wholeForeignScientificBinding':idx['wholeForeignScience']});total+=1
 if refs:after['viewId']='de-gym-economics-work-a-20261010-'+v['scope']['jurisdiction'].lower()+'-'+v['scope']['courseProfile'].lower()
 errs=[{'path':list(e.path),'message':e.message} for e in vs.iter_errors(after)];assert not errs or not refs
 cand=put('whole35-final539-candidate-views/'+Path(vr['activePath']).name,after);undo=copy.deepcopy(after)
 for _ in refs:undo['rootNodes'][0]['children'].pop()
 undo['viewId']=v['viewId'];assert undo==v
 rows.append({**vr,'wholeCandidateAfter':cand,'actual169ReferenceBindings':refs,'changed':bool(refs),'otherWholeViewFieldsExact':True,'closedSchemaErrors':errs})
assert total==169 and sum(r['changed'] for r in rows)==32
proofp=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-seven-market-money-current532-status-nav-fullclosure-access-author-a-v1/physical-whole-reader-input-successor-v3/actual-final-five-native-current539-market156-support13-fullclosure-source64sets-and-two-genuine-drops.AUTHOR.json';proof=json.loads(proofp.read_text());assert proof['wholeCandidateInputFreeze']['basis532']['wholeFrozenBeforeCAN']['sha256']==idx['wholeFrozenBeforeCAN']['sha256'];drop='f08e0a97-bcdd-504d-a9d9-7b1d8e6d4f96';droptarget='dd38e0c5-d77b-5893-815c-548ea2a84429';nr=next(r for r in rows if r['wholeScope'].get('jurisdiction')=='DE-BB' and r['wholeScope'].get('courseProfile')=='LK');gr=next(r for r in proof['whole64TargetSupportPOnlyMemoryOrientationAndMaterialRouteBindings'] if r['viewPath']==nr['activePath']);assert droptarget in gr['wholeActualMissingRouteIdsByFiveFrames'][0];ng=json.loads((R/nr['wholeCandidateAfter']['path']).read_text());ii=[i for i,r in enumerate(ng['rootNodes'][0]['children']) if r.get('goalId')==drop];assert len(ii)==1;ng['rootNodes'][0]['children'].pop(ii[0]);neg=put('negative-real-BBLK-work-model-material-target-access-dropped.json',ng)
caps={'before':idx['capsules']['before']};guards=[];physical=[]
def replace(p,s,cap):
 assert not p.is_symlink() and p.resolve().is_relative_to(cap.resolve());p.parent.mkdir(parents=True,exist_ok=True);active=R/p.relative_to(cap);was=active.exists() and p.exists() and os.path.samefile(p,active)
 if p.exists():p.unlink()
 p.write_bytes(s.read_bytes());assert not active.exists() or not os.path.samefile(p,active)
 guards.append({'privatePath':str(p),'resolveInsidePrivateCapsule':True,'detachedActiveSameFileIfPresent':was,'notSameFileAfterWrite':True})
for mode in ['after','negative']:
 cap=Path(tempfile.mkdtemp(prefix='skillpilot-economics-work-seven-scope-author-a-final-'+mode+'-'))/'capsule';shutil.copytree(Path(caps['before']),cap,symlinks=True,copy_function=os.link)
 # Physically own every whole-input JSON; preserve the read-only production code prefix link.
 for r in idx['wholeInputs']:
  src=Path(caps['before'])/r['path']
  if not src.exists() or h(src)!=r['sha256']:src=R/r['path']
  assert h(src)==r['sha256'];dest=cap/r['path']
  if r['path'].endswith('.json'):replace(dest,src,cap);physical.append({'mode':mode,'path':r['path'],'wholeSHA256':r['sha256'],'actualPhysicalInsideAndNotSameActive':True})
 replace(cap/idx['wholeCurrentCAN532']['path'],R/canref['path'],cap)
 for r in rows:replace(cap/r['activePath'],R/r['wholeCandidateAfter']['path'],cap)
 if mode=='negative':replace(cap/nr['activePath'],R/neg['path'],cap)
 caps[mode]=str(cap)
for r in idx['wholeInputs']:
 frozen=Path(caps['before'])/r['path'];p=frozen if frozen.exists() and h(frozen)==r['sha256'] else R/r['path'];assert h(p)==r['sha256']
final=put('actual-final539-seven-work-career169-country-access-two-nav-whole-input.AUTHOR-index-v2.json',{'role':'AUTHOR whole seven scientifically qualified work-career status/nav/169 access candidates; independent scope qualification pending','basis532':idx,'wholeBasisIndex':b(ip),'whole224RealNativeSelection':b(selp),'wholeCurrent539Candidate':canref,'wholeSevenOnlyStatusNoteBodies':idx['wholeSevenOnlyStatusNoteBodies'],'wholeForeignScience':idx['wholeForeignScience'],'wholeTwoNavFieldSuccessors':navrows,'actualFourEThreeQ2Placements':idx['actualFourEThreeQ2Placement'],'whole35FinalViews':rows,'actualCountryTargetRefs':total,'actualChangedCountryViews':32,'actualNationalViewsEdited':0,'actualPOnlyOrOrdinarySupportAdded':0,'nationalAuthority':'National material inclusion uses the existing E/Q2 practice clusters and exact matching country authority. Country practice targets appear only where complete existing mandatory closure and existing compiled country/course permit them. No source claim or new ordinary target.','allChangedClosedSchemasAndWhole539RuntimeSchemaErrors0':True,'wholeGenuineDropNegative':neg,'negativeActivePath':nr['activePath'],'negativeDroppedMaterial':drop,'negativeTargetGoal':droptarget,'negativeExistingFrozen532GapProof':b(proofp),'capsules':caps,'productionExactExportHelperPath':idx['productionExactExportHelperPath'],'privateWriteResolveAndSameFileGuards':guards,'actualAfterNegativeWholeInputJSONPhysicalAudits':physical,'allActualCurrentDataRegistrySEMAnd43PConfigsPhysicalPrivate':True,'readonlyHistoricalAssetsPreservedAndGuardedFromWrites':True,'activeWrites':0,'ownIndependentScopeApprovalClaim':False})
print(json.dumps(final))
