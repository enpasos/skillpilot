"""Independent numeric/geometry checks; no author checker imported or executed."""
import math,json,datetime,hashlib,itertools
from pathlib import Path
B=Path(__file__).parent
results=[]
def eq(label,value,want,rel=1e-9,abs_tol=1e-12):
    assert math.isclose(value,want,rel_tol=rel,abs_tol=abs_tol),(label,value,want)
    results.append({'label':label,'actual':value,'expected':want})
def mean(a):return sum(a)/len(a)
def half(a):return (max(a)-min(a))/2
def cross(a,b):return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
# Task9 signed conservation, rather than only total absolute magnitudes.
eq('9 cloth charge nC',0-(-6),6);eq('9 missing third body nC',3-5-2,-4)
eq('9 sphere gain nC',-1-3,-4);eq('9 environment gain nC',-(-1-3),4)
# Task10 geometry, potential and material transfer.
eps0=8.85e-12
eq('10 E N/C',160/.004,40000);eq('10 C F',eps0*.04/.004,88.5e-12)
eq('10 ordered potential V',-40000*(.003-.001),-80)
eq('10 positive charge potential energy J',3e-9*(-80),-240e-9)
eq('10 oblique potential V',-20000*.006*math.cos(math.pi/3),-60)
eq('10 changed C F',eps0*.02/.008,22.125e-12)
# Task11 construct potentials from definitions; no reuse of solution functions.
for x,w in [(-.2,80),(0,20),(.2,-40)]:eq('11 uniform phi at '+str(x),20-300*x,w)
eq('11 spherical ordered potential V',6/.3-6/.1,-40)
for phi,r in [(60,.1),(50,.12),(40,.15),(30,.2)]:eq('11 independent equal-step radius',6/phi,r)
# Task12 vector addition and orientation.
eq('12 opposed E',240-390,-150);eq('12 orthogonal E',math.hypot(-180,240),300)
eq('12 quadrant II angle deg',math.degrees(math.atan2(240,-180)),126.86989764584402)
# Task13 signed capacitor boundary current and separate parameter changes.
eq('13 mean current A',.00012/3,40e-6);eq('13 initial charging A',12/200000,60e-6)
eq('13 discharge A',-12/200000,-60e-6);eq('13 tau s',200000*10e-6,2)
eq('13 reversed-voltage changed-R current A',12/400000,30e-6)
eq('13 doubledR halvedC tau s',400000*5e-6,2)
# Task14 signed RC model and unrelated physical first-order state.
eq('14 tau s',400000*5e-6,2);eq('14 k inverse s',-1/(400000*5e-6),-.5)
eq('14 initial resistor current A',8/400000,20e-6);eq('14 U(tau)',8*math.exp(-1),2.9430355293715387)
eq('14 changed reference tau',800000*5e-6,4);eq('14 N initial derivative',-.25*1200,-300)
# Task15 balance of independent effective gravity and electrical force.
for f,n in [(3.2e-14,2),(4.8e-14,3),(6.4e-14,4)]:eq('15 positive multiplicity',f/1e5/1.6e-19,n)
eq('15 reversed field signed multiplicity',9.6e-14/(-2e5)/1.6e-19,-3)
assert 2.5e-19<2*1.6e-19<5.5e-19 and 2.5e-19<3*1.6e-19<5.5e-19
# Task16 individual infinite sheets, sum and conserved total charge.
eq('16 one sheet E',8.85e-7/(2*eps0),50000);eq('16 inside sum E',8.85e-7/eps0,100000)
eq('16 doubled area E',8.85e-7/(2*eps0),50000)
eq('16 dielectric E',8.85e-7/(2*eps0*3),16666.666666666668)
eq('16 inverse charge C',-.40e-6*.03,-12e-9)
# Task17 fixed voltage and fixed free charge are different experiments.
C0=40e-12;U0=100;Q=C0*U0
eq('17 initial charge C',Q,4e-9);eq('17 epsilon F/m',eps0*4,3.54e-11)
for er,cu,ui,ei,qc in [(4,160e-12,25,12500,16e-9),(2,80e-12,50,25000,8e-9)]:
 eq('17 C er'+str(er),C0*er,cu);eq('17 isolated U er'+str(er),Q/(C0*er),ui)
 eq('17 isolated E er'+str(er),Q/(C0*er)/.002,ei);eq('17 source charge er'+str(er),C0*er*U0,qc)
# Task18 field energy and system-boundary work.
eq('18 flash Q C',100e-6*200,.020);eq('18 flash W J',100e-6*200**2/2,2)
eq('18 source loss J',5-2,3);eq('18 light J',.7*2,1.4);eq('18 heat J',.3*2,.6)
qi=20e-6*50;w0=20e-6*50**2/2
wf=40e-6*50**2/2;wi=qi**2/(2*40e-6);ws=50*(40e-6*50-qi)
eq('18 fixedU W J',wf,.05);eq('18 fixedQ W J',wi,.0125)
eq('18 fixedU mechanical output J',ws-(wf-w0),.025);eq('18 fixedQ mechanical output J',w0-wi,.0125)
eq('18 disconnected motor fixedU J',.6*wf,.030);eq('18 disconnected motor fixedQ J',.6*wi,.0075)
# Task19 and20: actual population imbalance, frequency map, two inverse measurements.
eq('19 net z excess',5001-4999,2)
for r,tanj,J,coef,Bh,mu in [(.3,2/9,2.7e-5,2e-7,30e-6,.9),(.2,.5,6.4e-5,1e-7,40e-6,1.6)]:
 R=r**3*tanj/coef;P=4*math.pi**2*J/(2*math.pi)**2
 eq('20 field T',math.sqrt(P/R),Bh);eq('20 moment Am2',math.sqrt(P*R),mu)
# Task21: explicit sampled points, electric negative charge and magnetic directions.
assert [(2*t,4*u) for t,u in enumerate([-2,0,2,0])]==[(0,-8),(2,0),(4,8),(6,0)]
assert [(t,-4*u) for t,u in enumerate([0,1,-1,0])]==[(0,0),(1,-4),(2,4),(3,0)]
assert cross([1,0,0],[0,0,1])==[0,-1,0] # electron force opposite, +y
# Task22: derive beta from energy rather than checking gamma*v arithmetic.
eq('22 proton speed',math.sqrt(2*10*1000*1.6e-19/1.67e-27),1.384e6,rel=3e-4)
eq('22 classical electron beta',math.sqrt(2*1000/511),1.978,rel=3e-4)
gam=1+1000/511
eq('22 electron gamma',gam,2.9569471624266144);eq('22 electron beta',math.sqrt(1-1/gam**2),.94108,rel=3e-6)
eq('22 final wrong gap keV',9*100-100,800)
eq('22 independent gamma',1/math.sqrt(1-.6**2),1.25);eq('22 independent p/mc',1.25*.6,.75)
# Task23 Hall sign and pair reversal offset extraction.
eq('23 electron Hall V',.020*.2/(1e22*(-1.6e-19)*.0005),-.005)
eq('23 reversal offset V',(-.00490+.00510)/2,.0001)
eq('23 reversal field T',((-.00490-.00510)/2)/(-.025),.2)
eq('23 positive double-thickness V',.020*.2/(1e22*1.6e-19*.001),.0025)
# Task24/25 signs can be constructed from concrete components.
eq('24 oblique F N',.4*2*.120*math.sin(math.pi/6),.048)
assert cross([1,0,0],[math.cos(math.pi/6),math.sin(math.pi/6),0])[2]>0
eq('24 field slope T',((.098-.002)/2)/.120,.4);eq('24 biased raw T',.05/.120,5/12)
eq('25 torque Nm',.160*.075*math.sin(math.pi/6),.006)
assert cross([math.cos(math.pi/6),math.sin(math.pi/6),0],[1,0,0])[2]<0
eq('25 maximum torque Nm',.160*.075,.012)
# Separate SekI16bfb control data: the actual own measurement has no invented expected result.
for label,a,m,h in [('P',[19.8,20.2,20,20.1,19.9],20,.2),('Q',[21.2,21.2,21.1,21.2,21.3],21.2,.1),('all',[20,20.1,24,20,19.9],20.8,2.05),('filtered',[20,20.1,20,19.9],20,.1),('slow',[22,22.1,21.9],22,.1),('fast',[26,26.1,25.9],26,.1)]:
 eq('SekI '+label+' mean',mean(a),m);eq('SekI '+label+' half-range',half(a),h)
eq('SekI offset K',mean([21.2,21.2,21.1,21.2,21.3])-20,1.2)
eq('SekI sampling peak gap K',26-22,4)
B.joinpath('own-numeric-checks.actual.json').write_text(json.dumps({'reviewer':'/root/physics_release_finish','executedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'independentOfAuthorChecks':True,'passed':len(results),'results':results},ensure_ascii=False,indent=2)+'\n')
print('Independent numeric/geometry assertions passed:',len(results))
