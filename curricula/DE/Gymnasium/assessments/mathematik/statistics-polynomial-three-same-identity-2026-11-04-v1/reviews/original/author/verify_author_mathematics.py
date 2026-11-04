"""Exact mathematics, independently enumerated event checks and counterexamples."""
from pathlib import Path
from fractions import Fraction as Q
from math import comb
from hashlib import sha256
import json
import sympy as s

H=Path(__file__).resolve().parent;checks=[]
def check(name,condition,evidence):
 assert condition,name
 checks.append({'check':name,'passed':True,'actualEvidence':evidence})
def pm(n,j,p):return Q(comb(n,j))*p**j*(1-p)**(n-j)
def tail(n,k,p):return sum((pm(n,j,p) for j in range(k,n+1)),Q(0))
def staged_formula(r,p):return tail(20,r,p)+sum((pm(20,j,p)*tail(20,8-j,p) for j in range(3,r)),Q(0))
def reject(r,x,y):return x>=r or (3<=x<r and x+y>=8)
numbers=[]
for n,k in [(20,5),(40,8)]:
 a=tail(n,k,Q(1,10));prev=tail(n,k-1,Q(1,10));power=tail(n,k,Q(3,10))
 check(f'fixed {n} boundary',a<=Q(1,20)<prev,{'k':k,'alpha':float(a),'previousAlpha':float(prev),'power':float(power)})
 check(f'fixed {n} all thresholds maximal detection',all(tail(n,j,Q(3,10))<=power for j in range(k,n+1)),{'checkedThresholds':list(range(k,n+1))})
 check(f'fixed {n} admissibility',(power>=Q(9,10))==(n==40),{'admissible':n==40})
 numbers.append({'n':n,'k':k,'alpha':str(a),'alphaDecimal':float(a),'powerDecimal':float(power)})
for r in [5,6]:
 for p in [Q(1,10),Q(3,10)]:
  formula=staged_formula(r,p)
  enumerated=sum((pm(20,x,p)*pm(20,y,p) for x in range(21) for y in range(21) if reject(r,x,y)),Q(0))
  check(f'r={r}, p={p}: formula vs all 441 outcome pairs',formula==enumerated,{'probabilityExact':str(formula),'probabilityDecimal':float(formula)})
  check(f'r={r}, p={p}: complete probability space',sum((pm(20,x,p)*pm(20,y,p) for x in range(21) for y in range(21)),Q(0))==1,{'outcomePairs':441})
  numbers.append({'r':r,'p':str(p),'flaggingProbabilityDecimal':float(formula)})
 check(f'r={r}: correct eligibility',((staged_formula(r,Q(1,10))<=Q(1,20)) and (staged_formula(r,Q(3,10))>=Q(9,10)))==(r==6),{'admissible':r==6})
continuation=sum((pm(20,j,Q(1,10)) for j in [3,4,5]),Q(0));en=20+20*continuation
direct_en=sum((pm(20,x,Q(1,10))*(40 if 3<=x<=5 else 20) for x in range(21)),Q(0))
check('expected effort independently enumerated',en==direct_en and en<40,{'continuation':float(continuation),'expectedSamples':float(en)})
check('stopping counterexamples',reject(6,6,0) and not reject(6,2,10),{'X6Y0':True,'X2Y10':False})
check('fixed 40 vs staged differ',tail(40,8,Q(1,10))!=staged_formula(6,Q(1,10)),{'fixed40Alpha':float(tail(40,8,Q(1,10))),'twoStageAlpha':float(staged_formula(6,Q(1,10)))})

x=s.symbols('x',real=True)
polys={'f':2*x**6-3*x**4+5,'g':-x**5+4*x**3-2*x,'h':x**4+x**3-2,'u':(x+1)**2+(x-1)**2,'v':s.Integer(7),'z':s.Integer(0)}
expected={'f':(True,False),'g':(False,True),'h':(False,False),'u':(True,False),'v':(True,False),'z':(True,True)}
for name,p in polys.items():
 actual=(s.expand(p.subs(x,-x)-p)==0,s.expand(p.subs(x,-x)+p)==0)
 check('symmetry '+name,actual==expected[name],{'expandedExpression':str(s.expand(p)),'minusX':str(s.expand(p.subs(x,-x))),'yAxis':actual[0],'origin':actual[1]})
check('even degree alone counterexample',s.degree(x*x+x)==2 and (x*x+x).subs(x,1)!=(x*x+x).subs(x,-1),{'polynomial':'x^2+x','at1':2,'atMinus1':0})
q=x**3-x
check('one matched pair counterexample',q.subs(x,1)==q.subs(x,-1) and q.subs(x,2)!=q.subs(x,-2),{'polynomial':'x^3-x','at±1':0,'at2':6,'atMinus2':-6})
for p in polys.values():
 coeff=s.Poly(p,x).as_dict()
 even=all(c==0 or e[0]%2==0 for e,c in coeff.items());odd=all(c==0 or e[0]%2==1 for e,c in coeff.items())
 check('coefficient identity '+str(p),(even,odd)==(s.expand(p.subs(x,-x)-p)==0,s.expand(p.subs(x,-x)+p)==0),{'zeroCoefficientsIgnored':True})

f=s.Rational(1,2)*(x+2)*(x-1)**2;higher=f*(1+x*x)
check('graph values',all(f.subs(x,a)==b for a,b in [(-2,0),(1,0),(0,1),(-1,2)]),{'A':[-2,0],'B':[1,0],'P':[0,1],'otherTurn':[-1,2]})
check('graph cubic expansion',s.expand(f)==s.Rational(1,2)*x**3-s.Rational(3,2)*x+1,{'expanded':str(s.expand(f))})
check('graph two turns',s.solve(s.diff(f,x),x)==[-1,1],{'derivative':str(s.factor(s.diff(f,x))),'turns':[-1,1]})
check('graph crossing touching',f.subs(x,-3)<0 and f.subs(x,-1)>0 and f.subs(x,Q(1,2))>0 and f.subs(x,Q(3,2))>0,{'rootMultiplicities':{'-2':1,'1':2}})
check('degree among 0..4 unique', [n for n in range(5) if n>=3 and n%2==1]==[3],{'lowerBound':3,'upperBound':4,'odd':True})
check('higher degree ambiguity',s.degree(higher,x)==5 and higher.subs(x,0)==1 and s.Poly(higher,x).LC()>0,{'higherExpression':str(higher),'degree':5,'positiveFactor':'1+x^2 > 0 on R'})
check('higher same exact real roots',s.real_roots(higher)==[-2,1,1],{'realRootsWithMultiplicity':[-2,1,1]})
for name,p in [('F',f),('H',higher)]:
 check(name+' known ends',s.limit(p,x,-s.oo)==-s.oo and s.limit(p,x,s.oo)==s.oo,{'left':'-infinity','right':'+infinity'})

u,t=s.symbols('u t',real=True);a,b=s.symbols('a b',positive=True)
g=(x-t)**2+1;h=a*s.exp(x);k=s.sin(b*x)
check('shift arbitrary point identity',s.simplify(g.subs(x,u+t)-(u*u+1))==0,{'mapping':['u+t','u^2+1']})
check('shift concrete vertices',g.subs({x:-2,t:-2})==1 and g.subs({x:3,t:3})==1,{'vertices':[[-2,1],[3,1]]})
check('exponential arbitrary point identity',s.simplify(h.subs(x,u)-a*s.exp(u))==0,{'mapping':['u','a*exp(u)']})
check('exponential intercepts',h.subs({x:0,a:2})==2 and h.subs({x:0,a:s.Rational(1,2)})==s.Rational(1,2),{'intercepts':[2,.5]})
check('exponential no intersection',s.simplify((2*s.exp(x)-s.exp(x)/2)/s.exp(x))==s.Rational(3,2),{'positiveDifference':'(3/2)*exp(x)'})
check('exponential asymptote',s.limit(h,x,-s.oo)==0,{'asymptote':0})
check('sine arbitrary point identity',s.simplify(k.subs(x,u/b)-s.sin(u))==0,{'mapping':['u/b','sin(u)']})
check('sine general period',s.trigsimp(k.subs(x,x+2*s.pi/b)-k)==0,{'period':'2*pi/b'})
for bb in [s.Integer(2),s.Rational(1,2)]:
 xp=s.pi/(2*bb)
 check('sine maximum b='+str(bb),s.simplify(k.subs({b:bb,x:xp}))==1,{'b':str(bb),'firstMaximum':[str(xp),1],'period':str(2*s.pi/bb)})
for z in range(-5,6):check('sine zero integer '+str(z),s.simplify(k.subs(x,z*s.pi/b))==0,{'x':str(z*s.pi/b)})
check('positive parameter can widen',1/s.Rational(1,2)==2,{'b':.5,'horizontalScale':2})

pack=json.loads((H/'author-package.json').read_text());bindings=[]
for form in pack['forms']:
 p=H/form['goalId']/'proposed-whole-goal.draft.json';g=json.loads(p.read_text());before=json.loads((p.parent/'current-whole-goal.json').read_text())
 check('whole original contract '+form['key'],{k:v for k,v in g.items() if k not in ['nodeKind','examData']}==before,{'changedKeys':['nodeKind','examData'],'originalGoalId':before['id']})
 check('single score and self coverage '+form['key'],sum(st['points'] for st in g['examData']['scoring']['steps'])==20 and g['examData']['scoring']['passingPoints']==15 and g['examData']['coveredGoalIds']==[before['id']],{'maxPoints':20,'passingPoints':15,'coverage':[before['id']]})
 bindings.append({'path':str(p.relative_to(H)),'sha256':sha256(p.read_bytes()).hexdigest()})
report={'status':'PASS_AUTHOR_EXACT_MATHEMATICS_NOT_INDEPENDENT_CONTENT_APPROVAL','checkCount':len(checks),'checks':checks,'exactBinomialResults':numbers,'inputBindings':bindings,'engines':{'sympy':s.__version__,'binomial':'Python fractions.Fraction; formula independently checked against all 441 paired outcomes'},'limits':'Mathematical correctness checks and author correspondence to the frozen fields; not a production grader, scope activation or independent review.'}
(H/'author-exact-mathematics.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':'PASS_EXACT_MATHEMATICS','checks':len(checks)}))
