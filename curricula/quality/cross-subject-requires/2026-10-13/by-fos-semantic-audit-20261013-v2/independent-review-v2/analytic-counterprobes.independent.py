# Apache-2.0. Small independent mathematical reconstructions, no author script execution.
import pathlib,json,math,hashlib,datetime
from fractions import Fraction
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot');OUT=ROOT/'tmp/cross-subject-requires/by-fos-semantic-independent-review-20261013-v2'
checks=[]
def checked(number,statement,calculation,ok=True):
    assert ok,statement
    checks.append({'authorProbeOrdinal':number,'status':'PASS_as_mathematical_claim','independentStatement':statement,'independentCalculation':calculation,'noCurricularScopeOrMasteryInference':True})
det=lambda a:a[0][0]*a[1][1]-a[0][1]*a[1][0]
z=[[0,0],[0,0]]
checked(1,'Zero coefficient matrix and zero right side admit every real two-vector.',{'A':z,'b':[0,0],'det':det(z),'solutionSet':'R^2; both equations identically zero'},det(z)==0)
checked(2,'The same coefficient matrix with right side (1,0) is inconsistent.',{'A':z,'b':[1,0],'firstEquation':'0=1','solutionSet':'empty'})
num=lambda a,b,c:det([[b[r] if j==c else a[r][j] for j in range(2)] for r in range(2)])
values=[[det(z),num(z,b,0),num(z,b,1)] for b in [[0,0],[1,0]]]
checked(3,'All three Cramer determinants vanish in both zero-matrix systems despite different cardinalities.',{'determinantTriples':values,'cardinalities':['infinite','none']},values==[[0,0,0],[0,0,0]])
a=[[1,2],[2,4]]
checked(4,'A dependent nonzero-row system still needs the right-side consistency condition.',{'A':a,'det':det(a),'consistentB':[3,6],'consistentSolutions':'x=3-2s,y=s','inconsistentB':[3,7],'contradiction':'second left side equals twice the first; 7 differs from 2*3'},det(a)==0 and 7!=2*3)
a=[[2,1],[1,-1]];b=[5,1];d=det(a);solution=[Fraction(num(a,b,j),d) for j in range(2)];actual=[sum(Fraction(c)*x for c,x in zip(row,solution)) for row in a]
checked(5,'Cramer gives the correct unique solution for the nonsingular control.',{'A':a,'b':b,'det':d,'solution':list(map(str,solution)),'Ax':list(map(str,actual))},d==-3 and solution==[2,1] and actual==b)
cross=lambda u,v:[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
dot=lambda u,v:sum(x*y for x,y in zip(u,v))
u=[2,0,0];v=[0,3,0];w=cross(u,v)
general_u=[1,2,3];general_v=[2,0,1];general_w=cross(general_u,general_v)
checked(6,'One cross product yields orthogonality and both geometric area meanings, also in a non-axis example.',{'axisExampleProduct':w,'axisParallelogramArea':math.sqrt(dot(w,w)),'axisTriangleArea':math.sqrt(dot(w,w))/2,'generalU':general_u,'generalV':general_v,'generalProduct':general_w,'generalDotProducts':[dot(general_w,general_u),dot(general_w,general_v)],'generalAreaSquared':dot(general_w,general_w)},w==[0,0,6] and general_w==[2,5,-4] and dot(general_w,general_u)==dot(general_w,general_v)==0)
parallel=cross([1,2,3],[2,4,6])
checked(7,'Parallel inputs have zero area; their zero product is not a nonzero normal direction.',{'product':parallel,'area':0,'possibleIndependentNonzeroNormal':[-2,1,0],'boundary':'Constructing a nonzero normal in a degenerate case is a different choice; do not silently treat the zero product as a direction.'},parallel==[0,0,0] and dot([-2,1,0],[1,2,3])==0)
rate=lambda t:3*(t-1)**2-3
values=[[t,rate(t)] for t in [0,1,3]]
checked(8,'The rate has a global minimum at t=1 and its maximum at the endpoint t=3 on [0,3].',{'f':'t^3-3t^2','rate':'3(t-1)^2-3','rateDerivative':'6(t-1)','candidateValues':values,'proof':'Convex quadratic increases with |t-1|; on [0,3] the smallest distance is 0 and the largest is 2.'},values==[[0,0],[1,-3],[3,9]])
checked(9,'The position stationary points differ from the rate minimum.',{'positionDerivativeZeros':[0,2],'rateMinimum':1,'rateAtMinimum':rate(1)},rate(0)==rate(2)==0 and rate(1)==-3)
checked(10,'Zero parameter velocity does not remove a geometric tangent.',{'curve':'r(t)=(t^3,t^6)','parameterDerivativeAt0':[0,0],'eliminatedEquation':'y=x^2','secantSlope':'t^6/t^3=t^3 -> 0','tangentAtOrigin':'y=0','proof':'The elimination gives a regular geometric parabola even though this parametrization stalls at zero.'})
checked(11,'A generic curve point need not have one tangent line.',{'curve':'r(t)=(t,|t|)','leftSecantSlope':-1,'rightSecantSlope':1,'proof':'Two distinct limiting secant directions; no single tangent line at the corner.'})
t=math.pi/2;straight=[t,0];circle=[math.sin(t),1-math.cos(t)]
checked(12,'The same initial directed state and conserved kinetic energy do not identify a time-dependent path.',{'initialR':[0,0],'initialV':[1,0],'mass':1,'straightR':'(t,0)','circleR':'(sin(t),1-cos(t))','speedSquaredBoth':'1','energyBoth':'1/2','time':t,'positions':[straight,circle],'boundary':'Distinct admissible force/constraint models are missing from the energy data.'},not all(math.isclose(x,y) for x,y in zip(straight,circle)))
velocity=[math.cos(t),math.sin(t)];acceleration=[-math.sin(t),math.cos(t)]
checked(13,'The circular acceleration changes direction while doing zero instantaneous work.',{'generalIdentity':'(-sin t)*cos t+(cos t)*sin t=0','actualDot':dot(velocity,acceleration),'constraintMeaning':'Normal force may change the trajectory without changing mechanical energy.'},math.isclose(dot(velocity,acceleration),0,abs_tol=1e-12))
checked(14,'An explicitly added free-motion model provides a constructive bounded time route.',{'assumptions':['Cartesian inertial coordinates','zero resultant force','given initial position and directed velocity'],'solution':'r(t)=r0+v0*t','boundary':'These model facts are conditional task support; no claim that the original goal or current effective prerequisites supplies them.'})
extra={'goalId':'2a253274-dbf7-5a6d-bb60-dac131ada7e8','finding':'The generic provided-F verification clause does not repeat the affine negative-power construction restriction. Its normative reach needs source clarification.','constructiveExample':{'F':'1/(1+x^2)','f':'-2x/(1+x^2)^2','verification':'Quotient/chain differentiation gives F_prime=f. This rational f is not a single affine negative-power family term.','domain':'all real x','scopeBoundary':'Shows why a broader verification task is mathematically possible; does not prove that every such function is officially prescribed.'},'gate':'pending_source_and_complete_route_scope'}
r={'schemaVersion':1,'artifactId':'by-fos-v2-independent-analytical-counterprobe-v1','reviewerAgent':'/root/requires_canonical_review','model':'gpt-6.1-sol','reasoningEffort':'ultra','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'14_mathematical_claims_independently_reconstructed','checks':checks,'additionalScopeProbe':extra,'noAuthorOrActiveFilesChanged':True,'noNativeRequiresSourceScopeApproval':True,'license':'Apache-2.0','ownDidacticAnnotations':'CC-BY-4.0'}
with (OUT/'analytic-counterprobes.independent-v2.json').open('x') as f:json.dump(r,f,ensure_ascii=False,indent=2);f.write('\n')
print(json.dumps({'independentClaims':len(checks),'allMathematicalClaims':'PASS','curricularGates':'pending','extraM215SourceReach':'pending'}))
