from pathlib import Path
import os,json,hashlib,subprocess,time
ROOT=Path('/home/enpasos/projects/skillpilot')
S=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-source7-normal37-reviewed-inactive-j-private-completion-technical-successor-20261010-v2')
CAP=ROOT/'tmp/m7-resumption-20261010/chemistry-source7-normal37-j-integration-isolated-v3'
paths=['curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-27/m7-d-eight-five-keep-20260927-v1/synthesis-decisions.json','curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-23/m7-j10-functions-equations-keep-ten-partial-20260923-v1/synthesis-decisions.json']
rows=[]
for rel in paths:
 src=ROOT/rel; dst=CAP/rel; assert src.is_file() and not src.is_symlink(); assert not dst.exists()
 dst.parent.mkdir(parents=True,exist_ok=True);os.link(src,dst)
 raw=src.read_bytes();assert dst.read_bytes()==raw
 rows.append({'path':rel,'bytes':len(raw),'sha256':'sha256:'+hashlib.sha256(raw).hexdigest(),'historicalSourceChanged':False})
(ROOT/S/'checks/two-mathematik-historical-synthesis-inputs-exact-restoration.actual.json').write_text(json.dumps({'schemaVersion':1,'rows':rows,'exactNormalAttempt4MissingInputs':True,'newReviews':0,'activeWrites':[]},indent=2)+'\n')
config=json.loads((ROOT/S/'registry/all-subjects-latestBio353-chem-only-reviewed.inactive.config.json').read_text());m=next(a for a in config['subjects'] if a['subject']=='mathematik')
m['resolutionIndexPaths']=[p for p in m['resolutionIndexPaths'] if p.endswith(('retained-01.resolution-index.json','retained-05.resolution-index.json'))];assert len(m['resolutionIndexPaths'])==2
config['subjects']=[m];config['reportId']+='-two-restored-historical-synthesis-inputs-targeted'
rel=S/'configs/two-restored-math-D-indexes-targeted-normal.config.json';raw=(json.dumps(config,indent=2)+'\n').encode();(ROOT/rel).write_bytes(raw);(CAP/rel).parent.mkdir(parents=True,exist_ok=True);os.link(ROOT/rel,CAP/rel)
argv=[str(ROOT/'app/node_modules/.bin/tsx'),'app/scripts/reportDeepUnderstandingRollout.ts','--config='+str(rel),'--mode=check','--format=json'];stem=ROOT/S/'checks/two-restored-math-D-indexes-targeted-normal';start=time.monotonic()
with Path(str(stem)+'.stdout.json').open('wb') as a,Path(str(stem)+'.stderr.txt').open('wb') as b:r=subprocess.run(argv,cwd=CAP,stdout=a,stderr=b)
receipt={'schemaVersion':1,'argv':argv,'actualExitCode':r.returncode,'durationSeconds':time.monotonic()-start,'newReviews':0,'activeWrites':[]};Path(str(stem)+'.terminal.actual.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt));assert r.returncode==0
