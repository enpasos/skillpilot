import datetime, hashlib, json, math
from pathlib import Path

ROOT = Path('.')
OUT = ROOT / 'tmp/physics-q1-root-nine-review-20261115'
AUTHOR = ROOT / 'tmp/physics-q1-current-acquisition-20261115-v1'
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
candidate = json.loads((AUTHOR / 'content-candidate.json').read_text())
assert sha(AUTHOR / 'content-candidate.json') == 'd27f1182f9a02e9e9037722a9313ef0dab0bda7a504ade79dec357739f35b3d9'
tasks = candidate['tasks'][:9]
notes = [
    ('Microscopic vector sums 0,+4,-8 and before/during/after material histories jointly assess both whole-goal expectations; reversal is an additional transfer.',
     'A response calling both samples permanent only from the in-field reading fails the persistence criterion.'),
    ('Charge-sign reversal changes cancellation from horizontal to vertical components at P; negative radial fields, inverse-square scaling and spherical exterior limits are assessed.',
     'Adding field magnitudes instead of vectors, or inferring interior fields from exterior equality, fails separate required criteria.'),
    ('Positive and negative charges, transverse initial motion, slowing and reversal consistently distinguish force, trajectory and opposite energy changes.',
     'Claiming all kinetic energy vanishes at vx=0 despite vy>0 fails the trajectory/energy transfer.'),
    ('The sign inference, 30-degree force magnitude, parallel/perpendicular limits, controlled m/v/B changes and ambiguous unknown m/v case cover both claimed goals.',
     'Treating a radius of 2r as unique proof of double mass fails the explicitly uncontrolled-comparison criterion.'),
    ('The two particles and new double-mass/double-charge ion test separate radius and period scalings; relativistic and oblique entry limits are explicit.',
     'Doubling the period when only speed doubles, or applying the full-speed circle radius at 40 degrees, fails the relevant transfer.'),
    ('Parallel and perpendicular components, limiting paths, independent field reversal and parallel-velocity reversal diagnose which helical features actually change.',
     'Reversing the physical axial motion merely because B reverses fails the separate-reversal criterion.'),
    ('Acceleration, velocity selection and analysis are separated. Negative charge reverses both selector forces; analysis-field reversal and 1:2:1 m/|q| ratios remain consistent.',
     'Calling identical detector locations unique mass measurements fails the explicit charge/mass ambiguity criterion.'),
    ('Measured/set/inferred quantities are distinguished. Two independent tube settings determine specific charge; a separately supplied elementary charge is needed for mass.',
     'Treating the luminous radius as a direct mass reading fails the evidence-chain and independent-information criteria.'),
    ('Operating tables distinguish cyclotron and synchrotron. The new species changes m/|q|, the rigidity bound excludes both machines, and relativistic synchronism is explicitly limited.',
     'Claiming that a synchrotron automatically evades the same field/radius limit fails the quantitative feasibility criterion.'),
]
checks = []
def check(name, actual, expected, tolerance=1e-9):
    assert math.isclose(actual, expected, rel_tol=tolerance, abs_tol=1e-25), (name, actual, expected)
    checks.append({'name': name, 'actual': actual, 'expected': expected, 'relativeTolerance': tolerance})
check('electric force N', 2e-9 * 2e3, 4e-6)
check('electric acceleration m/s2', 2e-9 * 2e3 / 1e-6, 4)
check('electric kinetic-energy gain J', 2e-9 * 2e3 * .03, 1.2e-7)
check('perpendicular Lorentz force N', 3e-9 * 4e3 * .2, 2.4e-6)
check('30-degree Lorentz force N', 3e-9 * 4e3 * .2 * math.sin(math.pi/6), 1.2e-6)
check('proton radius m', 1.67e-27 * 1e6 / (1.6e-19 * .1), .104375)
check('electron radius m', 9.11e-31 * 1e6 / (1.6e-19 * .1), 5.69375e-5)
check('proton period s', 2*math.pi*1.67e-27/(1.6e-19*.1), 6.558e-7, .0001)
check('electron period s', 2*math.pi*9.11e-31/(1.6e-19*.1), 3.577e-10, .0002)
check('tube A C/kg', 400/(.001**2*.0477**2), 1.758e11, .0001)
check('tube B corrected four-significant-digit C/kg', 900/(.001**2*.0715**2), 1.760e11, .0003)
check('tube inferred mass kg', 1.602e-19/(400/(.001**2*.0477**2)), 9.11e-31, .0003)
check('tube radius factor', math.sqrt(450/200), 1.5)
check('maximum rigidity Tm', 1.5*.5, .75)
check('required field T at fixed radius', 1/.5, 2)
check('required radius m at fixed field', 1/1.5, 2/3)

findings = [
    {'id':'Q1-R9-RUBRIC', 'tasks':[g['id'] for g in tasks], 'severity':'blocking',
     'finding':'A separate total-score cap is not a separately enforced field of the runtime assessment contract. With 4-point steps and a max-minus-2 threshold, omitting a 2-point transfer can still meet the step sum threshold.',
     'requiredRepair':'Apply an explicit maximum of 1/4 within each affected step when any essential statement or transfer of that step is omitted or replaced by a misconception. The ordinary sum then stays below the threshold. Retain equivalent valid methods and minor-error treatment.'},
    {'id':'Q1-R9-GEOMETRY-SPHERES', 'tasks':[tasks[1]['id']], 'severity':'blocking',
     'finding':'A point 3a from two different spherical centres does not establish equal vector directions. The intended comparison needs the same centre in separate experiments.',
     'requiredRepair':'Specify separate arrangements with each centre at the origin and the same observation point (3a,0), in DE and EN.'},
    {'id':'Q1-R9-GEOMETRY-HELIX', 'tasks':[tasks[5]['id']], 'severity':'blocking',
     'finding':'Case B does not fix the perpendicular velocity azimuth, whereas the answer assumes initial +x to give an absolute +y force.',
     'requiredRepair':'Explicitly give initial v_perp along +x in both languages; retain the independent field and axial-velocity reversals.'},
    {'id':'Q1-R9-NUMERIC-TUBE', 'tasks':[tasks[7]['id']], 'severity':'minor',
     'finding':'Run B yields 1.76047728495281e11 C/kg; the four-significant-digit solution should read 1.760e11, not 1.761e11.',
     'requiredRepair':'Correct both language solutions; no stimulus or scoring-threshold change is needed.'},
]
inputs = [AUTHOR/'content-candidate.json', AUTHOR/'native-review-contexts.json', AUTHOR/'review-pack.json',
          AUTHOR/'coverage-matrix.json', ROOT/'tmp/physics-release809-20261115/q1-whole-goal-review-priorities.actual.json']
report = {
    'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'reviewer':'/root, independent informed AI content reviewer; not the task author',
    'status':'HOLD_PENDING_EXACT_SUCCESSOR_REVIEW',
    'scope':'Full DE/EN task, solution and scoring text for indices 0-8; eleven current whole-goal positive-evidence profiles (German); nine native candidate contexts and their secured goal texts. No acceptance of tasks 9-26, CQR, projection placement or classroom effectiveness.',
    'inputPins':[{'path':str(p),'sha256':sha(p)} for p in inputs],
    'rows':[{'taskId':g['id'],'coveredGoalIds':g['examData']['coveredGoalIds'],'contentAnalysis':notes[i][0],
             'counteranswer':notes[i][1],'currentVerdict':'hold'} for i,g in enumerate(tasks)],
    'findings':findings, 'independentNumericalChecks':checks,
    'primarySourcesRead':[
        {'url':'https://openstax.org/books/university-physics-volume-2/pages/11-3-motion-of-a-charged-particle-in-a-magnetic-field',
         'use':'Checked perpendicular no-work force, radius/period relations and component-wise helical motion; no text or image copied.'},
        {'url':'https://home.cern/science/accelerators/how-accelerator-works',
         'use':'Checked the distinct electric acceleration and magnetic steering roles, and synchronization context; no text or image copied.'}],
    'independence':'The author wrote v1. Root supplied review findings and requested a preserved successor; any later acceptance must bind and inspect that exact successor rather than retroactively approving v1.',
    'activeWrites':0, 'learnerResultWrites':0,
}
(OUT/'review-v1.actual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('HOLD:',len(tasks),'tasks;',len(checks),'numerical checks; findings',len(findings))
