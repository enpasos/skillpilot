from pathlib import Path
import json,hashlib,shutil,os,subprocess,time
R=Path('/home/enpasos/projects/skillpilot');H=Path(__file__).resolve().parent;C=H/'check-host';F=H/'negative-check-host';cfg=json.loads((H/'integration-config.json').read_text());POL=cfg['policyPath'];PLAN=cfg['planPath'];G4=cfg['allowancePath'];V='curricula/DE/Gymnasium/composition-views/mathematik';G3=json.loads((C/PLAN).read_text())['reviewedExistingAssessmentChanges']['path'];GUARD='com.skillpilot.backend.composition.MaterializeMathContextualCombinedViews';ID=cfg['newAssessmentId']
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text())
def put(p,b):p.parent.mkdir(parents=True,exist_ok=True);q=p.with_name(p.name+'.new');q.write_bytes(b);q.replace(p)
def save(p,v):put(p,(json.dumps(v,ensure_ascii=False,indent=2)+'\n').encode())
if not F.exists():shutil.copytree(C,F,copy_function=os.link,symlinks=True,ignore=lambda p,n:[x for x in n if Path(p)==C and x in{'.git','tmp'}])
entries=(H.parent/'cone-complex-four-plus-b2-native-20261104-v1/classpath-current.txt').read_text().strip().split(':');cp=':'.join([str(H/'fresh-guard-classes'),str(H/'backend-build/classes/java/test'),str(H/'backend-build/classes/java/main')]+[p for p in entries if p.endswith('.jar')]);java='/tmp/skillpilot-curriculum-ci-corretto-25.0.2.10.1/bin/java'
paths=list((F/V).glob('*.json'))+[F/cfg[k]for k in ['canonicalPath','ledgerPath','policyPath','layoutPath','planPath','allowancePath']]+[F/G3];plan=read(F/PLAN);paths.extend(F/x['path']for x in plan['producerSourceSnapshots'].values());paths.append(F/read(F/G4)['baseFinitePlan']['path']);original={p.relative_to(F).as_posix():(C/p.relative_to(F)).read_bytes()for p in paths}
def reset():
 for rel,b in original.items():put(F/rel,b)
def bind(rel):
 policy=read(F/POL)
 for b in policy['stageDecisionBindings']:
  if b['path']==rel:b['sha256']=sha(F/rel)
 save(F/POL,policy)
def rebind(key,rel):
 p=read(F/PLAN);p[key]['sha256']=sha(F/rel);save(F/PLAN,p);bind(rel);bind(PLAN)
def mutatefile(name,fn):
 p=F/V/name;v=read(p);fn(v);save(p,v)
def unauthorized_g3():
 a=read(F/G3);a['existingAssessmentAllowances'][0]['goalId']=plan['approvedExistingAssessmentAddition']['goalId'];save(F/G3,a);rebind('reviewedExistingAssessmentChanges',G3)
def wrong_g3_scope():mutatefile('de-sh-sekii-gk.view.json',lambda v:v['scope'].update(jurisdiction='DE-BY'))
def missingmask():mutatefile('de-sh-sekii-gk.view.json',lambda v:v.update(rootNodes=[n for n in v['rootNodes']if not(n.get('goalId')=='c83dc2d1-f44f-5fae-86ce-280c68c3c55e'and n.get('projectionRole')=='prerequisiteOnly')]))
def extramask():
 def f(v):
  for n in v['rootNodes']:
   if n.get('goalId')=='c83dc2d1-f44f-5fae-86ce-280c68c3c55e'and n.get('projectionRole')=='prerequisiteOnly':n['unreviewed']=True
 mutatefile('de-sh-sekii-gk.view.json',f)
def drift():mutatefile('de-sh-sekii-gk.view.json',lambda v:next(n for n in v['rootNodes']if n.get('kind')=='structure').update(label='Unreviewed drift'))
def snapshot():
 p=F/next(iter(plan['producerSourceSnapshots'].values()))['path'];v=read(p);v['rootNodes'][0]['label']='Snapshot drift';save(p,v)
def emptywrapper():
 def f(v):
  op=next(o for r in read(F/G3)['sourceRules']if r['viewId']==v['viewId']for o in r['approvedOperations']if o['action']=='include-target');v['rootNodes'].append({'kind':'structure','id':'reviewed-stage-positive-'+op['id'],'label':op['label'],'children':[]})
 mutatefile('de-sh-sekii-lk.view.json',f)
def extra_plain(file,gid):mutatefile(file,lambda v:v['rootNodes'].append({'kind':'goalEntry','goalId':gid,'projectionRole':'prerequisiteOnly'}))
def wrong_g4_scope():mutatefile('de-by-sekii-lk.view.json',lambda v:v['scope'].update(jurisdiction='DE-HE'))
def remove_g4():
 def strip(nodes):
  for n in nodes:
   if n.get('kind')=='structure':n['children']=[x for x in n['children']if x.get('goalId')!=ID];strip(n['children'])
 mutatefile('de-by-sekii-lk.view.json',lambda v:strip(v['rootNodes']))
def wrong_g4_id():
 a=read(F/G4);a['newAssessmentId']='00000000-0000-0000-0000-000000000000';save(F/G4,a);rebind('geometryFourAssessmentPlacement',G4)
def g4_broadscope():
 a=read(F/G4);a['approvedTargetScopePairs'].append('DE-HE/SekII/G9/LK');save(F/G4,a);rebind('geometryFourAssessmentPlacement',G4)
def oldplan_drift():
 p=F/read(F/G4)['baseFinitePlan']['path'];v=read(p);v['counts']['newAssessmentIdentities']=999;save(p,v)
def canonical_mutation(field):
 p=F/cfg['canonicalPath'];v=read(p);g=next(g for g in v['goals']if g['id']==ID)
 if field=='override':g['extendedData']['applicabilityOverrides']['jurisdiction'].append('DE-HE')
 elif field=='requires':g['requires']=g['requires'][:1]
 elif field=='coverage':g['examData']['coveredGoalIds'].append('effe43eb-cabe-56cb-a228-35887d7915c1')
 save(p,v);policy=read(F/POL);policy['canonical']['sha256']=sha(p);save(F/POL,policy)
cases=[('unauthorized-existing-id',unauthorized_g3,'Unreviewed existing assessment allowance',False),('wrong-source-scope',wrong_g3_scope,'Existing source current scope differs',False),('missing-SH-GK-mask',missingmask,'Existing excluded source role/mask inventory differs',False),('extra-mask-key',extramask,'Existing excluded source exact root mask differs',False),('unrelated-source-tree-drift',drift,'Original source tree changed beyond reviewed task references',False),('original-snapshot-drift',snapshot,'Bound before-view drift',False),('empty-SH-retained-wrapper',emptywrapper,'Original source tree changed beyond reviewed task references',False),('check-with-report-rejected',lambda:None,'--check is read-only; omit --report',False),('G3-BY-statistics-plain-POnly-generation',lambda:extra_plain('de-by-sekii-lk.view.json','c83dc2d1-f44f-5fae-86ce-280c68c3c55e'),'Existing added source direct-reference inventory differs',True),('G3-BY-pyramid-plain-POnly-generation',lambda:extra_plain('de-by-sekii-lk.view.json','1878f680-095c-511d-aaed-e98393f7fde9'),'Existing added source direct-reference inventory differs',True),('G3-SH-statistics-plain-POnly-generation',lambda:extra_plain('de-sh-sekii-lk.view.json','c83dc2d1-f44f-5fae-86ce-280c68c3c55e'),'Existing retained source direct-reference inventory differs',True),('G4-BY-plain-POnly-generation',lambda:extra_plain('de-by-sekii-lk.view.json',ID),'G4 exact positive direct-reference inventory differs',True),('G4-unauthorized-source-generation',lambda:extra_plain('de-he-sekii-lk.view.json',ID),'G4 unauthorized source reference',True),('G4-wrong-source-scope-generation',wrong_g4_scope,'G4 source exact scope differs',True),('G4-missing-positive-generation',remove_g4,'G4 exact positive direct-reference inventory differs',True),('G4-unauthorized-id-generation',wrong_g4_id,'G4 identity/schema differs',True),('G4-broadened-scope-generation',g4_broadscope,'G4 exact four scope pairs differ',True),('G4-bound-old-plan-drift-generation',oldplan_drift,'G4 original finite plan drift',True)]
cases += [('G4-broad-override-generation',lambda:canonical_mutation('override'),'G4 explicit own-content override/boundary differs',True),('G4-missing-form-preparation-generation',lambda:canonical_mutation('requires'),'G4 canonical preparation differs',True),('G4-fake-extra-coverage-generation',lambda:canonical_mutation('coverage'),'G4 scored coverage differs',True)]
rows=[]
for name,mutation,expected,generation in cases:
 reset();mutation();before={p.relative_to(F).as_posix():sha(p)for p in paths};output=F/('must-not-create-'+name);cmd=[java,'-cp',cp,GUARD,'--data-root',str(F)]+(['--output-dir',str(output)]if generation else['--check'])
 if name=='check-with-report-rejected':cmd+=['--report','must-not-write.json']
 t=time.monotonic();p=subprocess.run(cmd,capture_output=True,text=True);(H/(name+'.stderr.txt')).write_text(p.stderr);(H/(name+'.stdout.txt')).write_text(p.stdout)
 assert p.returncode!=0,(name,'accepted');assert expected in p.stderr,(name,p.stderr);assert before=={q.relative_to(F).as_posix():sha(q)for q in paths};assert not(F/'must-not-write.json').exists();assert not output.exists(),(name,'created generation output')
 rows.append({'case':name,'mode':'generation to isolated fresh path'if generation else'read-only --check','exitCode':p.returncode,'expectedRejection':expected,'guardedInputsUnchanged':len(before),'outputDirectoryCreated':False,'seconds':round(time.monotonic()-t,2),'stderrSha256':sha(H/(name+'.stderr.txt'))});print(json.dumps({'case':name,'rejected':True}),flush=True)
reset();before={p.relative_to(F).as_posix():sha(p)for p in paths};p=subprocess.run([java,'-cp',cp,GUARD,'--data-root',str(F),'--check'],capture_output=True,text=True);assert p.returncode==0,p.stderr;assert before=={q.relative_to(F).as_posix():sha(q)for q in paths}
result={'status':'PASS_ACTUAL_COMPILED_G4_GUARD_POSITIVE39_46_AND21_NEGATIVES','guardSourceSha256':sha(C/'backend/src/test/java/com/skillpilot/backend/composition/MaterializeMathContextualCombinedViews.java'),'unchangedProductionMainSha256':sha(C/'backend/src/main/java/com/skillpilot/backend/composition/CourseProfileCompositionViewMerger.java'),'originalActualGradleBuild':'normal-combined39-generate.actual.json','finalFreshJavac':'fresh-javac.actual.json','finalCanonicalSha256':sha(C/cfg['canonicalPath']),'finalPolicySha256':sha(C/POL),'positive':{'exitCode':p.returncode,'stdout':p.stdout,'stderr':p.stderr,'guardedInputsUnchanged':len(before)},'cases':rows,'oldEightRetained':8,'G3PlainPOnlyGenerationRetained':3,'newG4GenerationNegatives':10,'rootGitNativeWrites':False};(H/'guard-negatives.actual.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':result['status'],'cases':len(rows)}))
