"""Reviewer-authored checks. Does not import or execute author verification code."""
from pathlib import Path
from fractions import Fraction
import hashlib,json,math
import sympy as s
O=Path(__file__).resolve().parent
I=O.parent/'cone-asymptotic-complex-four-whole-forms-20261104-v1'
checks=[]
def check(name,condition,evidence):
    assert bool(condition),(name,evidence)
    checks.append({'name':name,'result':'PASS','evidence':str(evidence)})
# Polygon areas calculated independently via shoelace coordinates.
rows=[(4,'32.000','64.000','96.000','192.000'),(8,'45.255','53.019','135.765','159.057'),(16,'48.983','50.922','146.949','152.766'),(32,'49.943','50.428','149.829','151.284')]
lastgap=1e9
for n,inner,outer,vi,vo in rows:
    def polygon_area(radius):
        pts=[(radius*math.cos(2*math.pi*k/n),radius*math.sin(2*math.pi*k/n)) for k in range(n)]
        return abs(sum(pts[k][0]*pts[(k+1)%n][1]-pts[k][1]*pts[(k+1)%n][0] for k in range(n)))/2
    ai=polygon_area(4)
    ao=polygon_area(4/math.cos(math.pi/n))
    check(f'cone/{n}/base-rounding',abs(ai-float(inner))<.0005 and abs(ao-float(outer))<.0005,{'shoelaceInner':ai,'shoelaceOuter':ao})
    check(f'cone/{n}/supplied-volume-arithmetic',3*Fraction(inner)==Fraction(vi) and 3*Fraction(outer)==Fraction(vo),(vi,vo))
    check(f'cone/{n}/containment-and-gap',3*ai<48*math.pi<3*ao and 3*(ao-ai)<lastgap,3*(ao-ai))
    lastgap=3*(ao-ai)
n=s.symbols('n',positive=True)
check('cone/both-general-base-limits',s.limit(8*n*s.sin(2*s.pi/n),n,s.oo)==16*s.pi and s.limit(16*n*s.tan(s.pi/n),n,s.oo)==16*s.pi,'Both tend to 16*pi; h/3=3 is fixed, so both volumes tend to 48*pi.')
check('cone/volume-rounding',round(48*math.pi,2)==150.80,48*math.pi)
check('cone/finite-data-not-convergence-proof',True,'Numerical checks are supporting checks only. The review uses geometric containment and shrinking polygon-circle difference; it does not derive an infinite limit solely from four rows.')
x=s.symbols('x',real=True)
for name,expr,direction,value in [('positive-cubic',x**3/s.exp(x),s.oo,0),('positive-reciprocal',s.exp(x)/x**3,s.oo,s.oo),('negative-odd',x**3*s.exp(x),-s.oo,0),('negative-even',x**4*s.exp(x),-s.oo,0),('transfer-polynomial',(3*x*x-4*x+1)*s.exp(-x),s.oo,0),('transfer-denominator',s.exp(x)/(x**3+1),s.oo,s.oo)]:
    check('asymptotic/'+name,s.limit(expr,x,direction)==value,{'expression':str(expr),'direction':str(direction),'limit':str(value)})
check('asymptotic/finite-comparison',math.exp(1)>1 and math.exp(4)<64 and math.exp(20)>8000,[math.exp(t) for t in [1,4,20]])
u=s.symbols('u',positive=True)
check('asymptotic/negative-substitution',s.simplify((x**3*s.exp(x)).subs(x,-u)+u**3/s.exp(u))==0 and s.simplify((x**4*s.exp(x)).subs(x,-u)-u**4/s.exp(u))==0,'Odd negative / even positive for all u>0, and positive-direction limits apply.')
check('asymptotic/inequality-transfer',True,'For fixed positive integer n, choose m=n+1 in the provided inequality. Divide by positive e^x*x, giving 0 <= x^n/e^x <= (n+1)!/x. This proves the squeeze for every fixed n; m=n merely gives a constant bound and is insufficient.')
check('asymptotic/alternate-valid-bound',s.limit(120/x**2,x,s.oo)==0,'Using m=5 for x^3/e^x gives 120/x^2; must receive the same method credit.')
roots=[s.Integer(1),s.Rational(1,2)+s.sqrt(3)*s.I/2,-s.Rational(1,2)+s.sqrt(3)*s.I/2,s.Integer(-1),-s.Rational(1,2)-s.sqrt(3)*s.I/2,s.Rational(1,2)-s.sqrt(3)*s.I/2]
z=s.symbols('z')
for k,r in enumerate(roots):
    check(f'unity/{k}/equation-modulus',s.simplify(r**6)==1 and s.simplify(r*s.conjugate(r))==1,str(r))
    check(f'unity/{k}/rotation',s.simplify(r*roots[1]-roots[(k+1)%6])==0,'Multiply by 1/2+i*sqrt(3)/2 rotates to the next point, including wraparound.')
check('unity/complete-factorisation',s.simplify(s.prod(z-r for r in roots)-(z**6-1))==0,'The six distinct listed roots exhaust z^6-1; no multiplicity or missing-root issue.')
check('unity/cubic-subset',[k for k,r in enumerate(roots) if s.simplify(r**3)==1]==[0,2,4],'k=0,2,4; not all sixth roots are third roots.')
check('unity/fourth-transfer',s.expand(s.prod(z-r for r in [1,s.I,-1,-s.I]))==z**4-1,'1, i, -1, -i; square on axes.')
check('unity/hexagon-side-lengths',all(s.simplify((roots[(k+1)%6]-r)*s.conjugate(roots[(k+1)%6]-r))==1 for k,r in enumerate(roots)),'All six squared adjacent distances equal 1; each radius equals 1.')
quotients=[(3+4*s.I,1-2*s.I,-1+2*s.I),(2-3*s.I,1+2*s.I,-s.Rational(4,5)-s.Rational(7,5)*s.I),(4-2*s.I,2*s.I,-1-2*s.I),(1,2+s.I,s.Rational(2,5)-s.I/5)]
for k,(a,b,q) in enumerate(quotients,1):
    check(f'division/{k}/inverse-product',s.expand(q*b)==a,{'numerator':str(a),'denominator':str(b),'quotient':str(q)})
    check(f'division/{k}/conjugate-denominator',s.im(s.expand(b*s.conjugate(b)))==0 and s.re(s.expand(b*s.conjugate(b)))>0,s.expand(b*s.conjugate(b)))
check('division/false-component-rule',s.expand((3-2*s.I)*(1-2*s.I))==-1-8*s.I,'-1-8i differs from 3+4i, so the claimed quotient is false.')
a,b,c,d=s.symbols('a b c d',real=True)
check('division/general-conjugate-identity',s.expand((a+b*s.I)*(c-d*s.I)-(a*c+b*d+(b*c-a*d)*s.I))==0 and s.expand((c+d*s.I)*(c-d*s.I))==c*c+d*d,'For c+di != 0, denominator c^2+d^2>0 and quotient is (ac+bd)/(c^2+d^2)+i(bc-ad)/(c^2+d^2).')
for f in json.loads((I/'content-review-handoff.json').read_text())['forms']:
    e=json.loads((I/f['goalId']/'whole-form-content.draft.json').read_text())['examDataContent']
    check(f['key']+'/single-score',sum(t['points'] for t in e['scoring']['steps'])==20 and e['scoring']['passingPoints']==15,'20 total, one threshold at 15, cap text embedded in both actual solutionContent fields.')
    check(f['key']+'/no-prerequisite-coverage',e['coveredGoalIds']==[f['goalId']],e['coveredGoalIds'])
    for lang,suffix in [('de',''),('en','En')]:
        task=(I/f['goalId']/f'task.{lang}.md').read_text()
        solution=(I/f['goalId']/f'solution.{lang}.md').read_text()
        rubric=(I/f['goalId']/f'rubric.{lang}.md').read_text()
        check(f['key']+'/'+lang+'/field-fidelity',e['taskContent'+suffix]==task and solution.strip() in e['solutionContent'+suffix] and rubric.strip() in e['solutionContent'+suffix],'Standalone task, full solution and cap rubric present in exact draft fields.')
manualNames={'cone/finite-data-not-convergence-proof','asymptotic/inequality-transfer'}
manualArguments=[c for c in checks if c['name'] in manualNames]
checks=[c for c in checks if c['name'] not in manualNames]
report={'manualArguments':manualArguments,'manualArgumentCount':len(manualArguments),'status':'PASS_REVIEWER_INDEPENDENT_MATHEMATICS_AND_FIELD_CHECKS','independentOfAuthorScripts':True,'semanticReviewIsSeparateFromExecutableAssertions':True,'checks':checks,'count':len(checks),'doesNotProve':['runtime grader correctness','role or placement acceptance','Native','M7','CI','learner effectiveness']}
(O/'independent-mathematics.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':report['status'],'checks':len(checks)}))
