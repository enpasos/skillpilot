import pathlib,json,hashlib,shutil,time
R=pathlib.Path('/home/enpasos/projects/skillpilot');W=pathlib.Path('/dev/shm/informatics-q2-implementation-20261107'); F=W/'frozen';F.mkdir(exist_ok=True)
h=lambda b:hashlib.sha256(b).hexdigest()
P=R/'qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-full-context-scope-repair-analysis';seal=P/'analysis-seal.json';assert h(seal.read_bytes())=='1f8733baba445186927a1a10bd99cdf9c1d86a4e23c19f8f80420b8f02152ed3'
for x in json.loads(seal.read_text())['files']:assert h((P/x['path']).read_bytes())==x['sha256'],x['path']
paths=[]
for root in ['app/scripts','app/src','contracts/curriculum-package','scripts']:
 for p in (R/root).rglob('*'):
  if p.is_file() and not any(x in p.parts for x in ['node_modules','__pycache__']):paths.append(p)
for p in (R/'curricula').rglob('*'):
 if p.is_file() and p.suffix.lower() in ['.json','.md','.txt'] and 'goal-evidence' not in p.parts and 'goal-visualization-review' not in p.parts:paths.append(p)
for p in [R/'AGENTS.md',R/'app/package.json',R/'app/tsconfig.json',R/'app/tsconfig.node.json']: 
 if p.exists():paths.append(p)
records=[]
for p in sorted(set(paths)):
 rel=p.relative_to(R);b=p.read_bytes();dest=F/rel;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(b);records.append({'path':str(rel),'bytes':len(b),'sha256':h(b)})
(F/'app/node_modules').symlink_to(R/'app/node_modules',target_is_directory=True)
canonical=[x for x in records if x['path'].startswith('curricula/DE/Gymnasium/canonical/') and x['path'].endswith('.json') and '_deck' not in pathlib.Path(x['path']).name];assert len(canonical)==21
info=next(x for x in canonical if 'INFORMATIK.' in x['path']);assert info['sha256']=='85411185514af4b2ecf818807f3bd6fe5df17fb5011c5ebf8c4996de1a47817e'
(W/'frozen-manifest.json').write_text(json.dumps({'frozenAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'files':records,'canonical21':canonical,'analysisSealSha256':h(seal.read_bytes())},indent=2)+'\n')
for x in records:assert h((R/x['path']).read_bytes())==x['sha256'],x['path']
print(json.dumps({'files':len(records),'bytes':sum(x['bytes'] for x in records),'inputs21':canonical},indent=2))
