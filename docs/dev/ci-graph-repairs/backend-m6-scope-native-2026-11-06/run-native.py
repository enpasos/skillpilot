from pathlib import Path
import subprocess,tempfile,json,hashlib,time
root=Path.cwd();out=root/'tmp/backend-m6-scope-native-2026-11-06';ctx=json.loads((out/'input-context.json').read_text());java=root/'tmp/amazon-corretto-25.0.2.10.1/bin/java';source=out/'BackendM6ScopeNativeInventory.java';classpath=(out/'classpath.txt').read_text().strip();sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();bindings={row['path']:row['sha256'] for row in ctx['currentCanonicalCatalog']}
for p in ['backend/src/main/java/com/skillpilot/backend/service/LearnerService.java','backend/src/main/java/com/skillpilot/backend/service/CompositionViewService.java','backend/src/main/java/com/skillpilot/backend/landscape/LandscapeService.java','backend/src/main/java/com/skillpilot/backend/landscape/GoalMappingService.java','backend/build/classes/java/main/com/skillpilot/backend/service/LearnerService.class','backend/build/classes/java/main/com/skillpilot/backend/service/CompositionViewService.class','backend/build/classes/java/main/com/skillpilot/backend/landscape/LandscapeService.class','backend/build/classes/java/main/com/skillpilot/backend/landscape/GoalMappingService.class',str(source.relative_to(root)),ctx['fixturePath']]:bindings[p]=sha(root/p)
assert len(json.loads((out/'requests.json').read_text()))==112;assert sha(out/'requests.json')==ctx['requestSha256'];results=[]
for name,context in ctx['contexts'].items():
 for path,digest in bindings.items():assert sha(root/path)==digest,'Input changed: '+path
 assert sha(root/context['privateOverlayPath'])==context['sha256'];result=out/(name+'.results.json');started=time.time()
 with tempfile.TemporaryDirectory(prefix='native-java-cache-',dir=out) as cache:
  command=['bwrap','--die-with-parent','--unshare-net','--ro-bind','/','/','--proc','/proc','--dev','/dev','--bind',str(out),str(out),'--bind',cache,'/tmp','--ro-bind','/tmp/skillpilot-plan-gradle-20261022','/tmp/skillpilot-plan-gradle-20261022','--ro-bind',str(root/context['privateOverlayPath']),str(root/context['sourcePath']),'--chdir',str(root),'--',str(java),'-Xmx1024m','--class-path',classpath,str(source),str(root),str(out/'requests.json'),str(result),name]
  with (out/(name+'.stdout.log')).open('wb') as stdout,(out/(name+'.stderr.log')).open('wb') as stderr:code=subprocess.run(command,stdout=stdout,stderr=stderr).returncode
 row={'context':name,'exitCode':code,'elapsedSeconds':time.time()-started};print(json.dumps(row),flush=True);results.append(row)
 if code:break
 data=json.loads(result.read_text());assert data['actualInfoSourceSha256']==context['sha256'] and len(data['rows'])==112
 for path,digest in bindings.items():assert sha(root/path)==digest,'Input changed during native inspection: '+path
(out/'execution.json').write_text(json.dumps({'sourceDataChanged':False,'contexts':results,'bindingsBeforeAndAfter':bindings,'javaExecutable':str(java.relative_to(root)),'javaExecutableSha256':sha(java),'classpathSha256':sha(out/'classpath.txt'),'runtimeClasspathCaptureCompileJavaExitCode':0},indent=2)+'\n')
if len(results)!=3 or any(row['exitCode'] for row in results):raise SystemExit(1)
