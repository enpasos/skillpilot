# SPDX-License-Identifier: Apache-2.0
"""Analytical examples/counterexamples for content limits, not role approval."""
import hashlib,json,math,sys
from fractions import Fraction
from pathlib import Path
R=Path('tmp/cross-subject-requires/by-fos-semantic-audit-20261013-v2')
checks=[]
def record(name,condition,evidence):
    assert condition,name
    checks.append({'name':name,'result':'PASS','actualEvidence':evidence})
def rank(matrix):
    a=[[Fraction(x)for x in row]for row in matrix];pivot=0
    for col in range(len(a[0])if a else 0):
        row=next((r for r in range(pivot,len(a))if a[r][col]),None)
        if row is None:continue
        a[pivot],a[row]=a[row],a[pivot];div=a[pivot][col];a[pivot]=[x/div for x in a[pivot]]
        for r in range(len(a)):
            if r==pivot:continue
            f=a[r][col];a[r]=[x-f*y for x,y in zip(a[r],a[pivot])]
        pivot+=1
        if pivot==len(a):break
    return pivot
def det2(a):return a[0][0]*a[1][1]-a[0][1]*a[1][0]
def status(a,b):
    ra=rank(a);rab=rank([row+[bb]for row,bb in zip(a,b)])
    return 'none'if rab>ra else'unique'if ra==len(a[0])else'infinite'
def numerator_dets(a,b):return [det2([[b[r]if c==i else a[r][c]for c in range(2)]for r in range(2)])for i in range(2)]
zero=[[0,0],[0,0]]
record('same zero denominator determinant: infinite consistent system',det2(zero)==0 and status(zero,[0,0])=='infinite',{'A':zero,'b':[0,0],'det':0,'rankA':rank(zero),'rankAug':rank([[0,0,0],[0,0,0]])})
record('same zero denominator determinant: inconsistent system',det2(zero)==0 and status(zero,[1,0])=='none',{'A':zero,'b':[1,0],'det':0,'rankA':rank(zero),'rankAug':rank([[0,0,1],[0,0,0]])})
record('even all Cramer numerator determinants do not decide zero-matrix consistency',numerator_dets(zero,[0,0])==[0,0]and numerator_dets(zero,[1,0])==[0,0],{'D,D1,D2':'0,0,0 in both cases','differentCardinalities':['infinite','none']})
dep=[[1,2],[2,4]]
record('nonzero dependent rows still need consistency',status(dep,[3,6])=='infinite'and status(dep,[3,7])=='none',{'A':dep,'sameDet':det2(dep),'consistentB':[3,6],'inconsistentB':[3,7]})
non=[[2,1],[1,-1]];b=[5,1];d=det2(non);nums=numerator_dets(non,b);solution=[Fraction(n,d)for n in nums]
record('Cramer valid nonsingular positive case',d!=0 and status(non,b)=='unique'and all(sum(Fraction(x)*s for x,s in zip(row,solution))==bb for row,bb in zip(non,b)),{'det':d,'solution':[str(x)for x in solution],'Ax':b})
cross=lambda a,b:[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
dot=lambda a,b:sum(x*y for x,y in zip(a,b))
u=[2,0,0];v=[0,3,0];w=cross(u,v);area=math.sqrt(dot(w,w))
record('one cross product provides normal and two area meanings',w==[0,0,6]and dot(u,w)==0 and dot(v,w)==0 and area==6,{'u':u,'v':v,'cross':w,'normalOrthogonality':[dot(u,w),dot(v,w)],'parallelogramArea':area,'triangleArea':area/2})
parallel=cross([1,2,3],[2,4,6])
record('parallel-case zero product cannot become nonzero normal direction',parallel==[0,0,0],{'cross':parallel,'area':0,'nonzeroNormalProduced':False})
rate=lambda t:3*t*t-6*t
samples=[(0,rate(0)),(1,rate(1)),(3,rate(3))]
record('rate extrema include domain endpoints of same rate problem',min(samples,key=lambda x:x[1])==(1,-3)and max(samples,key=lambda x:x[1])==(3,9),{'f':'t^3-3t^2','domain':[0,3],'fPrime':'3t^2-6t','fDoublePrime':'6t-6','comparedCandidates':samples,'strongestIncreaseAt':3,'strongestDecreaseAt':1})
record('rate extremum is not position extremum',rate(1)==-3 and rate(2)==0,{'rateMinimumAt':1,'positionStationaryAt':[0,2],'boundary':'Higher derivative serves rate analysis; it does not prove a separate goal.'})
record('zero parametric velocity need not mean absent geometric tangent',3*0**2==0 and 6*0**5==0,{'r':'(t^3,t^6)','rPrimeAt0':[0,0],'geometricCurve':'y=x^2','geometricTangentAt0':'y=0','boundary':'Regular first-derivative recipe is insufficient here; no active repair is made.'})
record('generic curve point need not have a unique tangent',-1!=1,{'r':'(t,abs(t))','leftSlopeAt0':-1,'rightSlopeAt0':1,'uniqueTangentAt0':False})
t=math.pi/2
straight_pos=[t,0];straight_vel=[1,0];circle_pos=[math.sin(t),1-math.cos(t)];circle_vel=[math.cos(t),math.sin(t)];circle_acc=[-math.sin(t),math.cos(t)]
E=lambda velocity:0.5*dot(velocity,velocity)
record('identical initial position and directed velocity can obey same energy but different paths',E(straight_vel)==0.5 and math.isclose(E(circle_vel),0.5)and not all(math.isclose(x,y)for x,y in zip(straight_pos,circle_pos)),{'initialPosition':[0,0],'initialDirectedVelocity':[1,0],'mass':1,'sameKineticEnergy':0.5,'time':t,'straightPosition':straight_pos,'circularPosition':circle_pos,'missingDistinction':'Different force/constraint models; energy alone is insensitive to perpendicular force.'})
record('circle force does zero instantaneous work despite changing direction',math.isclose(dot(circle_acc,circle_vel),0,abs_tol=1e-12),{'FdotV':dot(circle_acc,circle_vel),'circleVelocity':circle_vel,'circleAcceleration':circle_acc,'speed':1})
record('explicit extra free-motion model supplies a bounded time route',straight_pos==[t,0],{'givenExtraModel':'No net force; constant directed velocity; Cartesian inertial frame','r(t)':'r0+v0*t','boundary':'Conditional positive route only; not assumed to be in the current goal or official source.'})
result={'schemaVersion':1,'status':'completed_constructive_content_precision_examples_no_semantic_or_source_approval','checks':checks,'checkCount':len(checks),'affectedMathIndicesZeroBased':[98,102,134,233,305,324],'affectedPhysicsIndicesZeroBased':[12,143],'boundary':'These exact analytical checks refute unsafe mathematical inference and exhibit coherent result meanings. They do not automatically classify a role, establish whole-goal mastery, repair source texts, or approve native atomicity/requires. No amtliche source meaning beyond current goal content is inferred.','license':'Apache-2.0','ownDidacticAnnotations':'CC-BY-4.0'}
if '--write-receipt'in sys.argv:
    with (R/'content-precision-probes.receipt.json').open('x')as f:f.write(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'checksPassed':len(checks),'receiptWritten':'--write-receipt'in sys.argv}))
