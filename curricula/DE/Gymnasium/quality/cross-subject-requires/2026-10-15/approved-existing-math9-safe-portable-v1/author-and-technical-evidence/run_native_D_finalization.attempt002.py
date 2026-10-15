from pathlib import Path
import datetime,json,os,subprocess
M=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent;R=O/'isolated-root-with-current-D-v2';B='curricula/DE/Gymnasium/quality/cross-subject-requires/2026-10-15/approved-existing-math9-safe-portable-v1';N=M/'tmp/ci-tools/node-v20.20.2-linux-x64/bin/node'
env={**os.environ,'GIT_OPTIONAL_LOCKS':'0','PATH':str(N.parent)+':'+str(M/'tmp/ci-tools/poppler-root/usr/bin')+':'+os.environ['PATH'],'LD_LIBRARY_PATH':str(M/'tmp/ci-tools/poppler-root/usr/lib/x86_64-linux-gnu')+':'+os.environ.get('LD_LIBRARY_PATH','')}
checks=[('native-fresh-D-synthesis-manifest-attempt002','materializeGoalDescriptionRolloutSynthesisManifest.ts',['--config',B+'/current-D/nine.config.json','--authoring',B+'/current-D/native-nine/synthesis-authoring.actual.json','--write']),('native-fresh-D-resolutions-attempt001','materializeGoalDescriptionRolloutResolutions.ts',['--config',B+'/current-D/nine.config.json','--synthesis-manifest',B+'/current-D/native-nine/synthesis-decisions.json','--write']),('native-fresh-D-index-finalize-attempt001','materializeGoalDescriptionRolloutBatch.ts',['finalize','--config',B+'/current-D/nine.config.json','--write'])]
for name,script,args in checks:
 argv=[str(N),str(R/'app/node_modules/tsx/dist/cli.mjs'),str(R/'app/scripts'/script)]+args;start=datetime.datetime.now(datetime.timezone.utc).isoformat()
 with (O/(name+'.stdout.raw.txt')).open('xb') as a,(O/(name+'.stderr.raw.txt')).open('xb') as b:p=subprocess.run(argv,cwd=R,env=env,stdout=a,stderr=b)
 (O/(name+'.execution.actual.json')).write_text(json.dumps({'argv':argv,'cwd':str(R),'startedAtUTC':start,'finishedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':p.returncode,'MainWrites':False},indent=2)+'\n');print(name,p.returncode,flush=True)
 if p.returncode:break
