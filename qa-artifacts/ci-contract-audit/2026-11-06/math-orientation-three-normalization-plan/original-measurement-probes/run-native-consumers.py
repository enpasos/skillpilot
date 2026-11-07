import hashlib,json,subprocess,time
from pathlib import Path
root=Path.cwd();base=root/'tmp/math-orientation-normalization-review-2026-11-06'
proof=json.loads((base/'proposal-and-global-proof.json').read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
cp=str(base/'native-classes')+':'+(root/'tmp/backend-m6-scope-native-2026-11-06/classpath.txt').read_text().strip()
assert json.loads((base/'native-compile.json').read_text())['exitCode']==0
results=[]
for label in ['baseline']+[r['scenario']for r in proof['formalIndividualAndCumulative']]:
 for b in proof['catalogBindings']:assert sha(root/b['path'])==b['sha256']
 cmd=['bwrap','--die-with-parent','--unshare-net','--ro-bind','/','/','--proc','/proc','--dev','/dev','--tmpfs','/tmp','--ro-bind','/tmp/skillpilot-plan-gradle-20261022','/tmp/skillpilot-plan-gradle-20261022','--bind',str(base),str(base)]
 if label!='baseline':cmd+=['--ro-bind',str(base/(label+'.candidate.json')),str(root/proof['source']['path'])]
 cmd+=['--chdir',str(root),'--',str(root/'tmp/amazon-corretto-25.0.2.10.1/bin/java'),'-Xmx1536m','--class-path',cp,str(base/'MathOrientationConsumerProbe.java'),str(root),str(base),label]
 started=time.monotonic()
 with (base/(label+'.consumer.stdout.log')).open('wb')as out,(base/(label+'.consumer.stderr.log')).open('wb')as err:code=subprocess.run(cmd,stdout=out,stderr=err).returncode
 row={'scenario':label,'exitCode':code,'seconds':time.monotonic()-started,'command':cmd};results.append(row);print(json.dumps({k:v for k,v in row.items()if k!='command'}),flush=True)
 if code:break
 for b in proof['catalogBindings']:assert sha(root/b['path'])==b['sha256']
(base/'consumer-execution.json').write_text(json.dumps(results,indent=2)+'\n')
if len(results)!=5 or any(r['exitCode']for r in results):raise SystemExit(1)
