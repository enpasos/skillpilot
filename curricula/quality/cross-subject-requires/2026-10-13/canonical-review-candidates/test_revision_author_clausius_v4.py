# SPDX-License-Identifier: Apache-2.0
import datetime
import hashlib
import json
import math
from fractions import Fraction as Q
from pathlib import Path

ROOT = Path('tmp/cross-subject-requires')
NAME = 'physics-clausius-revision-author-20261013-v4'
checks = []
def check(name, value, evidence):
    assert value, name
    checks.append({'name': name, 'passed': True, 'evidence': evidence})

def reciprocal(c, a, b, x0, factor_is_constant=True):
    if not factor_is_constant or a <= 0 or b <= 0 or x0 <= 0:
        raise ValueError('Reciprocal-only rule precondition failed')
    return c*(math.log(b/x0)-math.log(a/x0))

def simpson(f, a, b, n=2000):
    step = (b-a)/n
    return step/3*(f(a)+f(b)+4*sum(f(a+i*step)for i in range(1,n,2))+2*sum(f(a+i*step)for i in range(2,n,2)))

for c, a, b, x0 in [(3.5,2,5,7),(-2,1,4,3),(2,4,1,9),(0,1,8,2)]:
    value = reciprocal(c,a,b,x0)
    direct = simpson(lambda x:c/x,a,b)
    check('valid-reciprocal-' + str(len(checks)+1), abs(value-direct)<1e-10, {'c':c,'a':a,'b':b,'x0':x0,'formula':value,'independentNumericalIntegral':direct,'claimedScope':'Finite numerical probe, not a general theorem proof.'})
check('positive-reference-choice-invariance', abs(reciprocal(3,2,5,1)-reciprocal(3,2,5,13))<1e-12, {'positiveReferences':[1,13]})
for a,b,x0,const in [(0,2,1,True),(-1,2,1,True),(1,-2,1,True),(1,2,0,True),(1,2,-3,True),(1,2,1,False)]:
    rejected = False
    try:
        reciprocal(2,a,b,x0,const)
    except ValueError:
        rejected = True
    check('reject-invalid-precondition-' + str(len(checks)+1), rejected, {'a':a,'b':b,'x0':x0,'factorConstant':const})

# Exact countercase at x=3/2: the derivative of ln(x/x0) is 2/3,
# which is not the requested constant integrand 1. A primitive x is valid.
check('general-f-one-reject-unrelated-log', Q(1,1)/Q(3,2) != 1 and abs(math.log(2)-1)>0.3, {'integrand':'f(x)=1 on [1,2]','unrelatedPrimitive':'ln(x/x0)','unrelatedDerivativeAtThreeHalves':'2/3 != 1','correctPrimitive':'F(x)=x with F′=1','correctIntegral':1,'invalidLogResult':math.log(2)})
check('variable-factor-is-not-reciprocal-constant', simpson(lambda x:x/x,1,2) == 1 and abs(math.log(2)-1)>0.3, {'integrand':'c(x)/x with c(x)=x => 1','correctIntegral':1,'invalidPulledOutFactorFormula':math.log(2)})

# Physical cases retain the learner's choice; these probes check only the
# resulting mathematically admissible reciprocal integrands and domain.
gas = reciprocal(3,2,4,2)
solid = reciprocal(12,300,450,300)
check('gas-chosen-isothermal-integrand-positive-domain', abs(gas-3*math.log(2))<1e-12 and gas>0, {'integrand':'nR/V, fixed nR=3, V from 2 to 4','deltaS':gas,'physicalChoice':'Independent reversible isothermal path and deltaQ derivation remain in the task.'})
check('solid-variable-temperature-positive-domain', abs(solid-12*math.log(1.5))<1e-12 and abs(solid-12*(450-300)/450)>0.1, {'integrand':'C/T, constant C=12, T from 300 to 450','deltaS':solid,'incorrectEndpointReplacement':4})

inp = ROOT/(NAME+'.profile-amendments.candidate.json')
context = json.loads((ROOT/(NAME+'.context.exact.json')).read_text())
check('only-four-mathematical-helper-fields-changed', len(context['exactFieldChanges'])==4 and all(x['field']in ['taskDemandDe','taskDemandEn']for x in context['exactFieldChanges']), {'fields':[x['caseId']+'.'+x['field']for x in context['exactFieldChanges']]})
out = ROOT/(NAME+'.mathematical-probes.json')
report={'schemaVersion':1,'status':'author_mathematical_probes_passed_no_independent_approval','author':'/root/physics_pending5_revision','completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'authorityBoundary':'Positive and negative mathematical probes only; no learner evidence, native M7 or independent scientific verdict.','input':{'path':str(inp),'sha256':'sha256:'+hashlib.sha256(inp.read_bytes()).hexdigest()},'checkCount':len(checks),'checks':checks}
out.open('x').write(json.dumps(report,ensure_ascii=True,indent=2)+'\n')
print(json.dumps({'path':str(out),'sha256':'sha256:'+hashlib.sha256(out.read_bytes()).hexdigest(),'checks':len(checks)},indent=2))
