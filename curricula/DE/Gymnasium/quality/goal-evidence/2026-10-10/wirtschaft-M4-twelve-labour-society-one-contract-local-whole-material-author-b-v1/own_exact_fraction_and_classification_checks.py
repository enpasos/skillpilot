"""Actual AUTHOR calculations from supplied cases, not compiler output or foreign review."""
from fractions import Fraction as F
from pathlib import Path
import json,hashlib
O=Path(__file__).resolve().parent; rows=[]
def check(label,value,expected):
 a=F(value);b=F(expected);rows.append({'caseCheck':label,'actualFraction':str(a),'expectedFraction':str(b),'PASS':a==b});assert a==b,label
check('GKV A present contributions',F(1000)*F(15,100),150)
check('GKV A present revenue',150+20,170)
check('GKV A present gap',190-170,20)
check('GKV A future contributions',F(1100)*F(15,100),165)
check('GKV A future revenue',165+20,185)
check('GKV A future gap',210-185,25)
check('GKV A16% future contributions',F(1100)*F(16,100),176)
check('GKV A16% revenue',176+20,196)
check('GKV A16% gap',210-196,14)
check('GKV A tax option gap',210-(185+10),15)
check('GKV A avoided unnecessary expense gap',(210-10)-185,15)
check('Pension B original contributions',100*30*F(20,100),600)
check('Pension B original benefits',50*12,600)
check('Pension B original balance',600-600,0)
check('Pension B future contributions',90*30*F(20,100),540)
check('Pension B future benefits',60*12,720)
check('Pension B future gap',720-540,180)
check('Pension B required rate',F(720,90*30)*100,F(80,3))
check('Roles A girl share pp',40-10,30)
check('Roles A boy interest pp',25-12,13)
for label,num,den,result in [('Roles B before caring application',4,20,20),('Roles B before other application',12,20,60),('Roles B after caring application',10,20,50),('Roles B after other application',14,20,70),('Roles B before caring admission conditional',2,4,50),('Roles B before other admission conditional',6,12,50),('Roles B after caring admission conditional',5,10,50),('Roles B after other admission conditional',7,14,50),('Roles B before caring whole participation',2,20,10),('Roles B before other whole participation',6,20,30),('Roles B after caring whole participation',5,20,25),('Roles B after other whole participation',7,20,35)]:check(label,F(num,den)*100,result)
L=[1000,1000,3000,3000];M=[1800,1900,2100,2200]
check('Inequality A L mean',F(sum(L),len(L)),2000);check('Inequality A M mean',F(sum(M),len(M)),2000)
check('Inequality A L range',max(L)-min(L),2000);check('Inequality A M range',max(M)-min(M),400)
check('Inequality A L low share',F(sum(x<1500 for x in L),len(L))*100,50);check('Inequality A M low share',F(sum(x<1500 for x in M),len(M))*100,0)
check('Inequality B attainment pp',80-50,30);check('Inequality B guidance pp',70-30,40)
check('Labour A ILO unemployment %',F(100,900+100)*100,10)
check('Labour A registered % supplied compatible denominator',F(120,1200)*100,10)
check('Labour B ILO %',F(80,920+80)*100,8)
check('Labour B register count decline',100-80,20)
check('Labour B register relative decline %',F(100-80,100)*100,20)
check('Labour B treated index change',90-70,20)
check('Labour B comparison index change',86-70,16)
check('Labour B comparison-adjusted index change',(90-70)-(86-70),4)
check('Work meaning A low residual',900-1100,-200);check('Work meaning A high residual',1500-1100,400)
check('Work meaning B retail index %',F(88-100,100)*100,-12);check('Work meaning B tax index %',F(92-100,100)*100,-8)
check('Pay A R job points',2+2+1,5);check('Pay A S job points',3+3+2,8)
check('Pay A R base',14+2*5,24);check('Pay A S base',14+2*8,30)
check('Pay A daily time base',6*24,144)
check('Pay A U piece payment',240*F(60,100),144);check('Pay A V piece payment',300*F(60,100),180)
check('Pay B quality extra',F(120,6),20);check('Pay B profit extra',F(12,100)*1000/6,20)
check('Pay B loss positive-profit extra',F(12,100)*max(-300,0)/6,0)
check('Culture A satisfaction pp',74-58,16);check('Culture A suggestions ratio',F(24,12),2);check('Culture A complaints pp',4-5,-1)
check('Culture B period1 profit',1000-900,100);check('Culture B period2 profit',1100-1050,50)
check('Culture B profit change',50-100,-50);check('Culture B revenue change',1100-1000,100);check('Culture B satisfaction pp',55-70,-15)
for label,a,b,e in [('Life A industry pp',25,45,-20),('Life A services pp',65,45,20),('Life A digital pp',70,20,50),('Life A couples pp',35,50,-15),('Life A one-person pp',40,25,15),('Life A education pp',45,15,30),('Life B remote pp',45,20,25),('Life B shifting schedules pp',35,30,5),('Life B couples pp',32,40,-8),('Life B one-person pp',38,30,8),('Life B education pp',30,10,20)]:check(label,a-b,e)
check('Life A earlier industry partition',45+45+10,100);check('Life A later industry partition',25+65+10,100)
check('Life A earlier households',50+25+25,100);check('Life A later households',35+40+25,100)
check('Life B earlier households',40+30+30,100);check('Life B later households',32+38+30,100)
check('Life B remote access ratio',F(25,45),F(5,9));check('Life B remote access missing count',45-25,20)
classification=[
 {'case':'Labour A person A','paidWeeklyHours':8,'activeSearch':True,'registered':True,'availableWeeklyHours':20,'actualILO':'employed','actualRegister':'unemployed under all stated other conditions','reason':'Reference-week paid work meets ILO, while below15 hours can meet supplied national employmentlessness and other actual conditions.'},
 {'case':'Labour A person B','paidWeeklyHours':0,'activeSearch':True,'registered':False,'availableWithinTwoWeeks':True,'actualILO':'unemployed','actualRegister':'not registered unemployed','reason':'Actual search/availability but no registration.'},
 {'case':'Labour A person C','paidWeeklyHours':0,'activeSearch':False,'actualILO':'outside labour force','actualRegister':'no eligible status inferred','reason':'Search condition not fulfilled; no invented missing evidence.'},
 {'case':'Labour B20 program entrants','actualILO':'remain unemployed under supplied search/availability and no paid work','actualRegister':'excluded by supplied section16(2)','reason':'Registration classification change is not job creation.'},
 {'case':'Contracts A23/27','actual':'23 conflicts with binding25;27 more favourable permitted in stated otherwise identical situation','reason':'Direct binding and scope given; individual agreement cannot displace the mandatory25.'},
 {'case':'Contracts B24/26','actual':'Unbound published industry26 alone does not replace24; changed binding/scope makes26 mandatory','reason':'No assumed extension, incorporation or continuing effect.'}]
body=O/'whole-twelve-labour-society-DEEN-readable-two-case-one-contract.DRAFT-author-v1.json'
out={'role':'own actual AUTHOR calculations and classifications, no independent scientific approval','wholeBodySha256':hashlib.sha256(body.read_bytes()).hexdigest(),'actualFractionCheckCount':len(rows),'actualFractionErrors':sum(not r['PASS'] for r in rows),'checks':rows,'actualOwnRuleClassificationCount':len(classification),'individualOwnClassifications':classification,'noActualGermanObservationOrCompleteIndividualLegalAdviceClaim':True}
p=O/'actual-own-exact-fraction-and-six-rule-classification-author-checks.json';assert not p.exists();p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'actualFractionChecks':len(rows),'errors':0,'actualRuleClassifications':len(classification)}))
