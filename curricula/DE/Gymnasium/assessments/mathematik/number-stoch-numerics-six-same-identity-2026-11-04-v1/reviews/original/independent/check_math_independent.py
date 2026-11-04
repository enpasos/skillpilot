"""Reviewer-authored calculations, independent of the two author check scripts."""
import json,math
from pathlib import Path
import sympy as s
from datetime import datetime,timezone

out=Path(__file__).resolve().parent
checks=[]
def check(name,ok,detail):
 assert bool(ok),name
 checks.append({'check':name,'passed':True,'detail':detail})
# RSA: compute the inverse rather than trusting a displayed exponent.
n=11*17;e=7;phi=10*16;d=pow(e,-1,phi)
check('RSA key and inverse',n==187 and phi==160 and d==23,{'n':n,'phi':phi,'d':d})
samples={20:(147,[104,157,152,103]),11:(88,[77,132,33,154])}
for m,(c,qs) in samples.items():
 check('RSA encryption '+str(m),pow(m,e,n)==c,{'message':m,'ciphertext':pow(m,e,n)})
 check('RSA square table '+str(c),[pow(c,k,n) for k in [2,4,8,16]]==qs,qs)
 check('RSA decryption '+str(c),pow(c,d,n)==m,{'ciphertext':c,'decrypted':pow(c,d,n)})
bad=[m for m in range(n) if pow(pow(m,e,n),d,n)!=m]
nonunits=[m for m in range(n) if math.gcd(m,n)!=1]
check('RSA exhaustive full message domain',not bad,{'messages':n,'nonunitsIncludingZero':len(nonunits),'badMessages':bad})
check('RSA prime modulus proof conditions',(e*d-1)%10==0 and (e*d-1)%16==0 and math.gcd(11,17)==1,{'ed':e*d,'multiplesOfPrimeOrders':[160//10,160//16],'zeroResiduesRemainZero':True})
check('Euler blanket substitution counterexample',pow(11,160,187)!=1,{'m':11,'powerMod187':pow(11,160,187)})
# Quadratic sieve: independently divide and record exact residuals and exponents.
rows=[]
for x in range(41,46):
 rem=x*x-1649;exp=[]
 for p in [2,5]:
  k=0
  while rem%p==0:rem//=p;k+=1
  exp.append(k)
 rows.append({'x':x,'Q':x*x-1649,'exponents':exp,'residual':rem})
check('Sieve exact table',[r['Q'] for r in rows]==[32,115,200,287,376] and [r['residual'] for r in rows]==[1,23,1,287,47],rows)
check('Sieve residue classes',[x for x in range(2) if (x*x-1649)%2==0]==[1] and [x for x in range(5) if (x*x-1649)%5==0]==[2,3],{'mod2':[1],'mod5':[2,3]})
check('Sieve smooth parity combination',rows[0]['exponents']==[5,0] and rows[2]['exponents']==[3,2] and 32*200==80**2,{'X':41*43,'XmodN':41*43%1649,'Y':80})
check('Sieve congruence and factors',(114**2-80**2)%1649==0 and math.gcd(114-80,1649)==17 and math.gcd(114+80,1649)==97 and 17*97==1649,{'factors':[17,97]})
check('Sieve trivial congruence fails extraction',math.gcd(0,1649)==1649 and math.gcd(64,1649)==1,{'X':32,'Y':32,'gcds':[1649,1]})
# Continuous distribution: use exact expressions and check rounded answers.
R=s.Rational
exprs=[s.exp(-R(1,2))-s.exp(-R(3,4)),1-s.exp(-R(1,2)),s.exp(-R(1,2))-s.exp(-R(3,2)),s.exp(-R(3,4)),s.exp(-1)]
check('Exponential probabilities',[f'{float(v):.4f}' for v in exprs]==['0.1342','0.3935','0.3834','0.4724','0.3679'],[str(v.evalf(18)) for v in exprs])
check('Exponential conditional identity',s.simplify(s.exp(-2)/s.exp(-R(5,4))-s.exp(-R(3,4)))==0,'S(8)/S(5)=S(3)')
check('Exponential quantile',f'{float(4*s.log(10)):.2f}'=='9.21' and s.simplify(1-s.exp(-s.log(10))-R(9,10))==0,str((4*s.log(10)).evalf(18)))
check('Exponential exact-value and tail distinction',s.limit(1-s.exp(-s.Symbol('x',real=True)/4),s.Symbol('x',real=True),3,dir='+')==s.limit(1-s.exp(-s.Symbol('x',real=True)/4),s.Symbol('x',real=True),3,dir='-') and s.exp(-1)>0,'CDF continuous at 3; positive tail beyond 4')
# Relative binomial dispersion on the authored domain.
nn=s.symbols('n',positive=True);pp=s.symbols('p',positive=True)
v2=(1-pp)/(nn*pp)
check('Binomial quotient identity',s.cancel((nn*pp*(1-pp))/(nn*pp)**2-v2)==0,'Squared ratio = (1-p)/(np), positive for 0<p<1')
check('Binomial comparison',[s.sqrt(R(4,k)) for k in [100,400]]==[R(1,5),R(1,10)],{'mu':[20,80],'sigma':[4,8],'relative':[.2,.1]})
check('Binomial strict decrease and fourfold scaling',s.simplify(s.diff(v2,nn)+(1-pp)/(nn**2*pp))==0 and s.simplify(v2.subs(nn,4*nn)-v2/4)==0,'v squared has negative derivative for 0<p<1; v(4n)=v(n)/2')
check('Binomial exact minimum',R(4,1600)==R(1,20)**2 and R(4,1599)>R(1,20)**2,{'minimum':1600,'predecessorV':float(2/s.sqrt(1599))})
check('Binomial changing-p counterexample',R(1,100)<R(99,400) and f'{float(s.sqrt(R(99,400))):.4f}'=='0.4975',{'vBefore':.1,'vAfter':float(s.sqrt(R(99,400)))})
# Differential-equation candidates and qualitative checkpoints.
t=s.symbols('t',real=True)
u=2*s.cos(2*t);v=2*s.cos(4*t);w=2*s.exp(-2*t);z=s.cos(3*t)
check('DG2 suitable candidate',s.simplify(s.diff(u,t,2)+4*u)==0 and u.subs(t,0)==2 and s.diff(u,t).subs(t,0)==0,str(u))
check('DG2 invalid candidates',s.simplify(s.diff(v,t,2)+4*v)!=0 and s.simplify(s.diff(w,t,2)+4*w)!=0 and s.diff(w,t).subs(t,0)==-4,{'vResidual':str(s.simplify(s.diff(v,t,2)+4*v)),'wResidual':str(s.simplify(s.diff(w,t,2)+4*w))})
check('DG2 displacement checkpoints',[u.subs(t,k*s.pi/4) for k in range(5)]==[2,0,-2,0,2],[2,0,-2,0,2])
check('DG2 equilibrium and turning point',[u.subs(t,0),s.diff(u,t).subs(t,0),s.diff(u,t,2).subs(t,0)]==[2,0,-8] and [u.subs(t,s.pi/4),s.diff(u,t).subs(t,s.pi/4),s.diff(u,t,2).subs(t,s.pi/4)]==[0,-4,0],{'turning':[2,0,-8],'crossing':[0,-4,0]})
check('DG2 second process and periods',s.simplify(s.diff(z,t,2)+9*z)==0 and s.calculus.util.periodicity(u,t)==s.pi and s.calculus.util.periodicity(z,t)==2*s.pi/3,{'first':'pi','second':'2*pi/3','ratio':'2/3'})
# Numerical record: high precision independently verifies supplied rounding bounds.
x=s.symbols('x');f=x+s.exp(x)-4
data=[('1','-.2817182'),('2','5.3890561'),('1.5','1.9816891'),('1.25','.7403430'),('1.073','-.0028612'),('1.074','.0010644'),('1.0737','-.0001136'),('1.0738','.0002790')]
vals=[{'x':xx,'actual':str(f.subs(x,R(xx)).evalf(50)),'given':y,'absoluteRoundingError':str(abs(f.subs(x,R(xx)).evalf(50)-R(y)).evalf(20))} for xx,y in data]
check('Numerical table supplied error bound',all(abs(f.subs(x,R(xx)).evalf(50)-R(y))<R(1,10**7) for xx,y in data),vals)
check('Numerical initial bisections',f.subs(x,1)<0 and f.subs(x,R(3,2))>0 and f.subs(x,R(5,4))>0,{'retainedIntervals':[['1','1.5'],['1','1.25']]})
root=s.nsolve(f,R(11,10),prec=60)
for a,b,m,tol in [('1.073','1.074','1.0735','.0005'),('1.0737','1.0738','1.07375','.00005')]:
 aa,bb,mm,tt=map(R,[a,b,m,tol]);check('Numerical certified bracket '+a,f.subs(x,aa)<0 and f.subs(x,bb)>0 and (aa+bb)/2==mm and (bb-aa)/2==tt and abs(root-mm)<tt,{'bracket':[a,b],'midpoint':m,'absoluteErrorBound':tol,'independentRoot':str(root)})
check('Numerical root uniqueness',s.diff(f,x)==s.exp(x)+1,'f prime = e^x+1 > 0 everywhere; signs bracket a root')
report={'status':'PASS_REVIEWER_AUTHORED_MATHEMATICS','checkedAtUTC':datetime.now(timezone.utc).isoformat(),'reviewerAgent':'/root/astra_six_math_whole_forms','independentOfAuthorCheckScripts':True,'checks':checks,'checkCount':len(checks),'all187RSAResiduesChecked':True,'noncoprimeResiduesIncludingZero':len(nonunits),'limitations':'Finite/symbolic reviewer verification, not testing an LLM grader or classroom effectiveness.'}
(out/'mathematics.actual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':report['status'],'checks':len(checks),'rsaMessages':187,'nonunits':len(nonunits)}))
