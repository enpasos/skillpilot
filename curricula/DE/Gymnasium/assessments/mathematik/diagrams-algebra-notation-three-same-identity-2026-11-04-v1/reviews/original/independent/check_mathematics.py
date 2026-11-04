"""Independent exact calculations and literal diagram checks; no author code execution."""
from pathlib import Path
from fractions import Fraction as Q
from decimal import Decimal as D, getcontext
import sympy as s
import json,re,hashlib,html
from datetime import datetime,timezone
ROOT=Path.cwd();OUT=Path(__file__).resolve().parent
B=ROOT/'tmp/approach-review-20261101/diagrams-algebra-notation-three-whole-forms-20261104-v1'
checks=[]
def ck(name,value,evidence):
 assert value,name
 checks.append({'check':name,'result':'PASS','evidence':evidence})
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def diagram(t):return re.search(r'```text\n(.*?)```',t,re.S)[1]
gid='d668c22d-caeb-5e91-8980-721c931a2bcf'
for lang in ['de','en']:
 block=diagram((B/gid/f'task.{lang}.md').read_text());lines=block.splitlines();bars=[re.search(r'\|(#+) (\d+)$',x) for x in lines[-2:]]
 ck(lang+' task literal ASCII lengths and endpoints',[(len(m[1]),int(m[2])) for m in bars]==[(5,100),(15,120)],'Exactly 5 versus 15 # cells; values100/120. Scale marks at columns11,16,21,26 represent90,100,110,120.')
 ck(lang+' uniform actual scale and baselines',[i for i,c in enumerate(lines[2]) if c=='|']==[11,16,21,26] and all(x.index('|')==11 for x in lines[-2:]) and [int(x) for x in lines[1].split()]==[90,100,110,120],'10 visits per five cells; all bars start at90, so one cell represents2 visits.')
 fixed=diagram((B/gid/f'solution.{lang}.md').read_text()).splitlines();fb=[re.search(r'\|(#+) (\d+)$',x) for x in fixed[-2:]]
 ck(lang+' actual corrected zero plot',[(len(m[1])*10,int(m[2])) for m in fb]==[(100,100),(120,120)] and [int(x) for x in fixed[1].split()]==[0,50,100,150] and [i for i,c in enumerate(fixed[2]) if c=='|']==[11,16,21,26],'10/12 cells and uniform zero scale encode100/120 with ratio5:6.')
 h=(B/f'diagram-render.{lang}.html').read_text();rendered=html.unescape(re.search(r'<pre><code class="language-text">(.*?)</code></pre>',h,re.S)[1])
 ck(lang+' stored render HTML preserves actual task diagram',rendered==block,'Same actual embedded text, no runtime PNG dependency.')
ck('true count ratio and percent',Q(120,100)==Q(6,5) and Q(20,100)==Q(1,5),'100->120 means+20visits,20percent,1.2times; tripling would yield300.')
ck('truncated-length exaggeration',Q(120-90,100-90)==3 and Q(120,100)!=3,'The incorrect3-times visual comparison concerns increments from90, not full values.')
ck('concrete distinct-people counterexample',60*2==120 and 60<120,'60people each visiting twice produce120visits; distinct visitors cannot be inferred.')
x=s.Symbol('x',real=True);A=3*(x-2)+4-(2*x+9);Bexpr=6/(x-1)-s.Rational(3,2)
ck('bracket equation exact unique root',s.expand(A)==x-11 and s.solve(A,x)==[11],'Distributing3 to both terms gives3x-6; unique root11.')
ck('bracket original substitution check',3*(11-2)+4==2*11+9==31,'Both original sides equal31.')
ck('ratio equation exact root on admissible domain',s.solve(Bexpr,x)==[5] and s.simplify(2*(x-1)*Bexpr-(12-3*(x-1)))==0,'On x!=1, denominator-clearing factor2(x-1) is nonzero; transformed equation12=3(x-1) gives5.')
ck('ratio original substitution and proportional route',Q(6,5-1)==Q(3,2) and 5-1==2*2,'Numerator3->6 and denominator2->4 preserve the ratio; substitution6/4=3/2.')
ck('excluded denominator cannot be restored',s.denom(6/(x-1)).subs(x,1)==0 and (12-3*(x-1)).subs(x,1)==12,'At1 the original expression is undefined; transformed12=0 does not license original division by zero.')
ck('incorrect distributive step fails original check',3*(7-2)+4!=2*7+9,'Wrong expansion3(x-2)=3x-2 yieldsx7; original sides19and23 expose it. A probe checks candidate, not every transformation.')
M={n for n in range(0,10) if 2<=n<7}
ck('finite-set boundary and N convention',M=={2,3,4,5,6} and {n for n in range(1,10) if 2<=n<7}==M and 6 in M and 7 not in M,'The inclusion or exclusion of0fromN does not affect this set.')
P=s.Interval(-2,3,left_open=True,right_open=False)
ck('real interval boundary membership',[bool(P.contains(t)) for t in [-2,3,s.Rational(5,2)]]==[False,True,True],'(-2,3] includes3and2.5, excludes-2; ]-2;3] equivalent convention.')
ck('finite integer-list counterexample',bool(P.contains(s.Rational(5,2))) and s.Rational(5,2) not in {-1,0,1,2,3},'2.5 is one explicit omitted real member; the finite integer list is not P.')
fx=2*x+1;image=s.calculus.util.function_range(fx,x,s.Interval(0,5))
ck('function exact image and permitted codomains',image==s.Interval(1,11) and image.is_subset(s.S.Reals),'[1,11] exact image; R and any containing real codomain such as[0,infinity) are valid.')
ck('function value and ordered graph pair',fx.subs(x,2)==5 and fx.subs(x,0)==1 and fx.subs(x,5)==11,'f is the varying map, f(2) is5euros for2km, and(2,5)is a graph point; f=5 is not this whole function.')
ck('invalid natural-number-only codomain counterexample',fx.subs(x,s.Rational(1,4))==s.Rational(3,2),'The allowed distance0.25km gives1.5euros, so N is not a valid codomain for the full real input interval.')
p=-x*x/s.Integer(2)+12*x
ck('existing whole quadratic exam values',[(p.subs(x,a)) for a in [0,4,8,12,16,20,24]]==[0,40,64,72,64,40,0] and s.solve(p,x)==[0,24],'Additional full-exam requirements actually include quadratics, manual/digital values and vertex(12,72).')
ck('existing whole quadratic exam max deviation',s.expand(p-54-(18-(x-12)**2/2))==0 and p.subs(x,6)==p.subs(x,18)==54 and p.subs(x,12)-54==18,'The secant54 on[6,18] deviates by18>5, with horizontal comparison levels54/72/80.')
getcontext().prec=40
F=lambda t:t.ln()+t-D(2)
seq=[D(2)]
for k in range(3):seq.append(seq[-1]-F(seq[-1])/(1+1/seq[-1]))
ck('existing Newton numerical sequence',all(abs(a-D(b))<D('0.0000000001') for a,b in zip(seq[1:],['1.5379018796','1.5570985511','1.5571455987'])),'The older whole exam really requires adapting and executing Newton, beyond J8 notation; iterations independently computed.')
ck('existing Newton bracket and rounding',F(D('1.5571'))<0<F(D('1.5572')) and D('1.5571').quantize(D('.001'))==D('1.5572').quantize(D('.001'))==D('1.557'),'Positive derivative1+1/x on x>0 gives uniqueness; bracket supports rounded1.557 rather than exact1.56.')
# Bound author screenshot proof to actual unchanged application reader, without claiming own browser run.
proof=json.loads((B/'author-embedded-diagram-render-check.json').read_text())
ck('author render reader binding still current',sha(ROOT/proof['actualAppReader'])==proof['actualAppReaderSha256'],'Reviewer verified the declared GoalCard source hash. Browser generation remains author execution; reviewer actually viewed4PNGs separately.')
report={'status':'PASS_INDEPENDENT_MATHEMATICS_AND_LITERAL_DIAGRAM_CHECKS','checkedAtUTC':datetime.now(timezone.utc).isoformat(),'reviewerAgent':'/root/astra_six_math_whole_forms','checkCount':len(checks),'checks':checks,'authorCodeExecuted':False,'browserRendererExecutedByReviewer':False,'noNewApprovalOfExistingWholeExams':True,'writes':'Private reviewer directory only'}
(OUT/'mathematics.actual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':report['status'],'checks':len(checks)}))
