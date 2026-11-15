import csv
import hashlib
import itertools
import json
import math
from datetime import datetime, timezone
from pathlib import Path

src = Path('tmp/physics-current10-neutral-P-context-20261115-v2')
out = Path('tmp/physics-three-material-root-review-20261115')
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
tasks = json.loads((src / 'content-candidate.json').read_text())['tasks']
checks = []
def check(name, actual, expected, tolerance=1e-10):
    assert abs(actual-expected) <= tolerance, (name, actual, expected)
    checks.append({'name': name, 'actual': actual, 'expected': expected, 'tolerance': tolerance})

# Independent calculation, not execution of the author checks.
with (src / 'CIE_xyz_1931_2deg.csv').open() as f:
    cie = {int(float(row[0])): tuple(map(float,row[1:])) for row in csv.reader(f)}
for nm, values in [(450,(.3362,.038,1.77211)),(600,(1.0622,.631,.0008))]:
    for i,v in enumerate(values): check(f'CIE {nm} component {i}',cie[nm][i],v,1e-5)
assert tuple(a+b for a,b in zip((0,1,4),(0,3,2))) == (0,4,6)
assert (1,3,4)[::2] == (1,1,4)[::2] and (1,3,4) != (1,1,4)
for i,t_ms in enumerate([0,.5,1,1.5,2,2.5,3,3.5,4]):
    f = math.sin(2*math.pi*250*t_ms/1000)
    h = .5*math.sin(2*math.pi*500*t_ms/1000)
    check(f'X at {t_ms}ms',f+h,[0,1.21,1,.21,0,-.21,-1,-1.21,0][i],.005)
    check(f'Y at {t_ms}ms',f-h,[0,.21,1,1.21,0,-1.21,-1,-.21,0][i],.005)
check('400Hz period in ms',1000/400,2.5)
assert (.8**2)/2 < (.8**2+.6**2+.4**2)/2
check('pressure ratio20dB',10**(20/20),10)
check('intensity ratio20dB',10**(20/10),100)
for level,sones in [(70,8),(80,16),(90,32)]:check(f'conditional loudness {level}',2**((level-40)/10),sones)
check('pressure lower bound',10**(18/20),7.94,.005)
check('pressure upper bound',10**(22/20),12.59,.005)
check('intensity lower bound',10**(18/10),63.1,.01)
check('intensity upper bound',10**(22/10),158.5,.02)
check('conditional loudness lower bound',2**(18/10),3.48,.005)
check('conditional loudness upper bound',2**(22/10),4.59,.005)
check('equal modeled energy-time ratio',10**((90-80)/10)*.2/2,1)

omissions=[]
for t in tasks:
    s=t['examData']['scoring']
    assert len(s['steps'])==6 and s['maxPoints']==12 and s['passingPoints']==11
    assert all(x['points']==2 for x in s['steps'])
    for missing in range(6):
        vectors=[x for x in itertools.product(range(3),repeat=6) if x[missing]==0]
        maximum=max(map(sum,vectors))
        assert maximum==10 and all(sum(x)<s['passingPoints'] for x in vectors)
        omissions.append({'taskId':t['id'],'essentialStepOmitted':s['steps'][missing]['id'],'scoreVectors':len(vectors),'maxScore':maximum})
    assert sum([1,2,2,2,2,2])==s['passingPoints']

assets=json.loads((src/'task-material-targets.actual.json').read_text())
for item in assets.values(): assert sha(Path(item['sourcePath']))==item['sha256']
assert sha(src/'CIE_xyz_1931_2deg.csv')=='fa663e3535a7e0763a745993a1f0a192eb0275ac46ad2d1befd7626841e713c1'

record={
 'reviewedAt':datetime.now(timezone.utc).isoformat(),
 'reviewer':'Root, independent of the three task/profile authors',
 'status':'ACCEPT_BOUNDED_CONTENT_AND_THREE_P_BODIES',
 'taskIds':[t['id'] for t in tasks],
 'profileGoals':['39ef1e8a-9203-5192-8c76-8e0c3322646f','f06c581a-7157-584e-a692-99bcd613cff9','8ac61062-f63e-5935-96ae-84014906c368'],
 'pins':{name:sha(src/name) for name in ['content-candidate.json','profile-candidates.native.review.jsonl','candidate-artifact-pins.json','native-new-assessment-contexts.actual.json','source-and-material-manifest.json','task-material-targets.actual.json','R097-page8.png','CIE_xyz_1931_2deg.csv']},
 'actualReadScope':['Full DE/EN task and solution bodies; all 18 bilingual rubric criteria and common score policy','Three full DE/EN P bodies and ordinary target descriptions, native direct prerequisites, secured-context inventory','Three PNG diagrams visually viewed; source/material/asset manifests','Official CIE page and CSV; UBA historical report physical page8 visually read'],
 'decisions':[
  'CIE XYZ weights are empirical standardized matching data, not individual cone-response curves; toy SML addition and receiver deletion remain explicitly separate.',
  'Actual plotted and tabular stimuli require learner-created time curves and spectra; phase reversal demonstrates the non-uniqueness of time signals for an amplitude spectrum; ideal filtering does not assert a measured perceptual law.',
  'The stated loudness scale is used as a supplied historical conditional model for the 1kHz reference case. Different-frequency spectra do not inherit its numerical sones; equal modeled intensity-time exposure is not an identical injury or safety claim.',
  'Each declared essential action is required by an actual rubric zero condition; one omitted core caps the total below passing. A small isolated error can still pass.',
  'Concrete independent transfer cases require reconstruction and explanation rather than repetition of a supplied answer.'
 ],
 'numericChecks':checks,'omissionCases':omissions,
 'limits':['No universal M7, route, runtime, real-client, human or classroom acceptance','No claim that P profiles are automatically delivered to or enforced by the coach','Independent blind D review and final current-input P/SEM/A/M/V/CQR validation remain necessary','Final phase/applicability/placement metadata changes require fresh native fingerprints and actual current-view checks','Exact scientific stimuli must be copied byte-identically and their separate third-party license/attribution retained; UBA PDF is not republished']
}
out.mkdir(exist_ok=True)
(out/'review.actual.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':record['status'],'numericChecks':len(checks),'omissionCases':len(omissions),'vectors':sum(x['scoreVectors'] for x in omissions),'receiptSha256':sha(out/'review.actual.json')}))
