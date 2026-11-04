from pathlib import Path
import json,subprocess,time,hashlib,concurrent.futures
R=Path.cwd();H=R/'tmp/approach-review-20261101';O=Path(__file__).resolve().parent;P=O/'normal-default-host';N=O/'negative-all121-host';out=O/'normal-default-checks';out.mkdir(exist_ok=True);read=lambda p:json.loads(p.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();assert (O/'default-hosts.preparation.json').exists()
combined=read(H/'math-q3-final-source-candidate-20261104-v1/combined-command.json')[:4]+['--data-root',str(P),'--check']
cmds=[('country',['node',str(R/'app/node_modules/tsx/dist/cli.mjs'),'app/scripts/generateMathCountrySekICompositionViews.ts','--check'],P),('duration',['node',str(R/'app/node_modules/tsx/dist/cli.mjs'),'app/scripts/generateMathDurationCompositionViews.ts','--check'],P),('combined',combined,P),('negative-all121-removed',['node',str(R/'app/node_modules/tsx/dist/cli.mjs'),'app/scripts/generateMathCountrySekICompositionViews.ts','--check'],N)]
inputs=read(H/'math-q3-whole-forms-native-20261104-v1/candidate-input-hashes.json');guard={str(p.relative_to(P)):sha(p)for p in [P/rel for rel in inputs]};guard.update({str(p.relative_to(O/'overlay')):sha(p)for p in (O/'overlay').rglob('*')if p.is_file()});(out/'positive-inputs.before.json').write_text(json.dumps(guard,indent=2)+'\n')
def run(item):
 name,cmd,cwd=item;t=time.monotonic();stdout=out/(name+'.stdout.txt');stderr=out/(name+'.stderr.txt');assert not stdout.exists()
 with stdout.open('w')as so,stderr.open('w')as se:r=subprocess.run(cmd,cwd=cwd,stdout=so,stderr=se)
 rec={'name':name,'command':cmd,'cwd':str(cwd.relative_to(R)),'exitCode':r.returncode,'seconds':round(time.monotonic()-t,2),'defaultReceiptOnly':True,'specialReviewFlag':False,'stdout':{'path':str(stdout.relative_to(R)),'sha256':sha(stdout)},'stderr':{'path':str(stderr.relative_to(R)),'sha256':sha(stderr)}};(out/(name+'.execution.json')).write_text(json.dumps(rec,indent=2)+'\n');print(name,r.returncode,rec['seconds'],flush=True);return rec
with concurrent.futures.ThreadPoolExecutor(max_workers=4)as pool:records=list(pool.map(run,cmds))
assert all(sha(P/rel)==h for rel,h in guard.items()),'check mutated positive inputs'
result={'status':'TERMINAL_DEFAULT_CLI_EXECUTIONS','executions':records,'positiveInputsUnchanged':True,'noNewNativeInvocation':True};(out/'combined-execution.json').write_text(json.dumps(result,indent=2)+'\n');print('All default CLI executions terminal',flush=True)
