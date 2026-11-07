from fractions import Fraction as F
from math import sin,cos,pi,exp,log,sqrt,isclose
from pathlib import Path
import json,datetime
P=Path(__file__).resolve().parent
rows=[]
def check(goal,case,actual,expected,meaning):
 assert actual==expected,(case,actual,expected)
 rows.append(dict(goalNumber=goal,caseId=case,result='checked',actual=actual,interpretation=meaning))
def mm(A,B):
 assert len(A[0])==len(B)
 return [[sum(a*b for a,b in zip(row,col)) for col in zip(*B)] for row in A]
def mv(A,x):return [sum(a*b for a,b in zip(row,x)) for row in A]
def add(A,B,s=1):return [[a+s*b for a,b in zip(ar,br)] for ar,br in zip(A,B)]
check(1,'square-branch-explanation',[(x,(x-2)**2) for x in [5,-1]],[(5,9),(-1,9)],'Both roots satisfy the source equation; explaining the plus/minus branch remains indispensable.')
check(1,'inequality-explanation',[(x,3*(x-1)<=6,x<=3) for x in [-2,3,4]],[(-2,True,True),(3,True,True),(4,False,False)],'Sample boundary check accompanies the general derivation: divide by positive 3, then add 1; no reversed inequality.')
sub=lambda a,b:[x-y for x,y in zip(a,b)]
check(2,'three-roles-in-one-frame',sub([2,0,4],[-1,2,0]),[3,-2,4],'Displacement is B-A, not the position vector of B.')
check(2,'shifted-origin-fixed-displacement',[sub([5,1,4],[2,-1,1]),sub([3,4,4],[2,-1,1]),sub([3,4,4],[5,1,4])],[[3,2,3],[1,5,3],[-2,3,0]],'Subtracting the same origin cancels in Q-P.')
check(3,'directed-claims',[(p,p>F(4,5),1-p<F(1,5)) for p in [F(3,4),F(4,5),F(9,10)]],[(F(3,4),False,False),(F(4,5),False,False),(F(9,10),True,True)],'H0 includes equality; H1 uses the requested population proportion direction. Defect improvement p<.04 is left-sided.')
check(3,'two-sided-and-recoding',1-F(4,5),F(1,5),'p != .5 is two-sided; p>.8 iff q=1-p<.2, with H0 q>=.2.')
T=lambda u:[2*u[0],u[1]]
vecadd=lambda u,v:[a+b for a,b in zip(u,v)]
scale=lambda c,u:[c*a for a in u]
check(4,'stretch-linear',[(T(vecadd(u,v))==vecadd(T(u),T(v)),T(scale(c,u))==scale(c,T(u))) for u,v,c in [([1,-2],[-3,4],-2),([F(1,3),F(2,5)],[0,-1],F(3,7))]],[(True,True),(True,True)],'Symbolic identity: T(u+v)=(2a+2c,b+d)=T(u)+T(v); T(su)=(2sa,sb)=sT(u). Matrix is a descriptive certificate, not an extra learner demand.')
S=lambda u:[u[0],u[1]**2]
check(4,'squared-coordinate',(S(scale(2,[1,1])),scale(2,S([1,1]))),([2,4],[2,2]),'For u=(1,1), S(2u)!=(2)S(u); S(0)=0 is insufficient.')
check(5,'group-composition',[F(9+27,100),F(72+2,100),F(9,10),F(72,90),F(27,90),F(2,10)],[F(36,100),F(74,100),F(9,10),F(8,10),F(3,10),F(2,10)],'Overall B is larger, but A is larger in both strata. This arithmetic does not justify either causal direction.')
check(5,'inspection-base-rate',[200*F(9,10),9800*F(5,100),F(180,670),F(900,1350)],[180,490,F(18,67),F(2,3)],'Posterior denominator counts all flags; sensitivity is a different conditional probability.')
payout=lambda w:0 if w%2 else 5 if w==6 else 2
check(6,'die-payments',([payout(w) for w in range(1,7)],sum(F(1,6) for w in range(1,7) if payout(w)>=2)),([0,2,0,2,0,5],F(1,2)),'Three payout values have probabilities 1/2,1/3,1/6.')
check(6,'diagram-to-event',(F(1,4)+F(1,2)+F(1,4),F(1,2)+F(1,4),0),(1,F(3,4),0),'Discrete support excludes 2; interpolation is invalid.')
check(7,'two-item-check',[(w,w.count('D')) for w in ['GG','GD','DG','DD']],[('GG',0),('GD',1),('DG',1),('DD',2)],'Different ordered outcomes can have the same value; no probabilities are needed.')
check(7,'distance-from-target',([abs(w-3) for w in range(1,7)],[w for w in range(1,7) if abs(w-3)==1]),([2,1,0,1,2,3],[2,4]),'Distance assignment differs structurally from counting defects.')
check(8,'bridge-height-parameter',[[a*(4-x*x) for x in [-2,0,2]] for a in [F(1,2),1]],[[0,2,0],[0,4,0]],'h_a=4a-a*x^2: height scales, zeros and symmetry axis remain fixed; derivative -2ax is consistent, not the sole admissible explanation.')
check(8,'horizontal-family-parameter',[(b,b-3,b+3,9,6) for b in [0,2]],[(0,-3,3,9,6),(2,-1,5,9,6)],'Contextual nonnegative domain moves; peak height and span remain invariant.')
check(9,'exponential-composition',(exp(0),exp(-1)>0,exp(-100)<1e-40),(1.0,True,True),'General derivation: exp(-x^2)>0, derivative -2x exp(-x^2); even function, unique maximum (0,1), limit zero as |x| tends to infinity.')
check(9,'logarithmic-composition',(isclose(log(4-sqrt(3)**2),0,abs_tol=1e-14),4-2**2,log(4-(2-1e-8)**2)<-15),(True,0,True),'General derivation: domain (-2,2), derivative -2x/(4-x^2), maximum ln4, zeros +/-sqrt3; log argument tends to 0+ at both finite boundaries.')
A=[[1,-1,2],[0,3,1]];B=[[2,0,1,3],[1,4,0,-1],[-1,2,2,1]]
check(10,'rectangular-product-and-admissibility',(mm(A,B),len(B[0])==len(A)),([[-1,0,5,6],[2,14,2,-2]],False),'AB is 2x4; BA is undefined because 4!=2. Every one of eight AB entries recalculated.')
U=[[1,2],[0,1]];V=[[2,0],[1,1]]
check(10,'square-products-order-changes-values',(mm(U,V),mm(V,U)),([[4,2],[1,1]],[[2,4],[1,3]]),'All eight entries independently recalculated; equal shape does not imply commutativity.')
check(11,'negative-scalar-rectangular-matrix',[[-2*x for x in r] for r in [[3,-4,0],[F(1,2),-1,5]]],[[-6,8,0],[-1,2,-10]],'Every entry, including fractional and zero entries, receives the same scalar.')
C=[[0,6],[-8,2],[10,-4]]
check(11,'check-submitted-scaling-and-zero',([[F(1,2)*x for x in r] for r in C],[[0*x for x in r] for r in C]),([[0,3],[-4,1],[5,-2]],[[0,0],[0,0],[0,0]]),'All six submitted entries checked; only row3/column1 is wrong. Zero scalar preserves shape.')
A=[[12,5,8],[7,10,4]];B=[[3,2,0],[5,12,1]]
check(12,'aligned-stock-tables',(add(A,B),add(A,B,-1)),([[15,7,8],[12,22,5]],[[9,3,8],[2,-2,3]]),'Position (2,2) means blue size-L stock, so -2 is a comparison, not negative physical stock.')
A=[[4,-2],[0,5]];T=[[1,3],[-4,5]];D=add(T,A,-1)
check(12,'recover-additive-change-and-check-shape',(D,add(A,D)),([[-3,5],[-4,0]],T),'Equal entry count does not permit 1x4 minus 2x2.')
M=[[F(7,10),F(4,10)],[F(3,10),F(6,10)]]
check(13,'two-state-next-period',mv(M,[60,40]),[58,42],'Row destinations and column origins match stated model; totals preserved.')
M=[[F(5,10),F(2,10),F(1,10)],[F(3,10),F(5,10),F(4,10)],[F(2,10),F(3,10),F(5,10)]]
check(13,'three-state-reordered-input',(mv(M,[20,30,50]),mv(M,[50,20,30])),([21,41,38],[32,37,31]),'Wrong data order yields a different still sum-preserving vector; checking total alone cannot pass this rubric.')
check(14,'two-state-weather-graph',[F(8,10)+F(2,10),F(3,10)+F(7,10)],[1,1],'Outgoing dry/wet rows normalize; a loop consumes a day.')
M=[[F(1,2),F(1,2),0],[0,F(1,4),F(3,4)],[1,0,0]]
check(14,'three-state-table-to-graph',([sum(r) for r in M],[(i,j,str(v)) for i,r in enumerate(M) for j,v in enumerate(r) if v]),([1,1,1],[(0,0,'1/2'),(0,1,'1/2'),(1,1,'1/4'),(1,2,'3/4'),(2,0,'1')]),'All five nonzero directed edges match the stated row-origin convention; A->C impossible.')
check(15,'coordinate-table-base',[(round(cos(t)),round(sin(t))) for t in [0,pi/2,pi,3*pi/2,2*pi]],[(1,0),(0,1),(-1,0),(0,-1),(1,0)],'Base angle-coordinate pairs are correct; amplitude1 and angular period2pi.')
t=pi/2;unit=(round(cos(-t)),round(sin(-t)));double=(round(cos(-2*t)),round(sin(-2*t)))
assert unit!=double
rows.append(dict(goalNumber=15,caseId='clockwise-motion-transfer',result='counterexample-to-uniqueness',actual={'at_t_pi_over_2_expected_theta_minus_t':unit,'also_admissible_theta_minus_2t':double},interpretation='Both curves start at (1,0), stay on unit circle, are uniform and clockwise as parameter t increases. The unchanged task does not fix angular rate; theta=-t cannot be required uniquely.'))
check(15,'quarter-turn-start-transfer',[isclose(sin(t+pi/2),cos(t),abs_tol=1e-14) for t in [0,pi/6,pi/2,pi,3*pi/2]],[True]*5,'Angular increment is explicitly t in this third case; quarter-period identity is well posed.')
assert len(rows)==31
(P/'mathematical-crosschecks.json').write_text(json.dumps({'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Small exact arithmetic and algebraic crosschecks; mathematical derivations are reviewer reasoning, not automatic full correctness or learner evidence.','cases':rows},ensure_ascii=False,indent=2,default=str)+'\n')
print(json.dumps({'cases':len(rows),'counterexamples':sum(r['result']=='counterexample-to-uniqueness' for r in rows)}))
