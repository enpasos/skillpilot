"""Independent arithmetic checks, not source/learner/whole-review approval."""
import json
import math
from pathlib import Path

F = 96485.0
R = 8.314
checks = []

def check(case, quantity, formula, result, expected, unit, tolerance=1e-4):
    assert math.isclose(result, expected, rel_tol=tolerance, abs_tol=tolerance), (case, quantity, result, expected)
    checks.append(dict(caseId=case, quantity=quantity, formula=formula,
                       calculated=result, comparison=expected, unit=unit, passed=True))

check('q3-02-a', 'K', '.4^2/.2^2', .4**2/.2**2, 4, 'dimensionless activity approximation')
check('q3-02-b', 'reaction extent', 'sqrt(9)/(1+sqrt(9))', 3/4, .75, 'mol/L')
x = (10-math.sqrt(28))/6
check('q3-04-a', 'added-feed extent', '(10-sqrt(28))/6', x, .78474956, 'mol/L')
check('q3-04-a', 'substitution K', 'x^2/((1.5-x)*(1-x))', x*x/((1.5-x)*(1-x)), 4, 'normalized concentration quotient')
x = (5-math.sqrt(17))/4
check('q3-04-b', 'reverse compression extent', '(5-sqrt(17))/4', x, .21922359, 'mol/L')
check('q3-04-b', 'substitution Kc', '(2-2x)^2/(1+x)', (2-2*x)**2/(1+x), 2, 'mol/L convention')
check('q3-07-a', 'Haber-Bosch Kc', '.4^2/(.2*.6^3)', .4**2/(.2*.6**3), 3.7037037, 'L^2/mol^2 convention')
check('q3-07-a', 'ammonia concentration', 'sqrt(Kc*.1*.3^3)', math.sqrt((.4**2/(.2*.6**3))*.1*.3**3), .1, 'mol/L')
check('q3-07-b', 'Haber-Bosch Kc', '1^2/(.5*1.5^3)', 1/(.5*1.5**3), 16/27, 'L^2/mol^2 convention')
check('q3-07-b', 'fresh quotient', '.5^2/(.75*2.25^3)', .5**2/(.75*2.25**3), .02926383, 'L^2/mol^2 convention')
check('q3-08-a', 'supplied-model voltage', '1.46-(-1.03)+.20', 1.46-(-1.03)+.2, 2.69, 'V')
check('q3-08-b', 'supplied-model voltage', '1.17-.34+.12', 1.17-.34+.12, .95, 'V')
check('q3-09-a', 'copper amount', '(2*965)/(2*F)', 2*965/(2*F), .01000155, 'mol')
check('q3-09-a', 'copper mass', '(2*965)/(2*F)*63.55', 2*965/(2*F)*63.55, .63559828, 'g')
check('q3-09-b', 'aluminium charge', '.1*3*F', .1*3*F, 28945.5, 'C')
check('q3-09-b', 'electrolysis duration', '.1*3*F/5', .1*3*F/5, 5789.1, 's')
check('q3-10-a', 'standard cell voltage', '.34-(-.76)', .34-(-.76), 1.1, 'V')
check('q3-10-b', 'standard cell voltage', '-.44-(-2.37)', -.44-(-2.37), 1.93, 'V')
check('q3-11-a', 'electrical work', '1.2*.1*300', 1.2*.1*300, 36, 'J')
check('q3-11-b', 'interval-integrated work', '1.1*.2*100+.9*.1*200', 1.1*.2*100+.9*.1*200, 40, 'J')
check('q3-13-a', 'pressure-chain returned energy', '100*.7*.9*.5', 100*.7*.9*.5, 31.5, 'kWh')
check('q3-13-b', 'hydride-chain returned energy', '1000*.75*.85*.6', 1000*.75*.85*.6, 382.5, 'kWh')
check('q3-13-b', 'pressure-chain returned energy', '1000*.75*.92*.6', 1000*.75*.92*.6, 414, 'kWh')
check('q3-18-a', 'mean disappearance rate', '(.8-.6)/20', (.8-.6)/20, .01, 'mol/(L s)')
check('q3-18-b', 'first gas amount rate', '(.024/60)/24', (.024/60)/24, 1.6666667e-5, 'mol/s', 1e-9)
check('q3-20-a', 'two-point activation energy', 'R*ln(4)/(1/300-1/320)', R*math.log(4)/(1/300-1/320), 55323.12632808369, 'J/mol')
check('q3-20-b', 'slope activation energy', 'R*6000', R*6000, 49884, 'J/mol')
check('q3-20-b', 'rate constant at 300K', 'exp(18-6000/300)', math.exp(18-6000/300), .13533528, 's^-1')

output = dict(status='actual-independent-arithmetic-check-completed', checks=checks,
              checksPassed=len(checks), scientificWholeApproval=False,
              originalSourceApproval=False, actualLearnerPerformance=False)
out = Path(__file__).with_name('selected-case-arithmetic.independent-a.actual.json')
with out.open('x') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)
    f.write('\n')
print(json.dumps(dict(exitMeaning='arithmetic-only', checksPassed=len(checks), output=str(out))))
