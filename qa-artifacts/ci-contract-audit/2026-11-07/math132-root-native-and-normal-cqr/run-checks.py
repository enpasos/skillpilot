from pathlib import Path
import os,sys,json,subprocess,hashlib,datetime,shutil,tempfile
root=Path('/home/enpasos/projects/skillpilot'); mode=sys.argv[1]
base=Path('/dev/shm/root-math132-final-20261107');base.mkdir(exist_ok=True)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def snapshot():
 old=json.loads(Path('/dev/shm/root-retained-powi-normal-cqr-j3poxoty/preflight.json').read_text())['protectedInputHashes']
 paths={root/p for p in old}
 for folder in ['app/scripts','contracts/goal-visualization-context/v1','qa-artifacts/ci-contract-audit/2026-11-07/math58-active-integration','qa-artifacts/ci-contract-audit/2026-11-07/boxplot-label-private-activation-package','qa-artifacts/ci-contract-audit/2026-11-07/boxplot-label-independent-positive-evidence-review']:
  paths.update(p for p in (root/folder).rglob('*') if p.is_file() and '__pycache__' not in p.parts)
 for line in ['curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json','curricula/DE/Gymnasium/visualizations/mathematik/b819973b-4cad-48a4-9f7e-f74b5e75ea6c/b819973b-4cad-48a4-9f7e-f74b5e75ea6c.png','app/public/assets/goal-visualizations/mathematik/b819973b-4cad-48a4-9f7e-f74b5e75ea6c/b819973b-4cad-48a4-9f7e-f74b5e75ea6c.png']:
  paths.add(root/line)
 return {str(p.relative_to(root)):sha(p) for p in sorted(paths)}
work=base/mode;work.mkdir(exist_ok=False)
for name in ['temporary','repository-tmp','npm-cache']: (work/name).mkdir()
shutil.copyfile((root/'.git/index').resolve(),work/'workspace.index.readonly')
before=snapshot();(work/'protected-before.json').write_text(json.dumps(before,indent=2)+'\n')
common=['bwrap','--ro-bind','/','/','--dev-bind','/dev','/dev','--proc','/proc','--bind','/dev/shm','/dev/shm','--bind',str(work/'repository-tmp'),str(root/'tmp')]
if mode=='producer':
 shutil.copytree(root/'docs/qa-ci/status',work/'status');chemistry=json.loads(Path('/dev/shm/root-retained-powi-normal-cqr-j3poxoty/preflight.json').read_text())['chemistryReportBefore']['path']
 shutil.copyfile(root/chemistry,work/'chemistry-report.md')
 common+=['--bind',str(work/'status'),str(root/'docs/qa-ci/status'),'--bind',str(work/'chemistry-report.md'),str(root/chemistry)]
command=common+['--chdir',str(root/'app'),'--setenv','GIT_INDEX_FILE',str(work/'workspace.index.readonly'),'--setenv','TMPDIR',str(work/'temporary'),'--setenv','npm_config_cache',str(work/'npm-cache'),'--','npm','run',{'entry':'test:deep-understanding-rollout','producer':'quality:curriculum-status','floor':'check:curriculum-maturity-floors'}[mode]]
record={'recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'mode':mode,'command':command,'protectedInputCount':len(before),'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()}
with (work/'stdout.log').open('wb') as out,(work/'stderr.log').open('wb') as err:
 process=subprocess.Popen(command,cwd=root/'app',stdout=out,stderr=err);record['pid']=process.pid;(work/'execution.json').write_text(json.dumps(record,indent=2)+'\n');print('START',mode,process.pid,len(before),flush=True);code=process.wait()
record.update(exitCode=code,finishedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),stdoutSha256=sha(work/'stdout.log'),stderrSha256=sha(work/'stderr.log'))
(work/'execution.json').write_text(json.dumps(record,indent=2)+'\n')
after=snapshot();drift=[p for p in set(before)|set(after) if before.get(p)!=after.get(p)]
(work/'postflight.json').write_text(json.dumps({'protectedInputs':len(before),'allUnchanged':not drift,'drift':sorted(drift)},indent=2)+'\n')
print('DONE',mode,'exit',code,'drift',len(drift),flush=True)
assert not drift,drift
raise SystemExit(code)
