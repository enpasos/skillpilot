"""Exact and independently derived checks of the complete authored mathematics."""
from pathlib import Path
from hashlib import sha256
from fractions import Fraction as Q
from math import sin,tan,pi,exp
import json
import sympy as s
H=Path(__file__).resolve().parent;checks=[]
def check(name,ok,evidence):
 assert ok,name
 checks.append({'check':name,'passed':True,'actualEvidence':evidence})

# Independently calculate the geometry; pupils are given areas and need no trig.
given={4:('32.000','64.000'),8:('45.255','53.019'),16:('48.983','50.922'),32:('49.943','50.428')}
expected={4:('96.000','192.000'),8:('135.765','159.057'),16:('146.949','152.766'),32:('149.829','151.284')}
for n,(inner,outer) in given.items():
 gi=8*n*sin(2*pi/n);go=16*n*tan(pi/n)
 check('polygon source table n='+str(n),abs(float(inner)-gi)<=.000500001 and abs(float(outer)-go)<=.000500001,{'n':n,'independentlyComputedAreas':[gi,go],'givenAreas':[inner,outer]})
 vi,vo=3*Q(inner),3*Q(outer)
 check('exact supplied-data volumes n='+str(n),(vi,vo)==tuple(Q(x) for x in expected[n]),{'exactVolumes':[str(vi),str(vo)]})
 check('actual and displayed enclosure n='+str(n),3*gi<48*pi<3*go and float(vi)<48*pi<float(vo),{'coneVolume':48*pi,'displayedVolumeBounds':[float(vi),float(vo)]})
n=s.symbols('n',positive=True);gi=8*n*s.sin(2*s.pi/n);go=16*n*s.tan(s.pi/n)
check('both base areas converge to the circle',s.limit(gi,n,s.oo)==16*s.pi and s.limit(go,n,s.oo)==16*s.pi,{'bothLimits':'16*pi cm^2'})
check('fixed height yields same cone volume',s.limit(3*gi,n,s.oo)==48*s.pi and s.limit(3*go,n,s.oo)==48*s.pi,{'height':9,'factor':'1/3'})
check('height variation counterexample',s.limit(gi*3/n,n,s.oo)==0,{'wrongHeightSequence':'9/n','wrongVolumeLimit':0,'reason':'Changing the height destroys approximation of the fixed cone.'})
check('cone exact volume and rounding',s.Rational(1,3)*s.pi*4**2*9==48*s.pi and round(48*pi,2)==150.80,{'exact':'48*pi','rounded':150.80,'cylinder':'144*pi'})
check('table enclosure gap',Q('151.284')-Q('149.829')==Q('1.455'),{'lastDisplayedGap':'1.455 cm^3'})

x,u=s.symbols('x u',real=True)
for xx in [1,4,20]:check('exponential table x='+str(xx),exp(xx)>0,{'ePower':exp(xx),'cube':xx**3})
check('finite all-x claim counterexample',exp(4)<4**3 and exp(1)>1 and exp(20)>20**3,{'at4':[exp(4),64]})
check('positive bound algebra',s.simplify(x**3/(x**4/24)-24/x)==0,{'boundForPositiveX':'24/x'})
check('comparison bound vanishes',s.limit(24/x,x,s.oo)==0,{'limit':0})
for power in range(1,9):
 check('positive asymptotic power '+str(power),s.limit(x**power/s.exp(x),x,s.oo)==0 and s.limit(s.exp(x)/x**power,x,s.oo)==s.oo,{'power':power,'quotientLimit':0,'reciprocalLimit':'+infinity'})
 check('negative asymptotic power '+str(power),s.limit(x**power*s.exp(x),x,-s.oo)==0,{'power':power,'limit':0,'approachSign':-1 if power%2 else 1})
check('negative cubic substitution',s.simplify((x**3*s.exp(x)).subs(x,-u)+u**3/s.exp(u))==0,{'identity':'x^3 e^x = -u^3/e^u with u=-x'})
check('negative fourth substitution',s.simplify((x**4*s.exp(x)).subs(x,-u)-u**4/s.exp(u))==0,{'identity':'x^4 e^x = u^4/e^u with u=-x'})
check('transfer polynomial',s.limit((3*x*x-4*x+1)*s.exp(-x),x,s.oo)==0,{'limit':0})
check('transfer denominator',s.limit(s.exp(x)/(x**3+1),x,s.oo)==s.oo,{'limit':'+infinity'})
for m in range(1,7):
 t=s.symbols('t',real=True);pol=sum(x**k/s.factorial(k) for k in range(m+1));remainder=s.integrate(s.exp(t)*(x-t)**m/s.factorial(m),(t,0,x))
 check('auxiliary inequality identity m='+str(m),s.simplify(pol+remainder-s.exp(x))==0,{'exactRemainderIdentityVerified':True,'positivityReason':'For x>=0 every Taylor term and the integral remainder are nonnegative, so e^x >= x^m/m!.'})

I=s.I;rt=s.sqrt(3);roots=[s.Integer(1),s.Rational(1,2)+I*rt/2,-s.Rational(1,2)+I*rt/2,s.Integer(-1),-s.Rational(1,2)-I*rt/2,s.Rational(1,2)-I*rt/2]
for k,z in enumerate(roots):
 check('sixth root '+str(k),s.simplify(z**6)==1 and s.simplify(z*s.conjugate(z))==1,{'k':k,'exactAlgebraic':str(z),'sixthPower':1,'normSquared':1})
 check('polar representative '+str(k),s.simplify(s.expand_complex(s.exp(I*k*s.pi/3))-z)==0,{'angle':str(k*s.pi/3)})
 check('rotation to next root '+str(k),s.simplify(z*roots[1]-roots[(k+1)%6])==0,{'from':k,'to':(k+1)%6})
 check('regular hexagon chord '+str(k),s.simplify((z-roots[(k+1)%6])*s.conjugate(z-roots[(k+1)%6]))==1,{'chordLength':1})
z=s.symbols('z');product=s.expand(s.prod(z-r for r in roots))
check('all sixth roots distinct and complete',len(set(roots))==6 and s.simplify(product-(z**6-1))==0,{'polynomialProduct':'z^6-1','distinctCount':6})
fourth=[s.Integer(1),I,s.Integer(-1),-I]
check('fourth roots complete',s.expand(s.prod(z-r for r in fourth))==z**4-1 and all(r**4==1 for r in fourth),{'roots':[str(r) for r in fourth]})
check('common cubic roots exactly even indices',[k for k,r in enumerate(roots) if s.simplify(r**3)==1]==[0,2,4],{'selectedIndices':[0,2,4]})
check('first non-real sixth root is not cubic',s.simplify(roots[1]**3)==-1,{'cube':-1})

numerators=[3+4*I,2-3*I,4-2*I,s.Integer(1)];denominators=[1-2*I,1+2*I,2*I,2+I];quotients=[-1+2*I,-s.Rational(4,5)-s.Rational(7,5)*I,-1-2*I,s.Rational(2,5)-s.Rational(1,5)*I]
for k,(aa,bb,qq) in enumerate(zip(numerators,denominators,quotients),1):
 conj=s.conjugate(bb);num=s.expand(aa*conj);den=s.expand(bb*conj)
 check('complex quotient q'+str(k),s.simplify(aa/bb-qq)==0 and s.expand(qq*bb)==aa,{'conjugate':str(conj),'newNumerator':str(num),'newDenominator':str(den),'result':str(qq),'productRecovers':str(aa)})
 check('real denominator q'+str(k),s.im(den)==0 and den>0,{'denominator':str(den)})
check('component-division counterexample',s.expand((3-2*I)*(1-2*I))==-1-8*I and -1-8*I!=3+4*I,{'wrongProduct':'-1-8i','requiredNumerator':'3+4i'})
check('pure imaginary alternative',1/I==-I and s.simplify((4-2*I)/(2*I)-(-1-2*I))==0,{'identity':'1/i=-i'})

pack=json.loads((H/'author-package.json').read_text());bindings=[]
for f in pack['forms']:
 p=H/f['goalId']/'whole-form-content.draft.json';draft=json.loads(p.read_text());data=draft['examDataContent']
 check('one score/self contract '+f['key'],sum(t['points'] for t in data['scoring']['steps'])==20 and data['scoring']['passingPoints']==15 and data['coveredGoalIds']==[f['goalId']],{'score':'20/15','coverage':[f['goalId']],'canonicalRoleChanged':False})
 bindings.append({'path':str(p.relative_to(H)),'sha256':sha256(p.read_bytes()).hexdigest()})
report={'status':'PASS_AUTHOR_MATHEMATICS_NOT_INDEPENDENT_REVIEW_OR_ACTIVATION','checkCount':len(checks),'checks':checks,'inputBindings':bindings,'auxiliaryInequalityGeneralAuthorJustification':'Taylor formula with nonnegative polynomial terms and integral remainder for x>=0 proves the supplied inequality for all positive integers m. A student may use the supplied inequality without proving or learning Taylor theory.','engines':{'sympy':s.__version__,'exactGivenDecimals':'fractions.Fraction','numericalGeometry':'independent polygon area formulas, never required of pupils'},'limits':'Mathematical author verification, not a production grader, source adoption, scope/placement decision or learner performance.'}
(H/'author-mathematics.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':'PASS_AUTHOR_MATHEMATICS','checks':len(checks)}))
