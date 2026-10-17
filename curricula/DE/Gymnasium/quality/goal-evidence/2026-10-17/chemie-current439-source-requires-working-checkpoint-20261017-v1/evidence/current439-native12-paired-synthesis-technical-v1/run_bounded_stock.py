from pathlib import Path
import datetime,json,os,subprocess,time,sys
O=Path(__file__).parent;K=O/'capsule'
s=json.loads((O/'STAGE.actual-native12-original-byte-copies.json').read_text())
loader='/home/enpasos/projects/skillpilot/app/node_modules/tsx/dist/loader.mjs'
env=dict(os.environ,TSX_DISABLE_CACHE='1',NO_COLOR='1',NODE_OPTIONS='--preserve-symlinks --preserve-symlinks-main')
commands=[('create-manifest',['node','--import',loader,str(O/'synthesize_native12.mjs')]),('materialize-resolutions',['node','--import',loader,str(K/'app/scripts/materializeGoalDescriptionRolloutResolutions.ts'),'--config',s['configRelativePath'],'--synthesis-manifest',s['nativeRootRelativePath']+'/synthesis-decision-manifest.json','--write']),('materialize-index',['node','--import',loader,str(K/'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),'finalize','--config',s['configRelativePath'],'--write']),('validate-index',['node','--import',loader,str(K/'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),'finalize','--config',s['configRelativePath']])]
if '--finalize-only' in sys.argv:commands=commands[2:]
for name,argv in commands:
 start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic()
 r=subprocess.run(argv,cwd=K,env=env,text=True,capture_output=True)
 (O/(name+'.stdout.raw.txt')).write_text(r.stdout)
 (O/(name+'.stderr.raw.txt')).write_text(r.stderr)
 data={'argv':argv,'cwd':str(K),'NODE_OPTIONS':env['NODE_OPTIONS'],'atUTC':start,'elapsedSeconds':time.monotonic()-t,'exitCode':r.returncode,'stdoutPath':str(O/(name+'.stdout.raw.txt')),'stderrPath':str(O/(name+'.stderr.raw.txt'))}
 (O/(name+'.command.json')).write_text(json.dumps(data,indent=2)+'\n')
 print(json.dumps({'name':name,'exitCode':r.returncode,'stdout':r.stdout,'stderr':r.stderr}),flush=True)
 if r.returncode:raise SystemExit(r.returncode)
