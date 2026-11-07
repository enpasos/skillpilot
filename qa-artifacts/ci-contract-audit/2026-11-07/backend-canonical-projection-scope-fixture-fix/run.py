from pathlib import Path
import json,hashlib,subprocess,datetime,os
R=Path('/home/enpasos/projects/skillpilot');W=Path('/dev/shm/backend-canonical-projection-scope-fixture-fix-20261107');sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
before=json.loads(Path('/dev/shm/powi52-runtime-alias-20261107/source-guard.json').read_text())['all484CurrentSourcePins'];current={str(p.relative_to(R)):sha(p) for p in (R/'backend/src/main/java').rglob('*.java')};assert current==before
(W/'production-source-guard.json').write_text(json.dumps({'sourceCount':len(current),'unchanged':True,'sources':current},indent=2)+'\n')
old=json.loads(Path('/dev/shm/root-owner-entry-active-checks/active-javac-complete-test-classpath.json').read_text())['command'];cp=old[old.index('-cp')+1];cp=str(W/'classes')+':'+cp
(W/'classes').mkdir(exist_ok=True);(W/'temporary').mkdir(exist_ok=True);(W/'classpath.txt').write_text(cp)
def execute(name,args,cwd):
 record={'startedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'command':args,'cwd':str(cwd)}
 with (W/(name+'.stdout')).open('wb') as o,(W/(name+'.stderr')).open('wb') as e:p=subprocess.run(args,cwd=cwd,stdout=o,stderr=e,env={**os.environ,'TMPDIR':str(W/'temporary')})
 record.update(exitCode=p.returncode,finishedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),stdoutSha256=sha(W/(name+'.stdout')),stderrSha256=sha(W/(name+'.stderr')));(W/(name+'.json')).write_text(json.dumps(record,indent=2)+'\n');print(name,p.returncode,flush=True)
 if p.returncode:print((W/(name+'.stdout')).read_text()[-12000:]);print((W/(name+'.stderr')).read_text()[-2000:]);raise SystemExit(p.returncode)
jdk=R/'tmp/amazon-corretto-25.0.2.10.1/bin';prefix=['bwrap','--ro-bind','/','/','--dev-bind','/dev','/dev','--proc','/proc','--bind','/dev/shm','/dev/shm','--']
execute('javac',prefix+[str(jdk/'javac'),'-J-Djava.io.tmpdir='+str(W/'temporary'),'-J-Xmx500m','-cp',cp,'-sourcepath',str(W/'empty-sourcepath'),'-d',str(W/'classes'),str(R/'backend/src/test/java/com/skillpilot/backend/service/LearnerServiceCanonicalProjectionTest.java'),str(R/'backend/src/test/java/com/skillpilot/backend/service/CanonicalSubjectScopeReadinessTest.java'),str(W/'RunProjectionTests.java')],R/'backend')
agent=next(Path('/tmp/skillpilot-plan-gradle-20261022/caches/modules-2/files-2.1/net.bytebuddy/byte-buddy-agent').rglob('*.jar'))
execute('junit',prefix+[str(jdk/'java'),'-Djava.io.tmpdir='+str(W/'temporary'),'-Xmx1300m','-javaagent:'+str(agent),'-cp',cp,'RunProjectionTests','64','com.skillpilot.backend.service.LearnerServiceCanonicalProjectionTest','com.skillpilot.backend.service.CanonicalSubjectScopeReadinessTest'],R/'backend')
assert current=={str(p.relative_to(R)):sha(p) for p in (R/'backend/src/main/java').rglob('*.java')}
print((W/'junit.stdout').read_text()[-2000:])
