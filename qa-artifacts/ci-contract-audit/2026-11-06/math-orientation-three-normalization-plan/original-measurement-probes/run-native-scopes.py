import hashlib,json,subprocess,time
from pathlib import Path
root=Path.cwd();base=root/'tmp/math-orientation-normalization-review-2026-11-06'
proof=json.loads((base/'proposal-and-global-proof.json').read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
commands=[]
generator=root/'app/scripts/generateCurriculumQualityStatus.ts'
adapter=base/'cqr-readonly-export-adapter.ts'
adapter.write_bytes(generator.read_bytes()+b'\nexport { evaluateRouteProfile, routeProfiles }\n')
for label in ['baseline']+[r['scenario'] for r in proof['formalIndividualAndCumulative']]:
 for binding in proof['catalogBindings']:assert sha(root/binding['path'])==binding['sha256']
 cmd=['bwrap','--die-with-parent','--unshare-net','--ro-bind','/','/','--proc','/proc','--dev','/dev','--tmpfs','/tmp','--bind',str(base),str(base)]
 cmd+=['--ro-bind',str(adapter),str(generator)]
 if label!='baseline':cmd+=['--ro-bind',str(base/(label+'.candidate.json')),str(root/proof['source']['path'])]
 cmd+=['--chdir',str(root),'--',str(root/'app/node_modules/.bin/tsx'),str(base/'native-scope.mts'),label]
 start=time.monotonic()
 with (base/(label+'.native-scope.json')).open('wb') as out,(base/(label+'.native-scope.stderr.log')).open('wb')as err:
  code=subprocess.run(cmd,stdout=out,stderr=err).returncode
 row={'scenario':label,'exitCode':code,'seconds':time.monotonic()-start,'command':cmd}
 commands.append(row);print(json.dumps({k:v for k,v in row.items()if k!='command'}),flush=True)
 if code:break
 for binding in proof['catalogBindings']:assert sha(root/binding['path'])==binding['sha256']
(base/'native-scope-execution.json').write_text(json.dumps(commands,indent=2)+'\n')
if len(commands)!=5 or any(r['exitCode'] for r in commands):raise SystemExit(1)
