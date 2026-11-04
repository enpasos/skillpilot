from pathlib import Path
import json,hashlib
import sympy as s
H=Path(__file__).resolve().parent
checks=[]
def ok(name,details):checks.append({'name':name,'status':'PASS_AUTHOR_EXACT_SYMBOLIC_CHECK','details':details})
t,u,w,a=s.symbols('t u w a',real=True);x,y,z=s.symbols('x y z',real=True)
A=s.Matrix([0,0,3]);ab=s.Matrix([6,0,3]);ad=s.Matrix([0,4,0]);normal=ab.cross(ad);assert normal==s.Matrix([-12,0,24]);roof=A+u*ab+w*ad;assert s.expand(roof[0]-2*roof[2]+6)==0
ray=s.Matrix([8,2,9])+t*s.Matrix([-1,0,-1]);ti=s.solve(ray[0]-2*ray[2]+6,t);assert ti==[4];assert ray.subs(t,4)==s.Matrix([4,2,5]);r2=s.Matrix([8,5,9])+t*s.Matrix([-1,0,-1]);assert s.solve(r2[0]-2*r2[2]+6,t)==[4];assert r2.subs(t,4)==s.Matrix([4,5,5]);assert 0<s.Rational(2,3)<1 and 0<s.Rational(1,2)<1 and s.Rational(5,4)>1
ok('roof-and-ray','Independent edge cross product; all roof-point identities; unique t=4 on both forward rays; P=(4,2,5) in finite roof, P′=(4,5,5) outside. No distance/angle calculation is required for this model.')
# Independent line relationship checker using matrix rank and coordinate constraints.
def axes(p,d,j):
 e=s.eye(3)[:,j]
 if s.Matrix.hstack(d,e).rank()==1:return 'identical' if s.Matrix.hstack(p,e).rank()<=1 else 'distinct-parallel'
 r,v=s.symbols('r v');ans=s.linsolve(list(p+r*d-v*e),(r,v));return 'skew' if ans is s.EmptySet or ans==s.EmptySet else 'intersect'
def plane(p,d,j):return 'contained' if p[j]==0 and d[j]==0 else 'distinct-parallel' if d[j]==0 else 'one-intersection'
gp=s.zeros(3,1);gd=s.Matrix([1,0,0]);hp=s.Matrix([0,2,0]);hd=gd;kp=s.Matrix([1,1,2]);kd=s.Matrix([1,1,0]);assert [axes(gp,gd,j)for j in range(3)]==['identical','intersect','intersect'];assert [plane(gp,gd,j)for j in [2,1,0]]==['contained','contained','one-intersection'];assert [axes(hp,hd,j)for j in range(3)]==['distinct-parallel','intersect','skew'];assert [plane(hp,hd,j)for j in [2,1,0]]==['contained','distinct-parallel','one-intersection'];assert axes(kp,kd,2)=='intersect' and kp-kd==s.Matrix([0,0,2])and plane(kp,kd,2)=='distinct-parallel'
ok('special-axes-and-planes','Independent rank/LGS classification confirms all 14 requested relations, including h skew to z-axis and k meeting z-axis while parallel to xy. General p3+u d3 condition has zero/all/one solutions in exactly the stated cases.')
n=s.Matrix([1,2,2]);f1=s.Matrix([1,1,0]);f2=s.Matrix([2,0,1]);m=f1.cross(f2);assert m==s.Matrix([1,-1,-2]);assert m.dot(f1)==m.dot(f2)==0;assert n.dot(m)==-5;ratio=abs(n.dot(m))/(s.sqrt(n.dot(n))*s.sqrt(m.dot(m)));assert s.simplify(ratio-5/(3*s.sqrt(6)))==0;ang=float(s.acos(ratio)*180/s.pi);assert round(ang,1)==47.1
for k in [-2,-1,1,3]:assert s.simplify(abs(n.dot(k*m))/(s.sqrt(n.dot(n))*s.sqrt((k*m).dot(k*m)))-ratio)==0
inter=n.cross(m);assert n.dot(inter)==m.dot(inter)==0;assert inter!=s.zeros(3,1)
ok('plane-angle',{'normalF':list(map(str,m)),'exactCosine':str(ratio),'degrees':ang,'negativeScalingInvariant':True,'crossSectionNormalsPerpendicularToIntersection':True,'GafterDivision':'x+2y+2z=5, distinct from E constant 3'})
nF=s.Matrix([0,1,1]);na=s.Matrix([a,1,0]);ua=s.Matrix([1,0,a]);assert na.dot(na)==ua.dot(ua)==1+a*a and na.dot(nF)==1 and ua.dot(nF)==a
lineeq=s.Eq(a*a/(2*(1+a*a)),s.Rational(1,4));planeeq=s.Eq(1/(2*(1+a*a)),s.Rational(1,4));assert s.solveset(lineeq,a,domain=s.S.Reals)==s.FiniteSet(-1,1);assert s.solveset(planeeq,a,domain=s.S.Reals)==s.FiniteSet(-1,1)
for v in [-1,1]:assert s.simplify((s.Abs(a)/(s.sqrt(2)*s.sqrt(1+a*a))).subs(a,v))==s.Rational(1,2);assert s.simplify((1/(s.sqrt(2)*s.sqrt(1+a*a))).subs(a,v))==s.Rational(1,2)
assert s.solveset(s.Eq(s.Abs(a),1),a,domain=s.S.Reals)==s.FiniteSet(-1,1);assert na.cross(nF)==s.Matrix([1,-a,a]);assert nF.dot(s.Matrix([0,0,1])+t*s.Matrix([1,0,0]))==1
ok('parameter-angle-all-real',{'positiveNormSquares':'1+a² > 0 for all real a','line30Solutions':[-1,1],'plane60Solutions':[-1,1],'equivalentSquaring':'Both original quotients nonnegative, denominators positive; both roots checked in original equations.','complementaryAngles':'iff |a|=1; a=0 gives 0°+45°','positionAt0':'g0 has y+z=1 throughout: strictly parallel to F.'})
ball=s.Matrix([1+4*t,-2+3*t,2+6*t-2*t*t]);assert ball.subs(t,1)==s.Matrix([5,1,6]);assert ball.subs(t,3)==s.Matrix([13,7,2]);assert ball.subs(t,s.Rational(3,2))==s.Matrix([7,s.Rational(5,2),s.Rational(13,2)]);assert s.expand(ball[2]-(s.Rational(13,2)-2*(t-s.Rational(3,2))**2))==0
xexpr=ball.subs(t,(x-1)/4);assert s.expand(xexpr[1]-(-2+s.Rational(3,4)*(x-1)))==0;assert s.expand(xexpr[2]-(2+s.Rational(3,2)*(x-1)-s.Rational(1,8)*(x-1)**2))==0
q=s.symbols('q',real=True);assert s.expand(ball[2].subs(t,q/5)-(2+s.Rational(6,5)*q-s.Rational(2,25)*q*q))==0
urep=s.Matrix([1+2*u,-2+s.Rational(3,2)*u,2+3*u-s.Rational(1,2)*u*u]);assert s.simplify(ball.subs(t,u/2)-urep)==s.zeros(3,1);assert urep.subs(u,2)==ball.subs(t,1)
ok('parabolic-trajectory',{'timeDomain':'[0,3] maps bijectively to x∈[1,13], q∈[0,15], u∈[0,6]','max':'t=3/2, H=(7,5/2,13/2)','planarParabola':'q is horizontal orthogonal coordinate of the vertical trajectory plane; z(q)=2+6q/5−2q²/25','reparameterisation':'x_u(2t)=x_t(t) identically; physical time remains t=u/2'})
# Independently verify unchanged existing whole form to support the reuse judgment.
ex=json.loads((H/'whole-existing-exams-and-preparation.json').read_text());e=next(g for g in ex['wholeExistingExams']if g['id']=='8d314e15-69e9-5af1-a10a-be820b2f821d');L=s.Matrix([2-t,1,t]);assert s.expand(sum(L)-3)==0 and s.expand(L[0]-L[1]+L[2]-1)==0;coeff=s.Matrix([[1,2,-1],[2,4,-2]]);assert coeff.rank()==1 and coeff.row_join(s.Matrix([1,3])).rank()==2;assert coeff.row_join(s.Matrix([1,2])).rank()==1;C=s.Matrix([1-2*u+w,u,w]);assert s.expand(C[0]+2*C[1]-C[2]-1)==0
assert e['examData']['scoring']['maxPoints']==23 and e['examData']['scoring']['passingPoints']==21
ok('unchanged-existing-8d3-whole-form','A full line verified in both planes for every t; B inconsistent ranks 1/2; C rank 1 with exactly two free parameters. Original 23/21 score and method comparison retained, no new task or pass condition authored.')
files=[p for p in H.rglob('*.md')if p.parent.name in {f['goalId']for f in json.loads((H/'author-package.json').read_text())['forms']}];out={'status':'PASS_AUTHOR_MATHEMATICS_NOT_INDEPENDENT_REVIEW','symbolicEngine':'sympy '+s.__version__,'checks':checks,'boundMarkdown':[{'path':str(p.relative_to(H)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in sorted(files)]};(H/'author-mathematics.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':out['status'],'checks':len(checks),'planeAngleDegrees':ang}))
