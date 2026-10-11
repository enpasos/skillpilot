from pathlib import Path
import json,hashlib,shutil,subprocess
R=Path('/home/enpasos/projects/skillpilot');B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-two-global-ten-current518-accesses-independent-merge-audit-v1/private-config-isolation-and-current520-native-successor-v2';O=B.parent/'fortysix-required-accesses-independent-delta-successor-v3';O.mkdir(exist_ok=False)
A=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-thirteen-globalisation-development-whole-material-author-a-v1/same-two-whole-materials-fortysix-remaining-valid-accesses-author-successor-v9';read=lambda p:json.loads(p.read_text())
def fp(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def ref(v):p=R/v['path'];assert fp(p)['sha256']==v['sha256'],v['path'];return p
def wr(n,x):p=O/n;assert not p.exists();p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
def cp(p,n):q=O/n;assert not q.exists();q.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,q);return fp(q)
cap=Path('/tmp/skillpilot-economics-macro12-current504-wxkcpkyv')
def stage(p,q):q.parent.mkdir(parents=True,exist_ok=True);assert q.parent.resolve().is_relative_to(cap.resolve());assert q.resolve()!=p.resolve()and not q.is_symlink();q.unlink(missing_ok=True);shutil.copyfile(p,q)
x=read(A/'actual-fortysix-rest-full56-whole-country-course-accesses.AUTHOR-index-v9.json');can=ref(x['wholeCAN520Unmodified']);assert can.read_bytes()==(B/'whole-reviewed-current520.exact.json').read_bytes();assert ref(x['wholeTwoForeignQualifiedBodies']).read_bytes()==(B/'whole-two-current-foreign-qualified-bodies.exact.json').read_bytes()
baseline=read(B/'actual-ten-accesses-fieldwise-current518-to520-whole-input-review.json');pairs=[];addset=set();n=0
for row in x['whole35RemainingAccessCandidates']:
 p=ref(row['wholeBeforeV8Candidate']);q=ref(row['wholeAfter56Candidate']);actualbefore=next(z for z in baseline['wholeViewPairs']if z['activePath']==row['activePath']);assert p.read_bytes()==(R/actualbefore['after']['path']).read_bytes();u=read(p);v=read(q);adds=row['actualNewRemainingTargetReferences'];n+=len(adds)
 if adds:
  assert all(u[k]==v[k]for k in u if k not in ['viewId','rootNodes']);assert len(u['rootNodes'])==len(v['rootNodes']);found=0
  for uu,vv in zip(u['rootNodes'],v['rootNodes']):
   if uu==vv:continue
   assert all(uu[k]==vv[k]for k in uu if k!='children');assert vv['children'][:len(uu['children'])]==uu['children'];r=vv['children'][len(uu['children']):];assert r==[z['reference']for z in adds];found+=len(r)
   for z in r:assert z['kind']=='goalEntry'and z['projectionRole']=='target';assert z['goalId']in baseline['newPracticeIds'];addset.add((row['activePath'],z['goalId']))
  assert found==len(adds)
 else:assert p.read_bytes()==q.read_bytes()
 pairs.append({'activePath':row['activePath'],'beforeV8':cp(p,'whole-before-v8-views/'+p.name),'after56':cp(q,'whole-after-v9-views/'+q.name),'addedReferences':[z['reference']for z in adds]})
expected=read(B/'actual-independent20-visible-material-contexts-and46-whole-closure-access-debts.json')['wholeFortysixExpectedAccessOmissions'];assert addset=={(z['viewPath'],z['materialId'])for z in expected};assert n==46 and len(addset)==46 and sum(bool(z['addedReferences'])for z in pairs)==30
cp(can,'whole-exact-current520-unchanged-v8.json');cp(B/'independent-after-two-global-current520-ten-accesses.actual-native.json','independent-before-current520-ten-accesses.reused-exact-native.json');cp(B/'technical-reproduction/native-independent-Glob2-ten-scope.ts','technical-reproduction/native-independent-Glob2-fortysix-scope.ts');cp(B/'technical-reproduction/current-native-checker.exact.txt','technical-reproduction/current-native-checker.exact.txt');cp(B/'technical-reproduction/current-native-checker.observation-only.exact.txt','technical-reproduction/current-native-checker.observation-only.exact.txt');cp(B/'technical-reproduction/current-native-compiler.exact.txt','technical-reproduction/current-native-compiler.exact.txt')
assert (cap/'app/scripts/generateCurriculumQualityStatus.ts').read_bytes()==(B/'technical-reproduction/current-native-checker.observation-only.exact.txt').read_bytes();assert (R/'app/scripts/generateCurriculumQualityStatus.ts').read_bytes()==(B/'technical-reproduction/current-native-checker.exact.txt').read_bytes();assert (R/'app/scripts/applicabilityCompiler.ts').read_bytes()==(B/'technical-reproduction/current-native-compiler.exact.txt').read_bytes()
stage(can,cap/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
for z in pairs:stage(R/z['after56']['path'],cap/z['activePath'])
commands=[]
def run(n):
 out=O/(n+'.actual-native.json');argv=[str(cap/'app/node_modules/.bin/tsx'),str(cap/'native-macro12-current504-intake.ts'),str(out)];z=subprocess.run(argv,cwd=cap,capture_output=True,text=True);(O/(n+'.stdout.raw.txt')).write_text(z.stdout);(O/(n+'.stderr.raw.txt')).write_text(z.stderr);assert z.returncode==0,z.stderr;commands.append({'argv':argv,'cwd':str(cap),'exit':z.returncode,'output':fp(out)});d=read(out);m=next(r for r in d['nativeRules']if r['id']=='CQR-104')['metrics'];print(n,json.dumps({'compiler':d['compilerSummary'],'routes':m['visibleSelectedGoalOccurrencesMissingEffectiveTerminalRoute'],'unique':m['uniqueVisibleSelectedGoalsMissingEffectiveTerminalRoute'],'missingExpectedScopes':m['projectionScopesMissingTerminalAutonomyGoals']}),flush=True);return d
run('independent-after-current520-complete56-accesses')
vp=Path(x['negativeActivePath']);v=read(cap/vp);target=x['negativeDroppedMaterial'];removed=0
for z in v['rootNodes']:
 if 'children'in z:
  old=z['children'];z['children']=[c for c in old if not(c.get('kind')=='goalEntry'and c.get('goalId')==target)];removed+=len(old)-len(z['children'])
assert removed==1;p=wr('own-negative-HBGK-only-drop-required-company-process-access.json',v);stage(p,cap/vp);run('independent-negative-HBGK-required-endpoint-only-drop');stage(R/next(z['after56']['path']for z in pairs if z['activePath']==str(vp)),cap/vp)
wr('actual-fortysix-exact-view-field-appends-and-unmodified-current520-inputs.independent.json',{'whole35ViewPairs':pairs,'actualAdded46ReferenceSetMatchesOwnIndependentPendingSetExactly':True,'actual46AddedReferences':46,'actual30ChangedViews':30,'whole520CANBodiesNavStatusSourceAndPUnchanged':fp(can),'ownV8ForeignReview':fp(B/'actual-final-independent-two-global-status-nav-ten-accesses-KEEP-and46-real-expected-access-debts.handoff.receipt.json'),'ownReusedNativeBefore':fp(O/'independent-before-current520-ten-accesses.reused-exact-native.json'),'commands':commands,'activeWrites':0,'destinationParentResolveGuard':True})
