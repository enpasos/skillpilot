# SPDX-License-Identifier: Apache-2.0
# Inactive exact preparation after the genuine B first seal; no scientific review.
import copy
import hashlib
import json
from pathlib import Path

ROOT=Path.cwd()
OWN=Path(__file__).resolve().parent
BASE=OWN.parent
AUTHOR=BASE/'biologie-human20-current391-author-v1'
IMAGE=ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-human20-image-author-continuation-root-20261007-v2'
def digest(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def rel(p):return str(Path(p).relative_to(ROOT))
def bind(p):return {'path':rel(p),'sha256':digest(p),'bytes':Path(p).stat().st_size}
def read(p):return json.loads(Path(p).read_text())
def write(p,value):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True)
 data=value if isinstance(value,bytes) else (json.dumps(value,ensure_ascii=False,indent=2)+'\n').encode()
 if p.exists():assert p.read_bytes()==data,'An existing prepared file must not silently change.'
 else:
  with p.open('xb') as f:f.write(data)
 return bind(p)
sourcepaths={
 'canonical':'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',
 'kinds':'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json',
 'qa':'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json',
 'registry':'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
 'ledger':'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json',
 'maturityFloors':'app/scripts/config/curriculum-maturity-floor-policy.json',
}
before={key:bind(ROOT/path) for key,path in sourcepaths.items()}
assert before['canonical']['sha256']=='sha256:007d968e828f198bbd6c45c1b4a01c948c2eb3c88d4a9170a25c4a9bf104a8c5'
for key,b in before.items():write(OWN/'before'/f'{key}.json',(ROOT/b['path']).read_bytes())
entry=read(IMAGE/'neutral-final-human20-raster-native-review.entry.json')
images=read(IMAGE/'selected-twenty-author-images.exact.json')['images']
ids=[row['goalId'] for row in images];selected=set(ids)
old=read(ROOT/sourcepaths['canonical'])
futurepath=AUTHOR/'candidate/canonical.current474-twenty-new-raster-author.json'
future=read(futurepath)
assert digest(futurepath)=='sha256:99385b6eb462ed8888d7127653fb7b589698ae13fc176ebd52af6b5bdb09d18f'
assert len(old['goals'])==len(future['goals'])==474 and len(selected)==20
oldby={g['id']:g for g in old['goals']};newby={g['id']:g for g in future['goals']}
assert {k:v for k,v in old.items() if k!='goals'}=={k:v for k,v in future.items() if k!='goals'}
assert [g['id'] for g in old['goals']]==[g['id'] for g in future['goals']]
patches=[]
for g in old['goals']:
 n=newby[g['id']]
 if g['id'] not in selected:assert g==n
 else:
  assert {k:v for k,v in g.items() if k!='resourceLinks'}=={k:v for k,v in n.items() if k!='resourceLinks'}
  assert not [r for r in g.get('resourceLinks',[]) if r.get('type')=='goal-visualization']
  links=[r for r in n.get('resourceLinks',[]) if r.get('type')=='goal-visualization'];assert len(links)==1
  assert [r for r in g.get('resourceLinks',[]) if r.get('type')!='goal-visualization']==[r for r in n.get('resourceLinks',[]) if r.get('type')!='goal-visualization']
  expected=f'/assets/goal-visualizations/biologie/{g["id"]}/{g["id"]}.png';assert links[0]['url']==expected
  patches.append({'goalId':g['id'],'beforeResourceLinks':g.get('resourceLinks',[]),'afterResourceLinks':n['resourceLinks'],'futureCanonicalPNG':f'curricula/DE/Gymnasium/visualizations/biologie/{g["id"]}/{g["id"]}.png','futureAppPNG':'app/public'+expected,'futureBackendPNG':'backend/src/main/resources/static'+expected,'imageUrl':expected})
write(OWN/'candidate/canonical.future-active.json',futurepath.read_bytes())
kinds=copy.deepcopy(read(ROOT/sourcepaths['kinds']))
assert kinds['counts']['curricularAtomic']==391 and kinds['counts']['total']==474
kinds['sourceLandscapePath']=rel(OWN/'candidate/canonical.future-active.json')
write(OWN/'candidate/semantic-kinds.inactive-native.json',kinds)
baseline=BASE/'biologie-ecology20b-twelve-reviewed-active-integration-root-v1/active-after-twelve-central.actual.json'
report=read(baseline);by={s['subject']:s for s in report['subjects']}
assert report['blockingIssueCount']==0
assert {k:by[k]['strictComplete'] for k in by}=={'mathematik':807,'physik':478,'chemie':173,'biologie':134}
protected=by['biologie']['strictCompleteGoalIds'];assert len(protected)==134 and not selected.intersection(protected)
assert len(read(ROOT/sourcepaths['maturityFloors'])['floors'])==9
plan={'schemaVersion':1,'artifactKind':'inactive-exact-reviewed-human20-resource-link-guards','beforeBindings':before,'selectedGoalIds':ids,'rows':patches,'wholeCanonicalCount':474,'curricularAtomicCount':391,'exactOtherGoalBodies':454,'protectedStrictGoalIds':protected,'protectedStrictBySubject':{k:{'denominator':v['denominator'],'strictComplete':v['strictComplete'],'strictCompleteGoalIds':v['strictCompleteGoalIds']} for k,v in by.items()},'strictBaselineReport':bind(baseline),'protectedMaturityFloorCount':9,'selectedAuthorExactNeutralEntry':bind(IMAGE/'neutral-final-human20-raster-native-review.entry.json'),'noActiveWrites':True,'humanApproval':False,'humanTrial':False}
write(OWN/'candidate/twenty-exact-resource-link-patches.guarded.json',plan)
print(json.dumps({'inactiveExactWholeCanonical':474,'currentAtomic':391,'selectedResources':20,'exactOtherWholeGoals':454,'protectedBiologyStrict':134,'protectedFloors':9,'activeWrites':0}))
