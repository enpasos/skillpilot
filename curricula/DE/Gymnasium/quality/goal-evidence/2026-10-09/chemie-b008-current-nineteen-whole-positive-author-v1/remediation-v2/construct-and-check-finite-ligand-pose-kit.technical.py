"""Own authored ideal geometry, not molecular dynamics or a learner receipt."""
import math, json, csv, pathlib, hashlib, datetime
P = pathlib.Path(__file__).resolve().parent
def add(a,b): return tuple(x+y for x,y in zip(a,b))
def sub(a,b): return tuple(x-y for x,y in zip(a,b))
def mul(a,t): return tuple(x*t for x in a)
def dot(a,b): return sum(x*y for x,y in zip(a,b))
def cross(a,b): return (a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0])
def norm(a): return math.sqrt(dot(a,a))
def unit(a): return mul(a,1/norm(a))
def dist(a,b): return norm(sub(a,b))
def angle(a,b,c):
 u,v=unit(sub(a,b)),unit(sub(c,b))
 return math.degrees(math.acos(max(-1,min(1,dot(u,v)))))
def rotate(q,origin,axis,theta):
 v=sub(q,origin);u=unit(axis)
 return add(origin,add(add(mul(v,math.cos(theta)),mul(cross(u,v),math.sin(theta))),mul(u,dot(u,v)*(1-math.cos(theta)))))
def bind(p):
 r=p.read_bytes();return {'path':str(p.relative_to(pathlib.Path.cwd())),'sha256':hashlib.sha256(r).hexdigest(),'bytes':len(r)}
atoms={};bonds=[]
def atom(key,element,xyz,label,charge=0): atoms[key]={'element':element,'xyz_A':xyz,'label':label,'formalCharge':charge}
def bond(a,b,order): bonds.append({'a':a,'b':b,'order':order})
tet=math.sqrt(8/9)
atom('C2','C',(0,0,0),'CH2; flexible saturated carbon')
atom('C3','C',(1.52,0,0),'amide carbonyl C; planar')
atom('O','O',(1.52+1.25/2,1.25*math.sqrt(3)/2,0),'carbonyl O; H-bond acceptor')
atom('N4','N',(1.52+1.35/2,-1.35*math.sqrt(3)/2,0),'neutral amide NH; planar, not acceptor')
atom('C5','C',add(atoms['N4']['xyz_A'],(1.47,0,0)),'CH2; flexible saturated carbon')
atom('HN4','H',add(atoms['N4']['xyz_A'],(-1.01/2,-1.01*math.sqrt(3)/2,0)),'amide H')
atom('C1','C',(-1.53/3,0,1.53*tet),'CH2; flexible saturated carbon')
back=unit(sub(atoms['C2']['xyz_A'],atoms['C1']['xyz_A']))
ndir=add(mul(back,-1/3),(0,tet,0))
atom('Nplus','N',add(atoms['C1']['xyz_A'],mul(ndir,1.48)),'terminal NH3+; ionic contact',1)
for a,b,order in [('Nplus','C1',1),('C1','C2',1),('C2','C3',1),('C3','O',2),('C3','N4','amide-restricted'),('N4','C5',1),('N4','HN4',1)]: bond(a,b,order)
# Full tetrahedral ammonium and each CH2: labels do not hide planar centres.
u=unit(sub(atoms['C1']['xyz_A'],atoms['Nplus']['xyz_A']));p=unit(cross(u,(1,0,0)));q=cross(u,p)
for i in range(3):
 direction=add(mul(u,-1/3),mul(add(mul(p,math.cos(i*2*math.pi/3)),mul(q,math.sin(i*2*math.pi/3))),tet))
 key=f'HNplus{i+1}';atom(key,'H',add(atoms['Nplus']['xyz_A'],mul(direction,1.02)),'ammonium H');bond('Nplus',key,1)
v=(1/3,0,tet);w=(0,1,0)
atom('P1','C',add(atoms['C5']['xyz_A'],mul(v,1.51)),'phenyl ipso C; planar aromatic')
centre=add(atoms['P1']['xyz_A'],mul(v,1.40))
for i in range(1,6):
 theta=i*math.pi/3;key=f'P{i+1}'
 atom(key,'C',add(centre,mul(add(mul(v,-math.cos(theta)),mul(w,math.sin(theta))),1.40)),'phenyl aromatic C')
for i in range(6): bond(f'P{i+1}',f'P{(i+1)%6+1}','aromatic')
bond('C5','P1',1)
for c,a,b in [('C1','Nplus','C2'),('C2','C1','C3'),('C5','N4','P1')]:
 u=unit(sub(atoms[a]['xyz_A'],atoms[c]['xyz_A']));v1=unit(sub(atoms[b]['xyz_A'],atoms[c]['xyz_A']));n=unit(cross(u,v1))
 for k,sgn in enumerate([1,-1],1):
  d=add(mul(add(u,v1),-.5),mul(n,sgn*math.sqrt(2/3)))
  key=f'H{c}_{k}';atom(key,'H',add(atoms[c]['xyz_A'],mul(d,1.09)),'CH2 H');bond(c,key,1)
for i in range(2,7):
 key=f'HP{i}';d=unit(sub(atoms[f'P{i}']['xyz_A'],centre));atom(key,'H',add(atoms[f'P{i}']['xyz_A'],mul(d,1.08)),'phenyl H');bond(f'P{i}',key,1)
L={k:dict(x) for k,x in atoms.items()};L2={k:dict(x) for k,x in atoms.items()}
axis=sub(atoms['C2']['xyz_A'],atoms['C1']['xyz_A'])
for k in ['Nplus','HNplus1','HNplus2','HNplus3','HC1_1','HC1_2']:
 L2[k]['xyz_A']=rotate(atoms[k]['xyz_A'],atoms['C1']['xyz_A'],axis,math.pi)
normal=unit(cross(v,w))
receptor={'Rnegative':{'xyz_A':add(L['Nplus']['xyz_A'],(0,3.4,0)),'role':'negative ionic feature centre'},'D':{'xyz_A':add(atoms['O']['xyz_A'],(0,3,0)),'role':'H-bond donor heavy-atom anchor'},'Hdonor':{'xyz_A':add(atoms['O']['xyz_A'],(0,2,0)),'role':'donor H; D-H=1.00 A'},'Rhydrophobic':{'xyz_A':add(centre,mul(normal,3.5)),'role':'hydrophobic patch feature centre; not an atom'}}
def contacts(pose):
 n=dist(pose['Nplus']['xyz_A'],receptor['Rnegative']['xyz_A']);h=dist(pose['O']['xyz_A'],receptor['Hdonor']['xyz_A']);da=angle(receptor['D']['xyz_A'],receptor['Hdonor']['xyz_A'],pose['O']['xyz_A']);ring=tuple(sum(pose[f'P{i}']['xyz_A'][j] for i in range(1,7))/6 for j in range(3));r=dist(ring,receptor['Rhydrophobic']['xyz_A'])
 return {'ionicDistance_A':n,'O_HDistance_A':h,'D_H_OAngle_deg':da,'ringCentre_patchDistance_A':r,'ionicRulePass':2.5<=n<=4,'hydrogenBondRulePass':1.6<=h<=2.4 and da>=150,'hydrophobicRulePass':3<=r<=4.5}
checks=[]
for c,a,b in [('C1','Nplus','C2'),('C2','C1','C3'),('C5','N4','P1')]:
 for name,pose in [('L',L),('L2',L2)]:checks.append({'pose':name,'angle':f'{a}-{c}-{b}','degrees':angle(pose[a]['xyz_A'],pose[c]['xyz_A'],pose[b]['xyz_A'])})
tetraOK=all(abs(x['degrees']-109.47122063449)<1e-8 for x in checks)
lengthEqual=all(abs(dist(L[b['a']]['xyz_A'],L[b['b']]['xyz_A'])-dist(L2[b['a']]['xyz_A'],L2[b['b']]['xyz_A']))<1e-9 for b in bonds)
assert tetraOK and lengthEqual
assert all(abs(L[k]['xyz_A'][2])<1e-12 for k in ['C2','C3','O','N4','C5','HN4'])
ringPlaneError=max(abs(dot(sub(L[f'P{i}']['xyz_A'],centre),normal)) for i in range(1,7));assert ringPlaneError<1e-12
assert contacts(L)['ionicRulePass'] and not contacts(L2)['ionicRulePass']
assert len(atoms)==28 and sum(x['formalCharge'] for x in atoms.values())==1
geometry={'schemaVersion':1,'role':'Idealized explicit finite analogue construction; no docking or experiment','scaffold':'[NH3+]-CH2-CH2-C(=O)-NH-CH2-C6H5','formula':'C10H15N2O+','unit':'angstrom-like teaching coordinate unit','sameAtomTypesConnectivityAndChargeInBothPoses':True,'ligandPoses':{'L':L,'L2':L2},'bonds':bonds,'receptorFixedContacts':receptor,'registrationAtoms':['C3','N4','C5'],'changeBetweenPoses':'180 degree rotation of terminal ammonium-side fragment about flexible C1-C2; amide and phenyl constraints retained','constructionScale_mm_per_coordinate_unit':10,'constructionOrigin_mm':[80,80,80],'contactRules':{'ionic':'Nplus to negative feature: 2.5..4.0','hydrogenBond':'O to Hdonor:1.6..2.4 and D-Hdonor-O>=150deg','hydrophobic':'phenyl centre to patch:3.0..4.5'},'modelRulesNotEmpiricalBindingCutoffs':True,'activationAffinityOrClinicalEffectComputed':False,'actualLearnerPerformance':False,'actualPhysicalCardsConstructed':False,'humanApproval':False}
(P/'finite-L-L2-receptor-geometries.author-candidate.json').write_text(json.dumps(geometry,ensure_ascii=False,indent=2)+'\n')
with (P/'printable-L-L2-atom-and-contact-coordinate-cards.tsv').open('x') as f:
 writer=csv.writer(f,delimiter='\t');writer.writerow(['pose','card_id','label','element','formal_charge','x','y','z','mount_X_mm','mount_Y_mm','mount_Z_mm'])
 for name,pose in [('L',L),('L2',L2),('R',receptor)]:
  for key,x in pose.items():
   xyz=x['xyz_A'];writer.writerow([name,key,x.get('label',x.get('role')),x.get('element','feature'),x.get('formalCharge','')]+[f'{q:.6f}' for q in xyz]+[f'{80+10*q:.3f}' for q in xyz])
with (P/'printable-ligand-connectivity-and-rod-lengths.tsv').open('x') as f:
 writer=csv.writer(f,delimiter='\t');writer.writerow(['atom_a','atom_b','bond_type','rod_length_mm'])
 for b in bonds:writer.writerow([b['a'],b['b'],b['order'],f"{10*dist(L[b['a']]['xyz_A'],L[b['b']]['xyz_A']):.3f}"])
with (P/'ligand-contact-comparison.learner-blank.tsv').open('x') as f:
 writer=csv.writer(f,delimiter='\t');writer.writerow(['pose','own_construction_or_layout_reference','Nplus_Rnegative_distance','O_Hdonor_distance','D_H_O_angle','phenyl_centre_patch_distance','own_rule_results','chemical_reason','limit'])
 for x in ['L','L2','L2_with_extra_group']:writer.writerow([x]+['']*8)
receipt={'schemaVersion':1,'role':'Actual author finite calculation, not independent review','calculatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'inputBindings':[bind(P/'finite-L-L2-receptor-geometries.author-candidate.json'),bind(P/'printable-L-L2-atom-and-contact-coordinate-cards.tsv'),bind(P/'printable-ligand-connectivity-and-rod-lengths.tsv')],'atomCountPerPose':len(atoms),'bondCount':len(bonds),'sameTopologyAndBondLengths':lengthEqual,'netChargePerPose':1,'saturatedCarbonAngleChecks':checks,'amidePlanar':True,'amideRotationUnchanged':True,'phenylPlanarityMaximumError':ringPlaneError,'amideTrigonalAngles_deg':{'C2_C3_O':angle(L['C2']['xyz_A'],L['C3']['xyz_A'],L['O']['xyz_A']),'C2_C3_N4':angle(L['C2']['xyz_A'],L['C3']['xyz_A'],L['N4']['xyz_A']),'C3_N4_C5':angle(L['C3']['xyz_A'],L['N4']['xyz_A'],L['C5']['xyz_A'])},'contacts':{'L':contacts(L),'L2':contacts(L2)},'internalFeatureDistances':{name:{'Nplus_O':dist(p['Nplus']['xyz_A'],p['O']['xyz_A']),'Nplus_phenylCentre':dist(p['Nplus']['xyz_A'],centre),'O_phenylCentre':dist(p['O']['xyz_A'],centre)} for name,p in [('L',L),('L2',L2)]},'ownFiniteLayoutActionExecuted':True,'physicalConstructionPerformed':False,'learnerPerformanceRecorded':False,'clinicalInference':False,'humanApproval':False,'strictGain':0}
(P/'actual-finite-L-L2-geometric-construction-and-distance-check.author.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'atomsPerPose':len(atoms),'tetrahedralAngles':tetraOK,'sameBondLengths':lengthEqual,'contacts':receipt['contacts']}))
