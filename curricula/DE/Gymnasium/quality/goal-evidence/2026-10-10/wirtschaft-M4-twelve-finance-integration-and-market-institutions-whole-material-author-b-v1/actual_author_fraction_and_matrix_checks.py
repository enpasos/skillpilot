"""Meaningful own model calculations, not foreign scientific approval."""
from fractions import Fraction as F
from pathlib import Path
import json,hashlib
O=Path(__file__).resolve().parent
C=[]
def check(label,actual,expected):
 ok=actual==expected;C.append({'id':label,'actual':str(actual),'expected':str(expected),'PASS':ok});assert ok,label
check('43A.assets',6+94-4,96);check('43A.equity',96-92,4);check('43A.cashgap',16-6,10)
check('43A.loanEquity',(96+10)-(92+10),4);check('43A.ownerEquity',(96+4)-92,8)
check('43A.bothCashBeforePayout',6+10+4,20)
check('43B.assets',10+70+20-14,86);check('43B.equity',86-88,-2);check('43B.cashgap',15-10,5)
check('43B.loanEquity',(86+5)-(88+5),-2);check('43B.ownerEquity',(86+4)-88,2);check('43B.ownerRemainingGap',15-(10+4),1)
check('d224A.H',9-10,-1);check('d224A.J',13-10,3);check('d224A.cash',18-11,7)
check('d224A.modelShortfallJ',6-3,3);check('d224B.external',12,12);check('d224B.falseSum',12+12,24);check('d224B.trueLoss',12-15,-3)
check('5aeA.buffer',F(25,1000)*800,20);check('5aeA.loan',4*30,120);check('5aeA.excess',150-120,30)
check('5aeB.equity',70-8,62);check('5aeB.totalBefore',50+20,70);check('5aeB.gapBefore',62-70,-8);check('5aeB.gapAfter',62-50,12)
check('5aeB.releaseHeadroomDelta',12-(-8),20);check('5aeB.cashNoDelta',6,6)
check('f0A.forward',80*3,240);check('f0A.spotLow',80*2,160);check('f0A.spotHigh',80*4,320)
check('f0A.traderLow',240-160,80);check('f0A.traderHigh',240-320,-80)
for end,option,forward,cost in ((45,-5,-15,50),(75,10,15,65)):
 check('f0B.option'+str(end),max(end-60,0)-5,option)
 check('f0B.forward'+str(end),end-60,forward)
 check('f0B.cost'+str(end),min(end,60)+5,cost)
check('2a8A.EU',F(6,10)*12,F(72,10));check('2a8A.region',F(4,10)*12,F(48,10));check('2a8A.actualChange',64-60,4)
check('2a8A.controlChange',62-60,2);check('2a8A.conditionalDiff',(64-60)-(62-60),2)
check('2a8B.fund',20*F(1,2),10);check('2a8B.region',20*F(1,2),10);check('2a8B.spent',20*F(9,10),18)
check('1bddA.fund',2000*F(1,100),20);check('1bddA.requests',12+15,27);check('1bddA.excess',27-20,7)
check('1bddA.proportionalA',F(20,27)*12,F(80,9));check('1bddA.proportionalB',F(20,27)*15,F(100,9));check('1bddA.proportionalSum',F(80,9)+F(100,9),20)
check('1c92A.priceChange',12-10,2);check('1c92A.costChange',9-7,2);check('1c92A.marginBefore',10-7,3);check('1c92A.marginAfter',12-9,3)
check('f90A.absolute',120-84,36);check('f90A.relative',F(120-84,120),F(3,10))
check('f90B.first',200-50,150);check('f90B.second',F(4,10)*200-50,30)

G=[]
def matrix(label,m,expectedNE,expectedDominance):
 a=list(dict.fromkeys(k[0] for k in m));b=list(dict.fromkeys(k[1] for k in m));ne=[]
 for x in a:
  for y in b:
   if m[x,y][0]==max(m[u,y][0] for u in a) and m[x,y][1]==max(m[x,v][1] for v in b):ne.append(x+y)
 dom=[]
 for player,actions in ((0,a),(1,b)):
  wins=[]
  for candidate in actions:
   if all(all((m[candidate,y][0]>m[other,y][0] if player==0 else m[x,candidate][1]>m[x,other][1]) for other in actions if other!=candidate) for x in a for y in b):wins.append(candidate)
  dom.append(wins)
 ok=ne==expectedNE and dom==expectedDominance
 G.append({'id':label,'actualMatrix':{x+y:list(v) for (x,y),v in m.items()},'actualPureNE':ne,'actualStrictDominance':dom,'expectedPureNE':expectedNE,'expectedStrictDominance':expectedDominance,'PASS':ok});assert ok,label
matrix('becf.A.dilemma',{('C','C'):(4,4),('C','D'):(0,6),('D','C'):(6,0),('D','D'):(1,1)},['DD'],[['D'],['D']])
matrix('becf.A.rule',{('C','C'):(4,4),('C','D'):(0,3),('D','C'):(3,0),('D','D'):(-2,-2)},['CC'],[['C'],['C']])
matrix('becf.B.coordination',{('A','A'):(5,5),('A','B'):(0,0),('B','A'):(0,0),('B','B'):(3,3)},['AA','BB'],[[],[]])
matrix('becf.B.hawkDove',{('H','H'):(-3,-3),('H','Y'):(5,1),('Y','H'):(1,5),('Y','Y'):(2,2)},['HY','YH'],[[],[]])
matrix('7d4.A.dilemma',{('C','C'):(3,3),('C','D'):(0,5),('D','C'):(5,0),('D','D'):(1,1)},['DD'],[['D'],['D']])
matrix('7d4.B.coordination',{('A','A'):(4,3),('A','B'):(0,0),('B','A'):(0,0),('B','B'):(3,4)},['AA','BB'],[[],[]])
R={'role':'AUTHOR calculations only, no independent science approval','fractionCalculationCount':len(C),'matrixContractCount':len(G),'totalActualChecks':len(C)+len(G),'actualFailures':sum(not c['PASS'] for c in C+G),'fractionChecks':C,'wholeMatrixContracts':G,'actualCandidateSHA256':hashlib.sha256((O/'whole-twelve-local-finance-integration-market.DEEN-readable-two-real-cases.DRAFT-author-v2.json').read_bytes()).hexdigest()}
(O/'actual-own-fraction-and-six-whole-game-matrix-contract-checks.AUTHOR.json').write_text(json.dumps(R,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:R[k] for k in ('fractionCalculationCount','matrixContractCount','totalActualChecks','actualFailures')}))
