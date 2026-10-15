"""Execute real tools against detached source, retaining every attempt.
SPDX-License-Identifier: Apache-2.0
"""
from pathlib import Path
import concurrent.futures,datetime,hashlib,json,os,subprocess
M=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent;R=O/'isolated-root';N=M/'tmp/ci-tools/node-v20.20.2-linux-x64/bin/node'
def bind(p):
 b=p.read_bytes();return {'path':str(p.relative_to(M)),'bytes':len(b),'sha256':'sha256:'+hashlib.sha256(b).hexdigest()}
def run(name,args,cwd=R/'app',expected=None):
 assert not (O/(name+'.execution.actual.json')).exists()
 argv=[str(N),str(R/'app/node_modules/tsx/dist/cli.mjs')]+[str(a) for a in args]
 start=datetime.datetime.now(datetime.timezone.utc).isoformat()
 with (O/(name+'.stdout.raw.txt')).open('xb') as out,(O/(name+'.stderr.raw.txt')).open('xb') as err:p=subprocess.run(argv,cwd=cwd,env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'},stdout=out,stderr=err)
 rec={'argv':argv,'cwd':str(cwd),'startedAtUTC':start,'finishedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':p.returncode,'stdout':bind(O/(name+'.stdout.raw.txt')),'stderr':bind(O/(name+'.stderr.raw.txt')),'privatePhysicalScript':bind(Path(args[0])),'MainWritten':False,'scientificSourceHumanOrLearnerApproval':False}
 (O/(name+'.execution.actual.json')).write_text(json.dumps(rec,indent=2)+'\n');print(json.dumps({'name':name,'exitCode':p.returncode}),flush=True);return rec
checks=[('native-M7.after-P-author-attempt002',[R/'app/scripts/reportDeepUnderstandingRollout.ts','--config=native-input/M7.focused.config.json','--mode=check','--format=json'],R),
        ('native-global-graph-attempt001',[R/'app/scripts/validateGraph.ts'],R/'app'),
        ('native-composition-attempt001',[R/'app/scripts/validateCompositionViews.ts'],R/'app'),
        ('native-inventory-write-attempt001',[R/'app/scripts/generateCrossSubjectRequiresInventory.ts','--config','curricula/quality/cross-subject-requires/math-physics.config.json','--output','native-output/candidate.inventory.json','--write'],R/'app')]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(lambda item:run(*item),checks))
(O/'native-checks.execution-summary.actual.json').write_text(json.dumps(results,indent=2)+'\n')
print('All original return codes retained; a failed M7 remains failed.',flush=True)
