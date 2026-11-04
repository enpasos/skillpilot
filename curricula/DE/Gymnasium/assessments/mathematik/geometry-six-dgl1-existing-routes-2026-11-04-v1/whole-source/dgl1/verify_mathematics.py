from pathlib import Path
import json,hashlib
import sympy as s
H=Path(__file__).resolve().parent;t,y,K,C,L=s.symbols('t y K C L',real=True)
checks=[]
def ok(name,details):checks.append({'name':name,'status':'PASS_EXACT_AUTHOR_CHECK','details':details})
assert s.integrate(y**-2,y)==-1/y;assert s.integrate(1,t)==t
family=1/(C-t);assert s.simplify(s.diff(family,t)-family**2)==0;assert s.solve(s.Eq(-1/y,t+K),y)==[-1/(K+t)];assert s.simplify((-1/(K+t)).subs(K,-C)-family)==0
ok('actual-separation-and-parameter','Integral y^-2 gives−1/y on y≠0; integrate1 to t+K; algebra yields−1/(t+K)=1/(C−t), C=−K. Derivative equals square identically for t≠C.')
k=s.symbols('k',real=True);assert s.solveset(s.Eq(0,k*k),k,domain=s.S.Reals)==s.FiniteSet(0);assert s.diff(s.S.Zero,t)==s.S.Zero;assert s.solve(s.Eq(family,0),C)==[]
ok('division-and-equilibrium','Division by y² excludes exactly the constant zero solution; no finiteC gives zero. Constant test0=k² gives onlyk=0. A parameter family cannot be evaluated at t=C.')
assert s.solveset(s.Eq(1/C,1),C,domain=s.S.Reals)==s.FiniteSet(1);particular=family.subs(C,1);assert particular.subs(t,0)==1;assert s.simplify(s.diff(particular,t)-particular**2)==0;assert s.singularities(particular,t)==s.FiniteSet(1)
assert s.limit(particular,t,1,dir='-')==s.oo and s.limit(particular,t,1,dir='+')==-s.oo
ok('initial-condition-and-elementary-domain','C=1; y=1/(1−t); denominator has only real zero1, so largest open zero-free interval containing0 is(−∞,1). Other branch(1,∞) omits0 and cannot join through missing value1. Pole limits independently checked; no existence/uniqueness theorem is required.')
a,b=s.symbols('a b',real=True);u=s.Function('u')(t);assert s.simplify(s.diff(1/u,t)+s.diff(u,t)/u**2)==0;assert s.simplify(s.diff(1/(a+b*t),t)+b/(a+b*t)**2)==0
assert s.simplify(-s.diff(family,t)/family**2)==-1
ok('control-rule-and-equivalent-method','Supplied general reciprocal derivative rule verified symbolically for nonzero u; it specifies no affine expression or solution family. The affine specialisation was independently checked too. The optional equivalent u=1/y method givesu′=−1 and same family; the rubric must credit it. Rule states no solution constant and does not solve the original DGL for the learner.')
z=t*t+L;assert s.integrate(2*t,t)==t*t;assert s.solve(s.Eq(z.subs(t,0),-2),L)==[-2];assert s.diff(z,t)==2*t;assert s.singularities(z,t)==s.EmptySet
ok('direct-integration','Generalz=t²+L, condition fixesL=−2; derivative2t and initial−2 checked; polynomial has no domain singularities, intervalR.')
# Additional boundary values check family restrictions without adding learner task variants.
for c in [-2,0,1,3]:
 f=family.subs(C,c);assert s.singularities(f,t)==s.FiniteSet(c)
 assert s.simplify(s.diff(f,t)-f*f)==0
for initial in [-2,-1,1,3]:
 c=s.Rational(1,initial);assert s.simplify(family.subs({C:c,t:0})-initial)==0
ok('independent-boundary-counterchecks','C=0 is a valid family member away from0 but cannot satisfy initial data at0. Positive and negative initial values giveC=1/y0 with the appropriate zero-free branch; initial0 uses the separately checked equilibrium. No need to divide by zero or import logarithmic integration.')
form=H/'28cdee95-3c8e-5760-a68a-405b7f9c6cbf/whole-form-content.draft.json';out={'status':'PASS_6_AUTHOR_EXACT_DGL1_CHECKS_NOT_INDEPENDENT_REVIEW','engine':'sympy '+s.__version__,'contentSha256':hashlib.sha256(form.read_bytes()).hexdigest(),'checks':checks,'learnerTheoryBurden':'Only elementary separation, integer-power antiderivatives, general reciprocal derivative rule supplied for control, elementary denominator intervals. No logarithm integration, second derivative or DGL existence/uniqueness theorem.'};(H/'author-mathematics.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':out['status'],'checks':len(checks)}))
