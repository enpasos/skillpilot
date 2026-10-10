#!/usr/bin/env python3
"""Independent case calculations and an actual executable alternative spreadsheet layout."""
import ast,hashlib,json
from decimal import Decimal
from pathlib import Path
OUT=Path(__file__).resolve().parent
D=Decimal;checks=[]
def check(label,actual,expected,limit='Exactly the supplied fictional model; no empirical outcome claim'):
 assert actual==D(expected),(label,str(actual),expected)
 checks.append({'id':label,'actual':str(actual),'expected':str(D(expected)),'scopeLimit':limit})
for label,actual,expected in [
 ('party-seat-share',D(8)/20,'0.4'),('petition-over-hearing-threshold',D(1400)-1000,'400'),
 ('vote-total',D(720)+480,'1200'),('turnout',D(1200)/4000,'0.3'),('valid-X-share',D(720)/1200,'0.6'),('X-all-eligible-share',D(720)/4000,'0.18'),('valid-quorum-margin',D(1200)-1000,'200'),
 ('commute-person-week-minutes',D(2)*60,'120'),('commute-group-week-minutes',D(12)*2*60,'1440'),('commute-group-week-hours',D(1440)/60,'24'),
 ('commute-person-hours',D(120)/60,'2'),('homeworking-group-share',D(12)/20,'0.6'),('onsite-share',D(8)/20,'0.4'),
 ('human-routine-before-minutes',D(100)*10,'1000'),('human-routine-after-minutes',D(20)*15,'300'),('human-routine-saving-minutes',D(1000)-300,'700'),
 ('routine-time-only-saving-fraction',D(700)/1000,'0.7'),('initial-training-share',D(6)/10,'0.6'),('excluded-training-share',D(4)/10,'0.4'),
 ('A-insurance-month-reserve',D(120)/12,'10'),('A-original-spending-plus-reserve',D(150)+100+10,'260'),('A-original-free-rest',D(360)-150-100-10-30,'70'),
 ('A-varied-reserve',D(180)/12,'15'),('A-varied-free-rest',D(360)-150-100-15-30,'65'),
 ('A-combined-commitments',D(24)+36+2+2,'64'),('A-full-twelve-month-cost',D(64)*12,'768'),('A-original-loan-rest',D(70)-64,'6'),('A-variant-loan-rest',D(65)-64,'1'),
 ('A-original-extra10-rest',D(6)-10,'-4'),('A-variant-extra10-rest',D(1)-10,'-9'),('A-original-reserve-at-due-date',D(10)*12,'120'),('A-varied-reserve-at-due-date',D(15)*12,'180'),
 ('B-month-reserve',D(120)/12,'10'),('B-expected-rest',D(300)-120-80-10-20,'70'),('B-assumed-lower-income-rest',D(220)-120-80-10-20,'-10'),
 ('R-total-cost',D(24)*12+24,'312'),('R-premium-over-K',D(312)-240,'72'),('K-immediate-remainder',D(250)-240,'10'),('R-immediate-remainder',D(250)-24,'226'),
 ('R-first-income-month-rest',D(70)-12,'58'),('R-lower-income-month-rest',D(-10)-12,'-22'),('unsupported-duration-after-secure-six-months',D(24)-6,'18'),
 ('R-finite-buffer-month6-under-saving-surplus-assumption',D(226)+6*58,'574'),('R-next18-month-gap-scenario',D(18)*22,'396'),
 ('R-buffer-month24-under-explicit220-scenario',D(574)-396,'178'),('K-buffer-month6-scenario',D(10)+6*70,'430'),
 ('K-next18-month-gap-scenario',D(18)*10,'180'),('K-buffer-month24-scenario',D(430)-180,'250'),('K-R-buffer-difference-matches-cost-premium',D(250)-178,'72')
]:check(label,actual,expected)
assert len(checks)==49

def calculate(table):
 cache={};visiting=set()
 def cell(key):
  if key in cache:return cache[key]
  assert key not in visiting,'Cycle';visiting.add(key)
  value=table[key]
  result=evaluate(ast.parse(value[1:],mode='eval').body) if value.startswith('=') else D(value)
  visiting.remove(key);cache[key]=result;return result
 def evaluate(n):
  if isinstance(n,ast.Name):return cell(n.id)
  if isinstance(n,ast.Constant) and isinstance(n.value,(int,float)):return D(str(n.value))
  if isinstance(n,ast.BinOp):
   a,b=evaluate(n.left),evaluate(n.right)
   if isinstance(n.op,ast.Add):return a+b
   if isinstance(n.op,ast.Sub):return a-b
   if isinstance(n.op,ast.Mult):return a*b
   if isinstance(n.op,ast.Div):return a/b
  if isinstance(n,ast.Call) and isinstance(n.func,ast.Name) and n.func.id=='SUM' and not n.keywords:
   return sum((evaluate(arg) for arg in n.args),D(0))
  raise ValueError('Unsupported cell expression')
 return {key:str(cell(key)) for key in table}
A={'A1':'360','A2':'150','A3':'100','A4':'120','A5':'30','A6':'=A4/12','A7':'=SUM(A2,A3,A5,A6)','A8':'=A1-A7','A9':'=24+36+2+2','A10':'=A8-A9'}
B={'T1':'300','T2':'120','T3':'80','T4':'120','T5':'20','T6':'=T4/12','T7':'=SUM(T2,T3,T5,T6)','T8':'=T1-T7','T9':'12','T10':'=T8-T9'}
tables=[]
for name,template,changed_key,changed_value in [('A-independent',A,'A4','180'),('B-independent',B,'T1','220')]:
 original=calculate(template);variation=dict(template);variation[changed_key]=changed_value;updated=calculate(variation)
 assert all(variation[k]==v for k,v in template.items() if k!=changed_key)
 if name.startswith('A'):
  assert [D(original[k]) for k in ['A6','A8','A10']]==[D(10),D(70),D(6)]
  assert [D(updated[k]) for k in ['A6','A8','A10']]==[D(15),D(65),D(1)]
 else:
  assert [D(original[k]) for k in ['T6','T8','T10']]==[D(10),D(70),D(58)]
  assert [D(updated[k]) for k in ['T6','T8','T10']]==[D(10),D(-10),D(-22)]
 tables.append({'name':name,'independentlyAuthoredCells':template,'originalActualEvaluatedValues':original,'singleInputChange':{changed_key:changed_value},'variedCells':variation,'variedActualEvaluatedValues':updated,'outputCellsRetyped':False})
def save(name,obj):
 p=OUT/name;assert not p.exists();p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
save('actual49-own-Decimal-case-calculations-and-alternative-finite-buffer-proof.json',{'reviewer':'/root/economics_m2_views_independent_b','actualDecimalChecks':checks,'own49ChecksPassed':True,'financialBoundary':'The finite-buffer extension explicitly assumes every first-six-month surplus is retained and income220 continues for the next18 months, all stated monthly reserves/goals continue and no other expenses arise. It is a conditional model possibility, not assured future income, a claim of permanent solvency, or real credit advice. Negative monthly flow alone is not proof of legal overindebtedness.'})
save('actual-two-independent-executable-budget-celltables-and-single-input-recalculations.json',{'reviewer':'/root/economics_m2_views_independent_b','actualExecutedCellTables':tables,'actualFourFrameEvaluationsPassed':True,'spreadsheetLayoutCopiedFromAuthor':False,'meaning':'Executable documented cell references are explicitly permitted by the task. This evaluator actually recomputes all dependent outputs after one input change; no outputs are retyped and no learner work or external spreadsheet execution is claimed.'})
print(json.dumps({'decimalChecks':len(checks),'actualIndependentCellTables':len(tables),'actualExecutedFrames':4}))
