from pathlib import Path
import os,subprocess,json,hashlib,datetime,socket
root=Path('/home/enpasos/projects/skillpilot');work=Path(__file__).parent
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def execute(name,args,cwd=root,env=None):
 record={'startedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'command':args,'cwd':str(cwd)}
 with (work/(name+'.stdout')).open('wb') as out,(work/(name+'.stderr')).open('wb') as err:
  process=subprocess.Popen(args,cwd=cwd,env=env or os.environ,stdout=out,stderr=err)
  record['pid']=process.pid;(work/(name+'.json')).write_text(json.dumps(record,indent=2)+'\n');code=process.wait()
 record.update(exitCode=code,finishedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),stdoutSha256=sha(work/(name+'.stdout')),stderrSha256=sha(work/(name+'.stderr')))
 (work/(name+'.json')).write_text(json.dumps(record,indent=2)+'\n');print(name,code,flush=True)
 if code:raise RuntimeError(name+' failed: '+str(code))
 return record
sources={str(p.relative_to(root)):sha(p) for p in (root/'backend/src/main/java').rglob('*.java')}
(work/'production-source-before.json').write_text(json.dumps(sources,indent=2)+'\n')
old=json.loads(Path('/dev/shm/informatics-owner-entry-readiness-repair-s0nr8nmh/final-compile.json').read_text())['command']
classpath=[str(work/'classes'),'/dev/shm/root-owner-entry-active-checks/classes']+[p for p in old[old.index('-cp')+1].split(':') if p!='/dev/shm/informatics-owner-entry-readiness-repair-s0nr8nmh/classes']+[str(root/'backend/src/main/resources'),str(root/'backend/src/test/resources')]
classpath=':'.join(classpath);(work/'classes').mkdir(exist_ok=True);(work/'temporary').mkdir(exist_ok=True);(work/'repository-tmp').mkdir(exist_ok=True)
jdk=root/'tmp/amazon-corretto-25.0.2.10.1/bin'
execute('javac',[str(jdk/'javac'),'-cp',classpath,'-sourcepath',str(work/'empty-sourcepath'),'-d',str(work/'classes'),str(root/'backend/src/test/java/com/skillpilot/backend/service/AssessmentCompletionRestartIntegrationTest.java'),str(root/'backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/ClaudeV1TestProperties.java'),str(work/'RunRestartTest.java')])
pg=Path('/home/enpasos/.local/pgsql-18/bin');data=work/'pg-data';sock=work/'pg-socket';sock.mkdir(exist_ok=True)
execute('initdb',[str(pg/'initdb'),'-D',str(data),'-A','trust','--no-locale','--encoding=UTF8'])
with socket.socket() as s:s.bind(('127.0.0.1',0));port=s.getsockname()[1]
started=False
try:
 execute('pg-start',[str(pg/'pg_ctl'),'-D',str(data),'-l',str(work/'postgres.log'),'-o',f'-h 127.0.0.1 -p {port} -k {sock} -c shared_buffers=16MB -c max_connections=20','-w','start']);started=True
 execute('pg-login',[str(pg/'psql'),'-h','127.0.0.1','-p',str(port),'-d','postgres','-v','ON_ERROR_STOP=1','-c','CREATE ROLE completion_test LOGIN;','-c','CREATE DATABASE skillpilot_completion_test OWNER completion_test;'])
 env={**os.environ,'SKILLPILOT_TEST_POSTGRES_URL':f'jdbc:postgresql://127.0.0.1:{port}/skillpilot_completion_test','SKILLPILOT_TEST_POSTGRES_USER':'completion_test','SKILLPILOT_TEST_POSTGRES_PASSWORD':'','TMPDIR':str(work/'temporary')}
 command=['bwrap','--ro-bind','/','/','--dev-bind','/dev','/dev','--proc','/proc','--bind','/dev/shm','/dev/shm','--bind',str(work/'repository-tmp'),str(root/'tmp'),'--ro-bind',str(root/'tmp/amazon-corretto-25.0.2.10.1'),str(root/'tmp/amazon-corretto-25.0.2.10.1'),'--chdir',str(root/'backend'),'--',str(jdk.resolve()/'java'),'-Djava.io.tmpdir='+str(work/'temporary'),'-Xmx2g','-cp',classpath,'RunRestartTest']
 # Keep the JDK executable outside the overlaid repository tmp directory.
 command[command.index('--')+1]=str(Path(os.path.realpath(jdk/'java')))
 execute('restart',command,cwd=root/'backend',env=env)
finally:
 if started:execute('pg-stop',[str(pg/'pg_ctl'),'-D',str(data),'-m','fast','-w','stop'])
 after={str(p.relative_to(root)):sha(p) for p in (root/'backend/src/main/java').rglob('*.java')}
 assert sources==after,'Production Java source drift'
 (work/'production-source-after.json').write_text(json.dumps({'count':len(after),'unchanged':sources==after,'sha256':hashlib.sha256(json.dumps(after,sort_keys=True).encode()).hexdigest()},indent=2)+'\n')
