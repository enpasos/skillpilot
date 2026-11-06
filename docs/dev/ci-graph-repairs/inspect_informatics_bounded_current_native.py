#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import subprocess,tempfile,concurrent.futures,json,hashlib,gzip,time
import argparse,copy,sys
sys.dont_write_bytecode=True
root=Path(__file__).resolve().parents[3]
parser=argparse.ArgumentParser(description='Replay the exact bounded current-catalog variants with read-only native QA; no data application.')
parser.add_argument('--out',default='tmp/informatics-bounded-current-candidate-replay')
args=parser.parse_args();out=(root/args.out).resolve()
if not out.is_relative_to(root/'tmp'):parser.error('--out must remain below repository tmp/')
ctx=json.loads((root/'docs/dev/ci-graph-repairs/informatics-bounded-current-candidate-context-2026-11-06.json').read_text());source=root/ctx['source']['path'];cqr=root/ctx['nativeRouteAdapter']['productionPath'];adapter=out/'cqr-private-export-adapter.ts';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(cqr)==ctx['nativeRouteAdapter']['productionSha256']
accepted=json.loads((root/'docs/dev/ci-graph-repairs/informatics-bounded-current-native-impact-2026-11-06.json').read_text())
for path,digest in accepted['execution']['productionInputHashesBeforeAndAfter'].items():
 assert sha(root/path)==digest,'Pinned producer/input differs: '+path
out.mkdir(parents=True,exist_ok=True)
adapter.write_bytes(cqr.read_bytes()+ctx['nativeRouteAdapter']['onlySuffix'].encode())
assert sha(adapter)==ctx['nativeRouteAdapter']['adapterSha256']
for name,variant in ctx['variants'].items():
 candidate=json.loads(source.read_text())
 for op in variant['operations']:
  parts=op['path'].split('/');assert op['op']=='replace' and op['file']==ctx['source']['path'] and len(parts)==4 and parts[:2]==['','goals'] and parts[3]=='requires'
  goal=candidate['goals'][int(parts[2])];assert goal['id']==op['guardGoalId'] and goal['requires']==op['guardRequiresBefore'];goal['requires']=copy.deepcopy(op['value'])
 raw=(json.dumps(candidate,ensure_ascii=False,indent=2)+'\n').encode();assert hashlib.sha256(raw).hexdigest()==variant['hypotheticalSourceSha256'];(out/(name+'.source.json')).write_bytes(raw)
paths=[root/row['path'] for row in ctx['catalogSources']]+[root/ctx['mathLedger']['path'],cqr]
paths += [p for folder in ['semantic-atomicity','memory-card-review'] for p in (root/'curricula/DE/Gymnasium/quality'/folder).glob('canonical-informatics-full.*')]
paths += [root/p for p in ['app/scripts/semanticAtomicityReview.ts','app/scripts/memoryCardReview.ts','app/scripts/applicabilityCompiler.ts','app/src/utils/authoring/compositionViewAuthoring.ts','app/src/utils/authoring/canonicalAuthoring.ts','app/src/utils/goalFilters.ts','app/scripts/lib/skillGraphIntegrity.ts','app/scripts/auditTransitiveMinimality.ts','app/scripts/goalBookModel.ts','docs/dev/ci-graph-repairs/inspect_informatics_bounded_current_scope.ts']]
initial={str(p.relative_to(root)):sha(p) for p in paths}
for row in ctx['catalogSources']+[ctx['mathLedger']]:assert initial[row['path']]==row['sha256']
commands=[('scope',['app/node_modules/.bin/tsx','docs/dev/ci-graph-repairs/inspect_informatics_bounded_current_scope.ts']),('atomicity',['app/node_modules/.bin/tsx','app/scripts/semanticAtomicityReview.ts','--config=curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-informatics-full.config.json','--mode=check']),('memory',['app/node_modules/.bin/tsx','app/scripts/memoryCardReview.ts','--config=curricula/DE/Gymnasium/quality/memory-card-review/canonical-informatics-full.config.json','--mode=check'])]
def run(mode):
 result=[]
 with tempfile.TemporaryDirectory(prefix='native-bounded-cache-',dir=out) as directory:
  prefix=['bwrap','--die-with-parent','--unshare-net','--ro-bind','/','/','--proc','/proc','--dev','/dev','--bind',directory,'/tmp','--setenv','TMPDIR','/tmp','--setenv','PYTHONDONTWRITEBYTECODE','1','--ro-bind',str(adapter),str(cqr),'--ro-bind',str(out/(mode+'.source.json')),str(source),'--chdir',str(root),'--']
  for name,command in commands:
   actual=prefix+command+([mode] if name=='scope' else [])
   output=out/(mode+'-'+name+('.stdout.json.gz' if name=='scope' else '.stdout.log'));rawsha=hashlib.sha256();rawbytes=0
   with (out/(mode+'-'+name+'.stderr.log')).open('wb') as stderr:
    if name=='scope':
     with output.open('wb') as file,gzip.GzipFile(filename='',mode='wb',fileobj=file,mtime=0) as compressed:
      process=subprocess.Popen(actual,stdout=subprocess.PIPE,stderr=stderr)
      while chunk:=process.stdout.read(131072):rawsha.update(chunk);rawbytes+=len(chunk);compressed.write(chunk)
      code=process.wait()
     decoded=gzip.decompress(output.read_bytes());assert len(decoded)==rawbytes and hashlib.sha256(decoded).hexdigest()==rawsha.hexdigest()
    else:
     with output.open('wb') as stdout:code=subprocess.run(actual,stdout=stdout,stderr=stderr).returncode
     rawsha.update(output.read_bytes());rawbytes=output.stat().st_size
   row={'variant':mode,'check':name,'exitCode':code,'stdoutPath':str(output.relative_to(root)),'rawBytes':rawbytes,'rawSha256':rawsha.hexdigest(),'storedBytes':output.stat().st_size,'storedSha256':sha(output),'compressed':name=='scope'};result.append(row);print(json.dumps(row),flush=True)
   if code:break
 assert {path:sha(root/path) for path in initial}==initial,'Production input changed during read-only run'
 return result
started=time.time()
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:results=list(pool.map(run,list(ctx['variants'])))
report={'sourceDataApplied':False,'qaApprovalClaimed':False,'productionInputHashesBeforeAndAfter':initial,'commands':sum(results,[]),'elapsedSeconds':time.time()-started,'nativeRouteAdapter':ctx['nativeRouteAdapter']}
(out/'native-results.json').write_text(json.dumps(report,indent=2)+'\n')
if len(report['commands'])!=24 or any(row['exitCode'] for rows in results for row in rows):raise SystemExit(1)
