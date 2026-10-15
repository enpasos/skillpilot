from pathlib import Path
import datetime,json,os,subprocess,sys
O=Path(__file__).resolve().parent;M=Path('/home/enpasos/projects/skillpilot');R=O/'isolated-root';N=M/'tmp/ci-tools/node-v20.20.2-linux-x64/bin/node'
name,script,*args=sys.argv[1:]
argv=[str(N),str(R/'app/node_modules/tsx/dist/cli.mjs'),str(R/'app/scripts'/script),*args]
env={**os.environ,'GIT_OPTIONAL_LOCKS':'0','PATH':str(N.parent)+':'+str(M/'tmp/ci-tools/poppler-root/usr/bin')+':'+os.environ['PATH'],'LD_LIBRARY_PATH':str(M/'tmp/ci-tools/poppler-root/usr/lib/x86_64-linux-gnu')+':'+os.environ.get('LD_LIBRARY_PATH','')}
start=datetime.datetime.now(datetime.timezone.utc).isoformat()
cwd=R/'app' if script in ['generateCurriculumQualityStatus.ts','checkCurriculumMaturityFloors.ts','validateGraph.ts','validateCompositionViews.ts','generateCrossSubjectRequiresInventory.ts'] else R
with (O/(name+'.stdout.raw.txt')).open('xb') as a,(O/(name+'.stderr.raw.txt')).open('xb') as b:
    p=subprocess.run(argv,cwd=cwd,env=env,stdout=a,stderr=b)
(O/(name+'.execution.actual.json')).write_text(json.dumps({'argv':argv,'cwd':str(cwd),'startedAtUTC':start,'finishedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':p.returncode,'MainWrites':False},indent=2)+'\n')
print(name,p.returncode)
print((O/(name+'.stdout.raw.txt')).read_text()[-1800:]);print((O/(name+'.stderr.raw.txt')).read_text()[-1800:])
sys.exit(p.returncode)
