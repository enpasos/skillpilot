"""Independent, read-only input checks; writes only this review directory.
No Native execution, author checker invocation, graph mutation or activation.
"""
import copy, gzip, hashlib, json, re
from collections import Counter
from pathlib import Path
import sympy as s

O=Path(__file__).resolve().parent
R=O.parents[2]
P=O.parent/'geometry-six-remaining-content-20261104-v1'
load=lambda p:json.loads(p.read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def save(n,d): (O/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
BD='bd3576b8-f4e5-542a-a8a2-74524d9cee21'
I='857c1c46-5d94-5dfb-9697-9a9fd04103c3'
S='58f613da-03be-5c6a-90a9-ff0958aa7849'
B='bda6a659-9640-53a5-8be0-24705ab623ef'
F='5f90df42-8a71-534d-b995-b8f7dcaf1661'
E='eb112b6f-4cc4-58af-975a-f1ea61b727f0'
X='8d314e15-69e9-5af1-a10a-be820b2f821d'
N57='57b11e9a-4acf-5ebe-b2b6-c9f99d2b5bb5'
N69='69beb31d-5d02-4505-9500-3ec81af86f1e'
manifest=load(P/'review-input-manifest.json')
assert sha(P/'review-input-manifest.json')=='b69f993176d114ae88f1811ed64e92ccf02e9a8d466285d8833dad6aff576473'
for row in manifest['files']:
 p=P/row['path'];assert sha(p)==row['sha256'],p
 assert len(p.read_bytes())==row['bytes'],p
for row in manifest['externalInputBindings']:
 p=R/row.get('inputRoot','.')/row['path'];assert sha(p)==row['sha256'],p
frozen=load(P/'frozen-input.json')
cb=frozen['canonical'];canonical=load(R/cb['inputRoot']/cb['path'])
goals={g['id']:g for g in canonical['goals']}
assert load(P/'original/canonical.current.json')==canonical
for g in frozen['wholeGoals']:assert goals[g['id']]==g
assert load(P/'existing-8d3-whole-form.current.json')==goals[X]
forms=[]
for ident in [BD,S,B,F,E]:
 d=load(P/ident/'whole-form-content.draft.json');ed=d['examDataContent']
 for lang,suffix in [('de',''),('en','En')]:
  task=(P/ident/f'task.{lang}.md').read_text()
  solution=(P/ident/f'solution.{lang}.md').read_text()
  rubric=(P/ident/f'rubric.{lang}.md').read_text()
  assert ed['taskContent'+suffix].strip()==task.strip()
  norm=lambda text:re.sub(r'\n{3,}','\n\n',text.strip())
  assert norm(ed['solutionContent'+suffix])==norm(solution)
  assert solution.rstrip().endswith(rubric.rstrip())
 forms.append({'goalId':ident,'wholeFormSha256':sha(P/ident/'whole-form-content.draft.json'),'bilingualTextBindings':True})
save('independent-input-integrity.json',{'status':'PASS','manifestSha256':sha(P/'review-input-manifest.json'),'handoffSha256':sha(P/'content-review-handoff.json'),'files':len(manifest['files']),'externalPins':len(manifest['externalInputBindings']),'wholeOriginalGoals':6,'existing8d3WholeContractEqual':True,'forms':forms,'inputsMutated':False})

# Derive the quantities independently of the author's expected-results files.
t,a,x,u=s.symbols('t a x u',real=True);M=s.Matrix
roofp=M([0,0,3]);roofu=M([6,0,3]);roofv=M([0,4,0]);roofn=roofu.cross(roofv)
ray=M([8,2,9])+t*M([-1,0,-1]);hit_t=s.solve(roofn.dot(ray-roofp),t)
assert hit_t==[4] and ray.subs(t,4)==M([4,2,5])
assert s.solve(roofn.dot(M([8,5,9])+t*M([-1,0,-1])-roofp),t)==[4]
assert 0<=s.Rational(2,3)<=1 and 0<=s.Rational(1,2)<=1 and s.Rational(5,4)>1
n=M([1,2,2]);m=M([1,-1,-2]);v=M([1,1,0]);w=M([2,0,1]);assert m.dot(v)==m.dot(w)==0
co=s.Abs(n.dot(m))/(n.norm()*m.norm());assert s.simplify(co-5/(3*s.sqrt(6)))==0
assert round(float(s.acos(co)*180/s.pi),1)==47.1
assert s.Abs(n.dot(-2*m))/(n.norm()*(-2*m).norm())==co
nf=M([0,1,1]);na=M([a,1,0]);d=M([1,0,a])
sa=s.Abs(d.dot(nf))/(d.norm()*nf.norm());cbeta=s.Abs(na.dot(nf))/(na.norm()*nf.norm())
assert s.solve(sa**2-s.Rational(1,4),a)==[-1,1]
assert s.solve(cbeta**2-s.Rational(1,4),a)==[-1,1]
for val in [-1,1]:assert sa.subs(a,val)==cbeta.subs(a,val)==s.Rational(1,2)
assert s.solve(s.Abs(a)-1,a)==[-1,1]
assert na.cross(nf)[0]==1  # never parallel, including a=0
assert M([0,0,1]).dot(nf)==1 and d.subs(a,0).dot(nf)==0
traj=M([1+4*t,-2+3*t,2+6*t-2*t*t])
assert traj.subs(t,1)==M([5,1,6]) and traj.subs(t,3)==M([13,7,2])
assert traj.subs(t,s.Rational(3,2))==M([7,s.Rational(5,2),s.Rational(13,2)])
assert s.expand(traj[2]-(s.Rational(13,2)-2*(t-s.Rational(3,2))**2))==0
assert s.simplify(traj[2].subs(t,(x-1)/4)-(2+s.Rational(3,2)*(x-1)-(x-1)**2/8))==0
assert traj.subs(t,u/2)==M([1+2*u,-2+3*u/2,2+3*u-u*u/2])
q=s.symbols('q',real=True)
assert s.expand(traj[2].subs(t,q/5)-(2+6*q/5-2*q*q/25))==0
# Classify all requested special-line configurations directly as linear systems.
def axis_relation(p,d,j):
 z=s.symbols('z',real=True);axis=M([int(i==j) for i in range(3)])
 sol=s.linsolve(list(p+t*d-z*axis),(t,z))
 parallel=d.cross(axis)==s.zeros(3,1)
 return 'identical' if parallel and sol!=s.EmptySet else 'parallel' if parallel else 'skew' if sol==s.EmptySet else 'intersect'
def plane_relation(p,d,j):return 'contained' if d[j]==0 and p[j]==0 else 'parallel' if d[j]==0 else 'intersect'
g=(M([0,0,0]),M([1,0,0]));h=(M([0,2,0]),M([1,0,0]));k=(M([1,1,2]),M([1,1,0]))
assert [axis_relation(*g,j) for j in range(3)]==['identical','intersect','intersect']
assert [axis_relation(*h,j) for j in range(3)]==['parallel','intersect','skew']
assert [plane_relation(*g,j) for j in [2,1,0]]==['contained','contained','intersect']
assert [plane_relation(*h,j) for j in [2,1,0]]==['contained','parallel','intersect']
assert axis_relation(*k,2)=='intersect' and plane_relation(*k,2)=='parallel'
assert k[0]-k[1]==M([0,0,2])
# Whole existing 8d3: all three systems, not just first intersection.
xx,yy,zz=s.symbols('xx yy zz');param=M([2,1,0])+t*M([-1,0,1])
assert s.linsolve([xx+yy+zz-3,xx-yy+zz-1],(xx,yy,zz))==s.FiniteSet((2-zz,1,zz))
assert sum(param)==3 and param[0]-param[1]+param[2]==1
assert s.linsolve([xx+2*yy-zz-1,2*xx+4*yy-2*zz-3],(xx,yy,zz))==s.EmptySet
assert s.linsolve([xx+2*yy-zz-1,2*xx+4*yy-2*zz-2],(xx,yy,zz))==s.FiniteSet((-2*yy+zz+1,yy,zz))
save('independent-mathematics.json',{'status':'PASS','method':'Independent symbolic calculations and complete case classification, using no author expected-results file','sixWholeFormsChecked':[BD,S,B,F,E,X],'roof':{'t':4,'P':[4,2,5],'movedP':[4,5,5],'finiteRoofSecondMiss':True},'planeAngleDegrees':47.1,'bothParameterSolutionSets':[-1,1],'complementaryExactly':[-1,1],'parabolaPeak':[7,2.5,6.5],'existing8d3':['intersection line (2-t,1,t)','empty','whole plane (1-2s+t,s,t)']})

raw={i:g.get('requires',[]) for i,g in goals.items()}
changes=load(P/'proposed-preparation-changes.NOT-ACTIVATED.json')['proposedDirectRequiresByGoalId']
proposed={**raw,**changes}
def reach(starts, graph, mastered=()):
 m=set(mastered);seen=set();todo=list(starts)
 while todo:
  z=todo.pop()
  if z in m or z in seen:continue
  seen.add(z);todo.extend(graph.get(z,[]))
 return seen
def acyclic(graph):
 color={}
 def visit(z):
  assert color.get(z)!=1,('cycle',z)
  if color.get(z)==2:return
  color[z]=1
  for p in graph.get(z,[]):visit(p)
  color[z]=2
 for z in graph:visit(z)
acyclic(proposed)
nb=frozen['actualNativeG3'];native=json.load(gzip.open(R/nb['inputRoot']/nb['path']))
actual=load(P/'actual-g3-membership-and-effective-preparation.json')
assert len(native['scopes'])==len(actual['rows'])==161
ns={r['scope']:r for r in native['scopes']};effect=[];factcount=0
all_scope_effects=[]
for ar in actual['rows']:
 nr=ns[ar['scope']];eg=nr['effectiveDirectPrerequisitesByContextGoalId']
 assert ar['scopeDecision']==nr['scopeDecision'] and ar['personalCurriculumConfig']==nr['personalCurriculumConfig']
 for f in ar['facts']:
  z=f['goalId'];factcount+=1
  for ak,nk in [('target','targetGoalIds'),('prerequisiteOnly','prerequisiteOnlyGoalIds'),('context','contextGoalIds'),('neededAtM0','neededContextGoalIdsAtM0'),('selectedProtectedTarget','selectedProtectedTargetGoalIds')]:assert f[ak]==(z in nr[nk]),(ar['scope'],z,ak)
  assert f['actualEffectiveDirectRequires']==eg.get(z,[])
  expected=reach(eg.get(z,[]),eg) if z in nr['contextGoalIds'] else set()
  assert set(f['wholeEffectivePreparationGoalIds'])==expected,(ar['scope'],z)
 old_all=reach(nr['selectedProtectedTargetGoalIds'],eg)
 assert old_all==set(nr['neededContextGoalIdsAtM0']),ar['scope']
 revised_eg=copy.deepcopy(eg)
 for z,rr in changes.items():
  if z in eg:revised_eg[z]=rr
 # Expand newly required raw atoms; retain effective edges for existing nodes.
 pending=[p for z in changes if z in eg for p in changes[z]];seen=set()
 while pending:
  z=pending.pop()
  if z in seen:continue
  seen.add(z)
  if z not in revised_eg:revised_eg[z]=proposed.get(z,[])
  pending.extend(revised_eg[z])
 new_all=reach(nr['selectedProtectedTargetGoalIds'],revised_eg)
 all_scope_effects.append({'scope':ar['scope'],'scopeDecision':nr['scopeDecision'],'currentProtectedTargetsUnchanged':True,'beforeNeededCount':len(old_all),'afterNeededCount':len(new_all),'addedNeeded':sorted(new_all-old_all),'removedNeeded':sorted(old_all-new_all),'potentialAddedContextOutsideT':sorted((set(revised_eg)-set(eg))-set(nr['targetGoalIds']))})
 if X not in nr['targetGoalIds']:continue
 # Content counterfactual only: existing effective context plus corrected raw branch.
 neweg=copy.deepcopy(eg)
 for z,rr in changes.items():
  if z in neweg:neweg[z]=rr
 for z in reach([I],proposed):
  if z not in neweg:neweg[z]=proposed.get(z,[])
 neweg[X]=changes[X]
 old=reach([X],eg);new=reach([X],neweg)
 assert new-old=={I},(ar['scope'],new-old)
 assert not old-new,(ar['scope'],old-new)
 effect.append({'scope':ar['scope'],'scopeDecision':nr['scopeDecision'],'intersectionGoalInT':I in nr['targetGoalIds'],'intersectionGoalAlreadyInContext':I in nr['contextGoalIds'],'addedPreparationAtM0':sorted(new-old),'removedPreparationAtM0':sorted(old-new),'newContextOutsideT':sorted((new-set(nr['contextGoalIds']))-set(nr['targetGoalIds']))})
assert len(effect)==88 and sum(r['intersectionGoalInT'] for r in effect)==16
gap=[r['scope'] for r in native['scopes'] if B in r['targetGoalIds'] and F not in r['targetGoalIds']]
overlap=[r['scope'] for r in native['scopes'] if B in r['targetGoalIds'] and F in r['targetGoalIds']]
assert len(gap)==8 and len(overlap)==20
def titled(xs):return [{'goalId':z,'title':goals[z]['title']} for z in sorted(xs)]
partial=[]
def case(label,starts,m):
 before=reach(starts,raw,m);after=reach(starts,proposed,m)
 partial.append({'case':label,'protectedStarts':starts,'mastered':sorted(m),'beforeNeeded':titled(before),'afterNeeded':titled(after),'added':titled(after-before),'removed':titled(before-after)})
case('8d3 unfinished, all three old direct requirements mastered',[X],set(raw[X]))
case('8d3 unfinished, old requirements and 857 mastered',[X],set(raw[X]+[I]))
case('8d3 passed, no other protected demand',[X],{X})
case('Parameter goal unfinished, old and retained 241/BDA mastered, 57 missing',[F],set(raw[F]))
case('Parameter goal unfinished, all corrected direct requirements mastered',[F],set(proposed[F]))
case('Parameter goal passed, BDA ordinary and no other demand',[F],{F})
case('Counterexample: duplicate BDA protection survives parameter pass',[F,B],{F})
case('Modelling unfinished, retained intersection preparation mastered',[BD],set(proposed[BD]))
summaries=[]
for z in [BD,I,S,B,F,E,X]:
 rr=[r for r in native['scopes'] if z in r['targetGoalIds']]
 summaries.append({'goalId':z,'targetScopeCount':len(rr),'countries':dict(Counter(r['scope'].split('/')[0] for r in rr)),'protectedTargetScopeCount':sum(z in r['selectedProtectedTargetGoalIds'] for r in rr)})
save('independent-scope-and-partial-mastery.json',{'status':'READ_ONLY_161_ACTUAL_G3_CASES_AND_DIRECT_EDGE_COUNTERFACTUALS_NOT_NATIVE_ACCEPTANCE','nativeSha256':sha(R/nb['inputRoot']/nb['path']),'actualScopeCount':161,'actualUnionCount':native['actualUnionCount'],'actualFactRowsCrossChecked':factcount,'proposalAcyclic':True,'proposedRequiresByGoalId':changes,'targetSummaries':summaries,'existing8d3EffectsAll88':effect,'bdaOnlyGapScopes':gap,'bdaWithParameterScopes':overlap,'partialMasteryCases':partial,'ordinaryPreparationDoesNotWriteMastery':True,'strictModeStillChecksGlobalRequirements':True,'futureIntegratedRolesIDsApplicabilityAndContextRequireActualVerification':True})
save('independent-all-161-r-only-m0-counterfactuals.json',{'status':'ANALYTICAL_DIRECT_EDGE_COUNTERFACTUAL_CURRENT_PROTECTED_TARGETS_UNCHANGED_NOT_NATIVE','cases':all_scope_effects,'caseCount':len(all_scope_effects),'changedNeededScopeCount':sum(r['addedNeeded']!=[] or r['removedNeeded']!=[] for r in all_scope_effects),'potentialAddedContextScopeCount':sum(bool(r['potentialAddedContextOutsideT']) for r in all_scope_effects),'method':'Cross-check current demand against every actual G3 M0 needed-context set; replace only proposed direct edges and expand missing preparation from the corrected raw contracts. Does not compile applicability, assign new assessment IDs or roles, or authorize negative scopes.'})
print(json.dumps({'status':'PASS','files':len(manifest['files']),'pins':len(manifest['externalInputBindings']),'scopeFacts':factcount,'existing8d3Scopes':len(effect),'bdaOnlyGapScopes':gap,'partialCaseCounts':[(c['case'],len(c['beforeNeeded']),len(c['afterNeeded'])) for c in partial]},ensure_ascii=False))
