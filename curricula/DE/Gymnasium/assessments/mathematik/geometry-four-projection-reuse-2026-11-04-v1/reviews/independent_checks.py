"""Read-only independent checks of frozen inputs; writes only this review directory.

The hypothetical demand calculations below are finite Python calculations over
an already measured native artifact, not new native/runtime measurements.
"""
from pathlib import Path
from collections import Counter
import copy
import gzip
import hashlib
import json
import sympy as s

OUT = Path(__file__).resolve().parent
REPO = OUT.parents[2]
PACKAGE = OUT.parent / 'geometry-projection-fixpoints-vectorproduct-four-whole-forms-20261104-v1'
E3 = 'e3c70a12-7886-51f7-8bcd-ed54865415d6'
G574 = '5748633c-113f-5ea8-9041-24da55919de7'
G075 = '075f1ef2-6860-4b20-9df2-878157eb395e'
ED5 = 'ed5d869b-af4e-4b80-b34d-a2338e16ce34'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def read(path):
    return json.loads(path.read_text())

def write(name, data):
    (OUT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

manifest = read(PACKAGE / 'review-input-manifest.json')
assert sha(PACKAGE / 'review-input-manifest.json') == '481ac457449b2a2f62ddd90b62c14f9631e7b09706c88d0bdd03c50c14cee434'
assert sha(PACKAGE / 'content-review-handoff.json') == 'abe60917389bae7b2d7ef5e0c1275420fc6cc2ce8767daa128974192d65c2dc9'
bindings = []
for entry in manifest['files']:
    path = PACKAGE / entry['path']
    assert sha(path) == entry['sha256'], path
    assert path.stat().st_size == entry['bytes'], path
    bindings.append({'kind': 'package', **entry, 'verified': True})
for entry in manifest['externalInputBindings']:
    path = REPO / entry['inputRoot'] / entry['path']
    assert sha(path) == entry['sha256'], path
    bindings.append({'kind': 'external', **entry, 'verified': True})

canonical = read(PACKAGE / 'original/canonical.current.json')
by_id = {g['id']: g for g in canonical['goals']}
handoff = read(PACKAGE / 'content-review-handoff.json')
form_checks = []
for row in handoff['forms']:
    gid = row['goalId']
    form = read(PACKAGE / row['contentPath'])
    data = form['examDataContent']
    assert read(PACKAGE / gid / 'competency-contract.current.json') == by_id[gid]
    assert data['scoring']['maxPoints'] == 20
    assert data['scoring']['passingPoints'] == 15
    assert sum(x['points'] for x in data['scoring']['steps']) == 20
    for lang, suffix in [('de', ''), ('en', 'En')]:
        task = (PACKAGE / gid / f'task.{lang}.md').read_text()
        solution = (PACKAGE / gid / f'solution.{lang}.md').read_text()
        rubric = (PACKAGE / gid / f'rubric.{lang}.md').read_text()
        assert data['taskContent' + suffix] == task
        assert solution.rstrip() in data['solutionContent' + suffix]
        assert rubric.rstrip() in data['solutionContent' + suffix]
        assert 'coordinate-views-solution-v1.png' not in task
    form_checks.append({'goalId': gid, 'wholeFormSha256': sha(PACKAGE / row['contentPath']),
                        'wholeContractSha256': sha(PACKAGE / gid / 'competency-contract.current.json'),
                        'scoring': [20, 15], 'markdownAndJsonAgree': True})

M = s.Matrix
n = M([1, 2, -1])
d = M([1, 1, 1])
x = M(s.symbols('x1 x2 x3', real=True))
tau = s.symbols('tau', real=True)
parameter = s.solve(n.dot(x + tau*d), tau)[0]
P = s.simplify((x + parameter*d).jacobian(x))
expected_P = M([[s.Rational(1,2), -1, s.Rational(1,2)],
                [-s.Rational(1,2), 0, s.Rational(1,2)],
                [-s.Rational(1,2), -1, s.Rational(3,2)]])
assert P == expected_P and P*P == P and P.rank() == 2
assert n.T*P == s.zeros(1, 3) and P*d == s.zeros(3, 1)
assert P.nullspace() == [d]
assert P*M([4,1,2]) == M([2,-1,0])
assert P*M([4,1,2])-M([4,1,2]) == -2*d
nn = M(s.symbols('n1 n2 n3', real=True))
vv = M(s.symbols('v1 v2 v3', real=True))
denom = nn.dot(vv)
generic = s.eye(3)-vv*nn.T/denom
assert (generic*generic-generic).applyfunc(s.factor) == s.zeros(3)
assert (nn.T*generic).applyfunc(s.factor) == s.zeros(1, 3)
assert (generic*vv).applyfunc(s.factor) == s.zeros(3, 1)
# A concrete parallel case distinguishes no intersection from infinitely many.
np = M([0,0,1]); vp = M([1,0,0])
assert np.dot(vp) == 0
assert s.expand(np.dot(M([0,0,2])+tau*vp)) == 2
assert s.expand(np.dot(M([0,0,0])+tau*vp)) == 0

mats = {
    'A': M([[1,1,0],[0,1,0],[0,0,2]]),
    'B': M([[0,0,-1],[0,1,0],[-1,0,0]]),
    'C': M([[0,-1,0],[1,0,0],[0,0,2]]),
    'D': s.eye(3),
}
fixed = {}
for name, mat in mats.items():
    reduced, pivots = (mat-s.eye(3)).rref()
    basis = (mat-s.eye(3)).nullspace()
    for v in basis:
        assert mat*v == v
    fixed[name] = {'rank': len(pivots), 'dimension': len(basis),
                   'rref': str(reduced), 'nullspaceBasis': [str(v) for v in basis]}
assert [fixed[k]['dimension'] for k in ['A','B','C','D']] == [1,2,0,3]
assert fixed['A']['nullspaceBasis'] == [str(M([1,0,0]))]
assert (mats['B']-s.eye(3))*M([-tau,3,tau]) == s.zeros(3,1)
assert all(mats['C']*s.eye(3)[:,i] != s.eye(3)[:,i] for i in range(3))

projs = [s.diag(1,1,0), s.diag(1,0,1), s.diag(0,1,1)]
assert [list(z*M([2,-1,3])) for z in projs] == [[2,-1,0],[2,0,3],[0,-1,3]]
g = M([1,2,3])+tau*M([2,-1,2])
assert projs[0]*g == M([1+2*tau,2-tau,0])
assert (projs[0]*g).subs(tau,1) == M([3,1,0])
assert projs[0]*(M([2,1,0])+tau*M([0,0,1])) == M([2,1,0])
a,b,c = M([1,1,2]), M([5,1,2]), M([1,4,5])
alpha,beta = s.symbols('alpha beta', real=True)
filled = a+alpha*(b-a)+beta*(c-a)
assert projs[0]*filled == M([1+4*alpha,1+3*beta,0])
assert projs[2]*filled == M([0,1+3*beta,2+3*beta])
# alpha,beta >= 0 and alpha+beta <= 1; beta consequently spans exactly [0,1].
top_area = (projs[0]*(b-a)).cross(projs[0]*(c-a)).norm()/2
side_area = (projs[2]*(b-a)).cross(projs[2]*(c-a)).norm()/2
original_area = (b-a).cross(c-a).norm()/2
assert top_area == 6 and side_area == 0 and original_area == 6*s.sqrt(2)
shadow_t = s.solve((M([2,1,4])+tau*M([1,0,-2]))[2],tau)[0]
assert shadow_t == 2 and M([2,1,4])+shadow_t*M([1,0,-2]) == M([4,1,0])

a,b,c = M([1,0,1]),M([3,1,1]),M([1,2,3])
u,v = b-a,c-a
normal = u.cross(v)
assert normal == M([2,-4,4])
assert normal.dot(u) == normal.dot(v) == 0
assert normal.norm() == 6 and normal.norm()/2 == 3
assert all(normal.dot(q-a) == 0 for q in [a,b,c])
assert u.cross(tau*v) == tau*normal
assert s.simplify((u.cross(tau*v)).norm()/2) == 3*s.Abs(tau)
assert u.cross(-2*v) == M([-4,8,-8])
assert (u.cross(-2*v)).norm()/2 == 6
assert a+0*v == a and u.cross(0*v) == s.zeros(3,1)
assert M.hstack(u,0*v).rank() == 1

math = {
    'status':'INDEPENDENT_EXACT_MATHEMATICS_PASS',
    'engine':'SymPy '+s.__version__,
    'oblique':{'matrix':str(P),'parameter':str(parameter),'rank':2,
               'imagePoint':[2,-1,0],'kernelBasis':[[1,1,1]],
               'genericIdempotenceImageAndKernelVerified':True,
               'parallelCase':'z=0, v=(1,0,0): z=2 has no intersection; z=0 line lies in plane'},
    'fixedSets':fixed,
    'coordinateViews':{'topArea':str(top_area),'sideArea':str(side_area),
                      'originalAreaNotRequiredByTask':str(original_area),
                      'wholeTriangleMap':str(projs[0]*filled),
                      'wholeSegmentMap':str(projs[2]*filled),
                      'shadowParameter':str(shadow_t),'shadow':[4,1,0]},
    'crossProduct':{'normal':list(map(int,normal)),'parallelogramArea':6,
                    'triangleArea':3,'areaFunction':'3*Abs(t)',
                    'negativeCase_t_minus2':{'crossProduct':[-4,8,-8],'area':6},
                    'zeroCaseRank':1,'uniquePlaneAtZero':False},
    'authorVerificationScriptsExecuted':False,
}
write('independent-mathematics.json',math)

def closure(graph, roots, mastered=frozenset()):
    needed=set(); pending=list(roots)
    while pending:
        u=pending.pop()
        if u in mastered or u in needed:
            continue
        needed.add(u)
        pending.extend(graph.get(u,[]))
    return needed

original_graph = {g['id']: list(g.get('requires',[])) for g in canonical['goals']}
original_branch = closure(original_graph,[G574])
corrected_graph = copy.deepcopy(original_graph)
corrected_graph[G574] = [G075]
corrected_graph[E3] = original_graph[E3]+[G574]
assert E3 not in closure(corrected_graph,[G574])
minimal_branch = closure(corrected_graph,[G574])
assert len(original_branch)==17 and len(minimal_branch)==7
native_path = REPO / handoff['existingActualN2Binding']['path']
assert sha(native_path) == handoff['existingActualN2Binding']['sha256']
native=json.loads(gzip.decompress(native_path.read_bytes()))
scope_rows=[]; partial=[]
for row in native['scopes']:
    targets=set(row['targetGoalIds']); ctx=set(row['contextGoalIds'])
    protected=set(row['selectedProtectedTargetGoalIds'])
    graph=copy.deepcopy(row['effectiveDirectPrerequisitesByContextGoalId'])
    before=closure(graph,protected)
    assert before==set(row['neededContextGoalIdsAtM0']),row['scope']
    candidate=copy.deepcopy(graph)
    if G574 in ctx:
        candidate[G574]=[G075]
    added_context=set()
    if E3 in targets:
        added_context={G574}-ctx
        assert original_branch-{G574} <= ctx
        assert original_branch-{G574} <= before
        candidate[G574]=[G075]
        candidate[E3]=list(graph[E3])+[G574]
    after=closure(candidate,protected)
    assert not before-after,row['scope']
    assert after-before == ({G574} if E3 in targets else set()),row['scope']
    scope_rows.append({'scope':row['scope'],'e3Target':E3 in targets,
                       'e3ProtectedTarget':E3 in protected,'goal574Target':G574 in targets,
                       'goal574ContextBefore':G574 in ctx,
                       'oldFull574BranchMissingContext':sorted(original_branch-ctx) if E3 in targets else None,
                       'addedSupportContext':sorted(added_context),
                       'newlyNeeded':sorted(after-before),'noLongerNeeded':sorted(before-after),
                       'targetSetChange':False,'protectedSetChange':False})
    if E3 in targets:
        mastered=(protected-{E3})|{ED5}
        old_n=closure(graph,protected,mastered)
        naive=copy.deepcopy(graph);naive[E3]=list(graph[E3])+[G574]
        naive[G574]=original_graph[G574]
        naive_n=closure(naive,protected,mastered)
        corrected_n=closure(candidate,protected,mastered)
        assert old_n == {E3}
        assert naive_n == original_branch|{E3}
        assert corrected_n == minimal_branch|{E3}
        assert closure(candidate,protected,mastered|{G574}) == {E3}
        assert closure(candidate,protected,mastered|{E3}) == set()
        partial.append({'scope':row['scope'],
                        'masteryDefinition':'all selected protected targets except e3, plus ed5; ordinary preparation unmastered',
                        'originalNeeded':sorted(old_n),'uncorrectedEdgeNeeded':sorted(naive_n),
                        'correctedEdgeNeeded':sorted(corrected_n),
                        'afterMastering574':[E3],'afterMasteringE3':[]})

scope_report={
    'status':'CONDITIONAL_STATIC_PROPOSAL_NO_RUNTIME_OR_SCOPE_ACTIVATION',
    'nativeArtifact':handoff['existingActualN2Binding'],
    'fullNativeRerun':False,'source': 'Independent BFS over already measured effective direct edges; no transitive substitution at mastery boundaries',
    'proposal':[
        {'goalId':G574,'oldRequires':original_graph[G574],'proposedRequires':[G075]},
        {'goalId':E3,'oldRequires':original_graph[E3],'proposedRequires':corrected_graph[E3]},
    ],
    'original574Branch':sorted(original_branch),'corrected574Branch':sorted(minimal_branch),
    'removedFrom574BranchOnly':[{'id':g,'title':by_id[g]['title']} for g in sorted(original_branch-minimal_branch)],
    'counts':{'scopesRead':len(scope_rows),'e3Target':sum(r['e3Target'] for r in scope_rows),
              'goal574Target':sum(r['goal574Target'] for r in scope_rows),
              'targetOverlap':sum(r['e3Target'] and r['goal574Target'] for r in scope_rows),
              'supportContextAdditions':sum(bool(r['addedSupportContext']) for r in scope_rows),
              'zeroMasteryScopesLosingExistingNeeded':sum(bool(r['noLongerNeeded']) for r in scope_rows),
              'unchangedRPartialMasteryNeededCount':18,'correctedRPartialMasteryNeededCount':8},
    'scopeRows':scope_rows,'partialMasteryCases':partial,
    'noLearnerStateWritten':True,
    'limitations':[
        'The added support contexts and changed R are hypothetical and have not been compiled or activated.',
        'Actual applicability compilation, composition membership, all old protected obligations, ordinary/strict modes and exact native checks remain later integration duties.',
        'Neither inferred source coverage nor a runtime edge restricted to the twelve HE scopes is proposed.',
    ],
}
write('independent-scope-and-partial-mastery.json',scope_report)
write('input-integrity.json',{'status':'PASS','manifestSha256':sha(PACKAGE/'review-input-manifest.json'),
                            'handoffSha256':sha(PACKAGE/'content-review-handoff.json'),
                            'packageFilesVerified':len(manifest['files']),
                            'externalPinsVerified':len(manifest['externalInputBindings']),
                            'bindings':bindings,'forms':form_checks,
                            'originalPackageMutation':False})
print(json.dumps({'integrity':'PASS','files':136,'pins':27,'math':math['status'],
                  'staticScopeCounts':scope_report['counts']},ensure_ascii=False))
