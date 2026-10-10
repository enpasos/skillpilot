from pathlib import Path
import json,hashlib,copy,shutil,subprocess,tempfile
R=Path('/home/enpasos/projects/skillpilot');O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-seven-global96-current504-scope-independent-merge-audit-v1';O.mkdir(exist_ok=False)
G=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-thirteen-globalisation-development-whole-material-author-a-v1';V=G/'foreign-whole-qualified-seven-status-and-three-real-nav-fields-author-successor-v5';read=lambda p:json.loads(p.read_text());ix=read(V/'actual-final-seven-foreign-qualified-status-three-nav-fields96-view-current504.AUTHOR-index-v5.json')
cap=Path('/tmp/skillpilot-economics-macro12-current504-wxkcpkyv');cp=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json');smp=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-current504-four-qualified-route-packages-20261010-v8/wirtschaftswissenschaften.semantic-kinds.json')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def binding(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def wr(n,x):p=O/n;p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
def checkref(v):p=R/v['path'];assert sha(p)==v['sha256'],v['path'];return p
def stage(source,dest):dest.parent.mkdir(parents=True,exist_ok=True);dest.unlink(missing_ok=True);shutil.copyfile(source,dest)
def rawcopy(p,n):q=O/n;q.parent.mkdir(parents=True,exist_ok=True);assert not q.exists();shutil.copyfile(p,q);return binding(q)
refs=[ix['wholeFinalCAN511'],ix['wholeForeignScienceReleasedBodies'],ix['wholeForeignWholeScience'],ix['basis504']['wholeFrozenBeforeCAN'],ix['basis504']['wholeFrozenRegistry'],ix['basis504']['wholeFrozenSEM']]
for ref in refs:checkref(ref)
b=read(checkref(ix['basis504']['wholeFrozenBeforeCAN']));a=read(checkref(ix['wholeFinalCAN511']));bg={g['id']:g for g in b['goals']};ag={g['id']:g for g in a['goals']};new=read(checkref(ix['wholeForeignScienceReleasedBodies']));newids={g['id']for g in new};navs={x['goalId']for x in ix['wholeThreeChildUnionFields']};assert len(bg)==504 and len(ag)==511 and len(newids)==7
assert all(bg[k]==ag[k]for k in bg if k not in navs)
for row in ix['wholeThreeChildUnionFields']:
 k=row['goalId'];assert bg[k]['contains']==ag[k]['contains'][:len(bg[k]['contains'])];assert all(bg[k][f]==ag[k][f]for f in bg[k]if f not in ['contains','applicability']);assert set(ag[k]['contains'])-set(bg[k]['contains'])<=newids
for g in new:assert ag[g['id']]==g and g['examData']['reviewStatus']=='released'
body=read(G/'whole-seven-DEEN-thirteen-global-development-contract-materials.DRAFT-author-v1.json')
for g,h in zip(body,new):j=copy.deepcopy(g);j['examData']['reviewStatus']='released';j['examData']['reviewNote']=h['examData']['reviewNote'];assert j==h
pairs=[];total=0
for row in ix['whole96Reference35ViewCandidates']:
 p=checkref(row['wholeFrozenBefore']);q=checkref(row['wholeCandidateAfter']);x=read(p);y=read(q);adds=row['actualNewTargetReferences'];total+=len(adds)
 if adds:
  assert len(x['rootNodes'])==len(y['rootNodes']);assert all(x[k]==y[k]for k in x if k not in ['viewId','rootNodes'])
  found=0
  for xx,yy in zip(x['rootNodes'],y['rootNodes']):
   if xx==yy:continue
   assert all(xx[k]==yy[k]for k in xx if k!='children');assert yy['children'][:len(xx['children'])]==xx['children'];added=yy['children'][len(xx['children']):];assert added==[z['reference']for z in adds];found+=len(added)
  assert found==len(adds)
 else:assert p.read_bytes()==q.read_bytes()
 pairs.append({'activePath':row['activePath'],'before':rawcopy(p,'whole-before-views/'+p.name),'after':rawcopy(q,'whole-after-views/'+q.name),'actualAddedReferences':[r['reference']for r in adds]})
assert total==96 and sum(bool(p['actualAddedReferences'])for p in pairs)==32
rawcopy(checkref(ix['wholeFinalCAN511']),'whole-reviewed-Glob511.exact.json');rawcopy(checkref(ix['basis504']['wholeFrozenBeforeCAN']),'whole-before-current504.exact.json');rawcopy(checkref(ix['basis504']['wholeFrozenSEM']),'whole-before-SEM504.exact.json');rawcopy(checkref(ix['basis504']['wholeFrozenRegistry']),'whole-registry504.exact.json')
rawcopy(cap/'native-macro12-current504-intake.ts','technical-reproduction/native-independent-Glob96-scope.ts')
# The helper is the current unchanged checker plus observation-only exports and row capture.
quality=R/'app/scripts/generateCurriculumQualityStatus.ts';qcap=cap/'app/scripts/generateCurriculumQualityStatus.ts';print('qualitySource',sha(quality));print('capsuleChecker',sha(qcap));rawcopy(quality,'technical-reproduction/current-native-checker.exact.txt');rawcopy(qcap,'technical-reproduction/current-native-checker.instrumental-exact.txt');rawcopy(R/'app/scripts/applicabilityCompiler.ts','technical-reproduction/current-native-compiler.exact.txt')
stage(checkref(ix['basis504']['wholeFrozenRegistry']),cap/ix['basis504']['wholeRegistry']['path']);stage(checkref(ix['basis504']['wholeFrozenSEM']),cap/smp)
for p in pairs:stage(R/p['before']['path'],cap/p['activePath'])
commands=[]
def run(name):
 out=O/(name+'.actual-native.json');cmd=[str(cap/'app/node_modules/.bin/tsx'),str(cap/'native-macro12-current504-intake.ts'),str(out)];z=subprocess.run(cmd,cwd=cap,capture_output=True,text=True);(O/(name+'.stdout.raw.txt')).write_text(z.stdout);(O/(name+'.stderr.raw.txt')).write_text(z.stderr);commands.append({'argv':cmd,'cwd':str(cap),'exit':z.returncode,'output':binding(out) if out.exists()else None});assert z.returncode==0,z.stderr;return read(out)
stage(checkref(ix['basis504']['wholeFrozenBeforeCAN']),cap/cp);before=run('independent-before-current504')
stage(checkref(ix['wholeFinalCAN511']),cap/cp)
for p in pairs:stage(R/p['after']['path'],cap/p['activePath'])
after=run('independent-after-final-Glob511')
vp=Path(ix['negativeActivePath']);yy=read(cap/vp);target=ix['negativeDroppedMaterial'];count=0
for n in yy['rootNodes']:
 if 'children'in n:
  old=n['children'];n['children']=[c for c in old if not(c.get('kind')=='goalEntry'and c.get('goalId')==target)];count+=len(old)-len(n['children'])
assert count==1
neg=wr('negative-own-BWGK-only-remove-location-access.json',yy);stage(neg,cap/vp);negative=run('independent-negative-BWGK-location-access');stage(R/next(p['after']['path']for p in pairs if p['activePath']==str(vp)),cap/vp)
wr('actual-input-pairs96-exact-fieldwise-review.json',{'wholeViews':pairs,'wholeBodyForeignScience':ix['wholeForeignWholeScience'],'CAN504':ix['basis504']['wholeFrozenBeforeCAN'],'CAN511':ix['wholeFinalCAN511'],'wholeStatusOnly14FieldsReused':True,'all501OtherWholeGoalsExact':True,'threeActualNavContainsApplicabilityOnly':list(navs),'addedReferenceCount':96,'changedViewCount':32})
wr('actual-independent-native-command-input-bindings.json',{'commands':commands,'executionCapsuleOnly':str(cap),'activeWrites':0,'sharedChecker':binding(quality),'sharedCompiler':binding(R/'app/scripts/applicabilityCompiler.ts')});(O/'technical-reproduction/actual-run-argv.raw.txt').write_text('\n'.join(' '.join(z['argv'])for z in commands)+'\n')
for tag,raw in [('before',before),('after',after),('negative',negative)]:
 rule=next(r for r in raw['nativeRules']if r['id']=='CQR-104');print(tag,raw['compilerSummary'],rule['metrics'])
