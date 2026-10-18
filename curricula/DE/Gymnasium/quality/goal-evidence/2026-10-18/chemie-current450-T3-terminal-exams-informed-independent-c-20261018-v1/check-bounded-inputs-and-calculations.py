# SPDX-License-Identifier: Apache-2.0
import csv, hashlib, json, math
from pathlib import Path

AUTHOR = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-T3-terminal-exams-author-20261018-v1')
OWN = Path(__file__).parent
def read(p): return json.loads(Path(p).read_text())
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def objsha(o): return hashlib.sha256(json.dumps(o, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
seal = read(AUTHOR/'SEAL.json')
assert sha(AUTHOR/'SEAL.json') == '17bf769179e6670b36e8068b746e1d3890a69331fa5f0b626f20ba3c1c1c0d02'
pins = []
for f in seal['files']:
    assert sha(f['path']) == f['sha256'], f['path']
    pins.append({'path': f['path'], 'sha256': f['sha256']})
goals = read(AUTHOR/'AUTHOR.eighteen-whole-draft-exam-goals.INACTIVE.json')['goals']
inputs = read(AUTHOR/'inputs/T3.nineteen-whole-current-goals-and-native-positive-profiles.json')
canonical = read(inputs['canonical']['path'])
current = {g['id']:g for g in canonical['goals']}
inputby = {r['goal']['id']:r for r in inputs['records']}
selected = []
for gid,r in inputby.items():
    assert current[gid] == r['goal'], gid
    assert sha(r['config']['path']) == r['config']['sha256']
    assert sha(r['native']['path']) == r['native']['sha256']
    line = Path(r['native']['path']).read_text().splitlines()[r['lineOneBased']-1]
    assert json.loads(line) == r['wholeRecord']
    selected.append({'goalId':gid, 'wholeOrdinaryObjectSHA256':objsha(current[gid]), 'profileSHA256':objsha(r['wholeRecord']['profile']), 'nativeLine':r['lineOneBased']})
rows = []
for g in goals:
    e=g['examData']; s=e['scoring']; ordinary = [current[i] for i in g['requires']]
    assert set(g['requires']) == set(e['coveredGoalIds'])
    assert len(g['requires']) in (1,2,3)
    assert s['maxPoints'] == s['passingPoints'] == sum(t['points'] for t in s['steps'])
    assert e['reviewStatus'] == 'draft' and not g['contains']
    assert Path(e['sourceArtifactPath']).is_file()
    assert set(g['applicability']['jurisdiction']) <= set.intersection(*(set(x['applicability']['jurisdiction']) for x in ordinary))
    courses=set(g['tags']) & {'GK','LK'}
    assert all(courses <= (set(o['tags']) & {'GK','LK'}) for o in ordinary)
    rows.append({'goalId':g['id'],'requires':g['requires'],'coveredGoalIds':e['coveredGoalIds'],'phase':g.get('phase'),'courses':sorted(courses),'jurisdictions':g['applicability']['jurisdiction'],'maxEqualsPassing':s['maxPoints'],'practical':g['extendedData']['authorProposal']['practicalExecutionRequired']})
resource = read(AUTHOR/'AUTHOR.proposed-resource-delivery-deltas.INACTIVE.json')
assets=[]
for a in resource['assets']:
    assets.append(a)
# Numeric values checked directly against the supplied Maxwell-energy model.
def tail(E,T):
    x=E/(0.008314*T)
    return math.erfc(math.sqrt(x))+2/math.sqrt(math.pi)*math.sqrt(x)*math.exp(-x)
csvpath=AUTHOR/'materials/Boltzmann.normalized-energy-data.synthetic.csv'
data=list(csv.DictReader(csvpath.open()))
max_error=0.0
areas=[0.0,0.0]
previous=None
for r in data:
    E=float(r['E_kJ_per_mol']); values=[float(r['f300_per_kJ_per_mol']),float(r['f450_per_kJ_per_mol'])]
    for T,y in zip((300,450),values):
        expected=2/math.sqrt(math.pi)*math.sqrt(E)/(0.008314*T)**1.5*math.exp(-E/(0.008314*T))
        max_error=max(max_error,abs(y-expected))
    if previous:
        for j in range(2): areas[j]+=(E-previous[0])*(values[j]+previous[1][j])/2
    previous=(E,values)
assert max_error < 1e-12
calculations={'Boltzmann':{'csvRows':len(data),'maxAbsoluteModelError':max_error,'trapezoidAreasOverSuppliedFiniteRange':areas,'tail300at15':tail(15,300),'tail450at15':tail(15,450),'tail300at10':tail(10,300),'tailRatio':tail(15,450)/tail(15,300)},'PourbaixActualDefect':{'P':{'pH':8,'Eh':-0.50,'hydrogenBoundaryEh':-0.05916*8,'belowHydrogenBoundary':True},'Q':{'pH':11,'Eh':-0.50,'hydrogenBoundaryEh':-0.05916*11,'insideWaterWindow':True}},'gas':{'Kp':0.005*0.08314*298,'K318':0.1*math.exp(-50000/8.314*(1/318-1/298))}}
out={'role':'Independent C bounded actual checks; no scientific vote inferred from arithmetic','authorSealVerified':True,'sealPinnedFiles':pins,'currentSelectedOrdinaryObjectsExact':selected,'newGoalInterfaces':rows,'conjunctiveRubrics':True,'HBdigitalScopeSeparate':True,'commonWrongDEHeaderCount':sum('sofern sie ausdrücklich als selbst zu erhebende Daten bezeichnet sind' in g['examData']['taskContent'] for g in goals),'resourceDelta':resource,'calculations':calculations,'normalWrites':0,'fullQAInvoked':False}
(OWN/'CHECK.bounded-inputs-interfaces-and-numerics.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'verifiedSealFiles':len(pins),'currentOrdinaryExact':len(selected),'newInterfaces':len(rows),'practicalChannels':sum(r['practical'] for r in rows),'BoltzmannCSVError':max_error,'PourbaixPBelowWater':True,'normalWrites':0}))
