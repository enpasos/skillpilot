import json,pathlib,math
from decimal import Decimal as D,ROUND_HALF_UP
import sympy as s
from openpyxl import load_workbook
H=pathlib.Path(__file__).resolve().parent
rows=[]
def check(name,c,evidence):
 assert bool(c),name
 rows.append({'check':name,'result':'PASS','evidence':evidence,'verificationKind':'author_reasoned_boundary_not_executable_test' if name in ['Savings original OR kept','Duration discrete-year counterexample'] else 'executed_symbolic_numeric_or_table_assertion'})
x,a=s.symbols('x a',real=True);f=x*x-2*a*x+2*a;F=x**3/3-a*x*x+2*a*x
check('Family antiderivative exact',s.simplify(s.diff(F,x)-f)==0,'a is held constant when integrating/differentiating in x.')
I=s.integrate(f,(x,0,1));J=s.integrate(f,(x,0,2))
check('Family both definite integrals exact',s.simplify(I-a-s.Rational(1,3))==0 and J==s.Rational(8,3),{'I':str(I),'J':str(J),'zeroParameter':str(s.solve(I,a)[0])})
check('Family zero integral does not mean zero area',f.subs({a:-s.Rational(1,3),x:0})==-s.Rational(2,3) and f.subs({a:-s.Rational(1,3),x:1})==1,'Continuous function has negative and positive regions; signed cancellation is distinct from positive geometric area.')
check('Family cancelled parameter contribution',s.integrate(2*a*(1-x),(x,0,2))==0,'Parameter-dependent part has zero integral on [0,2], while f_a(0)=2a varies.')
t=s.symbols('t',real=True);T=10+8*s.sin(s.pi*t/12);Tv=12+6*s.sin(s.pi*t/12)
check('Periodic observed values and phase',[s.simplify(T.subs(t,k)) for k in [0,6,12,18,24]]==[10,18,10,2,10],'t counts hours after6am; max at6=noon, min at18=midnight; given observations all match.')
check('Periodic period24 and variation',s.simplify(T.subs(t,t+24)-T)==0 and [Tv.subs(t,k) for k in [0,6,12,18,24]]==[12,18,12,6,12],'Variation raises midline by2 and reduces amplitude8->6, keeps maximum18 and raises minimum2->6.')
check('Periodic midnight and next day',T.subs(t,18)==2 and T.subs(t,42)==2 and Tv.subs(t,18)==6,'Both original model midnight values coincide, but data/model assumptions do not prove real-world exact repetition.')
N=100*2**(t/2);M=80*2**(-t/3);Nv=400*s.Rational(11,10)**(t-4)
check('Exponential models fit all observations',[N.subs(t,k) for k in [0,2,4]]==[100,200,400] and [M.subs(t,k) for k in [0,3,6]]==[80,40,20],'Factors are2 per2hours and1/2 per3hours, rather than additive linear differences.')
check('Exponential predicted values',N.subs(t,6)==800 and M.subs(t,9)==10,'N6=800 cells; M9=10mg.')
check('Exponential varied growth has correct anchor and rate',Nv.subs(t,4)==400 and Nv.subs(t,8)==s.Rational(14641,25) and N.subs(t,8)==1600,'Nv(8)=585.64; exponent t-4 preserves the400-cell value at change time4.')
check('Decay positive for finite nonnegative times',all(float(M.subs(t,k))>0 for k in [0,3,9,30,300]),'Exact reasoning:80>0 and every finite real power of positive base1/2 is positive; zero is approached, not reached.')
# Exact decimals for all spreadsheet reference values and timing.
interest=[]
for r in [D('.04'),D('.05'),D('.06'),D('.0506'),D('.0507'),D('.0508')]:
 g=D(2000);vals=[]
 for _ in range(3):g=g*(1+r);vals.append(g)
 interest.append((r,vals,g-D(2320)))
check('Interest trial bracket and permitted candidates',interest[4][2]<0<interest[5][2] and all(abs(q[2])<=1 for q in interest[3:]),[{'rate':str(r),'balances':[str(v) for v in vals],'difference':str(diff)} for r,vals,diff in interest])
check('Interest annual compound-vs-simple counterexample',D(2000)*(1+D('.05'))**3==D('2315.250000') and D(2000)*(1+3*D('.05'))==2300,'Simple2300 differs from compound2315.25 at5% per year.')
savings=[]
for r in [450,475,500,478,479]:
 g=D(0);vals=[]
 for _ in range(4):g=g*D('1.03')+r;vals.append(g)
 savings.append((r,vals))
check('Savings exact479 minimal whole-euro rate',savings[-2][1][-1]<2000<=savings[-1][1][-1] and sum(D('1.03')**k for k in range(4))>0,[{'annualRate':r,'balances':[str(v) for v in vals]} for r,vals in savings])
check('Savings payment timing and no hidden extra period',savings[-1][1][0]==479 and D(479)*D('1.03')!=479,'At year1 the deposit has just arrived; starting-year contributions would gain exactly one additional interest year each.')
check('Savings original OR kept',True,'The single savings example satisfies original repayment OR savings method; no required second loan example added.')
durations={}
for name,rate in [('2pct',D('.02')),('0pct',D(0))]:
 g=D(1000);vals=[g]
 while g<2500:g=g*(1+rate)+200;vals.append(g)
 durations[name]=vals
check('Duration first target period with2percent',len(durations['2pct'])-1==7 and durations['2pct'][6]<2500<=durations['2pct'][7],[str(v) for v in durations['2pct']])
check('Duration first target period zero interest',len(durations['0pct'])-1==8 and durations['0pct'][7]==2400 and durations['0pct'][8]==2600,[str(v) for v in durations['0pct']])
check('Duration discrete-year counterexample',True,'No intermediate credit or deposit is defined; between years6and7 the account stays at prior credited balance, so linear interpolation is not an actual event time under the stated model.')
# Verify actual workbook formula caches against independently obtained exact-decimal recurrences.
for gid,tab,data,cols in [('1842da92-ca2c-5fed-a946-e6413a6285bb','Rates',interest,3),('f6574cdc-e29c-5a8f-a009-9f28b3bcf9be','Savings',savings,4)]:
 wb=load_workbook(H/gid/'solution-spreadsheet.xlsx',data_only=True);ws=wb[tab]
 for i,row in enumerate(data,2):
  vals=row[1]
  for j,v in enumerate(vals,2):assert abs(ws.cell(i,j).value-float(v))<1e-9
 check('Workbook exact recurrence comparison '+tab,True,{'rows':len(data),'balanceCells':len(data)*cols})
wb=load_workbook(H/'fc34449a-fbf4-574c-884f-ecdf48b42d2e'/'solution-spreadsheet.xlsx',data_only=True)
for title,vals in durations.items():
 for i,v in enumerate(vals,2):assert abs(wb[title].cell(i,5).value-float(v))<1e-9
check('Duration workbook matches exact decimals in both scenarios',True,'All period balances independently checked against Decimal recurrence, including year0 and first target years.')
# Parse and verify every displayed monetary table cell in both languages.
q=lambda v:D(v).quantize(D('.01'),rounding=ROUND_HALF_UP)
def table_rows(gid,lang):
 text=(H/gid/f'solution.{lang}.md').read_text();rs=[]
 for line in text.splitlines():
  if not line.startswith('|'):continue
  cells=[c.strip() for c in line.strip('|').split('|')]
  if not cells[0] or not cells[0][0].isdigit():continue
  rs.append(cells)
 return rs
for lang in ['de','en']:
 conv=lambda c:D(c.replace('%','').strip().replace(',','.'))
 for i,cells in enumerate(table_rows('1842da92-ca2c-5fed-a946-e6413a6285bb',lang)):
  r,vals,diff=interest[i];assert conv(cells[0])==r*100
  assert [conv(c) for c in cells[1:]]==[q(v) for v in vals]+[q(diff)]
 for i,cells in enumerate(table_rows('f6574cdc-e29c-5a8f-a009-9f28b3bcf9be',lang)):
  r,vals=savings[i];assert conv(cells[0])==r;assert [conv(c) for c in cells[1:]]==[q(v) for v in vals]
 for cells in table_rows('fc34449a-fbf4-574c-884f-ecdf48b42d2e',lang):
  k=int(cells[0]);assert conv(cells[-1])==q(durations['2pct'][k])
  if k:
   prev=durations['2pct'][k-1];assert [conv(c) for c in cells[1:4]]==[q(prev),q(prev*D('.02')),D(200)]
check('All bilingual displayed monetary tables exact',True,'Every displayed DE/EN balance/interest/difference cell checked against independently calculated exact-decimal reference rounded only for display.')
(H/'author-exact-mathematics.json').write_text(json.dumps({'status':'AUTHOR_SYMBOLIC_NUMERIC_CHECKS_AND_REASONED_BOUNDARIES_PASS_NOT_INDEPENDENT_APPROVAL','checks':rows},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':'PASS','checks':len(rows)}))
