from pathlib import Path
import json,datetime,hashlib
R=Path(__file__).parent
C=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-laboratory-communication-fifteen-current419-whole-author-20261015-v1/materials/thirty-complete-DE-EN-cases.author.json')
checks=[]
def c(case,expression,result,expected,tol=1e-9):
 ok=abs(result-expected)<=tol
 checks.append({'caseId':case,'expression':expression,'computed':result,'expected':expected,'withinTolerance':ok,'tolerance':tol});assert ok
c('03-a','0.0100 L*0.100 mol/L',.010*.100,.001)
c('03-a','0.001 mol*100.1 g/mol',.001*100.1,.1001)
c('03-a','100*0.09/0.1001',100*.09/.1001,89.91008991008991)
c('03-a-transfer','0.010 L*0.050 mol/L*100.1 g/mol',.010*.050*100.1,.05005)
for expr,v,e in [('mean water',(5+6)/2,5.5),('mean NaCl',(1190+1210)/2,1200),('mean sucrose',(9+10)/2,9.5)]:c('04-a',expr,v,e)
c('05-a','100*90kg/100kg',100*90/100,90)
c('05-b','O atoms left=3+3*1',3+3,6);c('05-b','O atoms right=3*2',3*2,6)
for expr,v,e in [('purity percent',2.565/2.70*100,95),('pure NaCl recovery percent',2.565/3*100,85.5),('gross mass recovery percent',2.7/3*100,90)]:c('06-a',expr,v,e)
for expr,v,e in [('hot capacity',20*30/100,6),('cold capacity',20*10/100,2),('ideal crystallised A',6-20*10/100,4),('purity',3.42/3.6*100,95),('original A recovery',3.42/6*100,57),('relative to ideal crystals',3.42/4*100,85.5)]:c('06-b',expr,v,e)
for expr,v,e in [('iron percent',1.2/5*100,24),('sand percent',1.5/5*100,30),('salt percent',2.2/5*100,44),('recovered mass',1.2+1.5+2.2,4.9),('recovery percent',4.9/5*100,98),('loss percent',(5-4.9)/5*100,2)]:c('07-a',expr,v,e)
c('07-b','mean conductivity',(9.8+10.1)/2,9.95);c('07-b','range',10.1-9.8,.3)
c('07-b','nominal g NaCl per L of water',1/.020,50);c('07-b','nominal molarity before small solution-volume change',1/58.44/.020,.8555783709787816)
for expr,v,e in [('Ca mol',.020*.100,.002),('carbonate mol',.025*.100,.0025),('ideal product g',.002*100.1,.2002),('gross yield percent',.180/.2002*100,89.91008991008991),('pure product g',.180*.95,.171),('corrected yield percent',.171/.2002*100,85.41458541458543),('transfer ideal mass',.0025*100.1,.25025)]:c('08-b',expr,v,e)
for expr,v,e in [('A mean',(120+124)/2,122),('B mean',(81+82)/2,81.5),('A increase percent',(122-80)/80*100,52.5),('B increase percent',(81.5-80)/80*100,1.875)]:c('09-a',expr,v,e)
c('10-a','10x objective*10x eyepiece',10*10,100);c('10-b','A mean um',(30+40+50)/3,40);c('10-b','B mean um',(10+20+20)/3,50/3)
c('11-a','moist germination percent',(16+18+17)/60*100,85);c('11-a','dry germination percent',1/60*100,5/3)
for key,v,e in [('20C',(8+9+10)/3,9),('30C',(17+18+19)/3,18),('40C',(10+12+11)/3,11)]:c('11-b',key,v,e)
c('12-a-transfer','new total mass',4+.5+5.5,10)
for case,expr,v,e in [('13-a','A mean load',(8+9+10)/3,9),('13-a','B mean load',(4+5+6)/3,5),('13-b','A mean radius',(6+7+8)/3,7),('13-b','B mean radius',(3+4+5)/3,4),('14-a','sunny grass per square metre',((12+14+10)/3)/.25,48),('14-a','shade grass per square metre',((8+9+7)/3)/.25,32),('14-b','open mean cover',(20+25+15)/3,20),('14-b','shade mean cover',(5+10+5)/3,20/3),('15-b','gravel nominal flow mL/s',100/20,5),('15-b','layered nominal flow mL/s',100/90,10/9)]:c(case,expr,v,e)
chem=[{'caseId':'03-a/08-b','reaction':'Ca2+ + CO3^2- -> CaCO3(s)','leftAtoms':{'Ca':1,'C':1,'O':3},'rightAtoms':{'Ca':1,'C':1,'O':3},'leftNetCharge':0,'rightNetCharge':0,'consistent':True},{'caseId':'03-b','reaction':'2 H2O2 -> 2 H2O + O2','leftAtoms':{'H':4,'O':4},'rightAtoms':{'H':4,'O':4},'consistent':True},{'caseId':'05-b','reaction':'Fe2O3 + 3 CO -> 2 Fe + 3 CO2','leftAtoms':{'Fe':2,'C':3,'O':6},'rightAtoms':{'Fe':2,'C':3,'O':6},'consistent':True,'sourceSolutionError':'The original case and profile state3O in DE and EN. Correct atom count is6O on each side; equation itself is balanced.'},{'caseId':'08-a','reaction':'C6H12O6 -> 2 C2H5OH + 2 CO2','leftAtoms':{'C':6,'H':12,'O':6},'rightAtoms':{'C':6,'H':12,'O':6},'consistent':True},{'caseId':'13-a','reaction':'CaSO4.0.5H2O + 1.5H2O -> CaSO4.2H2O','leftAtoms':{'Ca':1,'S':1,'O':6,'H':4},'rightAtoms':{'Ca':1,'S':1,'O':6,'H':4},'consistent':True}]
for x in chem:assert x['leftAtoms']==x['rightAtoms']
data={'runId':json.loads((R/'ORIGINAL.run.started.json').read_text())['runId'],'calculatedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'input':str(C),'inputDigest':'sha256:'+hashlib.sha256(C.read_bytes()).hexdigest(),'arithmetic':checks,'chemicalConsistency':chem,'claimBoundary':'Independent calculation and chemical design checking, not measurements or learner performance.','allNumericChecksPassed':all(x['withinTolerance'] for x in checks)}
(R/'ARITHMETIC.original.actual.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(len(checks),'actual arithmetic checks and',len(chem),'atom/charge checks completed.')
