"""Exact author computations; distinct checks via line solves, nullspaces and Gram area."""
from pathlib import Path
import json
import sympy as s
H=Path(__file__).resolve().parent
out=[]
def record(name,v):out.append({'check':name,'result':str(v),'passed':True})
x1,x2,x3,t,u,v=s.symbols('x_1 x_2 x_3 t u v',real=True);x=s.Matrix([x1,x2,x3]);n=s.Matrix([1,2,-1]);d=s.ones(3,1)
# Solve the geometric line equation independently of the displayed matrix entries.
intersection=s.solve((n.dot(x+t*d)),t)[0];P=(x+intersection*d).jacobian(x)
expected=s.Matrix([[s.Rational(1,2),-1,s.Rational(1,2)],[-s.Rational(1,2),0,s.Rational(1,2)],[-s.Rational(1,2),-1,s.Rational(3,2)]])
assert P==expected;assert P*P==P;assert n.T*P==s.zeros(1,3);assert P.nullspace()==[d];assert P.rank()==2
p=s.Matrix([4,1,2]);image=P*p;assert image==s.Matrix([2,-1,0]);assert n.dot(image)==0;assert image-p==-2*d
# Basis vectors of the target plane are fixed; two independent images span it.
for z in [s.Matrix([-2,1,0]),s.Matrix([1,0,1])]:assert P*z==z
for nn,vv in [(s.Matrix([2,-1,3]),s.Matrix([1,2,1])),(s.Matrix([1,1,1]),s.Matrix([0,0,2]))]:
 Q=s.eye(3)-vv*nn.T/(nn.dot(vv));assert Q*Q==Q;assert nn.T*Q==s.zeros(1,3);assert Q*vv==s.zeros(3,1)
parallel=s.Matrix([2,-1,0]);assert n.dot(parallel)==0;assert s.expand(n.dot(x+t*parallel))==n.dot(x)
record('Oblique projection: independent line solution, exact matrix, all-point plane identity, idempotence, full nullspace/rank, target-plane basis and image check',P)
record('General formula checked on two different arbitrary oblique planes; parallel direction leaves plane expression constant',n.dot(x+t*parallel))
A=s.Matrix([[1,1,0],[0,1,0],[0,0,2]]);B=s.Matrix([[0,0,-1],[0,1,0],[-1,0,0]]);C=s.Matrix([[0,-1,0],[1,0,0],[0,0,2]]);D=s.eye(3)
for name,M,dim in [('A',A,1),('B',B,2),('C',C,0),('D',D,3)]:
 N=M-s.eye(3);basis=N.nullspace();assert len(basis)==dim
 for z in basis:assert M*z==z
 assert M*s.zeros(3,1)==s.zeros(3,1)
 record('Full fixed-point solution '+name,{'rref':N.rref(),'nullspace':basis})
assert A*s.Matrix([t,0,0])==s.Matrix([t,0,0]);assert B*s.Matrix([-u,t,u])==s.Matrix([-u,t,u]);assert (C-s.eye(3)).det()!=0
P12=s.diag(1,1,0);P13=s.diag(1,0,1);P23=s.diag(0,1,1);Q=s.Matrix([2,-1,3]);assert [P12*Q,P13*Q,P23*Q]==[s.Matrix([2,-1,0]),s.Matrix([2,0,3]),s.Matrix([0,-1,3])]
g=s.Matrix([1,2,3])+t*s.Matrix([2,-1,2]);assert P12*g==s.Matrix([1+2*t,2-t,0]);assert (P12*g).subs(t,1)==s.Matrix([3,1,0]);assert P12*(s.Matrix([2,1,0])+t*s.Matrix([0,0,1]))==s.Matrix([2,1,0])
vertices=[s.Matrix(z) for z in [(1,1,2),(5,1,2),(1,4,5)]];aa,bb,cc=vertices
assert (bb-aa).cross(cc-aa)!=s.zeros(3,1)
for pp,area in [(P12,s.Integer(6)),(P23,s.Integer(0))]:
 projected=[pp*z for z in vertices];edge1,edge2=projected[1]-projected[0],projected[2]-projected[0]
 assert s.sqrt((edge1.dot(edge1)*edge2.dot(edge2))-edge1.dot(edge2)**2)/2==area
 # Affine parameter images establish the entire triangle/segment, not just corners.
 assert pp*(aa+u*(bb-aa)+v*(cc-aa))==pp*aa+u*pp*(bb-aa)+v*pp*(cc-aa)
 record('Sail projected vertices and Gram-determinant area',{'vertices':projected,'area':area})
ray=s.Matrix([2,1,4])+t*s.Matrix([1,0,-2]);root=s.solve(ray[2],t)[0];assert root==2;assert root>=0;assert ray.subs(t,root)==s.Matrix([4,1,0]);assert P12*s.Matrix([2,1,4])==s.Matrix([2,1,0]);record('Shadow solved by independent third-coordinate intersection',ray.subs(t,root))
AA=s.Matrix([1,0,1]);BB=s.Matrix([3,1,1]);CC=s.Matrix([1,2,3]);a=BB-AA;b=CC-AA;c=a.cross(b)
assert c==s.Matrix([2,-4,4]);assert c.dot(a)==c.dot(b)==0;assert c.norm()==6
# Independent Gram determinant, not a second copy of the cross-product formula.
G=s.Matrix([[a.dot(a),a.dot(b)],[b.dot(a),b.dot(b)]]);assert G.det()==36;assert s.sqrt(G.det())==6
for z in [AA,BB,CC]:assert s.Matrix([1,-2,2]).dot(z)==3
assert a.cross(t*b)==t*c;assert s.simplify(s.sqrt((t*c).dot(t*c))/2)==3*s.Abs(t)
for value in [-2,0,s.Rational(1,2),3]:assert (a.cross(t*b)).subs(t,value).norm()/2==3*abs(value)
assert b.cross(a)==-c;assert (a.cross(0*b))==s.zeros(3,1)
record('Plate normal, two dot checks, plane checks, independent Gram area, swap sign, all real parameter area',{'normal':c,'Gram':G,'area':3*s.Abs(t)})
report={'status':'PASS_EXACT_AUTHOR_MATHEMATICAL_COUNTERCHECKS_NOT_INDEPENDENT_REVIEW','checks':out,'checkCount':len(out),'method':'SymPy exact rational arithmetic; independently solved intersections, full nullspaces/ranks, Gram determinant areas and all-real symbolic parameter checks.','limitations':'Checks substantiate calculations; content and rubric approval require a different reviewer.'}
(H/'author-mathematics.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':report['status'],'checks':len(out)}))
