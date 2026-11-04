"""Independent symbolic, Decimal, printed-table and actual workbook checks.

No author check script is invoked. Workbook formulas are interpreted through a
restricted arithmetic AST, not through Excel/LibreOffice; no host claim follows.
"""
from pathlib import Path
import json,hashlib,ast,re
from decimal import Decimal as D,ROUND_HALF_UP,getcontext
from datetime import datetime,timezone
import sympy as s
import openpyxl
getcontext().prec=50
ROOT=Path.cwd();OUT=Path(__file__).resolve().parent
B=ROOT/'tmp/approach-review-20261101/functions-finance-six-whole-forms-20261104-v1'
checks=[]
def check(name,ok,detail):
 assert bool(ok),name
 checks.append({'check':name,'passed':True,'detail':detail})
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def euro(x):return x.quantize(D('.01'),rounding=ROUND_HALF_UP)
x,a,t=s.symbols('x a t',real=True);f=x*x-2*a*x+2*a;F=x**3/3-a*x*x+2*a*x
check('Family antiderivative',s.simplify(s.diff(F,x)-f)==0,str(F))
I=s.integrate(f,(x,0,1));J=s.integrate(f,(x,0,2))
check('Family definite integrals',I==a+s.Rational(1,3) and J==s.Rational(8,3),{'I':str(I),'J':str(J)})
check('Family zero and signed-balance witness',s.solve(I,a)==[-s.Rational(1,3)] and f.subs({a:-s.Rational(1,3),x:0})==-s.Rational(2,3) and f.subs(x,1)==1,{'zeroParameter':'-1/3','endpointValues':['-2/3','1'],'continuousNonzeroRegions':True})
check('Parameter cancellation interval',s.integrate(2*a*(1-x),(x,0,2))==0 and s.diff(I,a)==1,{'IIncreasing':True,'JParameterIndependent':True})
# Existing full exam cross-check: actual broader demands are not fabricated R.
check('Existing exam vertex and locus',s.expand((x-a)**2-a*a+2*a)==f,{'vertex':['a','-a^2+2a'],'locus':'y=-x^2+2x'})
check('Existing exam discriminant',s.simplify(s.discriminant(f,x)-4*a*(a-2))==0,'No real roots exactly for 0<a<2')
check('Existing exam geometric area',s.simplify(s.integrate(-f.subs(a,3),(x,3-s.sqrt(3),3+s.sqrt(3)))-4*s.sqrt(3))==0,'4*sqrt(3)')
T=10+8*s.sin(s.pi*t/12);Tv=12+6*s.sin(s.pi*t/12)
check('Periodic original data',[T.subs(t,k) for k in [0,6,12,18,24]]==[10,18,10,2,10],{'midline':10,'amplitude':8,'period':24,'clockOrigin':'06:00'})
check('Periodic second day and phase',s.simplify(T.subs(t,t+24)-T)==0 and [T.subs(t,k) for k in [6,18,30,42]]==[18,2,18,2],{'maximumClock':'12:00','minimumClock':'00:00'})
check('Periodic variant data',[Tv.subs(t,k) for k in [0,6,12,18,24]]==[12,18,12,6,12],{'midline':12,'amplitude':6,'maximum':18,'minimum':6})
check('Periodic cosine equivalence',s.trigsimp(T-(10+8*s.cos(s.pi*(t-6)/12)))==0,'Cosine form with shift 6 h gives the same model')
N=100*2**(t/2);M=80*s.Rational(1,2)**(t/3);Nv=400*s.Rational(11,10)**(t-4)
check('Growth and decay data',[N.subs(t,k) for k in [0,2,4,6,8]]==[100,200,400,800,1600] and [M.subs(t,k) for k in [0,3,6,9]]==[80,40,20,10],{'growthPoints':5,'decayPoints':4})
check('Changed growth continuity and value',Nv.subs(t,4)==N.subs(t,4)==400 and Nv.subs(t,8)==s.Rational(58564,100),{'N8':1600,'Nv8':'585.64','roundedCount':586})
check('Decay does not vanish finitely',s.limit(M,t,s.oo)==0 and M.subs(t,9)==10,'80*(1/2)^(t/3)>0 for every finite real t; limit is zero')
# Exact Decimal finance calculations, independent of worksheet formulas.
rates=[D('.04'),D('.05'),D('.06'),D('.0506'),D('.0507'),D('.0508')]
rate_rows=[]
for p in rates:
 v=D(2000);vals=[]
 for _ in range(3):v*=1+p;vals.append(v)
 rate_rows.append([p*100,*vals,v-D(2320)])
check('Interest exact bracketing',rate_rows[4][-1]<0<rate_rows[5][-1] and rates[5]-rates[4]==D('.0001'),{'lower':'5.07%','upper':'5.08%','differences':[str(rate_rows[4][-1]),str(rate_rows[5][-1])]})
check('Interest all accepted estimates',all(abs(row[-1])<=1 for row in rate_rows[3:]),{'acceptedPercent':['5.06','5.07','5.08'],'withinOneEuro':True})
check('Simple-interest counterexample',D(2000)*(1+3*D('.05'))==2300 and rate_rows[1][3]==D('2315.25'),{'simple':'2300','compound':'2315.25'})
pay_rows=[]
for r in [450,475,500,478,479]:
 v=D(0);vals=[]
 for _ in range(4):v=v*D('1.03')+r;vals.append(v)
 pay_rows.append([D(r),*vals])
check('Saving exact integer threshold',pay_rows[3][-1]<2000<=pay_rows[4][-1],{'rate478End':str(pay_rows[3][-1]),'rate479End':str(pay_rows[4][-1]),'wholeEuroMinimum':479})
check('Saving monotonic rate dependence',sum(D('1.03')**k for k in range(4))>0 and pay_rows[4][-1]-pay_rows[3][-1]==sum(D('1.03')**k for k in range(4)),'End balance = rate times a positive common factor')
check('Saving payment timing',pay_rows[4][1]==479 and D(479)*D('1.03')>479,{'fourPayments':1916,'yearEndFirstBalance':479,'beginningYearFactor':'1.03 more end balance for same rate'})
duration_rows=[];v=D(1000)
for year in range(1,8):
 opening=v;interest=v*D('.02');v=opening+interest+200;duration_rows.append([D(year),opening,interest,D(200),v])
check('Duration first complete target period',duration_rows[-2][-1]<2500<=duration_rows[-1][-1] and all(r[-1]<2500 for r in duration_rows[:-1]),{'period':7,'depositCount':7,'year6':str(duration_rows[-2][-1]),'year7':str(duration_rows[-1][-1])})
check('Duration zero-interest comparison',1000+7*200<2500<=1000+8*200,{'firstPeriod':8,'previous':2400,'targetPeriodBalance':2600})
# Verify every printed table cell in both complete language versions.
table_specs=[('1842da92-ca2c-5fed-a946-e6413a6285bb',rate_rows),('f6574cdc-e29c-5a8f-a009-9f28b3bcf9be',pay_rows),('fc34449a-fbf4-574c-884f-ecdf48b42d2e',duration_rows)]
for gid,expected in table_specs:
 for lang in ['de','en']:
  rows=[]
  for line in (B/gid/f'solution.{lang}.md').read_text().splitlines():
   if not line.startswith('|'):continue
   vals=[q.strip().replace('%','').replace(',','.') for q in line.strip('|').split('|')]
   try:parsed=[D(q) for q in vals]
   except Exception:continue
   rows.append(parsed)
  check('Printed finance table '+gid[:8]+' '+lang,len(rows)==len(expected) and rows==[[euro(x) for x in row] for row in expected],{'rows':len(rows),'cells':sum(map(len,rows)),'rounding':'Decimal ROUND_HALF_UP to cents; full internal precision retained'})
# Interpret actual XLSX arithmetic, preserving original files and caches.
workbooks=[];formula_count=0
for p in B.glob('*/solution-spreadsheet.xlsx'):
 wb=openpyxl.load_workbook(p,data_only=False);cached=openpyxl.load_workbook(p,data_only=True);sheets=[]
 for ws in wb:
  memo={};active=set();formulas=[]
  def cell(addr):
   if addr in memo:return memo[addr]
   assert addr not in active,'formula cycle';active.add(addr);value=ws[addr].value
   if ws[addr].data_type=='f':v=node(ast.parse(value[1:],mode='eval').body)
   else:assert isinstance(value,(float,int)),(ws.title,addr,value);v=D(str(value))
   memo[addr]=v;active.remove(addr);return v
  def node(n):
   if isinstance(n,ast.Constant):return D(str(n.value))
   if isinstance(n,ast.Name):assert re.fullmatch('[A-Z]+[0-9]+',n.id);return cell(n.id)
   if isinstance(n,ast.UnaryOp):return -node(n.operand) if isinstance(n.op,ast.USub) else node(n.operand)
   assert isinstance(n,ast.BinOp)
   l,r=node(n.left),node(n.right)
   if isinstance(n.op,ast.Add):return l+r
   if isinstance(n.op,ast.Sub):return l-r
   if isinstance(n.op,ast.Mult):return l*r
   if isinstance(n.op,ast.Div):return l/r
   raise AssertionError('unsupported arithmetic')
  for row in ws:
   for c in row:
    if c.data_type!='f':continue
    val=cell(c.coordinate);cache=cached[ws.title][c.coordinate].value
    assert cache is not None and abs(val-D(str(cache)))<D('1e-8'),(p,ws.title,c.coordinate)
    formulas.append({'cell':c.coordinate,'formula':c.value,'independentDecimalValue':str(val),'cachedValue':cache});formula_count+=1
  if p.parent.name.startswith('1842'):
   assert all(cell(f'{col}{i+2}')==value for i,row in enumerate(rate_rows) for col,value in zip('BCDE',row[1:]))
  elif p.parent.name.startswith('f657'):
   assert all(cell(f'{col}{i+2}')==value for i,row in enumerate(pay_rows) for col,value in zip('BCDE',row[1:]))
  elif ws.title=='2pct':
   assert all(cell(f'{col}{i+3}')==value for i,row in enumerate(duration_rows) for col,value in zip('ABCE',[row[0],row[1],row[2],row[4]]))
  elif ws.title=='0pct':
   assert all(cell(f'E{i+2}')==D(1000+200*i) for i in range(9))
  else:raise AssertionError('unexpected sheet')
  sheets.append({'sheet':ws.title,'formulaCells':formulas,'computedValuesMatchIndependentFinancialModel':True})
 workbooks.append({'path':str(p.relative_to(ROOT)),'sha256':sha(p),'sheets':sheets})
check('Actual workbook arithmetic and caches',formula_count==104,{'workbooks':len(workbooks),'formulaCells':formula_count,'method':'restricted AST + Decimal compared with stored cache; not Excel or LibreOffice execution'})
report={'status':'PASS_INDEPENDENT_MATHEMATICS_PRINTED_TABLES_AND_WORKBOOK_FORMULAS','checkedAtUTC':datetime.now(timezone.utc).isoformat(),'reviewerAgent':'/root/astra_six_math_whole_forms','checkCount':len(checks),'checks':checks,'workbooks':workbooks,'actualSpreadsheetHostExecution':False,'authorCheckScriptsInvoked':False,'originalInputsModified':False}
(OUT/'mathematics-and-spreadsheets.actual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':report['status'],'checks':len(checks),'actualFormulaCells':formula_count,'workbooks':len(workbooks)}))
