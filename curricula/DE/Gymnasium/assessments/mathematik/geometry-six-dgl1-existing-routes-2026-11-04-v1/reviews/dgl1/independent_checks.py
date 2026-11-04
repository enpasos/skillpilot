"""Read-only source audit plus reviewer-owned symbolic checks; no Native execution."""
import gzip, hashlib, json
from pathlib import Path
import sympy as s

OUT=Path(__file__).resolve().parent
ROOT=OUT.parents[2]
P=OUT.parent/'dgl1-whole-form-content-20261104-v1'
D1='28cdee95-3c8e-5760-a68a-405b7f9c6cbf'
D2='58fda9b4-4336-5594-99ce-722c4a453372'
MEM='ca708087-71f8-5fae-91c5-b80721a4208f'
SHA='0562557487f7be71513c316411103d364313d82e01557f8ab5355f4f5b93347f'
def read(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def write(n,v): (OUT/n).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
manifest=read(P/'review-input-manifest.json')
assert sha(P/'review-input-manifest.json')==SHA
for entry in manifest['files']:
    q=P/entry['path']; assert sha(q)==entry['sha256'],q
    assert q.stat().st_size==entry['bytes'],q
for entry in manifest['externalInputBindings']:
    q=ROOT/entry['inputRoot']/entry['path']; assert sha(q)==entry['sha256'],q
assert len(manifest['files'])==70 and len(manifest['externalInputBindings'])==22
frozen=read(P/'frozen-input.json')
b=frozen['canonical']; canonical=read(ROOT/b['inputRoot']/b['path']); goals={g['id']:g for g in canonical['goals']}
whole=read(P/'whole-contract-and-original-preparation.json')
assert goals[D1]==whole['wholeOriginalGoal']
def reach(seed,edges):
    seen=set(); stack=list(edges.get(seed,[]))
    while stack:
        g=stack.pop()
        if g in seen: continue
        seen.add(g); stack.extend(edges.get(g,[]))
    return seen
raw={g:gobj.get('requires',[]) for g,gobj in goals.items()}
anc=reach(D1,raw); assert len(anc)==54
assert anc==set(whole['wholeRawPreparationGoalIds'])
for obj in whole['wholeRawPreparationGoalObjects']: assert obj==goals[obj['id']]
alternatives=read(P/'whole-existing-alternatives-and-preparation.json')
for obj in alternatives['wholeAlternatives']+alternatives['wholePreparationGoalObjects']: assert obj==goals[obj['id']]
memory=read(P/'whole-memory-obligation-and-deck-context.json')
for obj in memory['wholeReferencedMemoryGoals']: assert obj==goals[obj['id']]
for deck in memory['wholeActualDecks']:
    b=deck['originalBinding']; assert read(ROOT/b['inputRoot']/b['path'])==deck['wholeDeck']==read(P/deck['privateCopy'])

b=frozen['actualG3Native']
native=json.load(gzip.open(ROOT/b['inputRoot']/b['path'],'rt'))
actual={r['scope']:r for r in native['scopes']}
assert len(actual)==161 and native['actualUnionCount']==46
supplied=read(P/'actual-g3-membership-and-effective-preparation.json')
assert set(actual)=={r['scope'] for r in supplied['rows']}
scope_results=[]; fact_count=0
mapping={'target':'targetGoalIds','prerequisiteOnly':'prerequisiteOnlyGoalIds','context':'contextGoalIds','neededAtM0':'neededContextGoalIdsAtM0','selectedProtectedTarget':'selectedProtectedTargetGoalIds'}
for row in supplied['rows']:
    a=actual[row['scope']]; edges=a['effectiveDirectPrerequisitesByContextGoalId']
    for key in ['scopeDecision','personalCurriculumConfig','compositionViewIds']: assert row[key]==a[key]
    for fact in row['facts']:
        g=fact['goalId']
        for key,nativekey in mapping.items(): assert fact[key]==(g in a[nativekey]),(a['scope'],g,key)
        assert set(fact['actualEffectiveDirectRequires'])==set(edges.get(g,[]))
        assert set(fact['wholeActualEffectivePreparationGoalIds'])==reach(g,edges)
        assert fact['visiblePaths']==a['visibleGoalPaths'].get(g,[])
        fact_count+=1
    for g,rs in row['actualEffectivePrerequisitesForWholeRelevantPreparation'].items(): assert rs==edges.get(g,[])
    # This recomputes only finite graph demand from the already measured direct edges.
    def demand(mastery):
        seen=set(); todo=list(a['selectedProtectedTargetGoalIds'])
        while todo:
            g=todo.pop()
            if g in seen or g in mastery: continue
            seen.add(g)
            todo.extend(edges.get(g,[]))
        return seen
    assert demand(set())==set(a['neededContextGoalIdsAtM0'])
    scope_results.append({'scope':a['scope'],'dgl1Target':D1 in a['targetGoalIds'],'dgl2Protected':D2 in a['selectedProtectedTargetGoalIds'],'memoryProtected':MEM in a['selectedProtectedTargetGoalIds'],'dgl1NeededM0':D1 in demand(set()),'dgl1NeededAfterDgl2OnlyMastery':D1 in demand({D2}),'memoryNeededAfterDgl2OnlyMastery':MEM in demand({D2}),'futurePlacementApproved':False})
d1T={r['scope'] for r in scope_results if r['dgl1Target']}
d2P={r['scope'] for r in scope_results if r['dgl2Protected']}
gap=d1T-d2P
rejected=read(P/'original44-rejected-dgl2-pairs.NOT-new-dgl1-role-approval.json')
assert gap=={r['scope'] for r in rejected['originalExact44PairRows']}
assert len(d1T)==132 and len(d2P)==88 and len(gap)==44 and d2P<=d1T
write('independent-binding-and-scope-check.json',{'status':'PASS_READ_ONLY_CURRENT_G3_BINDING','manifestSha256':SHA,'filesVerified':70,'externalPinsVerified':22,'canonicalSha256':frozen['canonical']['sha256'],'nativeSha256':frozen['actualG3Native']['sha256'],'originalRAncestors':54,'scopeCount':161,'unionCount':46,'wholeGoalFactRowsChecked':fact_count,'targetDgl1':132,'existingProtectedDgl2':88,'remainingDgl1Scopes':44,'remainingScopesExactlyEqualPrior44RejectedDgl2Scopes':True,'scopeResults':scope_results,'newNativeExecution':False,'futureIdentityRoleOrScopeApproval':False,'method':'Comparison with immutable actual G3 measurements plus direct-edge demand calculation; no candidate mutation, closure-edge invention or new runtime evidence.'})

t,C,K,L,y,a,b=s.symbols('t C K L y a b',real=True)
checks=[]
def equal(name,lhs,rhs):
    residual=s.simplify(lhs-rhs); assert residual==0,(name,residual)
    checks.append({'case':name,'left':str(lhs),'right':str(rhs),'residual':str(residual),'passed':True})
Y=1/(C-t)
equal('separated primitive',s.diff(-1/y,y),1/y**2)
equal('free-constant family residual',s.diff(Y,t),Y**2)
equal('K and C convention',(-1/(t+K)).subs(K,-C),Y)
equal('reciprocal derivative under DGL',(-s.Symbol('yp')/y**2).subs(s.Symbol('yp'),y**2),-1)
equal('integrated reciprocal',s.diff(C-t,t),-1)
assert s.solve(s.Eq(Y.subs(t,0),1),C)==[1]
equal('initial solution',Y.subs(C,1).subs(t,0),1)
assert s.solve(s.Eq(1-t,0),t)==[1]
equal('zero constant residual',0,0**2)
assert s.solve(s.Eq(s.Symbol('k')**2,0),s.Symbol('k'))==[0]
Z=t**2+L
equal('direct family derivative',s.diff(Z,t),2*t)
assert s.solve(s.Eq(Z.subs(t,0),-2),L)==[-2]
equal('direct particular initial',Z.subs({t:0,L:-2}),-2)
equal('free coefficient ansatz equation',s.diff(1/(a+b*t),t)-(1/(a+b*t))**2,(-b-1)/(a+b*t)**2)
assert s.solve(s.Eq(-b,1),b)==[-1]
equal('wrong plus sign is not solution',s.diff(1/(C+t),t)-(1/(C+t))**2,-2/(C+t)**2)
for c in [-3,0,1,4]: equal('family parameter '+str(c),s.diff(Y.subs(C,c),t),Y.subs(C,c)**2)
write('independent-mathematics.json',{'status':'PASS','checks':checks,'separateExactConditions':['Division only where y is nonzero.','Family denominator vanishes only at t=C; maximal zero-free open branches are (-infinity,C) and (C,infinity).','For C=1 the branch containing initial time 0 is (-infinity,1); R minus {1} is not an interval.','The same expression on (1,infinity) does not satisfy an initial condition at 0 because 0 is outside its domain.','Zero function is a further constant solution on R and is not obtained by any finite C.','z=t^2-2 is differentiable on R, so its largest elementary solution interval is R.','No general existence, uniqueness, completeness or maximality theorem is used or requested.'],'symbolicChecksAreNotDidacticReview':True})
print(json.dumps({'status':'PASS','files':70,'pins':22,'scopeFacts':fact_count,'mathEqualities':len(checks),'dgl1T':len(d1T),'dgl2P':len(d2P),'remaining':len(gap)}))
