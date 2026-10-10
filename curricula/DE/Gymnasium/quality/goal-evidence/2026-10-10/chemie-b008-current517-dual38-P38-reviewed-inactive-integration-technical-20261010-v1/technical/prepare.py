# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,hashlib,os,shutil,datetime
R=Path.cwd();BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10');OUT=BASE/'chemie-b008-current517-dual38-P38-reviewed-inactive-integration-technical-20261010-v1';AUTH=BASE/'chemie-b008-current517-machine-content-native-readiness-author-20261010-v1';A=BASE/'chemie-b008-current517-native-context-independent-a-20261010-v1';B=BASE/'chemie-b008-current517-native-context-independent-b-20261010-v1'
sha=lambda b:'sha256:'+hashlib.sha256(b).hexdigest()
def dump(p,x):
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def copy(s,d):
 d.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(s,d);assert s.read_bytes()==d.read_bytes();return {'sourcePath':str(s),'targetPath':str(d),'sha256':sha(s.read_bytes()),'bytes':s.stat().st_size}
checked=[]
def verify(v):
 if isinstance(v,dict):
  if isinstance(v.get('path'),str)and isinstance(v.get('sha256'),str):
   p=Path(v['path']);assert p.is_file(),p;raw=p.read_bytes();assert sha(raw)==v['sha256'],p
   if isinstance(v.get('bytes'),int):assert len(raw)==v['bytes'],p
   checked.append(v)
  for z in v.values():verify(z)
 elif isinstance(v,list):
  for z in v:verify(z)
for p,h in [(A/'independent-a-current-native.final.entry.json','2653dfb303ed58204dcdc78facf658194bb4bcab1a4ec1886bb60c205e4f005d'),(A/'independent-a-current-native.final.freeze.json','210de5152cb34469bbff90b6101c2caf1debaadee161866d9e197d1d00e568c4'),(B/'independent-b.final.entry.json','e42c1d7aa42de12ef37d883a06919048b26bb24dba7ad90d8d592818167b4b91'),(B/'independent-b.final.freeze.json','ee28d59755a45392b4f73e943eddbefae54b95d018c8b8c1a52f9dfc8cc11274')]:
 assert sha(p.read_bytes())=='sha256:'+h,p;verify(json.loads(p.read_text()))
groups=[];copies=[]
for name in ['current20','current6','protected12']:
 dst=OUT/name;src=AUTH/'native'/name;cfg=json.loads((AUTH/f'native/{name}.normal-rollout.batch.config.json').read_text());cfg['outputDirectory']=str(dst);cfgpath=dst/'batch.config.json';dump(cfgpath,cfg)
 manifest=json.loads((src/'batch-manifest.json').read_text());manifest['configPath']=str(cfgpath);manifest['configDigest']=sha(cfgpath.read_bytes());dump(dst/'batch-manifest.json',manifest)
 link=dst/'bundle';target=os.path.relpath(src/'bundle',dst)
 if not link.exists():link.symlink_to(target,target_is_directory=True)
 assert link.resolve()==(src/'bundle').resolve()
 for rnd,reviewer in [('round-a',A),('round-b',B)]:
  for p in (src/rnd).rglob('*'):
   if p.is_file():copies.append(copy(p,dst/rnd/p.relative_to(src/rnd)))
  campaign=json.loads((src/rnd/'description-review-campaign.json').read_text());batchId=campaign['batches'][0]['batchId'] if 'batches'in campaign else json.loads(next((src/rnd/'batches').glob('*.json')).read_text())['batchId']
  if rnd=='round-a':rp=reviewer/f'native/{name}/description-records.actual-independent-a.jsonl';mp=reviewer/f'native/{name}/run-manifest.actual-independent-a.json'
  else:rp=next((reviewer/f'native/{name}/results').glob('*.records.jsonl'));mp=next((reviewer/f'native/{name}/results').glob('*.run.json'))
  # Filenames must match the actual normal batch id.
  run=json.loads(mp.read_text());batchId=run['batchId']
  copies.append(copy(rp,dst/rnd/'results'/f'{batchId}.records.jsonl'));copies.append(copy(mp,dst/rnd/'results'/f'{batchId}.run.json'))
 groups.append({'group':name,'configPath':str(cfgpath),'goalIds':manifest['goalIds'],'firstScientificSource':str(A),'secondScientificSource':str(B),'bundleRelativeTarget':target})
dump(OUT/'native-groups.technical.json',groups);dump(OUT/'checks/exact-scientific-freeze-and-input-retention.actual.json',{'schemaVersion':1,'verifiedBindings':checked,'copies':copies,'groups':groups,'currentPhasePeerReadOnlyAfterOwnFirstSeal':True,'role':'post-seal technical integrator by existing independent B; no third scientific review','provider':'OpenAI','model':'Codex GPT-6 agent','exactModelRevision':'not exposed','providerDiversityClaim':False,'activeWrites':[]})
print('Prepared exact native dual groups',len(groups),'copies',len(copies),'verified sealed bindings',len(checked))
