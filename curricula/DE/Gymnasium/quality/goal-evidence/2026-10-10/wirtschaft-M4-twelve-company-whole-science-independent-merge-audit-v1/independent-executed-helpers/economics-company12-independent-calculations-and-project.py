from fractions import Fraction as F
import json,pathlib,hashlib,copy
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-twelve-company-whole-science-independent-merge-audit-v1';D=O/'actually-executed-explicit-role-simulation-project';D.mkdir(exist_ok=False)
checks=[]
def C(label,actual,expected):
 actual=F(actual);expected=F(expected);assert actual==expected,(label,actual,expected);checks.append({'label':label,'actual':str(actual),'expected':str(expected),'equal':True})
C('CSR absolute initial',1000*2,2000);C('CSR absolute after',1500*F('1.6'),2400);C('CSR absolute delta',1500*F('1.6')-1000*2,400);C('CSR absolute proportion',F(2400-2000,2000),F(1,5));C('CSR intensity proportion',F('1.6')/2-1,F(-1,5));C('CSR data reserve',5000-2000,3000)
C('Ethics remaining support budget',13000-12000,1000);C('Ethics price cost difference',12000-10000,2000);C('Ethics job tradeoff',100-90,10);C('Water C sum',80+20,100);C('Water D sum',60+40,100);C('Water C unmet basic need',40-20,20);C('Water D job loss',100-80,20)
C('State F year2',10000+2*500,11000);C('State P year2',12000-2*300,11400);C('State F year3',10000+3*500,11500);C('State P year3',12000-3*300,11100);C('State year2 preference',11400-11000,400);C('State year3 preference',11500-11100,400);C('State relative annual advantage',500+300,800);C('State equality horizon',F(12000-10000,500+300),F(5,2));C('Training own cash',6000-4000,2000);C('Training known money plus opportunity burden',2000+500,2500)
for v,e in [(10,5),(12,3),(11,4)]:C('Competition price delta from '+str(v),15-v,e)
C('Merger combined share',46+24,70);C('Merger alternative share',100-70,30);C('Pilot unit cost advantage',12-10,2);C('Pilot proportional advantage',F(12-10,12),F(1,6))
C('Debt normal remaining cash',22000-14000,8000);C('Debt stress remaining cash',9000-14000,-5000);C('Company unsecured remainder',10000-4000,6000);C('Separate given guarantee exposure',min(6000,10000-4000),6000);C('Different equity loss plus separate given guarantee',4000+6000,10000)
C('Old ten changeovers',10*2,20);C('New ten changeovers',10*F('0.5'),5);C('Changeover saved time',20-5,15);C('Automation additional fixed burden',6000-1000,5000);C('Automation variable benefit',9-4,5)
for q,m,a in [(500,5500,8000),(1200,11800,10800)]:C('Manual at '+str(q),1000+9*q,m);C('Automated at '+str(q),6000+4*q,a)
C('Automation equality quantity',F(6000-1000,9-4),1000);C('At500 automation excess',8000-5500,2500);C('At1200 automation advantage',11800-10800,1000)
C('Lean old throughput',24+36,60);C('Lean new throughput',24+16,40);C('Lean elapsed saving',60-40,20);C('Lean elapsed proportional saving',F(60-40,60),F(1,3));C('Lean processing change',24-24,0)
need=['red','blue','blue','red'];delivery=['red','red','blue','blue'];mismatch=[i+1 for i,(a,b) in enumerate(zip(need,delivery))if a!=b];assert mismatch==[2,4]
checks.append({'label':'Independent actual JIS ordered zipper comparison','actual':mismatch,'expected':[2,4],'equal':True,'givenRequired':need,'givenXDelivery':delivery})
C('Strategy A joint capital',30+20,50);C('Strategy A need',35+5,40);C('Strategy A surplus',50-40,10);C('Strategy A sole deficit',40-30,10);C('Strategy location M',F('0.6')*8+F('0.4')*4,F('6.4'));C('Strategy location N',F('0.6')*6+F('0.4')*9,F('7.2'));C('Strategy N capacity shortfall',1500-1000,500);C('Strategy A make',8000+10*1500,23000);C('Strategy A buy',18*1500,27000);C('Strategy A difference',27000-23000,4000);C('Strategy A threshold',F(8000,18-10),1000)
C('Strategy B joint capital',10+30,40);C('Strategy B ordinary surplus',40-15,25);C('Strategy B GmbH need',15+4,19);C('Strategy B GmbH surplus',40-19,21);C('Strategy location P',F('0.7')*9+F('0.3')*3,F('7.2'));C('Strategy location Q',F('0.7')*6+F('0.3')*8,F('6.6'));C('Strategy B make',6000+4*500,8000);C('Strategy B buy',10*500,5000);C('Strategy B advantage',8000-5000,3000);C('Strategy B threshold',F(6000,10-4),1000)
C('Governance funded solution',50+10,60);C('Governance impossible combined water demand',80+40,120);C('Governance feasible water sum',60+40,100);C('Governance plant funding deficit',20-8,12)
C('AI personalized known-cost surplus',12000-10000,2000);C('AI contextual known-cost surplus',11000-10000,1000);C('AI difference',2000-1000,1000);C('AI X qualified false rejection',F(10,100),F(1,10));C('AI Y qualified false rejection',F(30,100),F(3,10));C('AI qualified rate difference',F(30,100)-F(10,100),F(1,5));C('AI relative rate',F(30,100)/F(10,100),3);C('AI overall correct',1000-10-30,960);C('AI overall accuracy',F(960,1000),F(24,25));C('Supply A funded reserve',50-40,10);C('Supply B funded reserve',40-30,10)
checks.append({'label':'Given LkSG applicability under excluded exceptions','actual':[1500>=1000,100>=1000,1200>=1000],'expected':[True,False,True],'equal':True})
# Independent activity-on-node forward/backward calculation; derives float and critical paths from actual graph.
def network(durations,preds):
 remaining=set(durations);order=[]
 while remaining:
  available=sorted(n for n in remaining if all(p in order for p in preds[n]));assert available,'cycle';order.extend(available);remaining.difference_update(available)
 es={};ef={}
 for n in order:es[n]=max((ef[p]for p in preds[n]),default=0);ef[n]=es[n]+durations[n]
 end=max(ef.values());succ={n:[s for s in order if n in preds[s]]for n in order};lf={};ls={}
 for n in reversed(order):lf[n]=min((ls[s]for s in succ[n]),default=end);ls[n]=lf[n]-durations[n]
 paths=[]
 def walk(n,path):
  path=path+[n]
  if not succ[n]:paths.append(path)
  else:
   for s in succ[n]:walk(s,path)
 for n in order:
  if not preds[n]:walk(n,[])
 critical=[p for p in paths if sum(durations[n]for n in p)==end]
 return {'durations':durations,'predecessors':preds,'earliestStart':es,'earliestFinish':ef,'latestStart':ls,'latestFinish':lf,'totalFloat':{n:ls[n]-es[n]for n in order},'completion':end,'criticalPaths':critical}
pa={'A':[],'B':['A'],'C':['A'],'D':['B','C']};pb={'A':[],'B':['A'],'C':['A'],'D':['B'],'E':['C','D']}
na1=network({'A':2,'B':3,'C':2,'D':1},pa);na2=network({'A':2,'B':3,'C':4,'D':1},pa);nb1=network({'A':1,'B':2,'C':3,'D':2,'E':1},pb);nb2=network({'A':1,'B':2,'C':3,'D':4,'E':1},pb);nb3=network({'A':1,'B':2,'C':3,'D':1,'E':1},pb)
for label,n,e,crit in [('A initial',na1,6,[['A','B','D']]),('A actual change',na2,7,[['A','C','D']]),('B initial',nb1,6,[['A','B','D','E']]),('B cost-duration change',nb2,8,[['A','B','D','E']]),('B actual alternative',nb3,5,[['A','B','D','E'],['A','C','E']])]:
 C('Computed network completion '+label,n['completion'],e);assert n['criticalPaths']==crit,(label,n['criticalPaths']);checks.append({'label':'Derived critical paths '+label,'actual':n['criticalPaths'],'expected':crit,'equal':True})
C('Derived initial A C float',na1['totalFloat']['C'],1);C('Project disposable cost',F('0.2')*100,20);C('Project reusable cost',12+F('0.05')*100,17)
for label,costs,expected in [('B1',[20,15,10],45),('B2',[35,15,10],60),('B3',[25,15,10],50)]:C('Project budget '+label,sum(costs),expected);C('Project reserve '+label,60-sum(costs),60-expected)
C('B changed deadline miss',nb2['completion']-6,2)
# The independent reviewer explicitly enacts all named roles in a simulation, writes shared snapshots and real transition logs.
artifacts=[];logs=[]
def write_state(name,network,roles,costs,text,actions,parent=None):
 o={'version':name,'executionType':'explicit single-reviewer role simulation; no real interpersonal team claimed','roles':roles,'network':network,'costs':costs,'actualSubjectArtefact':text,'digitalMediumReason':'Readable text/CSV and shared versioned JSON hold the small numerical result, assigned checks, graph and actual changes without specialised software.','simulationActionsActuallyExecuted':actions,'parentSnapshotSHA':parent}
 p=D/(name+'.json');p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n');digest=hashlib.sha256(p.read_bytes()).hexdigest();artifacts.append({'path':str(p.relative_to(R)),'sha256':digest,'bytes':p.stat().st_size});logs.extend({'version':name,'role':r,'actualAction':act}for r,act in actions);return digest
ra={'A':'Ana — data checks','B':'Ben — calculations','C':'Cora — diagram','D':'Deniz — integration and approval'};rb={'A':'Ali — requirements','B':'Bea — costs','C':'Cem — room','D':'Dana — materials','E':'Dana — synthesis with sign-off by all simulated roles'}
a1=write_state('A.v1',na1,ra,{'disposable':20,'reusable':17},'Kostenbericht für 100 Nutzungen: Einweg 20; Mehrweg 17. Diagramm: Einweg #################### 20; Mehrweg ################# 17. Keine Aussage zu Umweltwirkung.',[('Ana','Checked 100 uses and the supplied cost units.'),('Ben','Actually calculated 0.20*100 and 12+0.05*100 and wrote the cost values.'),('Cora','Actually drew the proportional 20/17 text bars and checked their counts.'),('Deniz','Integrated the cost text and forward/backward network, approved conditional cost-only conclusion and recorded no environmental claim.')])
a2=write_state('A.v2',na2,ra,{'disposable':20,'reusable':17},'Kostenbericht bleibt Einweg 20, Mehrweg 17. Geändertes Diagramm-Freigabepaket C dauert 4 Tage; Ende 7 statt 6, kritischer Weg A–C–D. Rechnung bleibt richtig; der bisherige Termin wird nicht gehalten.',[('Cora','Recorded the actual C-duration change 2 to 4 in the shared data.'),('Deniz','Recomputed the graph and changed approval to finish 7.'),('Ben','Rechecked unchanged costs 20/17.'),('Ana','Compared initial and changed completion and signed the deadline-miss evaluation.')],a1)
b1=write_state('B.v1',nb1,rb,{'budget':60,'printing':20,'display':15,'transport':10,'sum':45,'reserve':15},'Informationsstand: Budget 60; Druck 20; Anzeige 15; Transport 10; Gesamtkosten 45; frei verbleibende Reserve 15. Ende 6; kritischer Weg A–B–D–E.',[('Ali','Defined the stand outcome as an understandable budget and reserve explanation.'),('Bea','Created actual 20/15/10 table and sum/reserve.'),('Cem','Checked the parallel room branch and its completion 4.'),('Dana','Integrated stand content with the graph and approved deadline 6 against the actual version.')])
b2=write_state('B.v2',nb2,rb,{'budget':60,'printing':35,'display':15,'transport':10,'sum':60,'reserve':0},'Informationsstand: Budget 60; Druck 35; Anzeige 15; Transport 10; Summe 60; Reserve 0. Kein Budgetüberzug, aber Materialdauer D 4 und Ende 8 statt Termin 6.',[('Bea','Actually changed printing 20 to 35; recomputed cost and reserve.'),('Dana','Actually changed D duration 2 to 4 and recomputed the shared graph.'),('Cem','Checked room readiness does not remove the now-longer material branch.'),('Ali','Evaluated zero reserve and real two-day deadline miss in the updated subject text.')],b1)
b3=write_state('B.v3',nb3,rb,{'budget':60,'printing':25,'display':15,'transport':10,'sum':50,'reserve':10},'Informationsstand: Budget 60; Druck 25; Anzeige 15; Transport 10; Summe 50; Reserve 10. Reserve bedeutet noch verfügbares Budget. Vorhandene Anzeige trägt diesen vollständigen Text. Materialdauer D 1; Ende 5 bei Termin 6.',[('Bea','Actually changed printing 35 to 25 and computed sum 50/reserve 10.'),('Dana','Actually changed D 4 to 1, recalculated completion and wrote the alternative stand text into display.txt.'),('Cem','Compared both paths: A–B–D–E and A–C–E each now take 5.'),('Ali','Read the actual display text, checked all given cost labels, reserve meaning and conditional display availability, and approved understandable budget/term result; actual public audience remains untested.')],b2)
(D/'display.txt').write_text('Informationsstand — ausdrücklich fiktive Rollensimulation\nBudget: 60\nDruck: 25\nAnzeige: 15\nTransport: 10\nSumme: 50\nReserve: 10 (noch verfügbares Budget)\nEnde: Modelltag 5; Termin: 6\nAlternative setzt tatsächliche Verfügbarkeit der vorhandenen Anzeige voraus.\n')
(D/'A-cost-chart.txt').write_text('100 Nutzungen\nEinweg   #################### 20\nMehrweg  #################    17\nNur Kosten; keine Umweltbilanz.\n')
(D/'actual-transition-and-role-execution-log.json').write_text(json.dumps({'execution':'Single reviewer enacting named roles explicitly, not real external messages','actualActions':logs,'actualNetworkForwardBackwardMethod':'Independent graph traversal on the given dependencies derives earliest/latest starts, float, all longest paths.','actualSnapshotBindings':artifacts},ensure_ascii=False,indent=2)+'\n')
for p in D.iterdir():
 if not any(a['path']==str(p.relative_to(R))for a in artifacts):artifacts.append({'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size})
for p in D.iterdir():json.loads(p.read_text())if p.suffix=='.json'else p.read_text()
result={'reviewer':'/root/economics_merge_audit','method':'Independently formulated rational arithmetic and forward/backward network traversal; no author numerical/counterwork artefact used.','checks':checks,'actualChecks':len(checks),'failures':0,'actualProjectArtefacts':artifacts,'factualLimits':'All case amounts fictional. The role simulation was explicitly executed locally; no actual interpersonal team, learner mastery, user display acceptance or environmental outcome claimed.'}
p=O/'actual-independent-rational-calculations-network-JIS-zipper-and-executed-project-results.json';assert not p.exists();p.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(len(checks),'own executed checks; project files',len(artifacts),hashlib.sha256(p.read_bytes()).hexdigest())
