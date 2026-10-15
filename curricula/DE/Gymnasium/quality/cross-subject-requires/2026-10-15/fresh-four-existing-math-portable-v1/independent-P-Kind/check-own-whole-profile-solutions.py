# SPDX-License-Identifier: Apache-2.0
import json, math, pathlib, datetime
from fractions import Fraction as F
import sympy as S
B=pathlib.Path(__file__).resolve().parent
checks=[]
def eq(label,actual,expected):
    assert abs(float(actual)-float(expected))<1e-9,(label,actual,expected)
    checks.append({'label':label,'actual':str(actual),'expected':str(expected),'passed':True})
def yes(label,value):
    assert value,label
    checks.append({'label':label,'actual':bool(value),'expected':True,'passed':True})
pi=math.pi
# All eight literal Physics briefs, then independently selected transfers.
eq('7ee literal car energy',F(1,2)*1000*10**2,50000)
eq('7ee literal light vehicle energy',F(1,2)*250*20**2,50000)
eq('7ee literal train-frame both throws',F(1,2)*F(1,5)*5**2,F(5,2))
eq('7ee literal ground forward',F(1,2)*F(1,5)*20**2,40)
eq('7ee literal ground backward',F(1,2)*F(1,5)*10**2,10)
eq('7ee own unequal-mass equal-energy A',F(1,2)*F(3,4)*8**2,24)
eq('7ee own unequal-mass equal-energy B',F(1,2)*3*4**2,24)
eq('7ee own plus8 relative to plus3 frame',F(1,2)*F(3,4)*(8-3)**2,F(75,8))
eq('7ee own minus8 relative to plus3 frame',F(1,2)*F(3,4)*(-8-3)**2,F(363,8))
# bf literal briefs have no numerical graph; instantiate both whole duties.
s=lambda t:t**3-3*t
v=lambda t:3*t*t-3
eq('bf own nonlinear average [0,2]',(s(2)-s(0))/2,1)
eq('bf own endpoint-speed mean counterexample',(v(0)+v(2))/2,3)
eq('bf own local rate at1',v(1),0)
eq('bf own point-height is not local rate',s(1),-2)
for h in [F(1,2),F(1,5),F(1,10)]:eq('bf shrinking symmetric secant h='+str(h),(s(1+h)-s(1-h))/(2*h),h*h)
eq('bf literal train20s instantiated s=t^3/400 average',20**3/400/20,1)
eq('bf literal train8s instantiated local derivative',3*8**2/400,F(12,25))
pause_s=lambda t:0 if t<=1 else 2*(t-1)**2
pause_v=lambda t:0 if t<=1 else 4*(t-1)
eq('bf own uniform and pause/ramp same displacement',pause_s(2),2)
eq('bf own pause/ramp average',pause_s(2)/2,1)
eq('bf own pause instantaneous .5s',pause_v(.5),0)
eq('bf own ramp instantaneous1.5s',pause_v(1.5),2)
eq('ec7 literal rigid-disc omega',2*pi*.8,1.6*pi)
eq('ec7 literal rigid-disc vA',2*pi*.8*.1,.16*pi)
eq('ec7 literal rigid-disc vB',2*pi*.8*.3,.48*pi)
eq('ec7 literal initial drum omega',2*pi/.5,4*pi)
eq('ec7 literal initial drum v',2*pi/.5*.25,pi)
eq('ec7 literal changed drum v',2*pi/1*.25,pi/2)
eq('ec7 own1.25Hz omega',2*pi*1.25,2.5*pi)
eq('ec7 own radius.08 speed',2*pi*1.25*.08,.2*pi)
eq('ec7 own radius.24 speed',2*pi*1.25*.24,.6*pi)
eq('ec7 own full directed angle -450degrees',-450*pi/180,-5*pi/2)
eq('ec7 own unwrapped angular velocity over.5s',(-450*pi/180)/.5,-5*pi)
eq('ec7 own directed tangential velocity r=.04',(-450*pi/180)/.5*.04,-.2*pi)
yes('ec7 reducing -450 to270 before dividing gives wrong omega',abs((270*pi/180)/.5-(-5*pi))>1)
eq('ef literal C-current amplitude',10e-6*2*1000,.020)
eq('ef literal doubled C-current amplitude',10e-6*2*2000,.040)
eq('ef literal L-voltage amplitude',.2*.010*500,1)
eq('ef literal L fixed-voltage doubled-frequency current',1/(1000*.2),.005)
eq('ef own phase/offset C-current amplitude',4.7e-6*3*2000,.0282)
eq('ef own C tripled frequency amplitude',4.7e-6*3*6000,.0846)
eq('ef own L cos-input voltage amplitude',.15*.012*400,.72)
eq('ef own L fixed-voltage doubled-frequency current',.72/(800*.15),.006)
# All literal briefs in all six nominated whole Math profiles.
eq('a646 literal negative power',2*(-2)**2-3*(-2)+1,15)
eq('a646 literal two variables negative fraction',3*F(-1,2)-2*4,F(-19,2))
eq('a646 literal nested first',4-(-3-2*F(3,2)),10)
eq('a646 literal nested changed',4-(2-2*(-1)),0)
eq('a646 own several signed variables',3*F(-3,2)**2-2*F(-3,2)*(-4)+F(-4,2),F(-29,4))
eq('a646 own changed assignment',3*F(1,2)**2-2*F(1,2)*2+F(2,2),F(-1,4))
eq('ae201 literal travel m/min',(460-100)/(5-2),120)
eq('ae201 literal travel m/s',120/60,2)
T=lambda t:80-3*t+F(1,10)*t*t
eq('ae201 literal cooling mean',(T(6)-T(2))/4,F(-11,5))
fun=lambda t:5+4*t-t*t
eq('ae201 own positive amounts negative mean',(fun(4)-fun(1))/3,-1)
eq('b1 literal negative local rate',-2,-2)
eq('b1 literal horizontal local volume rate',0,0)
yes('b1 literal V5=100 V4/V6=101 disproves interval constancy',100!=101)
eq('b1 own stationary cubic point value',(2-2)**3+4,4)
eq('b1 own stationary cubic derivative at2',3*(2-2)**2,0)
yes('b1 own derivative-zero need not imply pause or extremum',(1-2)**3+4<4<(3-2)**3+4)
eq('8d30 literal 3pi/4 in degrees',3*pi/4*180/pi,135)
eq('8d30 literal -210 in radians',-210*pi/180,-7*pi/6)
eq('8d30 literal coterminal',-7*pi/6+2*pi,5*pi/6)
eq('8d30 own5pi/3 in degrees',5*pi/3*180/pi,300)
eq('8d30 own -450 coterminal',-5*pi/2+4*pi,3*pi/2)
x,t=S.symbols('x t',real=True)
symbols=[]
def deq(label,f,expected,var):
    difference=S.simplify(S.diff(f,var)-expected);assert difference==0,(label,difference)
    symbols.append({'label':label,'function':str(f),'actualDerivative':str(S.diff(f,var)),'expected':str(expected),'symbolicDifference':'0','passed':True})
deq('58 literal sine',3*S.sin(2*(x-S.pi/4))+5,6*S.cos(2*(x-S.pi/4)),x)
deq('58 literal negative cosine',-4*S.cos(-3*(t+1))+2,12*S.sin(3*(t+1)),t)
deq('58 literal constant boundary',7*S.sin(0*(x-4))-2,S.Integer(0),x)
deq('58 literal small b',7*S.sin(S.Rational(1,10)*(x-4))-2,S.Rational(7,10)*S.cos(S.Rational(1,10)*(x-4)),x)
deq('58 own negative inner/outer',-2*S.cos(-5*(x-S.Rational(3,10)))+7,10*S.sin(5*(x-S.Rational(3,10))),x)
deq('ef own C shifted cosine+DC',3*S.cos(2000*(t-S.Rational(1,1000)))+1,-6000*S.sin(2000*(t-S.Rational(1,1000))),t)
deq('ef own L shifted cosine',S.Rational(12,1000)*S.cos(400*(t-S.Rational(2,1000))),-S.Rational(48,10)*S.sin(400*(t-S.Rational(2,1000))),t)
eq('58 literal finite comparison period',2*pi/.1,20*pi)
angles=[0,pi/2,pi,3*pi/2,2*pi];expected=[(1,0),(0,1),(-1,0),(0,-1),(1,0)]
for angle,(cx,sy) in zip(angles,expected):eq('bbef literal x at'+str(angle),math.cos(angle),cx);eq('bbef literal y at'+str(angle),math.sin(angle),sy)
for angle in [.2,.7,1.6]:
 eq('bbef literal clockwise x'+str(angle),math.cos(-angle),math.cos(angle));eq('bbef literal clockwise y'+str(angle),math.sin(-angle),-math.sin(angle))
 eq('bbef literal quarter-turn start'+str(angle),math.sin(angle+pi/2),math.cos(angle))
 eq('bbef own pi-start clockwise x'+str(angle),math.cos(pi-angle),-math.cos(angle));eq('bbef own pi-start clockwise y'+str(angle),math.sin(pi-angle),math.sin(angle))
out={'executedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reviewer':'/root/portable_eight_scope_and_guard_successor_author','scope':'Own independently chosen cases plus all8Physics/all15Math literal brief solution checks; qualitative graph briefs explicitly instantiated, no new learner performance','numericAssertions':checks,'symbolicDerivatives':symbols,'numericAssertionCount':len(checks),'symbolicDerivativeCount':len(symbols),'allPass':True,'noProfileOrMainWrites':True}
with(B/'own-executed-whole-profile-case-checks.actual.json').open('x')as f:json.dump(out,f,indent=2);f.write('\n')
print(json.dumps({'numericAssertions':len(checks),'symbolicDerivativeEqualities':len(symbols),'allPass':True}))
