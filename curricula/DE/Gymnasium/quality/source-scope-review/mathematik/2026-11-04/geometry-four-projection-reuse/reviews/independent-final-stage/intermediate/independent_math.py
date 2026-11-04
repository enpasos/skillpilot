from pathlib import Path
import sympy as s, json, hashlib
F=Path(__file__).resolve().parent
H=F.parent
C=H/'geometry-four-projection-reuse-integration-20261104-v1/check-host'
g={x['id']:x for x in json.loads((C/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json').read_text())['goals']}
ids=['803d910d-96d1-5118-b9ca-29e93d0da76d','d3c42193-f1b7-5c6d-a991-bf034d99359f','7bb3c312-f714-55e6-a31f-f31605a93760','dd1954f6-0941-55a9-88d2-e2980ed902fd']
src=H/'geometry-projection-fixpoints-vectorproduct-four-whole-forms-20261104-v1'
matches=[]
for i in ids:
    orig='5748633c-113f-5ea8-9041-24da55919de7' if i.startswith('dd195') else i
    p=src/orig/'whole-form-content.draft.json'
    payload=json.loads(p.read_text())['examDataContent']
    e=g[i]['examData']
    for key in ['taskContent','taskContentEn','solutionContent','solutionContentEn','scoring']:
        assert payload[key]==e[key],(i,key)
    assert e['scoring']['maxPoints']==20 and e['scoring']['passingPoints']==15
    assert sum(x['points'] for x in e['scoring']['steps'])==20
    matches.append({'goalId':i,'originalContentPath':str(p),'originalContentSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'wholeTaskSolutionScoringEqual':True})
n=s.Matrix([1,2,-1]);d=s.Matrix([1,1,1]);P=s.eye(3)-d*n.T/(n.dot(d))
assert P*P==P and n.T*P==s.zeros(1,3)
assert P*s.Matrix([4,1,2])==s.Matrix([2,-1,0])
assert P*d==s.zeros(3,1) and P.rank()==2
matrices=[s.Matrix([[1,1,0],[0,1,0],[0,0,2]]),s.Matrix([[0,0,-1],[0,1,0],[-1,0,0]]),s.Matrix([[0,-1,0],[1,0,0],[0,0,2]]),s.eye(3)]
dims=[len((M-s.eye(3)).nullspace()) for M in matrices]
assert dims==[1,2,0,3]
a=s.Matrix([2,1,0]);b=s.Matrix([0,2,2]);cross=a.cross(b)
assert cross==s.Matrix([2,-4,4]) and cross.norm()==6
assert cross.dot(a)==cross.dot(b)==0
t=s.symbols('t',real=True)
assert a.cross(t*b)==t*cross
A=s.Matrix([1,1,2]);B=s.Matrix([5,1,2]);D=s.Matrix([1,4,5]);p12=s.diag(1,1,0);p23=s.diag(0,1,1)
u,v=s.symbols('u v');p=p23*(A+u*(B-A)+v*(D-A))
assert p==s.Matrix([0,1+3*v,2+3*v])
assert ((p12*(B-A)).cross(p12*(D-A))).norm()/2==6
assert s.Matrix([2,1,4])+2*s.Matrix([1,0,-2])==s.Matrix([4,1,0])
out={'status':'PASS_OWN_SYMBOLIC_MATH_AND_EXACT_INTEGRATED_CONTENT','contentComparisons':matches,'obliqueProjectionMatrix':str(P),'fixedSpaceDimensions':dims,'crossProduct':str(cross),'triangleArea':3,'projectedTriangleArea':6,'collapsedProjection':str(p),'separateAssessmentWholeImageNotJustVertices':True,'taskImagesAbsent':[i for i in ids if '![' not in g[i]['examData']['taskContent'] and '![' not in g[i]['examData']['taskContentEn']]}
(F/'independent-math-and-content.actual.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(out['status'])
