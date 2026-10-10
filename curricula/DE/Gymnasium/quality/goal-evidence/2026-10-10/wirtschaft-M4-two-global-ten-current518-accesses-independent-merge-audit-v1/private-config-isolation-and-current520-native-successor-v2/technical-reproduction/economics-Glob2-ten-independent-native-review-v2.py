from pathlib import Path
import json,hashlib,copy,shutil,subprocess
R=Path('/home/enpasos/projects/skillpilot')
O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-two-global-ten-current518-accesses-independent-merge-audit-v1'
O=O/'private-config-isolation-and-current520-native-successor-v2'
O.mkdir(exist_ok=False)
A=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-thirteen-globalisation-development-whole-material-author-a-v1/two-only-additional-country-contexts-ten-whole-accesses-author-successor-v8'
read=lambda p:json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def ref(v):p=R/v['path'];assert sha(p)==v['sha256'],v['path'];return p
def wr(n,x):p=O/n;p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
def raw(p,n):q=O/n;q.parent.mkdir(parents=True,exist_ok=True);assert not q.exists();shutil.copyfile(p,q);return bind(q)
def stage(p,q):
 q.parent.mkdir(parents=True,exist_ok=True)
 assert q.parent.resolve().is_relative_to(Path('/tmp/skillpilot-economics-macro12-current504-wxkcpkyv').resolve()),str(q)
 assert q.resolve()!=p.resolve(),str(q)
 assert not q.is_symlink(),str(q)
 q.unlink(missing_ok=True);shutil.copyfile(p,q)
ix=read(A/'actual-two-only-additional-contexts10-whole-target-accesses-current518.AUTHOR-index-v8.json');basis=ix['basis518']
be=ref(basis['wholeFrozenBeforeCAN']);af=ref(ix['whole520Candidate']);b=read(be);a=read(af);bg={g['id']:g for g in b['goals']};ag={g['id']:g for g in a['goals']};new=read(ref(ix['wholeTwoForeignQualifiedBodies']));newids={g['id']for g in new};navids={r['goalId']for r in ix['wholeTwoDerivedNavCandidates']}
assert len(bg)==518 and len(ag)==520 and len(newids)==2 and len(navids)==2
assert set(ag)-set(bg)==newids
assert all(bg[k]==ag[k]for k in bg if k not in navids)
original=read(ref(basis['wholeOriginalThreeBodies']));og={g['id']:g for g in original};science=read(ref(basis['wholeForeignScience']));sr={r['materialId']:r for r in science['wholeReviews']};assert science['decision']=='THREE_NEW_WHOLE_SCIENCE_KEEP'
for g in new:
 assert ag[g['id']]==g
 x=copy.deepcopy(og[g['id']]);x['examData']['reviewStatus']='released';x['examData']['reviewNote']=g['examData']['reviewNote'];assert x==g
 assert sr[g['id']]['decision']=='KEEP' and sr[g['id']]['actuallyCoveredWholeCurrentGoals']==g['examData']['coveredGoalIds']
 assert sr[g['id']]['newKind']=='practiceAssessment' and g['requires']==g['examData']['coveredGoalIds']
 assert basis['wholeForeignScience']['sha256'] in g['examData']['reviewNote']
for row in ix['wholeTwoDerivedNavCandidates']:
 k=row['goalId'];assert row['wholeBefore']==bg[k] and row['wholeAfter']==ag[k]
 assert bg[k]['contains']==ag[k]['contains'][:len(bg[k]['contains'])]
 assert ag[k]['contains'][len(bg[k]['contains']):]==row['newMaterialIds']
 assert set(row['newMaterialIds'])<=newids
 assert all(bg[k][f]==ag[k][f]for f in bg[k]if f not in ['contains','applicability'])
ctx=read(ref(basis['wholeFourCurrentContractsP8']));book=read(R/'app/scripts/config/goal-books/de-gym-economics-current-canonical.json');pp=R/book['evidenceReviewPaths'][0];pr={r['goalId']:r for r in [json.loads(l)for l in pp.read_text().splitlines()if l.strip()]}
assert len(pr)==336
for r in ctx:assert r['wholeCurrentGoal']==bg[r['goalId']] and r['wholeCurrentP']==pr[r['goalId']]
needed={k for g in new for k in g['requires']};assert needed=={r['goalId']for r in ctx}
pairs=[];adds=0
for r in ix['whole35CandidateViews']:
 p=ref(r['wholeFrozenBefore']);q=ref(r['wholeCandidateAfter']);x=read(p);y=read(q);delta=r['actualNewTargetReferences'];adds+=len(delta)
 if delta:
  assert all(x[k]==y[k]for k in x if k not in ['viewId','rootNodes'])
  assert len(x['rootNodes'])==len(y['rootNodes']);found=0
  for xx,yy in zip(x['rootNodes'],y['rootNodes']):
   if xx==yy:continue
   assert all(xx[k]==yy[k]for k in xx if k!='children');assert yy['children'][:len(xx['children'])]==xx['children'];newrefs=yy['children'][len(xx['children']):];assert newrefs==[z['reference']for z in delta];found+=len(newrefs)
   for z in newrefs:assert z['goalId']in newids and z['kind']=='goalEntry'and z['projectionRole']=='target'
  assert found==len(delta)==1
 else:assert p.read_bytes()==q.read_bytes()
 pairs.append({'activePath':r['activePath'],'before':raw(p,'whole-before-views/'+p.name),'after':raw(q,'whole-after-views/'+q.name),'addedReferences':[z['reference']for z in delta]})
assert adds==10 and sum(bool(r['addedReferences'])for r in pairs)==10
for p,n in [(be,'whole-before-current518.exact.json'),(af,'whole-reviewed-current520.exact.json'),(ref(basis['wholeFrozenRegistry']),'whole-registry518.exact.json'),(ref(basis['wholeFrozenSEM']),'whole-SEM518.exact.json'),(ref(ix['wholeTwoForeignQualifiedBodies']),'whole-two-current-foreign-qualified-bodies.exact.json'),(ref(basis['wholeFourCurrentContractsP8']),'whole-four-current-goals-eight-unchanged-Pcases.exact.json')]:raw(p,n)
cap=Path('/tmp/skillpilot-economics-macro12-current504-wxkcpkyv');cp=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json');q=R/'app/scripts/generateCurriculumQualityStatus.ts';cq=cap/'app/scripts/generateCurriculumQualityStatus.ts'
obs="      ownProjectedScopeRows.push({viewPath:toRepoPath(file),jurisdiction,scopeFilters,scopeLabel,ordinaryTargetIds:visibleSelectedGoals.map(g=>g.id),visibleAllAtomicIds:[...visibleAtomicGoalIds],visibleTargetAtomicIds:[...visibleTargetAtomicGoalIds],expectedTerminalIds:expectedTerminalGoalIds,actualTerminalIds:actualTerminalGoalIds,missingEffectiveTerminalTargetIds:goalsMissingEffectiveTerminalRoute.map(g=>g.id),wholeMaterialCoverageBindingIssues:terminalMaterialCoverageBindingIssues,wholeMaterialPrerequisiteClosureIssues});\n"
suffix="\nexport const ownProjectedScopeRows:any[]=[];\nexport {routeProfiles,evaluateRouteProfile,collectWholeMaterialPrerequisiteClosure,readJurisdictionCoverageByLandscapeId,evaluateJurisdictionCoverage};\n"
assert cq.read_text().count(obs)==1 and cq.read_text().endswith(suffix)and cq.read_text().replace(obs,'').removesuffix(suffix)==q.read_text()
assert sha(cap/'app/scripts/applicabilityCompiler.ts')==sha(R/'app/scripts/applicabilityCompiler.ts')
for p,n in [(q,'technical-reproduction/current-native-checker.exact.txt'),(cq,'technical-reproduction/current-native-checker.observation-only.exact.txt'),(R/'app/scripts/applicabilityCompiler.ts','technical-reproduction/current-native-compiler.exact.txt'),(cap/'native-macro12-current504-intake.ts','technical-reproduction/native-independent-Glob2-ten-scope.ts')]:raw(p,n)
stage(ref(basis['wholeFrozenRegistry']),cap/basis['wholeRegistry']['path']);stage(ref(basis['wholeFrozenSEM']),cap/basis['wholeSEM518']['path']);stage(R/'app/scripts/config/goal-books/de-gym-economics-current-canonical.json',cap/'app/scripts/config/goal-books/de-gym-economics-current-canonical.json')
for p in pairs:stage(R/p['before']['path'],cap/p['activePath'])
cmds=[]
def run(n):
 output=O/(n+'.actual-native.json');argv=[str(cap/'app/node_modules/.bin/tsx'),str(cap/'native-macro12-current504-intake.ts'),str(output)];z=subprocess.run(argv,cwd=cap,capture_output=True,text=True);(O/(n+'.stdout.raw.txt')).write_text(z.stdout);(O/(n+'.stderr.raw.txt')).write_text(z.stderr);cmds.append({'argv':argv,'cwd':str(cap),'exit':z.returncode,'output':bind(output)if output.exists()else None});assert z.returncode==0,z.stderr
 d=read(output);rule=next(x for x in d['nativeRules']if x['id']=='CQR-104');print(n,json.dumps({'compiler':d['compilerSummary'],'routes':rule['metrics']['visibleSelectedGoalOccurrencesMissingEffectiveTerminalRoute'],'unique':rule['metrics'].get('visibleSelectedGoalIdsMissingEffectiveTerminalRoute',rule['metrics'].get('visibleSelectedGoalsMissingEffectiveTerminalRoute')),'metricKeys':list(rule['metrics'])}),flush=True);return d
stage(be,cap/cp);before=run('independent-before-current518')
stage(af,cap/cp)
for p in pairs:stage(R/p['after']['path'],cap/p['activePath'])
after=run('independent-after-two-global-current520-ten-accesses')
vp=Path(ix['negativeActivePath']);yy=read(cap/vp);target=ix['negativeDroppedMaterial'];count=0
for node in yy['rootNodes']:
 if 'children'in node:
  old=node['children'];node['children']=[c for c in old if not(c.get('kind')=='goalEntry'and c.get('goalId')==target)];count+=len(old)-len(node['children'])
assert count==1;np=wr('own-negative-BBGK-company-process-only-access-drop.json',yy);stage(np,cap/vp);negative=run('independent-negative-BBGK-company-process-access-drop');stage(R/next(p['after']['path']for p in pairs if p['activePath']==str(vp)),cap/vp)
wr('actual-ten-accesses-fieldwise-current518-to520-whole-input-review.json',{'wholeViewPairs':pairs,'wholeForeignBodyScience':basis['wholeForeignScience'],'wholeForeignOriginalBody':basis['wholeOriginalThreeBodies'],'wholeForeignCurrent520':ix['whole520Candidate'],'bodyStatusOnlyChanges':['examData.reviewStatus','examData.reviewNote'],'newPracticeIds':sorted(newids),'navFieldIds':sorted(navids),'all516OtherWholeGoalsExact':True,'wholeCurrentFourGoalsP8Exact':True,'tenAddedReferencesOnly':True})
wr('actual-independent-three-native-commands-and-input-frame.json',{'commands':cmds,'executionCapsule':str(cap),'helperSource':bind(O/'technical-reproduction/native-independent-Glob2-ten-scope.ts'),'nativeChecker':bind(q),'nativeCompiler':bind(R/'app/scripts/applicabilityCompiler.ts'),'observationOnlyExportExactPredicateGuard':True,'activeWrites':0})
