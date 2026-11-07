#!/usr/bin/env python3
"""Replay this bounded57 candidate in a new RAM namespace; no active repository writes."""
import argparse,gzip,hashlib,json,os,shutil,subprocess
from pathlib import Path
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--repository-root',type=Path,default=Path(__file__).resolve().parents[4]);p.add_argument('--output',type=Path,required=True);a=p.parse_args()
r=a.repository_root.resolve(strict=True);packet=Path(__file__).resolve().parent;w=a.output.resolve()
assert not w.exists() and not w.is_relative_to(r) and str(w).startswith('/dev/shm/')
assert shutil.disk_usage(w.parent).free>=534587474
w.mkdir();(w/'scratch').mkdir();sha=lambda raw:hashlib.sha256(raw).hexdigest()
manifest=json.loads((packet/'manifest.json').read_bytes())
for ref in manifest['files']:assert sha((packet/ref['path']).read_bytes())==ref['sha256'],ref['path']
receipt=json.loads((packet/'receipt.json').read_bytes())
for ref in receipt['unchangedProductionCodePins']:assert sha((r/ref['path']).read_bytes())==ref['sha256'],ref['path']
index=r/'contracts/goal-visualization-context/v1/qualified-context-index-math3-2026-11-07.json';assert sha(index.read_bytes())=='46416dd5939db442dd82c9905008cb89c79dbe9db08e9b19b03f10cde7fd3fd0'
cap=r/'qa-artifacts/ci-contract-audit/2026-11-07/visualization-qualified-context-index-math3-2026-11-07/capsule';assert sha((cap/'capsule.json').read_bytes())=='4f46e57864b5a1277764992f6301f4cb4da9b15ea7cf789e7e96d9d5175d5852'
source=gzip.decompress((r/receipt['privateContext']['sourceCarrier']['path']).read_bytes());assert sha(source)==receipt['privateContext']['sourceRawSha256'];(w/'source.json').write_bytes(source)
qa=gzip.decompress((packet/'private-inputs/mathematik.qa.json.gz').read_bytes());assert sha(qa)=='1ef78226f5b4eab3145b118b67e9feac317dca02c6c0e684d658f670d50f29e1';(w/'qa.json').write_bytes(qa)
kind=gzip.decompress((r/receipt['privateContext']['kindCarrier']['path']).read_bytes());assert sha(kind)=='188ff969598df64e6f455c761f30f65240cba6ad6304558baaefd15b8d82baea';(w/'kind.json').write_bytes(kind)
assert sum(f.stat().st_size for f in(r/'app/scripts').rglob('*')if f.is_file())<40*1024*1024
shutil.copytree(r/'app/scripts',w/'scripts')
for ref in receipt['privateCodeCandidates']:
 if ref['proposedPath'].startswith('app/scripts/'):
  dest=w/'scripts'/Path(ref['proposedPath']).relative_to('app/scripts');dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(packet/ref['path'],dest)
mid='ce198bc9-b014-52ba-814f-25cc3e020668';asset=r/receipt['privateContext']['matrixAsset']['path'];assert sha(asset.read_bytes())==receipt['privateContext']['matrixAsset']['sha256']
assets=[]
for i,path in enumerate(['app/public/assets/goal-visualizations/mathematik/'+mid,'curricula/DE/Gymnasium/visualizations/mathematik/'+mid]):
 assert sum(f.stat().st_size for f in(r/path).iterdir()if f.is_file())<16*1024*1024
 dest=w/('asset'+str(i));shutil.copytree(r/path,dest);shutil.copyfile(asset,dest/(mid+'.png'));assets.append((dest,r/path))
origin=w/'unrelated-origin';subprocess.run(['git','init','-q',str(origin)],check=True)
for _ in range(2):subprocess.run(['git','-C',str(origin),'-c','user.name=Private fixture','-c','user.email=fixture@example.invalid','commit','--quiet','--allow-empty','-m','unrelated shallow fixture'],check=True)
subprocess.run(['git','clone','-q','--depth=1',origin.as_uri(),str(w/'host-shallow')],check=True)
assert subprocess.run(['git','-C',str(w/'host-shallow'),'cat-file','-e','25a6f2164a81a7e6ae50db3557d20521fecf5124'],capture_output=True).returncode!=0
base=['bwrap','--ro-bind','/','/','--dev-bind','/dev','/dev','--proc','/proc','--bind','/dev/shm','/dev/shm','--setenv','TMPDIR',str(w/'scratch'),'--chdir',str(r),'--ro-bind',str(w/'host-shallow/.git'),str(r/'.git'),'--ro-bind',str(w/'scripts'),str(r/'app/scripts'),'--ro-bind',str(w/'source.json'),str(r/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'),'--ro-bind',str(w/'qa.json'),str(r/'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'),'--ro-bind',str(w/'kind.json'),str(r/'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'),'--ro-bind',str(packet/'private-code/scripts/visualization_qualified_context_capsule.py'),str(r/'scripts/visualization_qualified_context_capsule.py')]
for src,dest in assets:base+=['--ro-bind',str(src),str(dest)]
runs=[]
commands=[('actual-raw-materialize',['python3','-B',str(r/'scripts/visualization_qualified_context_capsule.py'),'materialize','--repository-root',str(r),'--accepted-commit','25a6f2164a81a7e6ae50db3557d20521fecf5124','--accepted-census-sha256','46416dd5939db442dd82c9905008cb89c79dbe9db08e9b19b03f10cde7fd3fd0','--census-path',str(index.relative_to(r)),'--capsule',str(cap),'--accepted-capsule-sha256','4f46e57864b5a1277764992f6301f4cb4da9b15ea7cf789e7e96d9d5175d5852','--output',str(w/'originals'),'--maximum-working-bytes','134217728','--maximum-object-bytes','268435456']),('actual-normal-module-maturity',[str(r/'app/node_modules/.bin/tsx'),str(r/'app/scripts/testVisualizationContextMaturity.ts')])]
for name,args in commands:
 proc=subprocess.run(base+['--']+args,capture_output=True);(w/(name+'.stdout')).write_bytes(proc.stdout);(w/(name+'.stderr')).write_bytes(proc.stderr)
 row={'case':name,'argv':base+['--']+args,'exit':proc.returncode,'stdoutSha256':sha(proc.stdout),'stderrSha256':sha(proc.stderr)};runs.append(row);(w/'execution.json').write_text(json.dumps(runs,indent=2)+'\n');assert proc.returncode==0,proc.stderr.decode(errors='replace')
print('Genuine unrelated-depth1 host replay passed: authenticated raw capsule +57 actual current qualifications +31 V/CQR303/Maturity/direct-floor countercases; no active writes.')
