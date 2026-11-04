import sympy as s
from decimal import Decimal, localcontext
from pathlib import Path
import json
out=Path(__file__).parent
rows=[]
def eq(group,label,actual,expected):
 ok=actual==expected if isinstance(actual,(str,list,tuple,bool)) else s.simplify(actual-expected)==0
 assert ok,(group,label,actual,expected)
 rows.append(dict(form=group,case=label,actual=str(actual),expected=str(expected),passResult=True))
x=s.symbols('x',real=True); t=s.symbols('t',positive=True); a=s.symbols('a',positive=True); n=s.symbols('n',integer=True,positive=True)
q=s.Rational
f=(x-1)/x**3;F=-1/x+1/(2*x*x)
eq('improper-area','primitive derivative',s.diff(F,x),f)
eq('improper-area','sign left',bool(f.subs(x,q(3,4))<0),True)
eq('improper-area','sign right',bool(f.subs(x,2)>0),True)
eq('improper-area','zero',f.subs(x,1),0)
left=-(F.subs(x,1)-F.subs(x,q(1,2)));right=s.limit(F,x,s.oo)-F.subs(x,1)
eq('improper-area','bounded nonnegative area',left,q(1,2));eq('improper-area','tail area limit',right,q(1,2));eq('improper-area','total',left+right,1)
G=-1/(2*x*x);eq('improper-area','g primitive',s.diff(G,x),1/x**3)
L=-(G.subs(x,-t)-G.subs(x,-1));R=G.subs(x,1)-G.subs(x,t)
eq('improper-area','left nonnegative truncated area',L,1/(2*t*t)-q(1,2));eq('improper-area','right nonnegative truncated area',R,L)
eq('improper-area','left area divergent',s.limit(L,t,0)==s.oo,True);eq('improper-area','right area divergent',s.limit(R,t,0)==s.oo,True)
eq('improper-area','symmetric signed cancellation counterexample',-L+R,0)
H=3*s.log(x)+x*x
eq('log-antiderivative','log derivative',s.diff(s.log(x),x),1/x);eq('log-antiderivative','H derivative',s.diff(H,x),3/x+2*x)
eq('log-antiderivative','definite',s.simplify(H.subs(x,s.exp(2))-H.subs(x,1)),s.exp(4)+5)
eq('log-antiderivative','variable bounds',s.expand_log(s.log(s.E*a)-s.log(a),force=True),1)
eq('log-antiderivative','ln0 is not real endpoint',s.log(0).is_real,False)
V=20+6*x-x*x;B=x*x-4*x+6
eq('stock-reconstruction','rate',s.diff(V,x),6-2*x);eq('stock-reconstruction','initial',V.subs(x,0),20)
for val,ans in [(2,28),(3,29),(5,25)]:eq('stock-reconstruction','V'+str(val),V.subs(x,val),ans)
eq('stock-reconstruction','net change 2 to 5',V.subs(x,5)-V.subs(x,2),-3)
eq('stock-reconstruction','maximum derivative zero',s.solve(s.diff(V,x),x),[3]);eq('stock-reconstruction','strict concavity',bool(s.diff(V,x,2)<0),True)
eq('stock-reconstruction','math rate',s.diff(B,x),2*x-4);eq('stock-reconstruction','reference at1',B.subs(x,1),3)
eq('stock-reconstruction','zero net change',s.integrate(2*x-4,(x,0,4)),0);eq('stock-reconstruction','equal nonzero endpoint',B.subs(x,0),B.subs(x,4));eq('stock-reconstruction','not constant',B.subs(x,2),2)
for label,fun,prim,ans in [('product',(2*x+1)*s.exp(x),(2*x-1)*s.exp(x),s.E+1),('composition',2*x*s.exp(x*x+1),s.exp(x*x+1),s.exp(2)-s.E),('sum',s.exp(2*x)+3*x*x,s.exp(2*x)/2+x**3,(s.exp(2)+1)/2)]:
 eq('linked-exp-polynomial',label+' derivative',s.diff(prim,x),fun);eq('linked-exp-polynomial',label+' integral',s.integrate(fun,(x,0,1)),ans);eq('linked-exp-polynomial',label+' endpoint',prim.subs(x,1)-prim.subs(x,0),ans)
u=3*(x-s.pi/6);v=-2*(x-s.pi/4)
for label,fun,prim in [('exp',s.exp(-2*x+1),-s.exp(-2*x+1)/2),('sin',s.sin(u),-s.cos(u)/3),('cos',s.cos(v),-s.sin(v)/2)]:eq('transformed-exp-trig',label+' chain check',s.diff(prim,x),fun)
eq('transformed-exp-trig','upper argument',u.subs(x,s.pi/2),s.pi);eq('transformed-exp-trig','lower argument',u.subs(x,s.pi/6),0)
eq('transformed-exp-trig','integral',s.integrate(s.sin(u),(x,s.pi/6,s.pi/2)),q(2,3));eq('transformed-exp-trig','wrong K derivative',s.diff(s.sin(v),x),-2*s.cos(v))
S4=sum(1/s.factorial(i) for i in range(5));S6=sum(1/s.factorial(i) for i in range(7));P4=sum(x**i/s.factorial(i) for i in range(5));upper=S6+1/(6*s.factorial(6))
eq('e-series-taylor','Taylor4',P4,1+x+x*x/2+x**3/6+x**4/24);eq('e-series-taylor','P4 at1',P4.subs(x,1),S4);eq('e-series-taylor','P4 at0',P4.subs(x,0),1)
eq('e-series-taylor','S4',S4,q(65,24));eq('e-series-taylor','S6',S6,q(1957,720));eq('e-series-taylor','upper',upper,q(11743,4320))
eq('e-series-taylor','lower beyond rounding edge',bool(S6>q(27175,10000)),True);eq('e-series-taylor','upper below rounding edge',bool(upper<q(27185,10000)),True)
eq('e-series-taylor','error bound vanishes',s.limit(1/(n*s.factorial(n)),n,s.oo),0)
for N in [1,2,4,6,10]:
 SN=sum(1/s.factorial(i) for i in range(N+1));err=(s.E-SN).evalf(80);bound=(1/(N*s.factorial(N))).evalf(80)
 eq('e-series-taylor','bound concrete n'+str(N),bool(0<err<bound),True)
for N,ans in [(1,'2.000000'),(10,'2.593742'),(100,'2.704814'),(1000,'2.716924'),(10000,'2.718146'),(100000,'2.718268')]:
 with localcontext() as c:
  c.prec=70;val=(1+Decimal(1)/N)**N
  eq('approximate-e','growth n'+str(N),format(val,'.6f'),ans)
eq('approximate-e','three place scaled estimate',q(2718,1000)*200,q(5436,10));eq('approximate-e','natural start',200*s.exp(x).subs(x,0),200)
A=x*x+x+1;Q=A+s.prod(x-i for i in range(1,6));BB=2*(-q(1,2))**(x-1)
for j,ans in enumerate([3,7,13,21,31],1):eq('sequence-formation','A datum'+str(j),A.subs(x,j),ans);eq('sequence-formation','alternative A datum'+str(j),Q.subs(x,j),ans)
for j,ans in enumerate([2,-1,q(1,2),-q(1,4),q(1,8)],1):eq('sequence-formation','B datum'+str(j),BB.subs(x,j),ans)
eq('sequence-formation','A6',A.subs(x,6),43);eq('sequence-formation','B6',BB.subs(x,6),-q(1,16));eq('sequence-formation','different sixth',Q.subs(x,6),163)
eq('sequence-formation','A recursion',s.expand(A.subs(x,x+1)-A),2*x+2);eq('sequence-formation','B recursion',s.simplify(BB.subs(x,n+1)/BB.subs(x,n)),-q(1,2))
result=dict(status='PASS',reviewer='/root/astra_space_geometry_four_forms',method='Own symbolic equations, one-sided limits, exact fractions and 70-digit Decimal growth calculations; author check code not reused.',checkCount=len(rows),checks=rows)
(out/'independent-mathematics.actual.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':'PASS','checkCount':len(rows)}))
