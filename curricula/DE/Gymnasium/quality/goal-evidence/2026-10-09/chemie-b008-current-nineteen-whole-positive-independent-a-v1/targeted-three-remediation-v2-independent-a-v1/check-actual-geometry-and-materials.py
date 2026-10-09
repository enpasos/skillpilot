import csv, hashlib, itertools, json, math
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-current-nineteen-whole-positive-author-v1/remediation-v2'
OUT = Path(__file__).parent
def binding(p):
    b = p.read_bytes()
    return dict(path=str(p.relative_to(ROOT)), sha256='sha256:'+hashlib.sha256(b).hexdigest(), bytes=len(b))
def sub(a,b): return [x-y for x,y in zip(a,b)]
def dot(a,b): return sum(x*y for x,y in zip(a,b))
def cross(a,b): return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
def norm(a): return math.sqrt(dot(a,a))
def dist(a,b): return norm(sub(a,b))
def angle(a,b,c):
    u,v=sub(a,b),sub(c,b)
    return math.degrees(math.acos(max(-1,min(1,dot(u,v)/(norm(u)*norm(v))))))
def read(n): return json.loads((BASE/n).read_text())
g=read('finite-L-L2-receptor-geometries.author-candidate.json')
oh=read('finite-L2-extra-OH-transfer-layout.author-candidate.json')
poses={k:{a:v['xyz_A'] for a,v in p.items()} for k,p in g['ligandPoses'].items()}
r={a:v['xyz_A'] for a,v in g['receptorFixedContacts'].items()}
neighbors=defaultdict(list)
for b in g['bonds']:
    neighbors[b['a']].append(b['b']); neighbors[b['b']].append(b['a'])
res={}
for name,p in poses.items():
    centre=[sum(p[f'P{i}'][j] for i in range(1,7))/6 for j in range(3)]
    plane=cross(sub(p['P2'],p['P1']),sub(p['P3'],p['P1']))
    plane_error=max(abs(dot(sub(p[a],p['P1']),plane))/norm(plane) for a in [f'P{i}' for i in range(1,7)]+[f'HP{i}' for i in range(2,7)])
    tetra={c:[angle(p[a],p[c],p[b]) for a,b in itertools.combinations(neighbors[c],2)] for c in ['C1','C2','C5','Nplus']}
    trig={c:[angle(p[a],p[c],p[b]) for a,b in itertools.combinations(neighbors[c],2)] for c in ['C3','N4']}
    bl={b['a']+'--'+b['b']:dist(p[b['a']],p[b['b']]) for b in g['bonds']}
    near=[]
    for a,b in itertools.combinations(p,2):
        if b in neighbors[a] or set(neighbors[a])&set(neighbors[b]): continue
        near.append((dist(p[a],p[b]),a,b))
    res[name]=dict(atoms=len(p),formula=dict(Counter(v['element'] for v in g['ligandPoses'][name].values())),charge=sum(v['formalCharge'] for v in g['ligandPoses'][name].values()),bondCount=len(bl),bondLengths=bl,tetrahedralAngles_deg=tetra,trigonalAngles_deg=trig,amideMaxAbsZ=max(abs(p[a][2]) for a in ['C2','C3','O','N4','HN4','C5']),phenylPlanarityMaxError=plane_error,phenylCentre=centre,contacts=dict(Nplus_Rnegative=dist(p['Nplus'],r['Rnegative']),O_Hdonor=dist(p['O'],r['Hdonor']),D_H_O_deg=angle(r['D'],r['Hdonor'],p['O']),phenyl_patch=dist(centre,r['Rhydrophobic'])),nearestNonbondedBeyondTwoBonds=sorted(near)[:5])
rows=list(csv.DictReader((BASE/'printable-L-L2-atom-and-contact-coordinate-cards.tsv').open(),delimiter='\t'))
errs=[]; maxcoord=0; maxmount=0
for row in rows:
    p=poses[row['pose']][row['card_id']] if row['pose'] in poses else r[row['card_id']]
    for j,axis in enumerate('xyz'):
        maxcoord=max(maxcoord,abs(float(row[axis])-p[j]))
        maxmount=max(maxmount,abs(float(row['mount_'+axis.upper()+'_mm'])-(80+10*p[j])))
    if row['pose'] in poses:
        atom=g['ligandPoses'][row['pose']][row['card_id']]
        if row['element']!=atom['element'] or int(row['formal_charge'])!=atom['formalCharge']: errs.append(row['card_id'])
rodrows=list(csv.DictReader((BASE/'printable-ligand-connectivity-and-rod-lengths.tsv').open(),delimiter='\t'))
rodmax=max(abs(float(b['rod_length_mm'])-10*dist(poses[n][b['atom_a']],poses[n][b['atom_b']])) for b in rodrows for n in poses)
assert {(b['atom_a'],b['atom_b'],b['bond_type']) for b in rodrows}=={(b['a'],b['b'],str(b['order'])) for b in g['bonds']}
ohp={**poses['L2'],**{k:v['xyz_A'] for k,v in oh['addedAtoms'].items()}}
for a in oh['deleteAtomIds']: ohp.pop(a)
ohres=dict(atoms=len(ohp),C5_OX=dist(ohp['C5'],ohp['OX']),OX_HX=dist(ohp['OX'],ohp['HX']),C5_OX_HX_deg=angle(ohp['C5'],ohp['OX'],ohp['HX']),OX_Hdonor=dist(ohp['OX'],r['Hdonor']),Nplus_Rnegative=dist(ohp['Nplus'],r['Rnegative']))
ohrows=list(csv.DictReader((BASE/'printable-extra-OH-transfer-cards.tsv').open(),delimiter='\t'))
ohmount=max(abs(float(row['mount_'+a.upper()+'_mm'])-(80+10*ohp[row['card_id']][j])) for row in ohrows for j,a in enumerate('xyz'))
out=dict(schemaVersion=1,role='Independent A arithmetic on actual raw coordinate/card inputs; no author geometry audit values used',calculatedAt=datetime.now(timezone.utc).isoformat(),inputBindings=[binding(BASE/n) for n in ['finite-L-L2-receptor-geometries.author-candidate.json','printable-L-L2-atom-and-contact-coordinate-cards.tsv','printable-ligand-connectivity-and-rod-lengths.tsv','finite-L2-extra-OH-transfer-layout.author-candidate.json','printable-extra-OH-transfer-cards.tsv']],poses=res,bondLengthMaxDeltaBetweenPoses=max(abs(res['L']['bondLengths'][b]-res['L2']['bondLengths'][b]) for b in res['L']['bondLengths']),registrationNoncollinearArea=norm(cross(sub(poses['L']['N4'],poses['L']['C3']),sub(poses['L']['C5'],poses['L']['C3']))),printable=dict(cards=len(rows),poseCounts=dict(Counter(row['pose'] for row in rows)),maxCoordinateRoundingError=maxcoord,maxMountRoundingError_mm=maxmount,rodCount=len(rodrows),maxRodLengthError_mm=rodmax,elementChargeErrors=errs,extraCards=len(ohrows),extraMountMaxRoundingError_mm=ohmount),extraOH=ohres,standardCheck=dict(nominal_uS_cm=1990,tolerance_uS_cm=20,wholeInterval=[1990-20,1990+20],newRange=[0,5000],entireIntervalWithinNewRange=0<=1970<2010<=5000,oldRangeClippedUpperLimit=2010>2000,referenceTemperature_C=25,resolutionNotAccuracy=True),occupancy=[l/(2+l) for l in [0,2,6]],ownPhysicalConstruction=False,actualLearnerPerformance=False,humanApproval=False,strictGain=0)
dest=OUT/'actual-independent-geometry-card-range-calculations.json'
dest.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(out,ensure_ascii=False,indent=2))
