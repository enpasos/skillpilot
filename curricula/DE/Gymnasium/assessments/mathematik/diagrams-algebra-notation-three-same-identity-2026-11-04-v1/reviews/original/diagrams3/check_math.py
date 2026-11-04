import json,pathlib,re
from fractions import Fraction as Q
import sympy as s
H=pathlib.Path(__file__).resolve().parent
rows=[]
def check(name,ok,evidence):
 assert bool(ok),name
 rows.append({'check':name,'result':'PASS','evidence':evidence})
for lang in ['de','en']:
 task=(H/'d668c22d-caeb-5e91-8980-721c931a2bcf'/f'task.{lang}.md').read_text();plot=re.search(r'```text\n([\s\S]*?)```',task)[1];bars=[q for q in plot.splitlines() if '#' in q];lengths=[q.count('#') for q in bars]
 check('Actual embedded bar data '+lang,lengths==[5,15] and [90+2*n for n in lengths]==[100,120],{'actualBarLengths':lengths,'actualDataFromScale':[90+2*n for n in lengths],'maximumLineCharacters':max(map(len,plot.splitlines()))})
 ticks=plot.splitlines()[2].strip();check('Actual plot uniform ticks '+lang,[i for i,c in enumerate(ticks) if c=='|']==[0,5,10,15],'Tick positions uniform; labels90,100,110,120.')
 sol=(H/'d668c22d-caeb-5e91-8980-721c931a2bcf'/f'solution.{lang}.md').read_text();alt=re.search(r'```text\n([\s\S]*?)```',sol)[1];bs=[q for q in alt.splitlines() if q.startswith('Woche') or q.startswith('Week')]
 check('Alternative bar chart exact '+lang,[q.count('#')*10 for q in bs]==[100,120],'Zero baseline;each#represents10;correct whole-count ratio5:6.')
check('Misleading length ratio differs from actual count ratio',Q(30,10)==3 and Q(120,100)==Q(6,5) and Q(120-100,100)==Q(1,5),'Visible increments ratio3;true visits ratio1.2;increase20%.')
x=s.symbols('x',real=True);Aleft=3*(x-2)+4;Aright=2*x+9;Bleft=6/(x-1);Bright=s.Rational(3,2)
check('Bracket exact solution',s.solve(Aleft-Aright,x)==[11],'Distribute3overbothterms;3x-2=2x+9.')
check('Bracket original substitution exact',Aleft.subs(x,11)==31 and Aright.subs(x,11)==31,'Original equation both sides31, not just a derived line.')
check('Ratio exact solution and admissible denominator',s.solve(Bleft-Bright,x)==[5] and (x-1).subs(x,5)==4,'DomainRexcept1;2isnonzero;ratioequationsolution5hasdenominator4.')
check('Ratio original substitution exact',Bleft.subs(x,5)==Bright,'Original equation6/4=3/2.')
check('Ratio denominator-clearing identity exact',s.simplify((Bleft-Bright)*2*(x-1)-(12-3*(x-1)))==0,'Multiplication by2(x-1)isreversibleonlyonoriginaldomainx!=1.')
check('Excluded value cannot be repaired',Bleft.subs(x,1) in [s.zoo,s.oo,-s.oo],'Originalleftsideat1isundefined/infinite;algebraicrewritingdoesnotauthorisedivisionbyzero.')
check('Distributivity error counterexample',s.expand(3*(x-2)-(3*x-2))==-4,'3(x-2)is3x-6,not3x-2;constantdifference-4.')
M=s.FiniteSet(*range(2,7));P=s.Interval(-2,3,left_open=True,right_open=False)
check('Natural set and membership',M==s.FiniteSet(2,3,4,5,6) and 6 in M and 7 not in M,'BothNconventionswith/without0givethesameset2through6.')
check('Singleton and element are different objects',s.FiniteSet(6)!=s.Integer(6),'Asetcontaining6isnotthenumber6.')
check('Real interval boundary and intermediate values',P.contains(-2)==False and P.contains(3)==True and P.contains(s.Rational(5,2))==True,'P=(-2,3];leftopen,rightclosed.')
check('Finite list does not equal continuous interval',s.FiniteSet(-1,0,1,2,3)!=P and s.Rational(5,2) not in s.FiniteSet(-1,0,1,2,3),'2.5isamemberoftheintervalbutnotfiniteintegerlist.')
f=2*x+1;D=s.Interval(0,5)
check('Function value and exact image interval',f.subs(x,2)==5 and s.imageset(s.Lambda(x,f),D)==s.Interval(1,11),'f:[0,5]->Ror[1,11]valid;graphpoint(2,5);functionisnonconstant.')
check('Function cannot be identified with constant5',f.subs(x,0)==1 and f.subs(x,5)==11,'f(2)=5doesnotmeanwholefunctionisconstant5.')
(H/'author-exact-mathematics.json').write_text(json.dumps({'status':'AUTHOR_EXECUTED_MATH_CHECKS_PASS_NOT_INDEPENDENT_APPROVAL','checks':rows},ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':'PASS','executedChecks':len(rows)}))
