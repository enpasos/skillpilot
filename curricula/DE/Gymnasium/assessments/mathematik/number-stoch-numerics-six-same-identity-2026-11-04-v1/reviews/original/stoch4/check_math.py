import json,math,pathlib
import sympy as s
H=pathlib.Path(__file__).resolve().parent
rows=[]
def check(name,condition,evidence):
 assert bool(condition),name
 rows.append({'check':name,'result':'PASS','evidence':evidence})
n,p=s.symbols('n p',positive=True)
# The symbolic simplification also needs 1-p>0, so express p through a positive ratio.
r=s.symbols('r',positive=True);pp=r/(1+r)
check('Binomial ratio identity on 0<p<1',s.simplify(s.sqrt(n*pp*(1-pp))/(n*pp)-s.sqrt((1-pp)/(n*pp)))==0,'p=r/(1+r), r>0 parametrises precisely 0<p<1; symbolic difference is zero.')
v=s.sqrt((1-p)/(n*p));q=s.symbols('q',positive=True)
check('Fixed-p fourfold-n relationship',s.simplify(v.subs(n,4*n)-v/2)==0,'v(4n,p)=v(n,p)/2 for n>0 and 0<p<1.')
check('Fixed-p strictly decreasing sequence',all(math.sqrt(.8/(k*.2))>math.sqrt(.8/((k+1)*.2)) for k in [1,100,399,1599]),'General exact reasoning: positive constant times 1/sqrt(n); sampled integer boundaries also checked.')
binom=[]
for nn,pp in [(100,.2),(400,.2),(100,.5),(400,.01)]:
 mu=nn*pp;sd=math.sqrt(nn*pp*(1-pp));binom.append({'n':nn,'p':pp,'mu':mu,'sigma':sd,'cv':sd/mu})
check('Binomial numerical examples',binom[0]['mu']==20 and binom[0]['sigma']==4 and binom[1]['mu']==80 and binom[1]['sigma']==8 and abs(binom[3]['cv']-.49749371855331)<1e-12,binom)
check('Binomial exact minimal integer',s.Rational(4,1600)==s.Rational(5,100)**2 and s.Rational(4,1599)>s.Rational(5,100)**2,'v²=4/n; n=1600 meets 0.05, n=1599 exceeds it, and sequence strictly decreases.')
check('Changing-p counterexample valid',binom[3]['n']>binom[2]['n'] and binom[3]['cv']>binom[2]['cv'],'n 100->400 while p .5->.01 increases CV .1->.49749; all parameters stay within original domain.')
lam=s.Rational(1,4)
expvals={'interval_2_3':math.exp(-.5)-math.exp(-.75),'at_most_2':1-math.exp(-.5),'interval_2_6':math.exp(-.5)-math.exp(-1.5),'conditional_extra_3':math.exp(-2)/math.exp(-1.25),'tail_4':math.exp(-1),'t90':4*math.log(10)}
check('Exponential all displayed probability rounding',[round(expvals[k],4) for k in ['interval_2_3','at_most_2','interval_2_6','conditional_extra_3','tail_4']]==[.1342,.3935,.3834,.4724,.3679],expvals)
a,b=s.symbols('a b',nonnegative=True)
check('Exponential memorylessness exact',s.simplify(s.exp(-lam*(a+b))/s.exp(-lam*a)-s.exp(-lam*b))==0,'Exact survival-ratio identity for nonnegative elapsed/additional times.')
check('Exponential quantile exact',s.simplify(1-s.exp(-lam*4*s.log(10))-s.Rational(9,10))==0,'t90=4 ln10, substituted into CDF gives exactly .9.')
t=s.symbols('t',real=True);u=2*s.cos(2*t);v=2*s.cos(4*t);w=2*s.exp(-2*t);z=s.cos(3*t)
check('DG2 correct candidate full equation and IC',s.simplify(s.diff(u,t,2)+4*u)==0 and u.subs(t,0)==2 and s.diff(u,t).subs(t,0)==0,'u=2cos(2t), u prime=-4sin(2t), u double prime=-8cos(2t).')
check('DG2 wrong candidates have exact counterexamples',s.diff(v,t,2).subs(t,0)==-32 and (-4*v).subs(t,0)==-8 and s.diff(w,t).subs(t,0)==-4 and s.diff(w,t,2).subs(t,0)==8,'v meets both IC but violates equation; w violates equation and initial velocity.')
check('DG2 qualitative values and velocity distinction',[s.simplify(u.subs(t,x)) for x in [0,s.pi/4,s.pi/2,3*s.pi/4,s.pi]]==[2,0,-2,0,2] and s.diff(u,t).subs(t,s.pi/4)==-4 and s.diff(u,t,2).subs(t,s.pi/4)==0,'At equilibrium crossing y=0 but velocity=-4; acceleration=0. At t=0 turning point: y=2, velocity=0, acceleration=-8.')
check('DG2 second periodic model and periods',s.simplify(s.diff(z,t,2)+9*z)==0 and s.simplify(u.subs(t,t+s.pi)-u)==0 and s.simplify(z.subs(t,t+2*s.pi/3)-z)==0,'Cosine fundamental periods are pi and 2pi/3; amplitude 2 and 1 respectively.')
f=lambda x:x+math.exp(x)-4
entries=[(1,-.2817182),(2,5.3890561),(1.5,1.9816891),(1.25,.7403430),(1.073,-.0028612),(1.074,.0010644),(1.0737,-.0001136),(1.0738,.0002790)]
check('Numerical decision table accuracy and robust signs',all(abs(f(x)-fv)<1e-7 and abs(fv)>1e-7 and f(x)*fv>0 for x,fv in entries),[{'x':x,'exactFloatEvaluation':f(x),'table':fv,'absoluteDifference':abs(f(x)-fv)} for x,fv in entries])
check('Bisection first two updates',f(1)<0<f(2) and f(1.5)>0 and f(1.25)>0,'[1,2]->[1,1.5]->[1,1.25]; remaining bracket is not falsely claimed as a result of unperformed steps.')
lo=s.Integer(1);hi=s.Integer(2)
for _ in range(150):
 mid=(lo+hi)/2
 if s.N(mid+s.exp(mid)-4,60)<0:lo=mid
 else:hi=mid
root=s.N((lo+hi)/2,40)
check('Decision original bracket and error exact',f(1.073)<0<f(1.074) and s.Rational(1074-1073,1000)/2==s.Rational(5,10000) and abs(float(root)-1.0735)<.0005,{'rootHighPrecision':str(root),'bracket':['1.073','1.074'],'midpoint':'1.0735','errorBound':'0.0005','actualError':abs(float(root)-1.0735)})
check('Decision revised bracket and error exact',f(1.0737)<0<f(1.0738) and s.Rational(10738-10737,10000)/2==s.Rational(5,100000) and abs(float(root)-1.07375)<.00005,{'bracket':['1.0737','1.0738'],'midpoint':'1.07375','errorBound':'0.00005','actualError':abs(float(root)-1.07375)})
check('Decision long displayed solver value is numerically plausible',abs(float(root)-1.073728937556)<1e-12,'Displayed digits closely approximate root, but the task correctly distinguishes a plausible value from a documented error certificate.')
res={'status':'AUTHOR_MATHEMATICS_CHECKS_PASS_NOT_INDEPENDENT_APPROVAL','checks':rows}
(H/'author-exact-mathematics.json').write_text(json.dumps(res,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':res['status'],'checks':len(rows)}))
