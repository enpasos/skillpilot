"""Exact author calculation checks on the actual supplied two-case figures."""
import json
from pathlib import Path
from fractions import Fraction as F
O=Path(__file__).resolve().parent;R=[]
def c(case,label,actual,expected):
 actual,expected=F(actual),F(expected);assert actual==expected,(case,label,actual,expected)
 R.append(dict(case=case,label=label,actualRational=str(actual),expectedRational=str(expected),pass_=True))
def q(case,label,v,rounded):
 actual=F(v);assert round(float(actual),2)==float(rounded),(case,label,actual,rounded)
 R.append(dict(case=case,label=label,actualRational=str(actual),roundedTwoDecimal=str(rounded),pass_=True))
for label,v,z in [('E distribution',F(10)*F(30,100),3),('zero distribution',0,0),('guaranteed residual',25-min(25,15),10),('B debt residual',18-min(18,12),6),('partial guarantee residual',18-5,13)]:c('c4f',label,v,z)
for case,vals,ex in [('service A',[F(48,120),F(24,50),F(24,240)],[F(2,5),F(12,25),F(1,10)]),('manufacturer A',[F(240,800),F(40,250),F(40,400)],[F(3,10),F(4,25),F(1,10)]),('retail B',[F(125,500),F(30,100),F(30,1500)],[F(1,4),F(3,10),F(1,50)]),('consulting B',[F(75,150),F(30,60),F(30,300)],[F(1,2),F(1,2),F(1,10)]),('retail variant',[F(125,500),F(15,100),F(15,1500)],[F(1,4),F(3,20),F(1,100)])]:
 for i,(x,y) in enumerate(zip(vals,ex)):c('ae7 '+case,['equity ratio','ROE','margin'][i],x,y)
def npv(a,b):return F(-100)+F(a)/F(11,10)+F(b)/F(11,10)**2
for label,a,b,static,z in [('A',90,20,5,'-1.65'),('B',30,80,5,'-6.61'),('A low',70,20,-5,'-19.83'),('C',65,65,15,'12.81'),('D resale',55,80,F(35,2),'16.12'),('D zero',55,55,5,'-4.55')]:
 c('8e8',label+' static',F(a+b-100,2),static);q('8e8',label+' NPV',npv(a,b),z)
q('8e8','A payment sensitivity',npv(70,20)-npv(90,20),'-18.18')
for label,x,z in [('A assets',6000+2500+1500,10000),('A equity',10000-4500,5500),('A variant',6000+2500+1000,9500),('A variant equity',9500-4500,5000),('B assets',4000+2000+1000,7000),('B debt',3000+1500,4500),('B equity',7000-4500,2500),('B received cash',1000+500,1500),('B remaining receivables',2000-500,1500),('B after assets',4000+1500+1500,7000)]:c('04c',label,x,z)
for label,x,z in [('A expense',4000+3000+1000+500,8500),('A profit',10000-8500,1500),('A cash',8500+300-8000,800),('B expense',2500+2800+1000+200,6500),('B profit',6000-6500,-500),('B cash',6000+1000-6500,500),('B variant profit',6500-6500,0),('B variant cash',6500+1000-6500,1000)]:c('9a1',label,x,z)
for label,x,z in [('procurement released',30-8,22),('internal cash',45+5,50),('after acquisition',50-40,10),('due bills gap',15-10,5),('book loss',20-30,-10),('replacement shortfall',25-20,5),('bike capacity',F(240,20),12),('double-demand time',24*20,480),('bike revenue',12*8,96),('bike variable costs',12*3,36),('bike profit',96-36-20,40),('kit cleaning',12*10,120),('kit available',15-4,11),('kit shortage',12-11,1),('stakeholder lost jobs',10-4,6)]:c('local process',label,x,z)
q('8328','manufacturing mean',F(7801230,198362),'39.33');q('8328','trade mean',F(6017332,538248),'11.18')
q('8328','manufacturing rounded craft percent',F(86,210)*100,'40.95');q('8328','construction rounded craft percent',F(253,388)*100,'65.21');q('8328','construction after percent',F(250,388)*100,'64.43');q('8328','construction percentage-point change',F(250-253,388)*100,'-0.77')
for label,x,z in [('GuV before margin',F(9,150),F(3,50)),('GuV after margin',F(18,150),F(3,25)),('capital total',90+210,300),('equity share',F(90,300),F(3,10)),('debt share',F(210,300),F(7,10)),('changed total',110+190,300),('changed equity',F(110,300),F(11,30)),('changed debt',F(190,300),F(19,30)),('delivery before',F(450,500),F(9,10)),('delivery after',F(460,500),F(23,25)),('delivery pp',(F(460,500)-F(450,500))*100,2),('additional timely deliveries',460-450,10)]:c('representations',label,x,z)
ordinal=[dict(case='273 A',actualIndependentSupplierCounts=[1,3,60],classification=['monopoly','oligopoly','many-supplier market'],reason='Eight outlets of one owner remain one independent supplier.'),dict(case='273 B',actualIndependentSupplierCounts=[1,4,35],classification=['monopoly','oligopoly','many-supplier market'],reason='One intermediary platform is not necessarily the only goods supplier; market boundary supplied.'),dict(case='837 historical properties',tested=['acceptance','divisibility','durability','portability','institutional change'],reason='Each separately needed property is explicit in both cases; denominations do not imply cutting notes/coins and later paper is no inevitable progression.')]
p=O/'actual-own-exact-finance-data-rational-and-three-classification-checks.AUTHOR.json';assert not p.exists();p.write_text(json.dumps(dict(role='AUTHOR actual own rational/rounded and classification checks, not foreign science',actualRationalChecks=len(R),actualClassificationChecks=len(ordinal),checksErrors=0,rationalChecks=R,classificationChecks=ordinal),ensure_ascii=False,indent=2)+'\n');print(json.dumps({'rationalChecks':len(R),'classificationChecks':len(ordinal),'errors':0}))
