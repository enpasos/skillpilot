#!/usr/bin/env python3
"""Durable fixed74 replay at normal module paths; read-only host and own RAM namespace."""
import argparse,datetime,gzip,hashlib,json,os,shutil,subprocess
from pathlib import Path
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--repository-root',type=Path,default=Path(__file__).resolve().parents[4])
parser.add_argument('--output',type=Path,required=True)
parser.add_argument('--full-deep-report',action='store_true')
args=parser.parse_args();root=args.repository_root.resolve(strict=True);packet=Path(__file__).resolve().parent;w=args.output.resolve()
assert not w.exists() and str(w).startswith('/dev/shm/') and not w.is_relative_to(root)
assert shutil.disk_usage(w.parent).free>=1073741824
sha=lambda raw:hashlib.sha256(raw).hexdigest()
manifest=json.loads((packet/'manifest.json').read_bytes())
for ref in manifest['files']:assert sha((packet/ref['path']).read_bytes())==ref['sha256'],ref['path']
receipt=json.loads((packet/'receipt.json').read_bytes())
for ref in receipt['protectedActiveInputs']:assert sha((root/ref['path']).read_bytes())==ref['sha256'],ref['path']
w.mkdir();(w/'scratch').mkdir();(w/'results').mkdir()
snapshot=w/'workspace.index.readonly';snapshot.write_bytes((root/'.git/index').read_bytes());snapshot.chmod(0o444)
shutil.copytree(root/'app/scripts',w/'scripts');shutil.copytree(root/'scripts',w/'root-scripts',ignore=shutil.ignore_patterns('__pycache__'))
shutil.copytree(root/'contracts/goal-visualization-context/v1',w/'contracts')
for source in(packet/'private-code').rglob('*'):
 if not source.is_file():continue
 rel=source.relative_to(packet/'private-code');name=str(rel)
 if name.startswith('app/scripts/'):dest=w/'scripts'/rel.relative_to('app/scripts')
 elif name.startswith('scripts/'):dest=w/'root-scripts'/rel.relative_to('scripts')
 elif name.startswith('contracts/goal-visualization-context/v1/'):dest=w/'contracts'/rel.relative_to('contracts/goal-visualization-context/v1')
 else:continue
 dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,dest)
subprocess.run(['git','init','--quiet',str(w/'origin')],check=True)
for _ in range(2):subprocess.run(['git','-C',str(w/'origin'),'-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','--quiet','--allow-empty','-m','Unrelated depth1 host'],check=True)
subprocess.run(['git','clone','--quiet','--depth=1',(w/'origin').as_uri(),str(w/'host')],check=True)
pins=receipt['fixed74Pins'];anchor='25a6f2164a81a7e6ae50db3557d20521fecf5124'
assert subprocess.check_output(['git','-C',str(w/'host'),'rev-parse','--is-shallow-repository']).strip()==b'true'
assert subprocess.run(['git','-C',str(w/'host'),'cat-file','-e',anchor],capture_output=True).returncode!=0
prefix=['bwrap','--ro-bind','/','/','--dev-bind','/dev','/dev','--proc','/proc','--bind','/dev/shm','/dev/shm',
 '--ro-bind',str(w/'host/.git'),str(root/'.git'),'--ro-bind',str(w/'scripts'),str(root/'app/scripts'),
 '--ro-bind',str(w/'root-scripts'),str(root/'scripts'),'--ro-bind',str(w/'contracts'),str(root/'contracts/goal-visualization-context/v1'),
 '--ro-bind',str(snapshot),str(snapshot),'--setenv','GIT_INDEX_FILE',str(snapshot),'--setenv','TMPDIR',str(w/'scratch'),'--chdir',str(root),'--']
commands=[('actual-unrelated-depth1-raw-materialize',['python3','-B',root/'scripts/visualization_qualified_context_capsule.py','materialize',
 '--repository-root',root,'--accepted-commit',anchor,'--accepted-census-sha256',pins['indexSha256'],'--census-path',pins['indexPath'],
 '--capsule',root/pins['capsulePath'],'--accepted-capsule-sha256',pins['capsuleSha256'],'--output',w/'originals',
 '--maximum-working-bytes','201326592','--maximum-object-bytes','268435456']),
 ('actual-normal-module-maturity',[root/'app/node_modules/.bin/tsx',root/'app/scripts/testVisualizationContextMaturity.ts'])]
if args.full_deep_report:commands.append(('actual-full-five-subject-deep-report',[root/'app/node_modules/.bin/tsx',root/'app/scripts/reportDeepUnderstandingRollout.ts','--format=json']))
results=[]
for name,command in commands:
 started=datetime.datetime.now(datetime.timezone.utc).isoformat();run=subprocess.run(prefix+list(map(str,command)),capture_output=True)
 (w/'results'/f'{name}.stdout.gz').write_bytes(gzip.compress(run.stdout,mtime=0));(w/'results'/f'{name}.stderr.gz').write_bytes(gzip.compress(run.stderr,mtime=0))
 row={'name':name,'startedUtc':started,'completedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':run.returncode,
  'stdoutSha256':sha(run.stdout),'stderrSha256':sha(run.stderr),'argv':prefix+list(map(str,command))};results.append(row)
 (w/'execution.json').write_text(json.dumps(results,indent=2)+'\n')
 assert run.returncode==0,(name,run.stderr[-3000:])
 if name=='actual-full-five-subject-deep-report':
  report=json.loads(run.stdout);assert sum(r['denominator']for r in report['subjects'])==2483
  assert sum(r['gates']['currentVisualizationQaRecords']for r in report['subjects'])==74
print(json.dumps({'privateFixed74ReplayPassed':True,'actualDepth1Host':True,'normalModuleMaturityPassed':True,
 'fullDeepReportExecuted':args.full_deep_report,'workspaceIndexSnapshotSha256':sha(snapshot.read_bytes()),'hostWrites':False}))
